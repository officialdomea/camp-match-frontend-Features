import { afterEach, describe, expect, it, vi } from "vitest";
import { apiAuthProvider } from "./auth.api-provider";
import type { Session } from "@/types/auth";

const session: Session = {
  accessToken: "camp-match-access-token",
  user: {
    id: "usr_google_123",
    fullName: "Google Account",
    email: "selected-account@example.com",
    phone: "",
    role: null,
    accountStatus: "active",
    emailVerified: true,
    onboardingComplete: false,
    identityVerification: "not_started",
  },
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("API Google authentication", () => {
  it("sends the selected Google credential to the auth API and stores its Camp Match session", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(session), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await apiAuthProvider.signInWithGoogle("google-id-token");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/auth/google",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ credential: "google-id-token" }),
      }),
    );
    expect(result).toEqual(session);
    expect(apiAuthProvider.getAccessToken()).toBe(session.accessToken);
  });

  it("rejects a missing credential without making an API request", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiAuthProvider.signInWithGoogle()).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
