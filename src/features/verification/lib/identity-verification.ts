import type { IdentityVerificationStatus, UserRole } from "@/types/auth";

export const identityVerificationSubjectMap: Record<
  UserRole,
  "student_identity" | "owner_identity" | "scout_identity"
> = {
  student: "student_identity",
  owner: "owner_identity",
  scout: "scout_identity",
};

export type VerificationRequirement = {
  role: UserRole;
  title: string;
  description: string;
  documentOptions: Array<{ value: string; label: string; description?: string }>;
};

export function getRoleVerificationRequirements(role: UserRole): VerificationRequirement {
  switch (role) {
    case "student":
      return {
        role,
        title: "Student identity verification",
        description:
          "We verify your student identity before you can access Camp Match student accommodation features.",
        documentOptions: [
          { value: "student-id", label: "Student ID card" },
          { value: "enrolment-letter", label: "Enrollment letter" },
          { value: "school-portal", label: "School portal screenshot" },
        ],
      };
    case "owner":
      return {
        role,
        title: "Owner identity verification",
        description:
          "We confirm your identity before you can publish owner listings or manage properties.",
        documentOptions: [
          { value: "nin", label: "National ID (NIN)" },
          { value: "drivers-licence", label: "Driver's licence" },
          { value: "international-passport", label: "International passport" },
        ],
      };
    case "scout":
      return {
        role,
        title: "Scout identity verification",
        description:
          "We confirm your identity before you can manage student property matches and scout coverage.",
        documentOptions: [
          { value: "nin", label: "National ID (NIN)" },
          { value: "drivers-licence", label: "Driver's licence" },
          { value: "international-passport", label: "International passport" },
        ],
      };
    default:
      return {
        role: "student",
        title: "Identity verification",
        description: "Complete your Camp Match identity check.",
        documentOptions: [],
      };
  }
}

export function canAccessRoleVerification(
  currentRole: UserRole | null,
  targetRole: UserRole,
): boolean {
  return currentRole === targetRole;
}

export function shouldAllowVerificationSubmission(
  status: IdentityVerificationStatus | null | undefined,
): boolean {
  if (status == null) return true;
  return ["not_started", "rejected", "failed", "changes_requested"].includes(status);
}

export function getFriendlyVerificationMessage(
  status: IdentityVerificationStatus | null | undefined,
): string {
  switch (status) {
    case "not_started":
      return "Verification required. Start your identity verification to continue.";
    case "pending":
    case "submitted":
    case "in_progress":
      return "Verification under review.";
    case "changes_requested":
      return "Verification needs attention. Please review your information and resubmit.";
    case "verified":
      return "Identity verified.";
    case "rejected":
    case "failed":
      return "Verification needs attention. Please review your information and resubmit.";
    default:
      return "Continue with your identity verification.";
  }
}

export function maskSensitiveValue(value: string | null | undefined): string {
  if (!value) return "Not provided";
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 4) return `********${digits.slice(-4)}`.slice(-12);
  return `********${digits.slice(-4)}`;
}
