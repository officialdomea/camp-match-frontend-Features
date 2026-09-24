import { createAppError } from "@/lib/api/errors";
import {
  buildCompatibleCandidates,
  calculateCompatibility,
} from "@/features/roommates/domain/compatibility";
import type { AuthUser, LivingPreference, Session, StudentProfile } from "@/types/auth";
import {
  createDefaultRoommatePreferences,
  getRoommateEligibility,
  isValidRoommatePreferences,
  type ConfirmedMatch,
  type MatchCandidate,
  type MatchRequest,
  type RoommateEligibilityState,
  type RoommatePreferences,
} from "@/types/roommate";
import type { RoommateProvider } from "./roommate.provider";

const SESSION_KEY = "campmatch.session";
const ROOMMATE_KEY = "campmatch.roommate";

const fallbackStorage = (() => {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => (map.has(key) ? map.get(key)! : null),
    setItem: (key: string, value: string) => map.set(key, value),
    removeItem: (key: string) => map.delete(key),
    clear: () => map.clear(),
  } as unknown as Storage;
})();

function getLocalStorage(): Storage {
  if (typeof window !== "undefined" && window.localStorage) return window.localStorage;
  if (
    typeof globalThis !== "undefined" &&
    "localStorage" in globalThis &&
    globalThis.localStorage
  ) {
    return globalThis.localStorage;
  }
  return fallbackStorage;
}

const delay = <T>(value: T, ms = 250): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

type StoredSession = Partial<Session> & {
  user?: Partial<AuthUser> & {
    studentProfile?: Partial<StudentProfile> | null;
    livingPreference?: LivingPreference;
  };
};

