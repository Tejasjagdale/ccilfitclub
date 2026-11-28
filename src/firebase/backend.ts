import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth, signInAnonymously } from 'firebase/auth';
import {
  collection, connectFirestoreEmulator, deleteDoc, doc, getDocFromServer, getFirestore,
  onSnapshot, runTransaction, setDoc, type DocumentData, type DocumentReference, type Transaction,
} from 'firebase/firestore';
import { ADMIN_EMPLOYEE_ID, emptyAppData, type AppData } from '../data/appData';
import {
  decodeActivity, decodeDirectory, decodeEvents, decodeRecords, employeeKey, encodeActivity, encodeDirectory,
  encodeEmployeeIds, encodeEvents, encodeRecords, normalizeEmployeeId, type ActivityDoc, type DirectoryDoc,
  type EmployeeIdsDoc, type EventsDoc, type RecordsDoc,
} from './codec';
import { firebaseOptions, useFirebaseEmulators, validateFirebaseConfig } from './config';

validateFirebaseConfig();
const app = initializeApp(firebaseOptions);
const auth = getAuth(app);
const db = getFirestore(app);
if (useFirebaseEmulators) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
}

const sessionKey = `offpace-firebase-session:${firebaseOptions.projectId}`;
const directoryRef = doc(db, 'core', 'directory');
const employeeIdsRef = doc(db, 'core', 'employeeIds');
const eventsRef = doc(db, 'core', 'events');
const recordsRef = doc(db, 'core', 'records');
const adminRef = doc(db, 'settings', 'admin');
const activityRef = (id: string) => doc(db, 'activity', id);
const employeeRef = (key: string) => doc(db, 'employeeKeys', key);
const accessRef = (uid: string) => doc(db, 'access', uid);

export type CloudSession = {
  uid: string; personId: string; employeeId: string; role: 'ADMIN' | 'ATHLETE';
};
export type WriteScope = { eventId?: string; employeeRemoval?: boolean; initialize?: boolean };

function errorCode(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error ? error.code : '';
}

export async function restoreSession(): Promise<CloudSession | null> {
  await auth.authStateReady();
  const raw = sessionStorage.getItem(sessionKey);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw) as CloudSession;
    const user = auth.currentUser;
    if (user?.uid === session.uid && user.isAnonymous) return session;
  } catch {
    // An invalid session cannot authorize data requests.
  }
  sessionStorage.removeItem(sessionKey);
  return null;
}

export async function signInEmployee(id: string): Promise<CloudSession> {
  const employeeId = normalizeEmployeeId(id);
  await auth.authStateReady();
  const user = auth.currentUser?.isAnonymous ? auth.currentUser : (await signInAnonymously(auth)).user;
  const key = employeeKey(employeeId);
  const person = (await getDocFromServer(employeeRef(key))).data()?.p;
  const invalidIdMessage = 'Employee ID not found. Contact your event administrator.';
  if (typeof person !== 'string') throw new Error(invalidIdMessage);
  try {
    await setDoc(accessRef(user.uid), { p: person, k: key });
  } catch (error) {
    if (errorCode(error) === 'permission-denied') throw new Error(invalidIdMessage);
    throw error;
  }
  const isAdmin = person === 'u-admin';
  const session: CloudSession = {
    uid: user.uid, personId: person, employeeId: isAdmin ? ADMIN_EMPLOYEE_ID : employeeId, role: isAdmin ? 'ADMIN' : 'ATHLETE',
  };
  sessionStorage.setItem(sessionKey, JSON.stringify(session));
  return session;
}

export async function endSession(session: CloudSession | null) {
  sessionStorage.removeItem(sessionKey);
  if (!session || auth.currentUser?.uid !== session.uid) return;
  await deleteDoc(accessRef(session.uid));
}

