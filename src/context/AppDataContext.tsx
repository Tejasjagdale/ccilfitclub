import { dateAfter } from '../data/dateAfter';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AppUser, Competition, CompetitionResult, EventCategory, EventRecord, Registration, CompetitionStatus } from '../types/domain';

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
  { id: 'c-hyrox-q4', eventId: 'HYROX', name: 'HYROX · Q4 2026', quarter: 'Q4', year: 2026, venue: 'Main Sports Arena', description: 'The final fitness challenge of the year.', registrationStart: '2026-10-20', registrationDeadline: '2026-11-20', startAt: '2026-11-22T08:00', endAt: '2026-11-22T15:00', status: 'REGISTRATION_OPEN', capacity: 40, createdBy: 'u-admin' },
  { id: 'c-zenga-live', eventId: 'ZENGA', name: 'Zenga Showdown · Q4 2026', quarter: 'Q4', year: 2026, venue: 'Lounge Area', description: 'A live test of focus, patience and steady hands.', registrationStart: '2026-11-01', registrationDeadline: '2026-11-14', startAt: '2026-11-15T14:00', endAt: '2026-11-15T17:00', status: 'LIVE', capacity: 16, createdBy: 'u-admin' },
  { id: 'c-marathon-q4', eventId: 'MARATHON', name: 'Office 5K · Q4 2026', quarter: 'Q4', year: 2026, venue: 'Bandra Promenade', description: 'A timed 5 kilometre team run.', registrationStart: '2026-11-10', registrationDeadline: '2026-11-28', startAt: '2026-12-06T06:30', endAt: '2026-12-06T09:00', status: 'UPCOMING', capacity: 100, createdBy: 'u-admin' },
];
const registrations: Registration[] = [
  { id: 'r-club-run', competitionId: 'c-club-run', userId: 'u-2', status: 'REGISTERED', registeredAt: dateAfter(0) },
  ...['u-1','u-2','u-3','u-4'].map((userId, i) => ({ id: `r-hyrox-${i}`, competitionId: 'c-hyrox-q1', userId, status: 'REGISTERED' as const, registeredAt: '2026-02-10' })),
  ...['u-1','u-2','u-3','u-4'].map((userId, i) => ({ id: `r-chess-${i}`, competitionId: 'c-chess-q1', userId, status: 'REGISTERED' as const, registeredAt: '2026-01-10' })),
  ...['u-1','u-2','u-3'].map((userId, i) => ({ id: `r-zenga-${i}`, competitionId: 'c-zenga-live', userId, status: 'REGISTERED' as const, registeredAt: '2026-11-10' })),
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

interface AppData { customCategories?: EventCategory[]; users: AppUser[]; competitions: Competition[]; registrations: Registration[]; results: CompetitionResult[]; records: EventRecord[]; currentUserId: string | null; }
interface AppContextValue extends AppData {
  categories: EventCategory[]; currentUser: AppUser | null;
  signIn: (employeeId: string) => AppUser | null; signOut: () => void;
  register: (competitionId: string, userId: string) => void;
  createEdition: (competition: Omit<Competition, 'createdBy'>, category?: EventCategory) => void;
  createCompetition: (competition: Omit<Competition, 'id' | 'createdBy'>) => void;
  setCompetitionStatus: (id: string, status: CompetitionStatus) => void;
  saveResult: (result: Omit<CompetitionResult, 'id' | 'updatedAt'>) => void;
  saveRecord: (record: Omit<EventRecord, 'id'>) => void;
  addUser: (user: Omit<AppUser, 'id' | 'joinedOn'>) => void;
  updateUser: (id: string, updates: Partial<Pick<AppUser, 'role' | 'status' | 'department' | 'team'>>) => void;
  updateCompetition: (id: string, updates: Partial<Pick<Competition, 'registrationStart' | 'registrationDeadline' | 'startAt' | 'endAt' | 'venue' | 'description' | 'capacity'>>) => void;
}
const AppDataContext = createContext<AppContextValue | null>(null);
const isAdminSession = (data: AppData) => data.users.some(user => user.id === data.currentUserId && user.role === 'ADMIN' && user.status === 'ACTIVE');
const localDateKey = () => { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`; };
function readInitial(): AppData {
  let persisted: Omit<AppData, 'currentUserId'>;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) { const parsed = JSON.parse(raw) as AppData; persisted = { customCategories: parsed.customCategories ?? [], users: parsed.users, competitions: parsed.competitions, registrations: parsed.registrations, results: parsed.results, records: parsed.records }; }
    else persisted = { users, competitions, registrations, results, records };
  } catch { persisted = { users, competitions, registrations, results, records }; }
  const currentUserId = sessionStorage.getItem(SESSION_KEY);
  return { ...persisted, currentUserId };
}
export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(readInitial);
  useEffect(() => {
    const { currentUserId, ...persisted } = data;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...persisted, currentUserId: null }));
    if (currentUserId) sessionStorage.setItem(SESSION_KEY, currentUserId);
    else sessionStorage.removeItem(SESSION_KEY);
  }, [data]);
  const currentUser = data.users.find((u) => u.id === data.currentUserId) ?? null;
  const value = useMemo<AppContextValue>(() => ({
    ...data, categories: [...categories, ...(data.customCategories ?? [])], currentUser,
    signIn: (employeeId) => { const normalized = employeeId.trim().toLowerCase(); const found = data.users.find((u) => u.employeeId.trim().toLowerCase() === normalized); if (found) setData((d) => ({ ...d, currentUserId: found.id })); return found ?? null; },
    signOut: () => setData((d) => ({ ...d, currentUserId: null })),
    register: (competitionId, userId) => setData((d) => { const competition = d.competitions.find(c => c.id === competitionId); const user = d.users.find(u => u.id === userId); const count = d.registrations.filter(r => r.competitionId === competitionId && r.status === 'REGISTERED').length; const today = localDateKey(); const open = d.currentUserId === userId && competition?.status === 'REGISTRATION_OPEN' && competition.registrationDeadline >= today && (!competition.registrationStart || competition.registrationStart <= today) && count < (competition.capacity || Infinity) && user?.role === 'ATHLETE' && user.status === 'ACTIVE'; if (!open || d.registrations.some(r => r.competitionId === competitionId && r.userId === userId && r.status === 'REGISTERED')) return d; return { ...d, registrations: [...d.registrations, { id: `r-${Date.now()}-${Math.random().toString(36).slice(2,7)}`, competitionId, userId, status: 'REGISTERED', registeredAt: new Date().toISOString() }] }; }),
    createEdition: (edition, category) => setData(d => !isAdminSession(d) ? d : ({ ...d, customCategories: category ? [...(d.customCategories ?? []), category] : d.customCategories, competitions: [...d.competitions, { ...edition, createdBy: d.currentUserId! }] })),
    createCompetition: (competition) => setData((d) => !isAdminSession(d) ? d : ({ ...d, competitions: [...d.competitions, { ...competition, id: `c-${Date.now()}`, createdBy: d.currentUserId! }] })),
    setCompetitionStatus: (id, status) => setData((d) => { if (!isAdminSession(d)) return d; const current = d.competitions.find(c => c.id === id); if (!current) return d; const transitions: Record<CompetitionStatus, CompetitionStatus[]> = { DRAFT: ['REGISTRATION_OPEN','UPCOMING','CANCELLED'], REGISTRATION_OPEN: ['UPCOMING','LIVE','CANCELLED'], UPCOMING: ['LIVE','CANCELLED'], LIVE: ['COMPLETED','CANCELLED'], COMPLETED: [], CANCELLED: [] }; if (!transitions[current.status].includes(status)) return d; return { ...d, competitions: d.competitions.map(c => c.id === id ? { ...c, status } : c), results: status === 'COMPLETED' ? d.results.map(r => r.competitionId === id ? { ...r, status: 'FINAL' } : r) : d.results }; }),
    saveResult: (result) => setData((d) => { if (!isAdminSession(d) || d.competitions.find(c => c.id === result.competitionId)?.status !== 'LIVE') return d; const existing = d.results.find((r) => r.competitionId === result.competitionId && r.userId === result.userId && r.stage === result.stage); const next = { ...result, id: existing?.id ?? `res-${crypto.randomUUID()}`, status: 'PENDING' as const, updatedAt: new Date().toISOString() }; return { ...d, results: existing ? d.results.map((r) => r.id === existing.id ? next : r) : [...d.results, next] }; }),
    saveRecord: (record) => setData((d) => { if (!isAdminSession(d) || d.competitions.find(c => c.id === record.competitionId)?.status !== 'COMPLETED') return d; return { ...d, records: [...d.records.filter(r => !(record.recordType === 'ALL_TIME' && r.eventId === record.eventId && r.recordType === 'ALL_TIME' && r.metric === record.metric)), { ...record, id: `rec-${Date.now()}` }] }; }),
    addUser: (user) => setData((d) => !isAdminSession(d) || d.users.some(u => u.employeeId.toLowerCase() === user.employeeId.toLowerCase()) ? d : ({ ...d, users: [...d.users, { ...user, employeeId: user.employeeId.trim().toUpperCase(), id: `u-${Date.now()}`, joinedOn: String(new Date().getFullYear()) }] })),
    updateUser: (id, updates) => setData((d) => !isAdminSession(d) ? d : ({ ...d, users: d.users.map(u => u.id === id ? { ...u, ...updates } : u) })),
    updateCompetition: (id, updates) => setData((d) => { if (!isAdminSession(d)) return d; const target = d.competitions.find(c => c.id === id); if (!target || !['DRAFT','REGISTRATION_OPEN','UPCOMING'].includes(target.status)) return d; const next = { ...target, ...updates }; if (next.registrationDeadline < next.registrationStart || next.registrationDeadline > next.startAt.slice(0,10)) return d; return { ...d, competitions: d.competitions.map(c => c.id === id ? next : c) }; }),
  }), [data, currentUser]);
  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}
export function useAppData() { const context = useContext(AppDataContext); if (!context) throw new Error('useAppData must be used inside AppDataProvider'); return context; }
