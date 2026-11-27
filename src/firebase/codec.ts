import type { AppData } from '../data/appData';
import { eventDay } from '../data/competitionLifecycle';
import type { AppUser, CabinetAward, Competition, CompetitionResult, EventCategory, EventRecord, Registration } from '../types/domain';

type Keyed<T> = Record<string, T>;
type PersonRow = [first: string, last: string, status: 'A' | 'R' | 'X', department?: string, team?: string, joined?: string];
type AwardRow = [event: string, title: string, date: string, type: CabinetAward['type'], placement: string, detail: string, finish?: string];
type EventRow = {
  k: string; n: string; q: string; b: number; d: number; s: Competition['status']; c: number;
  v?: string; i?: string; t?: string; z?: string; a?: string;
};
type RecordRow = [sport: string, holder: string, edition: string | null, type: 'A' | 'U', metric: string, value: string, date: string, note?: string, verifier?: string];
type ResultRow = [holder: string, stage: string, rank: number, score: string, label: string, final: boolean, updated: string, detail?: string];
type MatchRow = [stage: string, winner: string, opponent: string, winnerScore: number, opponentScore: number];

export type DirectoryDoc = { u: Keyed<PersonRow>; a?: Keyed<Keyed<AwardRow>> };
export type EmployeeIdsDoc = { e: Keyed<string> };
export type EventsDoc = { e: Keyed<EventRow>; k?: EventCategory[] };
export type RecordsDoc = { r: Keyed<RecordRow> };
export type ActivityDoc = {
  r: Keyed<string>;
  x?: Keyed<[string, 'WITHDRAWN' | 'DISQUALIFIED', string]>;
  s?: Keyed<ResultRow>;
  m?: Keyed<MatchRow>;
};

const day = 86_400_000;
const adminId = 'u-admin';
const statusCode = { ACTIVE: 'A', RETIRED: 'R', REMOVED: 'X' } as const;
const userStatus = { A: 'ACTIVE', R: 'RETIRED', X: 'REMOVED' } as const;
const midnight = (key: string) => Date.parse(`${key}T00:00:00+05:30`);
const dayFromTimestamp = (value: number) => value > 0 ? eventDay(new Date(value)) : '';

export function normalizeEmployeeId(value: string) { return value.trim().toUpperCase(); }
export function employeeKey(value: string) { return 'id-' + encodeURIComponent(normalizeEmployeeId(value)); }

function keyed<T, S>(items: T[], key: (item: T) => string, value: (item: T) => S): Keyed<S> {
  return Object.fromEntries(items.map(item => [key(item), value(item)]));
}

export function encodeDirectory(data: AppData): DirectoryDoc {
  const u = keyed(data.users, user => user.id, (user): PersonRow => {
    const row: PersonRow = [user.firstName, user.lastName, statusCode[user.status], user.department, user.team, user.joinedOn];
    while (row.length > 3 && !row.at(-1)) row.pop();
    return row;
  });
  const a: Keyed<Keyed<AwardRow>> = Object.fromEntries(Object.entries(data.awards).filter(([, awards]) => awards.length).map(([id, awards]) => [
    id, keyed(awards, award => award.id, (award): AwardRow => {
      const row: AwardRow = [award.event, award.title, award.date, award.type, award.placement, award.detail];
      if (award.finish) row.push(award.finish);
      return row;
    }),
  ]));
  return Object.keys(a).length ? { u, a } : { u };
}

export function encodeEmployeeIds(data: AppData): EmployeeIdsDoc {
  return { e: keyed(data.users, user => user.id, user => user.employeeId) };
}

export function decodeDirectory(doc: DirectoryDoc | undefined, employeeIds: Keyed<string> = {}) {
  const users: AppUser[] = Object.entries(doc?.u ?? {}).map(([id, [firstName, lastName, status, department = '', team = '', joinedOn = '']]) => ({
    id, firstName, lastName, employeeId: employeeIds[id] ?? '', status: userStatus[status],
    role: id === adminId ? 'ADMIN' : 'ATHLETE', department, team, joinedOn,
  }));
  const awards: AppData['awards'] = Object.fromEntries(Object.entries(doc?.a ?? {}).map(([userId, rows]) => [
    userId, Object.entries(rows).map(([id, [event, title, date, type, placement, detail, finish]]) => ({ id, event, title, date, type, placement, detail, finish })),
  ]));
  return { users, awards };
}

