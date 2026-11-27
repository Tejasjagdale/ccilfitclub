import type { AppUser, CabinetAward, Competition, CompetitionResult, EventCategory, EventRecord, KnockoutMatch, Registration } from '../types/domain';

export const ADMIN_EMPLOYEE_ID = 'ADM007';

export interface AppData {
  customCategories?: EventCategory[];
  users: AppUser[];
  competitions: Competition[];
  registrations: Registration[];
  results: CompetitionResult[];
  matches: KnockoutMatch[];
  records: EventRecord[];
  awards: Record<string, CabinetAward[]>;
  currentUserId: string | null;
}

export function emptyAppData(): AppData {
  return { users: [], competitions: [], registrations: [], results: [], matches: [], records: [], awards: {}, currentUserId: null };
}
