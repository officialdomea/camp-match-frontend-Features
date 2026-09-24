import { createAppError } from "@/lib/api/errors";
import type {
  ConfirmedMatch,
  MatchCandidate,
  MatchRequest,
  RoommateEligibilityState,
  RoommatePreferences,
} from "@/types/roommate";
import type { RoommateProvider } from "./roommate.provider";

const unimplemented = (method: string): never => {
  throw createAppError("SERVER_ERROR", {
    title: "Roommate API not connected",
    message: `The ${method} endpoint is not available until the FastAPI integration is added.`,
  });
};

export const apiRoommateProvider: RoommateProvider = {
  async getEligibility(): Promise<RoommateEligibilityState> {
    return {
      status: "not_started",
      canMatch: false,
      livingPreference: null,
      reason: "Roommate matching is not available until the backend is connected.",
    };
  },

  async getPreferences(): Promise<RoommatePreferences | null> {
    return null;
  },

  async updatePreferences(preferences: RoommatePreferences): Promise<RoommatePreferences> {
    return preferences;
  },

  async getCandidates(): Promise<MatchCandidate[]> {
    return [];
  },

  async getRequests(): Promise<MatchRequest[]> {
    return [];
  },

  async getConfirmedMatches(): Promise<ConfirmedMatch[]> {
    return [];
  },

  async sendMatchRequest(): Promise<MatchRequest> {
    return Promise.reject(
      createAppError("SERVER_ERROR", {
        title: "Roommate API not connected",
        message:
          "The sendMatchRequest endpoint is not available until the FastAPI integration is added.",
      }),
    );
  },

  async cancelMatchRequest(): Promise<void> {
    return Promise.reject(
      createAppError("SERVER_ERROR", {
        title: "Roommate API not connected",
        message:
          "The cancelMatchRequest endpoint is not available until the FastAPI integration is added.",
      }),
    );
  },

  async acceptMatchRequest(): Promise<MatchRequest> {
    return Promise.reject(
      createAppError("SERVER_ERROR", {
        title: "Roommate API not connected",
        message:
          "The acceptMatchRequest endpoint is not available until the FastAPI integration is added.",
      }),
    );
  },

  async declineMatchRequest(): Promise<MatchRequest> {
    return Promise.reject(
      createAppError("SERVER_ERROR", {
        title: "Roommate API not connected",
        message:
          "The declineMatchRequest endpoint is not available until the FastAPI integration is added.",
      }),
    );
  },
};