export function observeSession(session: CloudSession, receive: (data: AppData) => void, fail: (message: string) => void) {
  let directory: DirectoryDoc | undefined;
  let events: EventsDoc | undefined;
  let records: RecordsDoc | undefined;
  let ids: EmployeeIdsDoc | undefined;
  let activities: [string, ActivityDoc][] = [];
  const ready = new Set<string>();
  const expected = 6;

  function emit() {
    if (ready.size !== expected) return;
    const data = assemble(session, directory, events, records, ids, activities);
    if (!data.users.some(person => person.id === session.personId && person.status !== 'REMOVED')) {
      fail('This employee account is no longer active.');
      return;
    }
    receive(data);
  }

  const onError = (error: unknown) => fail(errorCode(error) === 'permission-denied'
    ? 'Your session no longer has access. Sign in again.'
    : 'Unable to load Firebase data. Check the connection and try again.');
  const permissions = session.role === 'ADMIN' ? adminRef : employeeRef(employeeKey(session.employeeId));
  const stops = [
    onSnapshot(directoryRef, snapshot => { directory = snapshot.data() as DirectoryDoc | undefined; ready.add('directory'); emit(); }, onError),
    onSnapshot(eventsRef, snapshot => { events = snapshot.data() as EventsDoc | undefined; ready.add('events'); emit(); }, onError),
    onSnapshot(recordsRef, snapshot => { records = snapshot.data() as RecordsDoc | undefined; ready.add('records'); emit(); }, onError),
    onSnapshot(collection(db, 'activity'), snapshot => {
      activities = snapshot.docs.map(item => [item.id, item.data() as ActivityDoc]);
      ready.add('activity'); emit();
    }, onError),
    onSnapshot(permissions, snapshot => {
      const allowed = session.role === 'ADMIN' ? snapshot.exists() : snapshot.data()?.p === session.personId;
      if (!allowed) { if (!snapshot.metadata.fromCache) fail('This browser no longer has access.'); return; }
      ready.add('access'); emit();
    }, onError),
  ];
  if (session.role === 'ADMIN') stops.push(onSnapshot(employeeIdsRef, snapshot => {
    ids = snapshot.data() as EmployeeIdsDoc | undefined; ready.add('ids'); emit();
  }, onError));
  else stops.push(onSnapshot(accessRef(session.uid), snapshot => {
    if (snapshot.data()?.p !== session.personId) {
      if (!snapshot.metadata.fromCache) fail('This browser’s session has ended.');
      return;
    }
    ready.add('session'); emit();
  }, onError));
  return () => stops.forEach(stop => stop());
}

function assemble(session: CloudSession, directory: DirectoryDoc | undefined, events: EventsDoc | undefined,
  records: RecordsDoc | undefined, ids: EmployeeIdsDoc | undefined, activities: [string, ActivityDoc | undefined][]): AppData {
  const people = decodeDirectory(directory, { ...ids?.e, [session.personId]: session.employeeId });
  if (session.role === 'ADMIN' && !people.users.some(user => user.id === 'u-admin')) {
    people.users.unshift({
      id: 'u-admin', firstName: 'Club', lastName: 'Admin', employeeId: ADMIN_EMPLOYEE_ID, role: 'ADMIN',
      status: 'ACTIVE', department: '', team: '', joinedOn: '',
    });
  }
  const eventState = decodeEvents(events);
  const data: AppData = { ...emptyAppData(), ...people, ...eventState, records: decodeRecords(records), currentUserId: session.personId };
  const existing = new Set(eventState.competitions.map(event => event.id));
  for (const [eventId, activity] of activities) {
    if (!existing.has(eventId)) continue;
    const rows = decodeActivity(eventId, activity);
    data.registrations.push(...rows.registrations);
    data.results.push(...rows.results);
    data.matches.push(...rows.matches);
  }
  return data;
}

function same(a: object, b: object) { return JSON.stringify(a) === JSON.stringify(b); }

function writeCompact(tx: Transaction, ref: DocumentReference<DocumentData>, value: DocumentData) {
  if (new TextEncoder().encode(JSON.stringify(value)).length > 700_000) {
    throw new Error('This data document is approaching the Firestore size limit.');
  }
  tx.set(ref, value);
}

