/**
 * Frontend DTO types for authentication & onboarding. These mirror the JSON
 * the FastAPI backend is expected to return — not database schemas.
 */

export type UserRole = "student" | "owner" | "scout";

export type AccountStatus = "pending_verification" | "active" | "suspended";

/** Backend remains authoritative for this value. */
export type IdentityVerificationStatus =
  "not_started" | "in_progress" | "pending" | "verified" | "failed";

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole | null;
  accountStatus: AccountStatus;
  emailVerified: boolean;
  onboardingComplete: boolean;
  identityVerification: IdentityVerificationStatus;
};

export type AuthState =
  | { status: "unknown" }
  | { status: "checking" }
  | { status: "unauthenticated" }
  | { status: "authenticated"; user: AuthUser };

export type LoginPayload = {
  /** Email address or phone number — the backend decides how to resolve it. */
  identifier: string;
  password: string;
};

export type RegisterPayload = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
};

export type VerifyPayload = {
  code: string;
};

export type StudentOnboardingPayload = {
  universityId: string;
  accommodationTypes: string[];
  budgetMin: number;
  budgetMax: number;
  preferredArea: string;
};

export type OwnerOnboardingPayload = {
  displayName: string;
  contactPhone: string;
  city: string;
  ownershipEvidenceType: string;
  propertyAddress: string;
  identityDocumentType: string;
};

export type ScoutOnboardingPayload = {
  displayName: string;
  contactPhone: string;
  city: string;
  coverageAreas: string;
  experience: string;
  identityDocumentType: string;
};

export type OnboardingPayload =
  | { role: "student"; data: StudentOnboardingPayload }
  | { role: "owner"; data: OwnerOnboardingPayload }
  | { role: "scout"; data: ScoutOnboardingPayload };

export type Session = {
  user: AuthUser;
  /** Opaque to the frontend. Never logged. */
  accessToken: string;
  refreshToken?: string;
  tokenType?: "bearer";
  expiresAt?: string;
  issuedAt?: string;
};
