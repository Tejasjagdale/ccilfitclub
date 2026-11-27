import { dateAfter } from '../data/dateAfter';
import { canStart, creatableSports, eventDay, registrationOpen, validDay, type CreatableSport } from '../data/competitionLifecycle';
import { finishSeconds, normalizeFinishTime, sameMatch, validateMatch } from '../data/scoring';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AppUser, Competition, CompetitionResult, EventCategory, EventRecord, Registration, KnockoutMatch } from '../types/domain';

const STORAGE_KEY = 'offpace-app-v1';
const SESSION_KEY = 'offpace-session-user';
const categories: EventCategory[] = [
  { id: 'HYROX', name: 'HYROX', format: 'TIMED', scoreLabel: 'Finish time', unit: 'time', icon: '🏋️', description: 'A race combining running and functional workout stations.' },
  { id: 'CHESS', name: 'Chess', format: 'KNOCKOUT', scoreLabel: 'Match score', unit: 'points', icon: '♟', description: 'Head-to-head strategy, round by round.' },
  { id: 'CARROM', name: 'Carrom', format: 'KNOCKOUT', scoreLabel: 'Board points', unit: 'points', icon: '◎', description: 'Precision, control and knockout matches.' },
  { id: 'MARATHON', name: 'Marathon', format: 'DISTANCE', scoreLabel: 'Finish time', unit: 'time', icon: '🏃', description: 'Distance running measured by finish time.' },
  { id: 'TABLE_TENNIS', name: 'Table Tennis', format: 'KNOCKOUT', scoreLabel: 'Sets', unit: 'sets', icon: '🏓', description: 'Fast-paced singles and doubles competition.' },
  { id: 'ZENGA', name: 'Zenga', format: 'POINTS', scoreLabel: 'Score', unit: 'points', icon: '▥', description: 'Steady hands and nerve under pressure.' },
];
const users: AppUser[] = [
  { id: 'u-admin', firstName: 'Club', lastName: 'Admin', employeeId: 'ADM001', status: 'ACTIVE', role: 'ADMIN', department: 'People & Culture', team: 'Organisers', joinedOn: '2024' },
  { id: 'u-1', firstName: 'Aarav', lastName: 'Mehta', employeeId: 'EMP001', status: 'ACTIVE', role: 'ATHLETE', department: 'Platform Engineering', team: 'Engineering', joinedOn: '2022' },
  { id: 'u-2', firstName: 'Maya', lastName: 'Iyer', employeeId: 'EMP002', status: 'ACTIVE', role: 'ATHLETE', department: 'Design', team: 'Product', joinedOn: '2021' },
  { id: 'u-3', firstName: 'Kabir', lastName: 'Shah', employeeId: 'EMP003', status: 'ACTIVE', role: 'ATHLETE', department: 'Finance', team: 'Operations', joinedOn: '2023' },
  { id: 'u-4', firstName: 'Ananya', lastName: 'Rao', employeeId: 'EMP004', status: 'ACTIVE', role: 'ATHLETE', department: 'Data', team: 'Engineering', joinedOn: '2020' },
  { id: 'u-5', firstName: 'Rohan', lastName: 'Das', employeeId: 'EMP005', status: 'RETIRED', role: 'ATHLETE', department: 'Marketing', team: 'Growth', joinedOn: '2019' },
];
const demoDate = dateAfter(8);
const competitions: Competition[] = [
  { id: 'c-club-run', eventId: 'MARATHON', name: 'Club Run · Riverside 5K', quarter: 'Q' + Math.ceil(Number(demoDate.slice(5,7))/3), year: Number(demoDate.slice(0,4)), venue: 'Riverside track', description: 'Individual 5K time trial.', registrationStart: dateAfter(0), registrationDeadline: dateAfter(7), startAt: demoDate+'T08:00', endAt: demoDate+'T10:00', status: 'REGISTRATION_OPEN', capacity: 24, createdBy: 'u-admin' },
  { id: 'c-chess-q1', eventId: 'CHESS', name: 'Chess Championship · Q1 2026', quarter: 'Q1', year: 2026, venue: 'Conference Room 2', description: 'Quarterly knockout chess championship.', registrationStart: '2026-01-05', registrationDeadline: '2026-01-16', startAt: '2026-01-20T10:00', endAt: '2026-01-20T17:00', status: 'COMPLETED', capacity: 32, createdBy: 'u-admin' },
  { id: 'c-hyrox-q1', eventId: 'HYROX', name: 'HYROX · Q1 2026', quarter: 'Q1', year: 2026, venue: 'Main Sports Arena', description: 'Eight workout stations with running intervals.', registrationStart: '2026-02-01', registrationDeadline: '2026-02-14', startAt: '2026-02-21T08:00', endAt: '2026-02-21T15:00', status: 'COMPLETED', capacity: 40, createdBy: 'u-admin' },
  { id: 'c-tt-q3', eventId: 'TABLE_TENNIS', name: 'Table Tennis Open · Q3 2026', quarter: 'Q3', year: 2026, venue: 'Recreation Hall', description: 'Singles knockout tournament.', registrationStart: '2026-07-01', registrationDeadline: '2026-07-12', startAt: '2026-07-18T10:00', endAt: '2026-07-18T16:00', status: 'COMPLETED', capacity: 24, createdBy: 'u-admin' },
  { id: 'c-hyrox-q4', eventId: 'HYROX', name: 'HYROX · The Gauntlet', quarter: 'Q' + Math.ceil(Number(demoDate.slice(5, 7)) / 3), year: Number(demoDate.slice(0, 4)), venue: 'Main Sports Arena', description: 'Eight workout stations with running intervals.', registrationStart: dateAfter(-8), registrationDeadline: dateAfter(-1), startAt: '', endAt: '', status: 'REGISTRATION_OPEN', capacity: 40, createdBy: 'u-admin' },
  { id: 'c-carrom-live', eventId: 'CARROM', name: 'Carrom Open', quarter: 'Q' + Math.ceil(Number(demoDate.slice(5, 7)) / 3), year: Number(demoDate.slice(0, 4)), venue: 'Recreation Hall', description: 'Singles knockout tournament.', registrationStart: dateAfter(-8), registrationDeadline: dateAfter(-1), startAt: dateAfter(0) + 'T09:00', endAt: '', status: 'LIVE', capacity: 16, createdBy: 'u-admin' },
  { id: 'c-marathon-q4', eventId: 'MARATHON', name: 'Office 5K · Q4 2026', quarter: 'Q4', year: 2026, venue: 'Bandra Promenade', description: 'A timed 5 kilometre team run.', registrationStart: '2026-11-10', registrationDeadline: '2026-11-28', startAt: '2026-12-06T06:30', endAt: '2026-12-06T09:00', status: 'UPCOMING', capacity: 100, createdBy: 'u-admin' },
];
const registrations: Registration[] = [
  { id: 'r-club-run', competitionId: 'c-club-run', userId: 'u-2', status: 'REGISTERED', registeredAt: dateAfter(0) },
  ...['u-1','u-2','u-3','u-4'].map((userId, i) => ({ id: `r-hyrox-${i}`, competitionId: 'c-hyrox-q1', userId, status: 'REGISTERED' as const, registeredAt: '2026-02-10' })),
  ...['u-1','u-2','u-3','u-4'].map((userId, i) => ({ id: `r-chess-${i}`, competitionId: 'c-chess-q1', userId, status: 'REGISTERED' as const, registeredAt: '2026-01-10' })),
  ...['u-1','u-2','u-3','u-4'].map((userId, i) => ({ id: `r-carrom-${i}`, competitionId: 'c-carrom-live', userId, status: 'REGISTERED' as const, registeredAt: dateAfter(-2) })),
  ...['u-1','u-2'].map((userId, i) => ({ id: `r-gauntlet-${i}`, competitionId: 'c-hyrox-q4', userId, status: 'REGISTERED' as const, registeredAt: dateAfter(-2) })),
];
const results: CompetitionResult[] = [
  { id: 'res-chess-1', competitionId: 'c-chess-q1', userId: 'u-2', stage: 'FINAL', rank: 1, score: '3–1', scoreLabel: 'Match score', detail: 'Won the final 3–1 after four rounds.', status: 'FINAL', updatedAt: '2026-01-20' },
  { id: 'res-chess-2', competitionId: 'c-chess-q1', userId: 'u-1', stage: 'FINAL', rank: 2, score: '1–3', scoreLabel: 'Match score', detail: 'Runner-up.', status: 'FINAL', updatedAt: '2026-01-20' },
  { id: 'res-chess-3', competitionId: 'c-chess-q1', userId: 'u-3', stage: 'SEMI FINAL', rank: 3, score: '1–2', scoreLabel: 'Match score', detail: 'Semi-finalist.', status: 'FINAL', updatedAt: '2026-01-20' },
  { id: 'res-hyrox-1', competitionId: 'c-hyrox-q1', userId: 'u-1', stage: 'FINISH', rank: 1, score: '01:08:42', scoreLabel: 'Finish time', detail: 'Fastest overall time.', status: 'FINAL', updatedAt: '2026-02-21' },
  { id: 'res-hyrox-2', competitionId: 'c-hyrox-q1', userId: 'u-4', stage: 'FINISH', rank: 2, score: '01:12:09', scoreLabel: 'Finish time', detail: 'Second place.', status: 'FINAL', updatedAt: '2026-02-21' },
  { id: 'res-hyrox-3', competitionId: 'c-hyrox-q1', userId: 'u-2', stage: 'FINISH', rank: 3, score: '01:16:33', scoreLabel: 'Finish time', detail: 'Third place.', status: 'FINAL', updatedAt: '2026-02-21' },
  { id: 'res-tt-1', competitionId: 'c-tt-q3', userId: 'u-4', stage: 'FINAL', rank: 1, score: '3–0', scoreLabel: 'Sets', detail: 'Won the final without dropping a set.', status: 'FINAL', updatedAt: '2026-07-18' },
  { id: 'res-tt-2', competitionId: 'c-tt-q3', userId: 'u-3', stage: 'FINAL', rank: 2, score: '0–3', scoreLabel: 'Sets', detail: 'Runner-up.', status: 'FINAL', updatedAt: '2026-07-18' },
];
const records: EventRecord[] = [
  { id: 'rec-hyrox', eventId: 'HYROX', userId: 'u-1', competitionId: 'c-hyrox-q1', recordType: 'ALL_TIME', metric: 'Fastest HYROX finish', value: '01:08:42', achievedAt: '2026-02-21', note: 'Current office best across all recorded HYROX competitions.', verifiedBy: 'u-admin' },
  { id: 'rec-chess', eventId: 'CHESS', userId: 'u-2', competitionId: 'c-chess-q1', recordType: 'ALL_TIME', metric: 'Most consecutive wins', value: '7 wins', achievedAt: '2026-01-20', note: 'Seven consecutive match wins.', verifiedBy: 'u-admin' },
  { id: 'rec-tt', eventId: 'TABLE_TENNIS', userId: 'u-4', competitionId: 'c-tt-q3', recordType: 'UNIQUE', metric: 'Clean-sheet final', value: '3–0', achievedAt: '2026-07-18', note: 'First recorded clean-sheet final in the office league.', verifiedBy: 'u-admin' },
];

