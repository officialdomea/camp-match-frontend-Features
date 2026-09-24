import { beforeEach, describe, expect, it } from "vitest";
import { mockAuthProvider } from "./auth.mock-provider";

beforeEach(() => {
  const data = new Map<string, string>();
  const localStorage = {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
    clear: () => void data.clear(),
  } as Storage;

  Object.defineProperty(globalThis, "window", {
    value: { localStorage },
    configurable: true,
  });
});

describe("mock Google authentication flow", () => {
  it("sends a new Google user to role selection", async () => {
    const session = await mockAuthProvider.signInWithGoogle();

    expect(session.user.email).toBe("google-user@campmatch.local");
    expect(session.user.role).toBeNull();
    expect(session.user.onboardingComplete).toBe(false);
    expect(session.user.emailVerified).toBe(true);
  });

  it("recognizes a returning Google user with their existing role", async () => {
    await mockAuthProvider.signInWithGoogle();
    await mockAuthProvider.selectRole("owner");

    const returningSession = await mockAuthProvider.signInWithGoogle();

    expect(returningSession.user.email).toBe("google-user@campmatch.local");
    expect(returningSession.user.role).toBe("owner");
  });
});