function readStoredSession(): StoredSession | null {
  try {
    const raw = getLocalStorage().getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

function readCurrentUserId(): string | null {
  const session = readStoredSession();
  return session?.user?.id ?? null;
}

function readStudentProfile(): Partial<StudentProfile> | null {
  const session = readStoredSession();
  const user = session?.user;
  if (!user) return null;

  const profile = user.studentProfile ?? null;
  if (profile) return profile;

  if (user.livingPreference) {
    return {
      livingPreference: user.livingPreference,
      accommodationTypes: [],
      preferredArea: "",
      budgetMin: 200000,
      budgetMax: 800000,
      universityId: "",
    };
  }

  return null;
}

function readPreference(studentId?: string): RoommatePreferences | null {
  const session = readStoredSession();
  const user = session?.user;
  const currentId = studentId ?? user?.id ?? readCurrentUserId();
  if (!currentId) return null;

  const profile = readStudentProfile();
  const base = createDefaultRoommatePreferences(currentId);

  if (!user) {
    const storedRaw = getLocalStorage().getItem(ROOMMATE_KEY);
    if (storedRaw) {
      try {
        const stored = JSON.parse(storedRaw) as Record<string, RoommatePreferences>;
        const record = stored[currentId];
        if (record) return record;
      } catch {
        // ignore malformed storage and fall back to base profile
      }
    }
    return base;
  }

  const storedRaw = getLocalStorage().getItem(ROOMMATE_KEY);

  if (storedRaw) {
    try {
      const stored = JSON.parse(storedRaw) as Record<string, RoommatePreferences>;
      const record = stored[currentId];
      if (record) return record;
    } catch {
      // ignore malformed storage and fall back to base profile
    }
  }

  const profilePreference = profile?.livingPreference ?? user?.livingPreference;
  if (!profilePreference) return null;

  const merged: RoommatePreferences = {
    ...base,
    universityId: profile?.universityId ?? base.universityId,
    preferredArea: profile?.preferredArea ?? base.preferredArea,
    accommodationTypes: profile?.accommodationTypes ?? base.accommodationTypes,
    budgetMin: profile?.budgetMin ?? base.budgetMin,
    budgetMax: profile?.budgetMax ?? base.budgetMax,
    livingPreference: profilePreference,
  };

  return merged;
}

function writePreference(preferences: RoommatePreferences) {
  const raw = getLocalStorage().getItem(ROOMMATE_KEY);
  const existing = raw ? (JSON.parse(raw) as Record<string, RoommatePreferences>) : {};
  existing[preferences.studentId] = preferences;
  getLocalStorage().setItem(ROOMMATE_KEY, JSON.stringify(existing));
  return preferences;
}

function currentEligibility(studentId?: string): RoommateEligibilityState {
  const preference = readPreference(studentId);
  return getRoommateEligibility(preference?.livingPreference ?? null);
}

const seedProfiles: RoommatePreferences[] = [
  {
    studentId: "student-2",
    universityId: "univ-1",
    preferredArea: "Ekosodin",
    accommodationTypes: ["shared", "studio"],
    budgetMin: 180000,
    budgetMax: 360000,
    livingPreference: "find-roommate",
    lifestylePreferences: ["study-focused", "quiet", "clean"],
    studyHabits: "night-owl",
    sleepSchedule: "night-owl",
    noisePreference: "quiet",
    cleanlinessPreference: "high",
    socialPreference: "moderate",
    notes: "Prefers a calm study environment.",
  },
  {
    studentId: "student-3",
    universityId: "univ-1",
    preferredArea: "Ekosodin",
    accommodationTypes: ["shared", "duplex"],
    budgetMin: 200000,
    budgetMax: 380000,
    livingPreference: "find-roommate",
    lifestylePreferences: ["study-focused", "quiet"],
    studyHabits: "night-owl",
    sleepSchedule: "night-owl",
    noisePreference: "quiet",
    cleanlinessPreference: "high",
    socialPreference: "quiet",
    notes: "Loves neat spaces and early check-ins.",
  },
  {
    studentId: "student-4",
    universityId: "univ-2",
    preferredArea: "Akoka",
    accommodationTypes: ["private"],
    budgetMin: 350000,
    budgetMax: 500000,
    livingPreference: "find-roommate",
    lifestylePreferences: ["social", "music"],
    studyHabits: "morning-person",
    sleepSchedule: "early-bird",
    noisePreference: "lively",
    cleanlinessPreference: "moderate",
    socialPreference: "social",
    notes: "Enjoys a more social living setup.",
  },
  {
    studentId: "student-5",
    universityId: "univ-3",
    preferredArea: "Yaba",
    accommodationTypes: ["shared"],
    budgetMin: 250000,
    budgetMax: 420000,
    livingPreference: "find-roommate",
    lifestylePreferences: ["study-focused", "clean"],
    studyHabits: "night-owl",
    sleepSchedule: "night-owl",
    noisePreference: "quiet",
    cleanlinessPreference: "high",
    socialPreference: "moderate",
    notes: "Prefers a tidy environment and quiet evenings.",
  },
];

function seededCandidatesFor(studentId: string): MatchCandidate[] {
  const current = readPreference(studentId);
  if (!current || current.livingPreference === "live-alone") return [];

  const pool = seedProfiles.map((candidate) => ({
    ...candidate,
    id: candidate.studentId,
    compatibility: calculateCompatibility(current, candidate),
  }));

  return buildCompatibleCandidates(current, pool as RoommatePreferences[]).map((candidate) => ({
    id: candidate.studentId,
    studentId: candidate.studentId,
    name: `Student ${candidate.studentId.split("-").at(-1)}`,
    universityId: candidate.universityId,
    preferredArea: candidate.preferredArea,
    accommodationTypes: candidate.accommodationTypes,
    budgetMin: candidate.budgetMin,
    budgetMax: candidate.budgetMax,
    livingPreference: candidate.livingPreference,
    lifestylePreferences: candidate.lifestylePreferences,
    studyHabits: candidate.studyHabits,
    sleepSchedule: candidate.sleepSchedule,
    noisePreference: candidate.noisePreference,
    cleanlinessPreference: candidate.cleanlinessPreference,
    socialPreference: candidate.socialPreference,
    compatibility: candidate.compatibility,
  }));
}

function readAllRequests(): MatchRequest[] {
  const raw = getLocalStorage().getItem("campmatch.match-requests");
  if (!raw) return [];

  try {
    return (JSON.parse(raw) as MatchRequest[]).map((request) => ({
      ...request,
      requesterAccepted: request.requesterAccepted ?? request.status === "matched",
      recipientAccepted:
        request.recipientAccepted ??
        (request.status === "matched" || request.status === "accepted"),
    }));
  } catch {
    return [];
  }
}

function readRequests(studentId?: string): MatchRequest[] {
  const parsed = readAllRequests();
  const currentId = studentId ?? readCurrentUserId();
  if (!currentId)
    return parsed.filter(
      (request) => request.status !== "cancelled" && request.status !== "declined",
    );
  return parsed.filter(
    (request) =>
      (request.requesterId === currentId || request.recipientId === currentId) &&
      request.status !== "cancelled" &&
      request.status !== "declined",
  );
}

function writeRequests(requests: MatchRequest[]) {
  getLocalStorage().setItem("campmatch.match-requests", JSON.stringify(requests));
}

function readConfirmedMatches(studentId?: string): ConfirmedMatch[] {
  const raw = getLocalStorage().getItem("campmatch.confirmed-matches");
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as ConfirmedMatch[];
    const currentId = studentId ?? readCurrentUserId();
    if (!currentId) return parsed;
    return parsed.filter((match) => match.participantIds.includes(currentId));
  } catch {
    return [];
  }
}

function writeConfirmedMatches(matches: ConfirmedMatch[]) {
  getLocalStorage().setItem("campmatch.confirmed-matches", JSON.stringify(matches));
}

function ensureConfirmMatchExists(requests: MatchRequest[]) {
  const confirmedMatches = readConfirmedMatches();
  for (const request of requests) {
    if (request.status !== "matched") continue;
    const sorted = [request.requesterId, request.recipientId].sort() as [string, string];
    const exists = confirmedMatches.some(
      (match) =>
        match.participantIds.length === 2 &&
        match.participantIds.every((participant) => sorted.includes(participant)),
    );
    if (!exists) {
      writeConfirmedMatches([
        ...confirmedMatches,
        {
          id: `match_${Date.now()}_${request.id}`,
          requestId: request.id,
          participantIds: sorted,
          status: "matched",
          matchedAt: new Date().toISOString(),
        },
      ]);
    }
  }
}

export const mockRoommateProvider: RoommateProvider = {
  async getEligibility(studentId?: string) {
    const preference = readPreference(studentId);
    if (studentId && preference && preference.studentId && studentId !== preference.studentId) {
      return {
        status: "not_started",
        canMatch: false,
        livingPreference: null,
        reason: "This student profile is not the current session profile.",
      };
    }
    return currentEligibility(studentId);
  },

  async getPreferences(studentId?: string) {
    return delay(readPreference(studentId));
  },

  async updatePreferences(preferences: RoommatePreferences) {
    if (!isValidRoommatePreferences(preferences)) {
      throw createAppError("VALIDATION_ERROR", {
        title: "Your roommate preferences need attention",
        message: "Check the budget, area, and other roommate details and try again.",
      });
    }

    const normalized = {
      ...preferences,
      preferredArea: preferences.preferredArea.trim(),
      universityId: preferences.universityId.trim(),
      lifestylePreferences: [
        ...new Set(
          (preferences.lifestylePreferences ?? []).map((item) => item.trim()).filter(Boolean),
        ),
      ],
      accommodationTypes: [
        ...new Set(
          (preferences.accommodationTypes ?? []).map((item) => item.trim()).filter(Boolean),
        ),
      ],
      notes: preferences.notes?.trim() ?? "",
    };

    const persisted = writePreference(normalized);
    return delay(persisted);
  },

  async getCandidates(studentId?: string) {
    const currentUserId = studentId ?? readCurrentUserId();
    if (!currentUserId) {
      return delay([]);
    }

    const candidates = seededCandidatesFor(currentUserId);
    return delay(candidates);
  },

  async getRequests(studentId?: string) {
    return delay(readRequests(studentId));
  },

  async getConfirmedMatches(studentId?: string) {
    return delay(readConfirmedMatches(studentId));
  },

  async sendMatchRequest(targetStudentId: string, actingUserId: string) {
    const currentUserId = readCurrentUserId();
    if (!actingUserId || actingUserId !== currentUserId) {
      throw createAppError("AUTHENTICATION_ERROR");
    }
    if (targetStudentId === currentUserId) {
      throw createAppError("VALIDATION_ERROR", {
        title: "You cannot match with yourself",
        message: "Choose a different student to connect with.",
      });
    }

    const existing = readRequests(currentUserId).find(
      (request) =>
        (request.requesterId === currentUserId && request.recipientId === targetStudentId) ||
        (request.requesterId === targetStudentId && request.recipientId === currentUserId),
    );

    if (
      existing &&
      (existing.status === "pending" ||
        existing.status === "accepted" ||
        existing.status === "matched")
    ) {
      throw createAppError("CONFLICT", {
        title: "Request already exists",
        message: "You already have a request or match with this student.",
      });
    }

    const request: MatchRequest = {
      id: `match_${Date.now()}`,
      requesterId: currentUserId,
      recipientId: targetStudentId,
      requesterAccepted: false,
      recipientAccepted: false,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const allRequests = readAllRequests();
    writeRequests([...allRequests, request]);
    return delay(clone(request));
  },

  async cancelMatchRequest(requestId: string, actingUserId: string) {
    const requests = readAllRequests();
    const target = requests.find((request) => request.id === requestId);
    if (!target) throw createAppError("NOT_FOUND");
    if (target.requesterId !== actingUserId) {
      throw createAppError("FORBIDDEN", {
        title: "You cannot cancel this request",
        message: "Only the requesting student can cancel a roommate request.",
      });
    }
    if (
      target.status === "accepted" ||
      target.status === "matched" ||
      target.status === "declined"
    ) {
      throw createAppError("VALIDATION_ERROR", {
        title: "This request cannot be cancelled",
        message: "Only active requests can be cancelled.",
      });
    }

    const next: MatchRequest = {
      ...target,
      status: "cancelled",
      updatedAt: new Date().toISOString(),
    };
    writeRequests(requests.map((request) => (request.id === requestId ? next : request)));
    return delay(undefined, 150);
  },

  async acceptMatchRequest(requestId: string, actingUserId: string) {
    const requests = readAllRequests();
    const target = requests.find((request) => request.id === requestId);
    if (!target) throw createAppError("NOT_FOUND");
    if (actingUserId !== target.requesterId && actingUserId !== target.recipientId) {
      throw createAppError("FORBIDDEN", {
        title: "You cannot accept this request",
        message: "Only participants can accept a roommate request.",
      });
    }
    if (target.status === "declined" || target.status === "cancelled") {
      throw createAppError("VALIDATION_ERROR", {
        title: "This request cannot be accepted",
        message: "Only pending or accepted requests can be accepted.",
      });
    }

    if (target.status === "matched") return delay(clone(target));

    const requesterAccepted = target.requesterAccepted || actingUserId === target.requesterId;
    const recipientAccepted = target.recipientAccepted || actingUserId === target.recipientId;
    const isMutuallyAccepted = requesterAccepted && recipientAccepted;
    const acceptedAt = new Date().toISOString();

    const updatedRequests: MatchRequest[] = requests.map((request) => {
      if (request.id === requestId) {
        return {
          ...request,
          requesterAccepted,
          recipientAccepted,
          status: isMutuallyAccepted ? "matched" : "accepted",
          updatedAt: acceptedAt,
        };
      }

      return request;
    });

    const finalRequest = updatedRequests.find((request) => request.id === requestId) ?? {
      ...target,
      status: isMutuallyAccepted ? "matched" : "accepted",
      updatedAt: acceptedAt,
    };

    if (isMutuallyAccepted) {
      const pair = [target.requesterId, target.recipientId].sort() as [string, string];
      const existingMatches = readConfirmedMatches();
      const alreadyMatched = existingMatches.some(
        (match) =>
          match.participantIds.length === 2 &&
          match.participantIds.every((participant) => pair.includes(participant)),
      );

      if (!alreadyMatched) {
        writeConfirmedMatches([
          ...existingMatches,
          {
            id: `match_${Date.now()}`,
            requestId: requestId,
            participantIds: pair,
            status: "matched",
            matchedAt: acceptedAt,
          },
        ]);
      }
    }

    writeRequests(updatedRequests);

    if (finalRequest.status === "matched") {
      ensureConfirmMatchExists(updatedRequests);
    }

    return delay(clone(finalRequest));
  },

  async declineMatchRequest(requestId: string, actingUserId: string) {
    const requests = readAllRequests();
    const target = requests.find((request) => request.id === requestId);
    if (!target) throw createAppError("NOT_FOUND");
    if (target.requesterId !== actingUserId && target.recipientId !== actingUserId) {
      throw createAppError("FORBIDDEN", {
        title: "You cannot decline this request",
        message: "Only participants can decline a roommate request.",
      });
    }
    if (target.status !== "pending") {
      throw createAppError("VALIDATION_ERROR", {
        title: "This request cannot be declined",
        message: "Only pending requests can be declined.",
      });
    }

    const next: MatchRequest = {
      ...target,
      status: "declined",
      updatedAt: new Date().toISOString(),
    };
    writeRequests(requests.map((request) => (request.id === requestId ? next : request)));
    return delay(clone(next));
  },
};