interface AppData {
  customCategories?: EventCategory[];
  users: AppUser[];
  competitions: Competition[];
  registrations: Registration[];
  results: CompetitionResult[];
  matches: KnockoutMatch[];
  records: EventRecord[];
  currentUserId: string | null;
}

type UserDetails = Pick<AppUser, 'firstName' | 'lastName' | 'employeeId'>;
type MatchInput = Omit<KnockoutMatch, 'id'>;
type ResultInput = Pick<CompetitionResult, 'competitionId' | 'userId' | 'score' | 'detail'> & { rank?: number };
type NextStatus = 'REGISTRATION_OPEN' | 'LIVE' | 'COMPLETED' | 'CANCELLED';

interface AppContextValue extends AppData {
  categories: EventCategory[];
  currentUser: AppUser | null;
  today: string;
  signIn: (employeeId: string) => AppUser | null;
  signOut: () => void;
  register: (competitionId: string, userId: string) => void;
  createCompetition: (sport: CreatableSport, deadline: string) => string | null;
  deleteEdition: (id: string) => void;
  setCompetitionStatus: (id: string, status: NextStatus) => void;
  saveResult: (result: ResultInput) => void;
  saveMatch: (match: MatchInput) => void;
  saveRecord: (record: Omit<EventRecord, 'id'>) => void;
  addUser: (user: UserDetails) => void;
  removeUser: (id: string) => void;
  updateDeadline: (id: string, deadline: string) => void;
}

