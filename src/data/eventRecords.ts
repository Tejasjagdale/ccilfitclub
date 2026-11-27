import type { Competition, CompetitionResult, EventRecord, RecordEntry, Registration } from '../types/domain';
import { editionDate } from './athleteEvents';
import { eventDay, validDay } from './competitionLifecycle';

export function cleanMetric(metric: string) {
  return metric.trim().replace(/\s+/g, ' ');
}

export function matchesAllTimeMetric(record: EventRecord, entry: Pick<RecordEntry, 'recordType' | 'eventId' | 'metric'>) {
  return entry.recordType === 'ALL_TIME' && record.recordType === 'ALL_TIME' && record.eventId === entry.eventId &&
    cleanMetric(record.metric).toLowerCase() === cleanMetric(entry.metric).toLowerCase();
}

export function recordHolderIds(competitionId: string, registrations: Registration[], results: CompetitionResult[]) {
  return new Set([
    ...registrations.filter(row => row.competitionId === competitionId && row.status === 'REGISTERED').map(row => row.userId),
    ...results.filter(row => row.competitionId === competitionId && row.status === 'FINAL').map(row => row.userId),
  ]);
}

export function recordEditionDate(edition: Competition) {
  const value = editionDate(edition);
  if (value.includes('T') && /(?:[zZ]|[+-]\d{2}:\d{2})$/.test(value)) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : eventDay(date);
  }
  const day = value.slice(0, 10);
  return validDay(day) ? day : '';
}
