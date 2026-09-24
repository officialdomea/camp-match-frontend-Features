import { createAppError } from "@/lib/api/errors";
import { validateImageFile } from "@/lib/media";
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
const GOOGLE_PROFILE_KEY = "campmatch.mock-google-profile";
// Temporary browser-only preview state. A real provider will return a durable media reference.
const temporaryProfileImages = new Map<string, string>();

function nextExpiry(): string {
  return new Date(Date.now() + 60 * 60 * 1000).toISOString();
}

function createDefaultSession(): Session {
  return {
    accessToken: "mock-access-token",
    refreshToken: "mock-refresh-token",
    tokenType: "bearer",
    issuedAt: new Date().toISOString(),
    expiresAt: nextExpiry(),
    user: {
      id: "usr_mock_student",
      fullName: "Student User",
      email: "student@campmatch.local",
      phone: "+234 800 000 0000",
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
    const temporaryImage = temporaryProfileImages.get(parsed.user.id);
    return temporaryImage
      ? { ...parsed, user: { ...parsed.user, profileImageUrl: temporaryImage } }
      : parsed;
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

  const persistedUser = normalized.user.profileImageUrl?.startsWith("blob:")
    ? (() => {
        const { profileImageUrl: _temporaryImage, ...user } = normalized.user;
        return user;
      })()
    : normalized.user;

  try {
    window.localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ ...normalized, user: persistedUser }),
    );
    if (normalized.user.email === "google-user@campmatch.local") {
      window.localStorage.setItem(GOOGLE_PROFILE_KEY, JSON.stringify(persistedUser));
    }
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
  async signInWithGoogle() {
    await delay(null, 700);
    let user: AuthUser | null = null;

    try {
      const stored = window.localStorage.getItem(GOOGLE_PROFILE_KEY);
      user = stored ? (JSON.parse(stored) as AuthUser) : null;
    } catch {
      user = null;
    }

    return writeSession({
      accessToken: "mock-google-access-token",
      refreshToken: "mock-google-refresh-token",
      tokenType: "bearer",
      issuedAt: new Date().toISOString(),
      expiresAt: nextExpiry(),
      user: user ?? {
        id: "usr_mock_google",
        fullName: "Google User",
        email: "google-user@campmatch.local",
        phone: "",
        role: null,
        accountStatus: "active",
        emailVerified: true,
        onboardingComplete: false,
        identityVerification: "not_started",
      },
    });
  },

  async getCurrentUser() {
    const session = readSession();
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
    const identifier = payload.identifier.trim();
    if (!identifier || payload.password.length < 8) {
      throw createAppError("AUTHENTICATION_ERROR");
    }

    const existing = readSession();
    if (existing) {
      return writeSession({
        ...existing,
        accessToken: "mock-access-token",
        refreshToken: existing.refreshToken ?? "mock-refresh-token",
        expiresAt: nextExpiry(),
      });
    }

    const isEmail = identifier.includes("@");
    return writeSession({
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      tokenType: "bearer",
      issuedAt: new Date().toISOString(),
      expiresAt: nextExpiry(),
      user: {
        ...makeUser({
          fullName: "Amara Okafor",
          email: isEmail
            ? identifier
            : `student-${identifier.replace(/\s+/g, "-").toLowerCase()}@campmatch.local`,
          phone: isEmail ? "+234 800 000 0000" : identifier,
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
    if (!/^\d{6}$/.test(payload.code)) {
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
    const nextUser =
      payload.role === "student"
        ? {
            role: payload.role,
            onboardingComplete: true,
            identityVerification: "not_started" as const,
            livingPreference: payload.data.livingPreference,
            studentProfile: { ...payload.data },
          }
        : {
            role: payload.role,
            onboardingComplete: true,
            identityVerification: "pending" as const,
          };

    return updateUser(nextUser);
  },

  async updateProfilePhoto(file: File) {
    const error = validateImageFile(file);
    if (error) {
      throw createAppError("VALIDATION_ERROR", { title: "Invalid profile photo", message: error });
    }
    const session = requireSession();
    const previous = temporaryProfileImages.get(session.user.id);
    if (previous) URL.revokeObjectURL(previous);
    const temporaryImage = URL.createObjectURL(file);
    temporaryProfileImages.set(session.user.id, temporaryImage);
    return delay(updateUser({ profileImageUrl: temporaryImage }), 700);
  },

  async logout() {
    await this.clearSession();
    await delay(undefined, 200);
  },
};
