import { eventDay } from './competitionLifecycle';

export function dateAfter(days: number) {
  return eventDay(new Date(Date.now() + days * 86_400_000));
}

