import type { Competition, CompetitionStatus } from '../types/domain';

export const creatableSports = ['HYROX', 'MARATHON', 'CHESS', 'CARROM'] as const;
export type CreatableSport = typeof creatableSports[number];

const timeZone = 'Asia/Kolkata';
const dayKey = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' });

export const eventDay = (date = new Date()) => dayKey.format(date);

export function validDay(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function canStart(competition: Competition, today: string) {
  return (competition.status === 'REGISTRATION_OPEN' || competition.status === 'UPCOMING') &&
    validDay(competition.registrationDeadline) && competition.registrationDeadline < today;
}

export function registrationOpen(competition: Competition, today: string) {
  return competition.status === 'REGISTRATION_OPEN' && validDay(competition.registrationDeadline) &&
    today <= competition.registrationDeadline && (!competition.registrationStart || competition.registrationStart <= today);
}

export function eventStatus(competition: Competition, today: string) {
  return canStart(competition, today) ? 'READY' : competition.status;
}

export const statusLabel: Record<CompetitionStatus | 'READY', string> = {
  DRAFT: 'Draft', REGISTRATION_OPEN: 'Registration open', UPCOMING: 'Upcoming', READY: 'Ready to start',
  LIVE: 'Live now', COMPLETED: 'Completed', CANCELLED: 'Cancelled',
};

export function formatEventDate(value: string, options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }) {
  if (!value) return '—';
  const date = new Date(value.includes('T') ? (/([zZ]|[+-]\d{2}:\d{2})$/.test(value) ? value : `${value}+05:30`) : `${value}T00:00:00+05:30`);
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('en-IN', { ...options, timeZone }).format(date);
}
