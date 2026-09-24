import { env } from "@/lib/env";
import { apiRoommateProvider } from "./roommate.api-provider";
import { mockRoommateProvider } from "./roommate.mock-provider";
import type { RoommateProvider } from "./roommate.provider";

const provider: RoommateProvider = env.useMockData ? mockRoommateProvider : apiRoommateProvider;

export const roommateService: RoommateProvider = {
  getEligibility: (studentId) => provider.getEligibility(studentId),
  getPreferences: (studentId) => provider.getPreferences(studentId),
  updatePreferences: (preferences) => provider.updatePreferences(preferences),
  getCandidates: (studentId) => provider.getCandidates(studentId),
  getRequests: (studentId) => provider.getRequests(studentId),
  getConfirmedMatches: (studentId) => provider.getConfirmedMatches(studentId),
  sendMatchRequest: (targetStudentId, actingUserId) =>
    provider.sendMatchRequest(targetStudentId, actingUserId),
  cancelMatchRequest: (requestId, actingUserId) =>
    provider.cancelMatchRequest(requestId, actingUserId),
  acceptMatchRequest: (requestId, actingUserId) =>
    provider.acceptMatchRequest(requestId, actingUserId),
  declineMatchRequest: (requestId, actingUserId) =>
    provider.declineMatchRequest(requestId, actingUserId),
};