export function encodeEvents(data: AppData): EventsDoc {
  const e = keyed(data.competitions, event => event.id, (event): EventRow => ({
    k: event.eventId, n: event.name, q: event.quarter + event.year,
    b: midnight(event.registrationStart) || 0, d: (midnight(event.registrationDeadline) + day) || 0,
    s: event.status, c: event.capacity,
    ...(event.venue && { v: event.venue }), ...(event.description && { i: event.description }),
    ...(event.startAt && { t: event.startAt }), ...(event.endAt && { z: event.endAt }),
    ...(event.createdBy !== adminId && { a: event.createdBy }),
  }));
  return data.customCategories?.length ? { e, k: data.customCategories } : { e };
}

export function decodeEvents(doc: EventsDoc | undefined) {
  const competitions: Competition[] = Object.entries(doc?.e ?? {}).map(([id, event]) => ({
    id, eventId: event.k, name: event.n, quarter: event.q.slice(0, 2), year: Number(event.q.slice(2)),
    registrationStart: dayFromTimestamp(event.b), registrationDeadline: dayFromTimestamp(event.d - 1),
    status: event.s, capacity: event.c, venue: event.v ?? '', description: event.i ?? '',
    startAt: event.t ?? '', endAt: event.z ?? '', createdBy: event.a ?? adminId,
  }));
  return { competitions, customCategories: doc?.k ?? [] };
}

export function encodeRecords(data: AppData): RecordsDoc {
  return { r: keyed(data.records, record => record.id, (record): RecordRow => {
    const row: RecordRow = [record.eventId, record.userId, record.competitionId ?? null, record.recordType === 'ALL_TIME' ? 'A' : 'U',
      record.metric, record.value, record.achievedAt];
    if (record.verifiedBy !== adminId) row.push(record.note, record.verifiedBy);
    else if (record.note) row.push(record.note);
    return row;
  }) };
}

export function decodeRecords(doc: RecordsDoc | undefined): EventRecord[] {
  return Object.entries(doc?.r ?? {}).map(([id, [eventId, userId, edition, type, metric, value, achievedAt, note = '', verifiedBy = adminId]]) => ({
    id, eventId, userId, competitionId: edition ?? undefined, recordType: type === 'A' ? 'ALL_TIME' : 'UNIQUE', metric, value, achievedAt, note, verifiedBy,
  }));
}

export function encodeActivity(data: AppData, eventId: string): ActivityDoc {
  const registrations = data.registrations.filter(entry => entry.competitionId === eventId);
  const r = keyed(registrations.filter(entry => entry.status === 'REGISTERED'), entry => entry.userId, entry => entry.registeredAt);
  const x = keyed(registrations.filter((entry): entry is Registration & { status: 'WITHDRAWN' | 'DISQUALIFIED' } => entry.status !== 'REGISTERED'),
    entry => entry.id, entry => [entry.userId, entry.status, entry.registeredAt] as [string, 'WITHDRAWN' | 'DISQUALIFIED', string]);
  const s = keyed(data.results.filter(entry => entry.competitionId === eventId), entry => entry.id, (entry): ResultRow => {
    const row: ResultRow = [entry.userId, entry.stage, entry.rank, entry.score, entry.scoreLabel, entry.status === 'FINAL', entry.updatedAt];
    if (entry.detail) row.push(entry.detail);
    return row;
  });
  const m = keyed(data.matches.filter(entry => entry.competitionId === eventId), entry => entry.id,
    (entry): MatchRow => [entry.stage, entry.winnerId, entry.opponentId, entry.winnerScore, entry.opponentScore]);
  return { r, ...(Object.keys(x).length && { x }), ...(Object.keys(s).length && { s }), ...(Object.keys(m).length && { m }) };
}

export function decodeActivity(competitionId: string, doc: ActivityDoc | undefined): Pick<AppData, 'registrations' | 'results' | 'matches'> {
  const registered = Object.entries(doc?.r ?? {}).map(([userId, registeredAt]): Registration => ({
    id: `${competitionId}~${userId}`, competitionId, userId, registeredAt, status: 'REGISTERED',
  }));
  const withdrawn = Object.entries(doc?.x ?? {}).map(([id, [userId, status, registeredAt]]): Registration => ({
    id, competitionId, userId, status, registeredAt,
  }));
  const results = Object.entries(doc?.s ?? {}).map(([id, [userId, stage, rank, score, scoreLabel, final, updatedAt, detail = '']]): CompetitionResult => ({
    id, competitionId, userId, stage, rank, score, scoreLabel, status: final ? 'FINAL' : 'PENDING', updatedAt, detail,
  }));
  const matches = Object.entries(doc?.m ?? {}).map(([id, [stage, winnerId, opponentId, winnerScore, opponentScore]]) => ({
    id, competitionId, stage, winnerId, opponentId, winnerScore, opponentScore,
  }));
  return { registrations: [...registered, ...withdrawn], results, matches };
}