function writeDirectory(tx: Transaction, previous: AppData, next: AppData) {
  const beforeDirectory = encodeDirectory(previous), afterDirectory = encodeDirectory(next);
  if (!same(beforeDirectory, afterDirectory)) writeCompact(tx, directoryRef, afterDirectory);
  const beforeIds = encodeEmployeeIds(previous), afterIds = encodeEmployeeIds(next);
  if (!same(beforeIds, afterIds)) writeCompact(tx, employeeIdsRef, afterIds);
  const lookup = (data: AppData) => new Map(data.users.filter(user => user.role === 'ATHLETE' && user.status !== 'REMOVED')
    .map(user => [employeeKey(user.employeeId), user.id]));
  const beforeLookup = lookup(previous), afterLookup = lookup(next);
  beforeLookup.forEach((_, key) => { if (!afterLookup.has(key)) tx.delete(employeeRef(key)); });
  afterLookup.forEach((person, key) => {
    if (beforeLookup.get(key) !== person) tx.set(employeeRef(key), { p: person });
  });
}

export async function commit(session: CloudSession, update: (current: AppData) => AppData, scope: WriteScope = {}) {
  if (auth.currentUser?.uid !== session.uid) return false;
  return runTransaction(db, async tx => {
    const [directory, events, records, ids] = await Promise.all([
      tx.get(directoryRef), tx.get(eventsRef), tx.get(recordsRef),
      session.role === 'ADMIN' ? tx.get(employeeIdsRef) : Promise.resolve(undefined),
    ]);
    const eventDoc = events.data() as EventsDoc | undefined;
    const eventIds = new Set(scope.eventId ? [scope.eventId] : []);
    if (scope.employeeRemoval) {
      Object.entries(eventDoc?.e ?? {}).forEach(([id, event]) => {
        if (['DRAFT', 'REGISTRATION_OPEN', 'UPCOMING'].includes(event.s)) eventIds.add(id);
      });
    }
    const activity = await Promise.all([...eventIds].map(async id => {
      const snapshot = await tx.get(activityRef(id));
      return [id, snapshot.data() as ActivityDoc | undefined] as [string, ActivityDoc | undefined];
    }));
    const previous = assemble(session, directory.data() as DirectoryDoc | undefined, eventDoc,
      records.data() as RecordsDoc | undefined, ids?.data() as EmployeeIdsDoc | undefined, activity);
    const next = update(previous);
    if (next === previous) return false;

    if (session.role === 'ADMIN') {
      writeDirectory(tx, previous, next);
      const beforeEvents = encodeEvents(previous), afterEvents = encodeEvents(next);
      if (!same(beforeEvents, afterEvents) || scope.initialize) writeCompact(tx, eventsRef, afterEvents);
      const beforeRecords = encodeRecords(previous), afterRecords = encodeRecords(next);
      if (!same(beforeRecords, afterRecords) || scope.initialize) writeCompact(tx, recordsRef, afterRecords);
      if (scope.initialize && !directory.exists()) writeCompact(tx, directoryRef, encodeDirectory(next));
      if (scope.initialize && !ids?.exists()) writeCompact(tx, employeeIdsRef, encodeEmployeeIds(next));
      next.competitions.forEach(event => {
        if (!(event.id in beforeEvents.e)) eventIds.add(event.id);
      });
      eventIds.forEach(id => {
        if (id in beforeEvents.e && !(id in afterEvents.e)) tx.delete(activityRef(id));
      });
    }
    eventIds.forEach(id => {
      if (!next.competitions.some(event => event.id === id)) return;
      const before = encodeActivity(previous, id), after = encodeActivity(next, id);
      if (!same(before, after) || !activity.some(([eventId, row]) => eventId === id && row)) {
        writeCompact(tx, activityRef(id), after);
      }
    });
    return true;
  });
}
