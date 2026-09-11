import type {
  AuthUser,
  LoginPayload,
  OnboardingPayload,
  RegisterPayload,
  Session,
  UserRole,
  VerifyPayload,
} from "@/types/auth";

/**
 * The contract every auth data source must satisfy. Swapping the mock for the
 * FastAPI client means swapping the provider — no UI component changes.
 */
export type AuthProvider = {
  getCurrentUser(): Promise<AuthUser | null>;
  getSession(): Promise<Session | null>;
  getAccessToken(): string | null;
  refreshSession(): Promise<Session>;
  clearSession(): Promise<void>;
  login(payload: LoginPayload): Promise<Session>;
  register(payload: RegisterPayload): Promise<Session>;
  verifyAccount(payload: VerifyPayload): Promise<AuthUser>;
  resendVerificationCode(): Promise<void>;
  selectRole(role: UserRole): Promise<AuthUser>;
  completeOnboarding(payload: OnboardingPayload): Promise<AuthUser>;
  logout(): Promise<void>;
};
