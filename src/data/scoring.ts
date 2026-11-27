import type { KnockoutMatch } from '../types/domain';

type MatchInput = Omit<KnockoutMatch, 'id'>;

export const knockoutRounds = ['ROUND OF 64', 'ROUND OF 32', 'ROUND OF 16', 'QUARTER FINAL', 'SEMI FINAL', 'FINAL'];

export function normalizeFinishTime(value: string) {
  const match = /^(\d{1,3}):([0-5]\d):([0-5]\d)$/.exec(value.trim());
  if (!match || finishSeconds(value) <= 0) return null;
  return `${String(Number(match[1])).padStart(2, '0')}:${match[2]}:${match[3]}`;
}

export function finishSeconds(value: string) {
  const [hours, minutes, seconds] = value.trim().split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}

function includesPlayer(match: MatchInput, id: string) {
  return match.winnerId === id || match.opponentId === id;
}

export function sameMatch(a: MatchInput, b: MatchInput) {
  return a.competitionId === b.competitionId && a.stage === b.stage &&
    includesPlayer(a, b.winnerId) && includesPlayer(a, b.opponentId);
}

export function validateMatch(match: MatchInput, matches: KnockoutMatch[], sport: string) {
  if (!match.winnerId || !match.opponentId || match.winnerId === match.opponentId) return 'Select two different registered players.';
  if (!knockoutRounds.includes(match.stage)) return 'Select a match round.';
  const step = sport === 'CHESS' ? 2 : 1;
  const scores = [match.winnerScore, match.opponentScore];
  if (scores.some(score => !Number.isSafeInteger(score * step) || score < 0)) {
    return sport === 'CHESS' ? 'Enter both scores in whole or half points.' : 'Enter both scores as whole numbers.';
  }
  if (match.winnerScore <= match.opponentScore) return 'The winner’s score must be higher than the opponent’s.';
  const round = matches.filter(entry => entry.competitionId === match.competitionId && entry.stage === match.stage && !sameMatch(entry, match));
  if (match.stage === 'FINAL' && round.length) return 'A final has already been recorded. Edit that match to make a correction.';
  if (round.some(entry => includesPlayer(entry, match.winnerId) || includesPlayer(entry, match.opponentId))) {
    return 'One of these players already has a match in this round.';
  }
  return '';
}

export function roundLabel(stage: string) {
  return stage.toLowerCase().replace(/^\w/, first => first.toUpperCase());
}
