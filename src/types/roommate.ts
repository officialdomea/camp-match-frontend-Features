import type { LivingPreference, StudentProfile } from "@/types/auth";

export type RoommateEligibilityStatus = "not_started" | "eligible" | "ineligible";

export type RoommateEligibilityState = {
  status: RoommateEligibilityStatus;
  canMatch: boolean;
  livingPreference: LivingPreference | null;
  reason: string | null;
};

export type RoommatePreferences = {
  studentId: string;
  universityId: string;
  preferredArea: string;
  accommodationTypes: string[];
  budgetMin: number;
  budgetMax: number;
  livingPreference: LivingPreference;
  lifestylePreferences: string[];
  studyHabits: string;
  sleepSchedule: string;
  noisePreference: string;
  cleanlinessPreference: string;
  socialPreference: string;
  notes?: string;
};

export type CompatibilityResult = {
  score: number;
  matchedPreferences: string[];
  differences: string[];
  summary: string;
};

export type MatchStatus = "none" | "pending" | "accepted" | "declined" | "cancelled" | "matched";

export type MatchCandidate = {
  id: string;
  studentId: string;
  name: string;
  profileImage?: string;
  universityId: string;
  preferredArea: string;
  accommodationTypes: string[];
  budgetMin: number;
  budgetMax: number;
  livingPreference: LivingPreference;
  lifestylePreferences: string[];
  studyHabits: string;
  sleepSchedule: string;
  noisePreference: string;
  cleanlinessPreference: string;
  socialPreference: string;
  compatibility: CompatibilityResult;
};

export type MatchRequest = {
  id: string;
  requesterId: string;
  recipientId: string;
  requesterAccepted: boolean;
  recipientAccepted: boolean;
  status: MatchStatus;
  createdAt: string;
  updatedAt: string;
};

export type ConfirmedMatch = {
  id: string;
  requestId: string;
  participantIds: [string, string];
  status: "matched";
  matchedAt: string;
};

export type RoommatePreference = RoommatePreferences;

export type RoommateMatch = {
  id: string;
  studentId: string;
  candidateStudentId: string;
  candidateName: string;
  score: number;
  sharedPreferences: string[];
  reasons: string[];
  status: "suggested" | "contacted" | "dismissed";
  createdAt: string;
};

export function getRoommateEligibility(
  livingPreference: LivingPreference | null | undefined,
): RoommateEligibilityState {
  if (!livingPreference) {
    return {
      status: "not_started",
      canMatch: false,
      livingPreference: null,
      reason: "Student profile is incomplete; roommate matching has not started.",
    };
  }

  if (livingPreference === "live-alone") {
    return {
      status: "ineligible",
      canMatch: false,
      livingPreference: "live-alone",
      reason: "LIVE_ALONE students are ineligible for roommate matching.",
    };
  }

  return {
    status: "eligible",
    canMatch: true,
    livingPreference: "find-roommate",
    reason: "FIND_ROOMMATE students are eligible for roommate matching.",
  };
}

export function createDefaultRoommatePreferences(studentId: string): RoommatePreferences {
  return {
    studentId,
    universityId: "university-not-set",
    preferredArea: "Ekosodin",
    accommodationTypes: ["shared"],
    budgetMin: 200000,
    budgetMax: 400000,
    livingPreference: "find-roommate",
    lifestylePreferences: ["study-focused", "quiet"],
    studyHabits: "balanced",
    sleepSchedule: "flexible",
    noisePreference: "quiet",
    cleanlinessPreference: "moderate",
    socialPreference: "moderate",
    notes: "",
  };
}

export function isValidRoommatePreferences(value: RoommatePreferences): boolean {
  if (!value.studentId.trim()) return false;
  if (!value.universityId.trim()) return false;
  if (!value.preferredArea.trim()) return false;
  if (value.budgetMin <= 0 || value.budgetMax <= 0) return false;
  if (value.budgetMin > value.budgetMax) return false;
  return value.accommodationTypes.length > 0 && value.lifestylePreferences.length > 0;
}

export type RoommatePreferenceSource = Pick<
  StudentProfile,
  | "universityId"
  | "preferredArea"
  | "accommodationTypes"
  | "budgetMin"
  | "budgetMax"
  | "livingPreference"
>;
