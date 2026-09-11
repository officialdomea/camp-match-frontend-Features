import { apiClient } from "@/lib/api/client";
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
 * Real backend implementation. Paths are relative to `env.apiBaseUrl` and are
 * placeholders until the FastAPI contract is published — no host is hard-coded.
 */
let currentSession: Session | null = null;

export const apiAuthProvider: AuthProvider = {
  async getCurrentUser() {
    const session = await apiClient.get<Session | null>("/auth/me");
    currentSession = session ?? currentSession;
    return session?.user ?? null;
  },

  async getSession() {
    const session = await apiClient.get<Session | null>("/auth/session");
    currentSession = session ?? null;
    return session;
  },

  getAccessToken() {
    return currentSession?.accessToken ?? null;
  },

  async refreshSession() {
    const session = await apiClient.post<Session>("/auth/refresh");
    currentSession = session;
    return session;
  },

  async clearSession() {
    currentSession = null;
    await apiClient.post<void>("/auth/logout");
  },

  async login(payload: LoginPayload) {
    const session = await apiClient.post<Session>("/auth/login", { body: payload });
    currentSession = session;
    return session;
  },

  async register(payload: RegisterPayload) {
    const session = await apiClient.post<Session>("/auth/register", { body: payload });
    currentSession = session;
    return session;
  },

  async verifyAccount(payload: VerifyPayload) {
    const user = await apiClient.post<AuthUser>("/auth/verify", { body: payload });
    if (currentSession) {
      currentSession = { ...currentSession, user };
    }
    return user;
  },

  async resendVerificationCode() {
    await apiClient.post<void>("/auth/verify/resend");
  },

  async selectRole(role: UserRole) {
    const user = await apiClient.post<AuthUser>("/auth/role", { body: { role } });
    if (currentSession) {
      currentSession = { ...currentSession, user };
    }
    return user;
  },

  async completeOnboarding(payload: OnboardingPayload) {
    const user = await apiClient.post<AuthUser>("/auth/onboarding", { body: payload });
    if (currentSession) {
      currentSession = { ...currentSession, user };
    }
    return user;
  },

  async logout() {
    await this.clearSession();
  },
};
