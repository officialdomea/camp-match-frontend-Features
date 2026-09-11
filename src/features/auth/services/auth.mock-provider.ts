import { createAppError } from "@/lib/api/errors";
import type {
  AuthUser,
  LoginPayload,
  OnboardingPayload,
  RegisterPayload,
  Session,
  UserRole,
  VerifyPayload,
} from "@/types/auth";
import type { AuthProvider } from "./auth.provider";

/**
 * DEMO ONLY — in-browser stand-in for the FastAPI auth API.
 * No password is ever persisted; the "session" is an opaque mock token.
 */
const SESSION_KEY = "campmatch.session";

/** Any 6-digit code except this one is treated as invalid in the demo. */
const DEMO_CODE = "123456";

/**
 * Test-only demo account. It is intentionally generic and non-sensitive.
 * This is a mock fixture only and must never be mistaken for a real account.
 */
const DEMO_ACCOUNT = {
  email: "demo.student@example.com",
  password: "demo-password-123",
  fullName: "Demo Student",
  phone: "+234 800 000 0000",
} as const;

function nextExpiry(): string {
  return new Date(Date.now() + 60 * 60 * 1000).toISOString();
}

function createDemoSession(): Session {
  return {
    accessToken: "mock-access-token",
    refreshToken: "mock-refresh-token",
    tokenType: "bearer",
    issuedAt: new Date().toISOString(),
    expiresAt: nextExpiry(),
    user: {
      id: "usr_demo_student",
      fullName: DEMO_ACCOUNT.fullName,
      email: DEMO_ACCOUNT.email,
      phone: DEMO_ACCOUNT.phone,
      role: "student",
      accountStatus: "active",
      emailVerified: true,
      onboardingComplete: true,
      identityVerification: "not_started",
    },
  };
}

function delay<T>(value: T, ms = 700): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function readSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Session;
    if (parsed.expiresAt && new Date(parsed.expiresAt).getTime() <= Date.now()) {
      window.localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeSession(session: Session): Session {
  const normalized: Session = {
    ...session,
    tokenType: session.tokenType ?? "bearer",
    issuedAt: session.issuedAt ?? new Date().toISOString(),
    expiresAt: session.expiresAt ?? nextExpiry(),
    refreshToken: session.refreshToken ?? "mock-refresh-token",
  };

  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(normalized));
  } catch {
    /* storage unavailable */
  }
  return normalized;
}

function requireSession(): Session {
  const session = readSession();
  if (!session) throw createAppError("AUTHENTICATION_ERROR");
  return session;
}

function updateUser(patch: Partial<AuthUser>): AuthUser {
  const session = requireSession();
  const next: Session = { ...session, user: { ...session.user, ...patch } };
  writeSession(next);
  return next.user;
}

function makeUser(input: {
  fullName: string;
  email: string;
  phone: string;
  emailVerified: boolean;
}): AuthUser {
  return {
    id: `usr_${Math.random().toString(36).slice(2, 10)}`,
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    role: null,
    accountStatus: input.emailVerified ? "active" : "pending_verification",
    emailVerified: input.emailVerified,
    onboardingComplete: false,
    identityVerification: "not_started",
  };
}

export const mockAuthProvider: AuthProvider = {
  async getCurrentUser() {
    const session = readSession();
    if (session?.user.email.toLowerCase() === DEMO_ACCOUNT.email) {
      return delay(writeSession(createDemoSession()).user, 300);
    }
    return delay(session?.user ?? null, 300);
  },

  async getSession() {
    return delay(readSession(), 150);
  },

  getAccessToken() {
    return readSession()?.accessToken ?? null;
  },

  async refreshSession() {
    const session = readSession();
    if (!session) throw createAppError("AUTHENTICATION_ERROR");

    const refreshed: Session = {
      ...session,
      accessToken: `mock-access-token-${Math.random().toString(36).slice(2, 10)}`,
      refreshToken: `mock-refresh-token-${Math.random().toString(36).slice(2, 10)}`,
      tokenType: "bearer",
      issuedAt: new Date().toISOString(),
      expiresAt: nextExpiry(),
    };

    return delay(writeSession(refreshed), 300);
  },

  async clearSession() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(SESSION_KEY);
    }
    await delay(undefined, 100);
  },

  async login(payload: LoginPayload) {
    await delay(null);
    if (payload.password.length < 8) {
      throw createAppError("AUTHENTICATION_ERROR");
    }
    const isDemoAccount =
      payload.identifier.trim().toLowerCase() === DEMO_ACCOUNT.email &&
      payload.password === DEMO_ACCOUNT.password;
    if (isDemoAccount) return writeSession(createDemoSession());

    const existing = readSession();
    if (existing) {
      return writeSession({
        ...existing,
        accessToken: "mock-access-token",
        refreshToken: existing.refreshToken ?? "mock-refresh-token",
        expiresAt: nextExpiry(),
      });
    }
    const isEmail = payload.identifier.includes("@");
    return writeSession({
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      tokenType: "bearer",
      issuedAt: new Date().toISOString(),
      expiresAt: nextExpiry(),
      user: {
        ...makeUser({
          fullName: "Amara Okafor",
          email: isEmail ? payload.identifier : "amara@example.com",
          phone: isEmail ? "+234 800 000 0000" : payload.identifier,
          emailVerified: true,
        }),
        role: "student",
        onboardingComplete: true,
      },
    });
  },

  async register(payload: RegisterPayload) {
    await delay(null);
    return writeSession({
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      tokenType: "bearer",
      issuedAt: new Date().toISOString(),
      expiresAt: nextExpiry(),
      user: makeUser({ ...payload, emailVerified: false }),
    });
  },

  async verifyAccount(payload: VerifyPayload) {
    await delay(null);
    if (payload.code !== DEMO_CODE) {
      throw createAppError("VALIDATION_ERROR", {
        title: "That code didn't work",
        message: "The code you entered is incorrect or has expired.",
      });
    }
    return updateUser({ emailVerified: true, accountStatus: "active" });
  },

  async resendVerificationCode() {
    await delay(undefined, 600);
  },

  async selectRole(role: UserRole) {
    await delay(null, 450);
    return updateUser({ role });
  },

  async completeOnboarding(payload: OnboardingPayload) {
    await delay(null, 900);
    return updateUser({
      role: payload.role,
      onboardingComplete: true,
      identityVerification: payload.role === "student" ? "not_started" : "pending",
    });
  },

  async logout() {
    await this.clearSession();
    await delay(undefined, 200);
  },
};
