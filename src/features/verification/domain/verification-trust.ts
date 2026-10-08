import type {
  IdentityVerificationStatus,
  VerificationState,
  VerificationSubjectType,
} from "@/types/auth";
import type { PropertyVerification } from "@/types/property";

export function normalizeVerificationStatus(
  status: IdentityVerificationStatus | VerificationState | null | undefined,
): VerificationState {
  switch (status) {
    case "verified":
      return "verified";
    case "rejected":
    case "failed":
      return "rejected";
    case "pending":
    case "in_progress":
      return "pending";
    case "submitted":
    case "changes_requested":
      return status;
    default:
      return "not_started";
  }
}

export function isIdentityVerified(status: IdentityVerificationStatus | null | undefined): boolean {
  return normalizeVerificationStatus(status) === "verified";
}

export function isVerificationPending(
  status: IdentityVerificationStatus | VerificationState | null | undefined,
): boolean {
  return normalizeVerificationStatus(status) === "pending";
}

export function wasVerificationRejected(
  status: IdentityVerificationStatus | VerificationState | null | undefined,
): boolean {
  return normalizeVerificationStatus(status) === "rejected";
}

export type TrustIndicatorSubject = "identity" | "property";

export type TrustIndicatorState = "verified" | "pending" | "rejected" | "not_started";

export function getTrustIndicatorState(
  status:
    | IdentityVerificationStatus
    | VerificationState
    | PropertyVerification["overall"]
    | null
    | undefined,
): TrustIndicatorState {
  const normalized = normalizeVerificationStatus(
    status as IdentityVerificationStatus | VerificationState,
  );

  if (normalized === "verified") return "verified";
  if (normalized === "rejected") return "rejected";
  if (normalized === "pending" || status === "submitted" || status === "changes_requested") {
    return "pending";
  }

  return "not_started";
}

export function getTrustIndicatorLabel(
  subject: TrustIndicatorSubject,
  state: TrustIndicatorState,
): string {
  switch (state) {
    case "verified":
      return subject === "property" ? "Verified property" : "Verified identity";
    case "pending":
      return "Verification pending";
    case "rejected":
      return "Verification rejected";
    default:
      return "";
  }
}

export function isPropertyVerified(
  property: Pick<PropertyVerification, "overall"> | null | undefined,
): boolean {
  return property?.overall === "verified";
}

export function isPropertyVerificationPending(
  property: Pick<PropertyVerification, "overall"> | null | undefined,
): boolean {
  return ["submitted", "pending", "changes_requested"].includes(property?.overall ?? "not_started");
}

export function shouldAllowPropertyVerificationSubmission(
  status: PropertyVerification["overall"] | null | undefined,
): boolean {
  if (status == null) return true;
  return ["not_started", "rejected", "changes_requested"].includes(status);
}

export function getFriendlyPropertyVerificationMessage(
  status: PropertyVerification["overall"] | null | undefined,
): string {
  switch (status) {
    case "not_started":
      return "Start property verification to make the listing eligible for review.";
    case "submitted":
    case "pending":
      return "Your property is under review. We will update you once the checklist is complete.";
    case "changes_requested":
      return "Please fix the requested property issues and resubmit for review.";
    case "verified":
      return "This property is verified and ready for students to view.";
    case "rejected":
      return "This property needs attention before it can be published to students.";
    default:
      return "Continue with the property verification workflow.";
  }
}

export function subjectLabel(subjectType: VerificationSubjectType): string {
  switch (subjectType) {
    case "student_identity":
      return "Student identity";
    case "owner_identity":
      return "Owner identity";
    case "scout_identity":
      return "Scout identity";
    case "property":
      return "Property";
    default:
      return "Verification";
  }
}
