export type UserRole = 'ATHLETE' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'RETIRED' | 'REMOVED';
export type CompetitionStatus = 'DRAFT' | 'REGISTRATION_OPEN' | 'UPCOMING' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
export type ResultStatus = 'PENDING' | 'FINAL';
export type EventFormat = 'TIMED' | 'DISTANCE' | 'KNOCKOUT' | 'POINTS' | 'SETS';

export interface AppUser {
  id: string; firstName: string; lastName: string; employeeId: string;
  status: UserStatus; role: UserRole; department: string; team: string; joinedOn: string;
}
export interface EventCategory {
  id: string; name: string; format: EventFormat; scoreLabel: string; unit: string;
  description: string; icon: string;
}
export interface Competition {
  id: string; eventId: string; name: string; quarter: string; year: number; venue: string;
  description: string; registrationStart: string; registrationDeadline: string; startAt: string;
  endAt: string; status: CompetitionStatus; capacity: number; createdBy: string;
}
export interface Registration {
  id: string; competitionId: string; userId: string; status: 'REGISTERED' | 'WITHDRAWN' | 'DISQUALIFIED'; registeredAt: string;
}
export interface CompetitionResult {
  id: string; competitionId: string; userId: string; stage: string; rank: number;
  score: string; scoreLabel: string; detail: string; status: ResultStatus; updatedAt: string;
}
export interface KnockoutMatch {
  id: string; competitionId: string; stage: string; winnerId: string; opponentId: string;
  winnerScore: number; opponentScore: number;
}
export interface EventRecord {
  id: string; eventId: string; userId: string; competitionId?: string; recordType: 'ALL_TIME' | 'UNIQUE';
  metric: string; value: string; achievedAt: string; note: string; verifiedBy: string;
}

export type RecordEntry = Omit<EventRecord, 'id' | 'verifiedBy'>;

export interface CabinetAward {
  id: string; event: string; title: string; date: string; type: 'hyrox' | 'chess' | 'run';
  placement: string; detail: string; finish?: string;
}
