import type {
  ConfirmedMatch,
  MatchCandidate,
  MatchRequest,
  RoommateEligibilityState,
  RoommatePreferences,
} from "@/types/roommate";

export type RoommateProvider = {
  getEligibility(studentId?: string): Promise<RoommateEligibilityState>;
  getPreferences(studentId?: string): Promise<RoommatePreferences | null>;
  updatePreferences(preferences: RoommatePreferences): Promise<RoommatePreferences>;
  getCandidates(studentId?: string): Promise<MatchCandidate[]>;
  getRequests(studentId?: string): Promise<MatchRequest[]>;
  getConfirmedMatches(studentId?: string): Promise<ConfirmedMatch[]>;
  sendMatchRequest(targetStudentId: string, actingUserId: string): Promise<MatchRequest>;
  cancelMatchRequest(requestId: string, actingUserId: string): Promise<void>;
  acceptMatchRequest(requestId: string, actingUserId: string): Promise<MatchRequest>;
  declineMatchRequest(requestId: string, actingUserId: string): Promise<MatchRequest>;
};
