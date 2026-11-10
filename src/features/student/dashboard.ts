import type { IdentityVerificationStatus } from "@/types/auth";
import type { BookingStatus, PropertyBooking } from "@/types/booking";
import type { Listing } from "@/types/listing";
import type { ConfirmedMatch, MatchRequest } from "@/types/roommate";
import { countByStatus, uniqueById } from "@/features/dashboard/insights";

export type DashboardRoommateState = "none" | "pending" | "matched" | "ineligible";

export type StudentDashboardSavedProperty = Pick<
  Listing,
  "id" | "title" | "price" | "pricePeriod" | "location" | "verification" | "images"
>;

export type StudentDashboardBooking = Pick<
  PropertyBooking,
  "id" | "studentId" | "status" | "createdAt" | "updatedAt"
>;

export type StudentDashboardSummaryInput = {
  user?: { identityVerification?: IdentityVerificationStatus } | null;
  studentId?: string | undefined;
  savedProperties?: StudentDashboardSavedProperty[];
  bookings?: StudentDashboardBooking[];
  roommateRequests?: MatchRequest[];
  confirmedMatches?: ConfirmedMatch[];
  roommateStatus?: DashboardRoommateState;
  messageCount?: number;
  notificationCount?: number;
  actions?: string[];
};

export function summarizeStudentDashboard({
  user,
  studentId,
  savedProperties = [],
  bookings = [],
  roommateRequests = [],
  confirmedMatches = [],
  roommateStatus = "none",
  messageCount = 0,
  notificationCount = 0,
  actions = [],
}: StudentDashboardSummaryInput) {
  const verificationStatus = user?.identityVerification ?? "not_started";

  const verification = (() => {
    switch (verificationStatus) {
      case "verified":
        return { label: "Identity verified", action: "Your identity has been confirmed." };
      case "pending":
      case "submitted":
      case "in_progress":
        return {
          label: "Verification under review",
          action: "Your identity check is still being reviewed.",
        };
      case "rejected":
      case "changes_requested":
      case "failed":
        return {
          label: "Verification needs attention",
          action: "Please review and resubmit your identity check.",
        };
      default:
        return {
          label: "Verification required",
          action: "Start verification to unlock full access to Camp Match.",
        };
    }
  })();

  const scopedBookings = studentId
    ? uniqueById(bookings.filter((booking) => booking.studentId === studentId))
    : [];
  const scopedRequests = studentId
    ? uniqueById(
        roommateRequests.filter(
          (request) => request.requesterId === studentId || request.recipientId === studentId,
        ),
      )
    : [];
  const scopedMatches = studentId
    ? uniqueById(confirmedMatches.filter((match) => match.participantIds.includes(studentId)))
    : [];
  const scopedSavedProperties = uniqueById(savedProperties);
  const bookingSummary = countByStatus(
    scopedBookings,
    ["pending", "approved", "rejected", "cancelled", "confirmed", "expired"] as const,
    (booking) => booking.status,
  );
  const activeBookings =
    bookingSummary.pending + bookingSummary.approved + bookingSummary.confirmed;
  const activeRoommateRequests = scopedRequests.filter(
    (request) => request.status === "pending" || request.status === "accepted",
  ).length;

  const activities = [
    verificationStatus === "not_started" ? "Verification requires attention" : null,
    bookingSummary.pending > 0 ? "Booking awaiting action" : null,
    roommateStatus === "matched" ? "Roommate match confirmed" : null,
    messageCount > 0 ? `${messageCount} unread message${messageCount === 1 ? "" : "s"}` : null,
    notificationCount > 0
      ? `${notificationCount} important notification${notificationCount === 1 ? "" : "s"}`
      : null,
  ].filter((value): value is string => Boolean(value));

  const derivedActions = actions.length
    ? actions
    : [
        verificationStatus === "not_started" ? "Start verification" : null,
        scopedSavedProperties.length === 0 ? "Save properties you want to compare later" : null,
        roommateStatus === "none" ? "Find a roommate match" : null,
        bookingSummary.pending > 0 ? "Review booking request" : null,
        messageCount > 0 ? "Open messages" : null,
        notificationCount > 0 ? "Check notifications" : null,
      ].filter((value): value is string => Boolean(value));

  return {
    verification,
    savedProperties: scopedSavedProperties,
    bookingSummary: {
      ...bookingSummary,
      total: scopedBookings.length,
      active: activeBookings,
    },
    roommateRequestCount: activeRoommateRequests,
    confirmedMatchCount: scopedMatches.length,
    roommateStatus,
    messageCount,
    notificationCount,
    actions: derivedActions,
    activities,
    emptyState:
      scopedSavedProperties.length === 0 ? "Save properties you want to compare later." : "",
  };
}
