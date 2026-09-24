import { beforeEach, describe, expect, it } from "vitest";

import { calculateCompatibility } from "./compatibility";
import { createDefaultRoommatePreferences, isValidRoommatePreferences } from "@/types/roommate";
import { roommateService } from "../services/roommate.service";

beforeEach(() => {
  const storage = {
    data: new Map<string, string>(),
    getItem(key: string) {
      return this.data.has(key) ? this.data.get(key)! : null;
    },
    setItem(key: string, value: string) {
      this.data.set(key, value);
    },
    removeItem(key: string) {
      this.data.delete(key);
    },
    clear() {
      this.data.clear();
    },
  } as Storage & { data: Map<string, string> };

  Object.defineProperty(globalThis, "localStorage", {
    value: storage,
    configurable: true,
    writable: true,
  });

  Object.defineProperty(globalThis, "window", {
    value: { localStorage: storage },
    configurable: true,
    writable: true,
  });
});

describe("roommate compatibility", () => {
  it("gives a strong score for aligned preferences", () => {
    const current: ReturnType<typeof createDefaultRoommatePreferences> = {
      ...createDefaultRoommatePreferences("student-1"),
      preferredArea: "Ekosodin",
      accommodationTypes: ["studio", "shared"],
      budgetMin: 180000,
      budgetMax: 350000,
      livingPreference: "find-roommate",
      lifestylePreferences: ["study-focused", "quiet"],
      studyHabits: "night-owl",
      sleepSchedule: "night-owl",
      noisePreference: "quiet",
      cleanlinessPreference: "high",
      socialPreference: "moderate",
      universityId: "univ-1",
    };

    const candidate: ReturnType<typeof createDefaultRoommatePreferences> = {
      ...createDefaultRoommatePreferences("student-2"),
      accommodationTypes: ["shared", "studio"],
      budgetMin: 200000,
      budgetMax: 340000,
      livingPreference: "find-roommate",
      lifestylePreferences: ["study-focused", "quiet"],
      studyHabits: "night-owl",
      sleepSchedule: "night-owl",
      noisePreference: "quiet",
      cleanlinessPreference: "high",
      socialPreference: "moderate",
      universityId: "univ-1",
    };
    const result = calculateCompatibility(current, candidate);
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.summary.length).toBeGreaterThan(0);
  });

  it("returns a lower score for mismatched life patterns", () => {
    const current: ReturnType<typeof createDefaultRoommatePreferences> = {
      ...createDefaultRoommatePreferences("student-1"),
      preferredArea: "Akoka",
      accommodationTypes: ["shared"],
      budgetMin: 200000,
      budgetMax: 400000,
      livingPreference: "find-roommate",
      lifestylePreferences: ["social"],
      studyHabits: "morning-person",
      sleepSchedule: "early-bird",
      noisePreference: "quiet",
      cleanlinessPreference: "high",
      socialPreference: "social",
      universityId: "univ-2",
    };

    const candidate: ReturnType<typeof createDefaultRoommatePreferences> = {
      ...createDefaultRoommatePreferences("student-2"),
      preferredArea: "Yaba",
      accommodationTypes: ["private"],
      budgetMin: 500000,
      budgetMax: 800000,
      livingPreference: "find-roommate",
      lifestylePreferences: ["party"],
      studyHabits: "night-owl",
      sleepSchedule: "night-owl",
      noisePreference: "lively",
      cleanlinessPreference: "low",
      socialPreference: "quiet",
      universityId: "univ-3",
    };

    const result = calculateCompatibility(current, candidate);
    expect(result.score).toBeLessThan(60);
  });

  it("validates roommate preferences and rejects invalid budgets", () => {
    const valid = createDefaultRoommatePreferences("student-9");
    expect(isValidRoommatePreferences(valid)).toBe(true);

    const invalid = {
      ...valid,
      budgetMin: 500000,
      budgetMax: 200000,
    };

    expect(isValidRoommatePreferences(invalid)).toBe(false);
  });

  it("exposes the provider contract for preferences and match requests", async () => {
    const preferences = await roommateService.getPreferences("student-provider");
    expect(preferences).toBeTruthy();

    const updated = await roommateService.updatePreferences({
      ...createDefaultRoommatePreferences("student-provider"),
      preferredArea: "Ilupeju",
      budgetMin: 150000,
      budgetMax: 300000,
      livingPreference: "find-roommate",
      lifestylePreferences: ["study-focused"],
      studyHabits: "night-owl",
      sleepSchedule: "night-owl",
      noisePreference: "quiet",
      cleanlinessPreference: "high",
      socialPreference: "moderate",
      universityId: "univ-9",
    });

    expect(updated.preferredArea).toBe("Ilupeju");
    const candidates = await roommateService.getCandidates("student-provider");
    expect(Array.isArray(candidates)).toBe(true);
  });

  it("creates a pending request from a student to another student", async () => {
    const session = {
      user: { id: "student-a", livingPreference: "find-roommate" as const },
    };
    window.localStorage.setItem("campmatch.session", JSON.stringify(session));
    const request = await roommateService.sendMatchRequest("student-b", "student-a");

    expect(request.status).toBe("pending");
    expect(request.requesterId).toBe("student-a");
    expect(request.recipientId).toBe("student-b");
  });

  it("keeps accepted requests distinct from matched relationships until both sides accept", async () => {
    const senderSession = {
      user: { id: "student-a", livingPreference: "find-roommate" as const },
    };
    window.localStorage.setItem("campmatch.session", JSON.stringify(senderSession));

    const request = await roommateService.sendMatchRequest("student-b", "student-a");
    expect(request.status).toBe("pending");

    const recipientSession = {
      user: { id: "student-b", livingPreference: "find-roommate" as const },
    };
    window.localStorage.setItem("campmatch.session", JSON.stringify(recipientSession));

    const incoming = (await roommateService.getRequests("student-b")).find(
      (value) => value.requesterId === "student-a" && value.recipientId === "student-b",
    );
    expect(incoming).toBeTruthy();

    if (!incoming) throw new Error("incoming request missing");

    const accepted = await roommateService.acceptMatchRequest(incoming.id, "student-b");
    expect(accepted.status).toBe("accepted");
    expect(accepted.requesterAccepted).toBe(false);
    expect(accepted.recipientAccepted).toBe(true);

    const afterRecipientAccept = await roommateService.getRequests("student-b");
    expect(
      afterRecipientAccept.some((value) => value.id === incoming.id && value.status === "accepted"),
    ).toBe(true);
    expect(await roommateService.getConfirmedMatches("student-b")).toHaveLength(0);

    window.localStorage.setItem("campmatch.session", JSON.stringify(senderSession));

    const outgoing = (await roommateService.getRequests("student-a")).find(
      (value) => value.requesterId === "student-a" && value.recipientId === "student-b",
    );
    expect(outgoing).toBeTruthy();

    if (!outgoing) throw new Error("outgoing request missing");

    const matched = await roommateService.acceptMatchRequest(outgoing.id, "student-a");
    expect(matched.status).toBe("matched");
    expect(matched.requesterAccepted).toBe(true);
    expect(matched.recipientAccepted).toBe(true);

    const matches = await roommateService.getConfirmedMatches("student-a");
    expect(matches).toHaveLength(1);
    expect(matches[0]).toMatchObject({
      requestId: incoming.id,
      participantIds: ["student-a", "student-b"],
    });

    window.localStorage.setItem("campmatch.session", JSON.stringify(recipientSession));
    await expect(roommateService.getConfirmedMatches("student-b")).resolves.toEqual(matches);
  });

  it("prevents duplicate requests between the same students", async () => {
    const session = {
      user: { id: "student-a", livingPreference: "find-roommate" as const },
    };
    window.localStorage.setItem("campmatch.session", JSON.stringify(session));

    await roommateService.sendMatchRequest("student-b", "student-a");

    await expect(roommateService.sendMatchRequest("student-b", "student-a")).rejects.toMatchObject({
      code: "CONFLICT",
    });
  });

  it("prevents self-matching and invalid transitions", async () => {
    const session = {
      user: { id: "student-a", livingPreference: "find-roommate" as const },
    };
    window.localStorage.setItem("campmatch.session", JSON.stringify(session));

    await expect(roommateService.sendMatchRequest("student-a", "student-a")).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
    });

    const request = await roommateService.sendMatchRequest("student-b", "student-a");
    await expect(
      roommateService.declineMatchRequest(request.id, "student-a"),
    ).resolves.toMatchObject({
      status: "declined",
    });

    await expect(roommateService.acceptMatchRequest(request.id, "student-a")).rejects.toMatchObject(
      {
        code: "VALIDATION_ERROR",
      },
    );
  });

  it("does not turn repeated acceptance by one user into a mutual match", async () => {
    window.localStorage.setItem(
      "campmatch.session",
      JSON.stringify({ user: { id: "student-a", livingPreference: "find-roommate" } }),
    );

    const request = await roommateService.sendMatchRequest("student-b", "student-a");
    const first = await roommateService.acceptMatchRequest(request.id, "student-b");
    const repeated = await roommateService.acceptMatchRequest(request.id, "student-b");

    expect(first.status).toBe("accepted");
    expect(repeated.status).toBe("accepted");
    expect(repeated.requesterAccepted).toBe(false);
    expect(repeated.recipientAccepted).toBe(true);
    expect(await roommateService.getConfirmedMatches("student-a")).toHaveLength(0);

    const matched = await roommateService.acceptMatchRequest(request.id, "student-a");
    expect(matched.status).toBe("matched");
    expect(await roommateService.acceptMatchRequest(request.id, "student-a")).toEqual(matched);
    expect(await roommateService.getConfirmedMatches("student-a")).toHaveLength(1);
  });

  it("requires an actual participant to accept a request", async () => {
    window.localStorage.setItem(
      "campmatch.session",
      JSON.stringify({ user: { id: "student-a", livingPreference: "find-roommate" } }),
    );

    const request = await roommateService.sendMatchRequest("student-b", "student-a");

    await expect(roommateService.acceptMatchRequest(request.id, "student-c")).rejects.toMatchObject(
      {
        code: "FORBIDDEN",
      },
    );
  });

  it("stores a declined or cancelled request without creating a match", async () => {
    const session = {
      user: { id: "student-a", livingPreference: "find-roommate" as const },
    };
    window.localStorage.setItem("campmatch.session", JSON.stringify(session));

    const request = await roommateService.sendMatchRequest("student-b", "student-a");
    const declined = await roommateService.declineMatchRequest(request.id, "student-a");
    expect(declined.status).toBe("declined");
    await expect(roommateService.acceptMatchRequest(request.id, "student-b")).rejects.toMatchObject(
      {
        code: "VALIDATION_ERROR",
      },
    );

    const matches = await roommateService.getConfirmedMatches("student-a");
    expect(matches).toHaveLength(0);

    const second = await roommateService.sendMatchRequest("student-c", "student-a");
    await roommateService.cancelMatchRequest(second.id, "student-a");
    await expect(roommateService.acceptMatchRequest(second.id, "student-c")).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
    });
    const requests = await roommateService.getRequests("student-a");
    expect(requests.some((value) => value.id === second.id)).toBe(false);
  });
});
