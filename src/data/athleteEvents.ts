import type { AppUser, Competition, CompetitionResult } from '../types/domain';

export function eventLink(event: Pick<Competition, 'eventId'> & { id?: string }) {
  const path = `/events/${encodeURIComponent(event.eventId)}`;
  return event.id ? `${path}?competition=${encodeURIComponent(event.id)}` : path;
}

export function editionDate(event: Competition) {
  return event.endAt || event.startAt || event.registrationDeadline;
}

export function athleteName(user?: AppUser) {
  return user ? `${user.firstName} ${user.lastName}` : 'Unknown athlete';
}

export function standingsStage(results: CompetitionResult[], hasMatches: boolean) {
  const final = results.find(result => result.stage.trim().toUpperCase() === 'FINAL');
  if (final) return final.stage;
  if (hasMatches) return undefined;
  return results.reduce<CompetitionResult | undefined>((latest, result) =>
    !latest || result.updatedAt > latest.updatedAt ? result : latest, undefined)?.stage;
}