const AppDataContext = createContext<AppContextValue | null>(null);
const admin = users[0];

function isAdminSession(data: AppData) {
  return data.currentUserId === admin.id && data.users.some(user => user.id === admin.id && user.role === 'ADMIN' && user.status === 'ACTIVE');
}

function readInitial(): AppData {
  let persisted: Omit<AppData, 'currentUserId'> = { users, competitions, registrations, results, records, matches: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppData;
      const roster = parsed.users.map(user => user.id === admin.id
        ? { ...user, role: admin.role, status: admin.status }
        : user.role === 'ADMIN' ? { ...user, role: 'ATHLETE' as const } : user);
      if (!roster.some(user => user.id === admin.id)) roster.unshift(admin);
      persisted = { ...parsed, users: roster, matches: parsed.matches ?? [] };
    }
  } catch {
    // Fall back to the starter data if an older store cannot be read.
  }
  const currentUserId = sessionStorage.getItem(SESSION_KEY);
  return { ...persisted, currentUserId: persisted.users.some(user => user.id === currentUserId && user.status !== 'REMOVED') ? currentUserId : null };
}

function isEntrant(data: AppData, competitionId: string, userId: string) {
  return data.registrations.some(r => r.competitionId === competitionId && r.userId === userId && r.status === 'REGISTERED');
}

function getCategory(data: AppData, competition: Competition) {
  return categories.find(c => c.id === competition.eventId) ?? data.customCategories?.find(c => c.id === competition.eventId);
}

function canTransition(competition: Competition, status: NextStatus, today: string) {
  switch (status) {
    case 'REGISTRATION_OPEN': return competition.status === 'DRAFT' && competition.registrationDeadline >= today;
    case 'LIVE': return canStart(competition, today);
    case 'COMPLETED': return competition.status === 'LIVE';
    case 'CANCELLED': return competition.status !== 'COMPLETED' && competition.status !== 'CANCELLED';
  }
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, syncData] = useState<AppData>(readInitial);
  const [today, setToday] = useState(eventDay);
  const setData = useCallback((update: (previous: AppData) => AppData) => {
    const previous = readInitial();
    const next = update(previous);
    if (next !== previous) {
      const { currentUserId, ...persisted } = next;
      const raw = JSON.stringify(persisted);
      if (raw !== localStorage.getItem(STORAGE_KEY)) localStorage.setItem(STORAGE_KEY, raw);
      if (currentUserId) sessionStorage.setItem(SESSION_KEY, currentUserId);
      else sessionStorage.removeItem(SESSION_KEY);
    }
    syncData(next);
  }, []);

  useEffect(() => {
    const refreshDay = () => setToday(eventDay());
    const timer = window.setInterval(refreshDay, 1000);
    window.addEventListener('focus', refreshDay);
    return () => { window.clearInterval(timer); window.removeEventListener('focus', refreshDay); };
  }, []);

  useEffect(() => {
    const receiveUpdate = (event: StorageEvent) => {
      if (event.storageArea !== localStorage || (event.key !== null && event.key !== STORAGE_KEY)) return;
      const next = readInitial();
      if (!next.currentUserId) sessionStorage.removeItem(SESSION_KEY);
      syncData(next);
    };
    window.addEventListener('storage', receiveUpdate);
    return () => window.removeEventListener('storage', receiveUpdate);
  }, []);

  const currentUser = data.users.find(u => u.id === data.currentUserId && u.status !== 'REMOVED') ?? null;
  const value = useMemo<AppContextValue>(() => ({
    ...data, categories: [...categories, ...(data.customCategories ?? [])], currentUser, today,
    signIn: employeeId => {
      const normalized = employeeId.trim().toUpperCase();
      const found = readInitial().users.find(u => u.status !== 'REMOVED' && u.employeeId.trim().toUpperCase() === normalized);
      if (found) setData(d => ({ ...d, currentUserId: found.id }));
      return found ?? null;
    },
    signOut: () => setData(d => ({ ...d, currentUserId: null })),
    register: (competitionId, userId) => {
      const entry: Registration = { id: crypto.randomUUID(), competitionId, userId, status: 'REGISTERED', registeredAt: new Date().toISOString() };
      setData(d => {
        const competition = d.competitions.find(c => c.id === competitionId);
        const user = d.users.find(u => u.id === userId);
        if (!competition || !registrationOpen(competition, eventDay()) || d.currentUserId !== userId ||
          user?.role !== 'ATHLETE' || user.status !== 'ACTIVE' || isEntrant(d, competitionId, userId)) return d;
        const count = d.registrations.filter(r => r.competitionId === competitionId && r.status === 'REGISTERED').length;
        if (competition.capacity > 0 && count >= competition.capacity) return d;
        return { ...d, registrations: [...d.registrations, entry] };
      });
    },
    createCompetition: (sport, deadline) => {
      const today = eventDay();
      const category = creatableSports.includes(sport) && categories.find(c => c.id === sport);
      if (!isAdminSession(data) || !category || !validDay(deadline) || deadline < today) return null;
      const id = crypto.randomUUID();
      const year = Number(deadline.slice(0, 4));
      const quarter = 'Q' + Math.ceil(Number(deadline.slice(5, 7)) / 3);
      const competition: Competition = {
        id, eventId: sport, name: category.name, quarter, year, venue: '',
        description: category.description, registrationStart: today, registrationDeadline: deadline,
        startAt: '', endAt: '', status: 'REGISTRATION_OPEN', capacity: 0, createdBy: admin.id,
      };
      setData(d => isAdminSession(d) ? { ...d, competitions: [competition, ...d.competitions] } : d);
      return id;
    },
    deleteEdition: id => setData(d => !isAdminSession(d) ? d : ({
      ...d,
      competitions: d.competitions.filter(c => c.id !== id),
      registrations: d.registrations.filter(r => r.competitionId !== id),
      results: d.results.filter(r => r.competitionId !== id),
      matches: d.matches.filter(m => m.competitionId !== id),
      records: d.records.filter(r => r.competitionId !== id),
    })),
    setCompetitionStatus: (id, status) => {
      const now = new Date();
      const stamp = now.toISOString();
      setData(d => {
        const current = d.competitions.find(c => c.id === id);
        if (!isAdminSession(d) || !current || !canTransition(current, status, eventDay(now))) return d;
        const next = { ...current, status };
        if (status === 'LIVE') { next.startAt = stamp; next.endAt = ''; }
        if (status === 'COMPLETED') next.endAt = stamp;
        return {
          ...d, competitions: d.competitions.map(c => c.id === id ? next : c),
          results: status === 'COMPLETED' ? d.results.map(r => r.competitionId === id ? { ...r, status: 'FINAL' } : r) : d.results,
        };
      });
    },
    saveResult: input => {
      const id = crypto.randomUUID();
      const updatedAt = new Date().toISOString();
      setData(d => {
        const event = d.competitions.find(c => c.id === input.competitionId);
        if (!isAdminSession(d) || !event || event.status !== 'LIVE' || !isEntrant(d, event.id, input.userId)) return d;
        const category = getCategory(d, event);
        if (!category || category.format === 'KNOCKOUT') return d;
        const timed = category.unit === 'time';
        const score = timed ? normalizeFinishTime(input.score) : input.score.trim();
        if (!score || (!timed && (!Number.isFinite(Number(score)) || Number(score) < 0 || !Number.isInteger(input.rank) || input.rank! < 1))) return d;
        const existing = d.results.find(r => r.competitionId === event.id && r.userId === input.userId && r.stage.toUpperCase() === 'FINISH');
        const result: CompetitionResult = {
          ...input, score, detail: input.detail.trim(), competitionId: event.id, id: existing?.id ?? id,
          stage: 'FINISH', rank: timed ? 0 : input.rank!, scoreLabel: category.scoreLabel, status: 'PENDING', updatedAt,
        };
        const next = [...d.results.filter(r => r.id !== existing?.id), result];
        if (!timed) return { ...d, results: next };
        const finishes = next.filter(r => r.competitionId === event.id && r.stage.toUpperCase() === 'FINISH' && normalizeFinishTime(r.score))
          .sort((a, b) => finishSeconds(a.score) - finishSeconds(b.score));
        let rank = 0;
        const ranks = new Map(finishes.map((row, index) => {
          if (index === 0 || finishSeconds(row.score) !== finishSeconds(finishes[index - 1].score)) rank = index + 1;
          return [row.id, rank];
        }));
        return { ...d, results: next.map(r => ranks.has(r.id) ? { ...r, rank: ranks.get(r.id)! } : r) };
      });
    },
    saveMatch: input => {
      const id = crypto.randomUUID();
      const updatedAt = new Date().toISOString();
      setData(d => {
        const event = d.competitions.find(c => c.id === input.competitionId);
        if (!isAdminSession(d) || !event || event.status !== 'LIVE' || getCategory(d, event)?.format !== 'KNOCKOUT') return d;
        const stage = input.stage.trim().toUpperCase();
        const match = { ...input, stage, id };
        if (!isEntrant(d, event.id, match.winnerId) || !isEntrant(d, event.id, match.opponentId) ||
          validateMatch(match, d.matches, event.eventId)) return d;
        const existing = d.matches.find(m => sameMatch(m, match));
        const winner = d.users.find(u => u.id === match.winnerId);
        const opponent = d.users.find(u => u.id === match.opponentId);
        if (!winner || !opponent) return d;
        const resultRows: CompetitionResult[] = [
          { id: `${existing?.id ?? id}-winner`, userId: winner.id, rank: 1, score: `${match.winnerScore}–${match.opponentScore}`, detail: `Won against ${opponent.firstName} ${opponent.lastName}.` },
          { id: `${existing?.id ?? id}-runner-up`, userId: opponent.id, rank: 2, score: `${match.opponentScore}–${match.winnerScore}`, detail: `Lost to ${winner.firstName} ${winner.lastName}.` },
        ].map(row => ({ ...row, competitionId: event.id, stage, scoreLabel: getCategory(d, event)!.scoreLabel, status: 'PENDING', updatedAt }));
        return {
          ...d, matches: [...d.matches.filter(m => m.id !== existing?.id), { ...match, id: existing?.id ?? id }],
          results: [...d.results.filter(r => !(r.competitionId === event.id && r.stage === stage && (r.userId === winner.id || r.userId === opponent.id))), ...resultRows],
        };
      });
    },
    saveRecord: record => {
      const id = crypto.randomUUID();
      setData(d => {
        if (!isAdminSession(d) || d.competitions.find(c => c.id === record.competitionId)?.status !== 'COMPLETED') return d;
        const other = d.records.filter(r => !(record.recordType === 'ALL_TIME' && r.eventId === record.eventId && r.recordType === 'ALL_TIME' && r.metric === record.metric));
        return { ...d, records: [...other, { ...record, id }] };
      });
    },
    addUser: input => {
      const firstName = input.firstName.trim();
      const lastName = input.lastName.trim();
      const employeeId = input.employeeId.trim().toUpperCase();
      if (!firstName || !lastName || !employeeId) return;
      const user: AppUser = {
        firstName, lastName, employeeId, id: crypto.randomUUID(), status: 'ACTIVE',
        role: 'ATHLETE', department: '', team: '', joinedOn: eventDay().slice(0, 4),
      };
      setData(d => !isAdminSession(d) || d.users.some(u => u.status !== 'REMOVED' && u.employeeId.trim().toUpperCase() === employeeId)
        ? d : { ...d, users: [...d.users, user] });
    },
    removeUser: id => setData(d => {
      const user = d.users.find(u => u.id === id);
      if (!isAdminSession(d) || user?.role !== 'ATHLETE' || user.status === 'REMOVED') return d;
      const pending = new Set(d.competitions.filter(c => c.status === 'DRAFT' || c.status === 'UPCOMING' || c.status === 'REGISTRATION_OPEN').map(c => c.id));
      return {
        ...d, users: d.users.map(u => u.id === id ? { ...u, status: 'REMOVED' } : u),
        registrations: d.registrations.map(r => r.userId === id && pending.has(r.competitionId) && r.status === 'REGISTERED'
          ? { ...r, status: 'WITHDRAWN' } : r),
      };
    }),
    updateDeadline: (id, deadline) => setData(d => {
      const competition = d.competitions.find(c => c.id === id);
      if (!isAdminSession(d) || !competition || !['DRAFT', 'REGISTRATION_OPEN', 'UPCOMING'].includes(competition.status) ||
        !validDay(deadline) || deadline < eventDay() || deadline < competition.registrationStart) return d;
      return { ...d, competitions: d.competitions.map(c => c.id === id ? { ...c, registrationDeadline: deadline } : c) };
    }),
  }), [data, currentUser, setData, today]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) throw new Error('useAppData must be used inside AppDataProvider');
  return context;
}
