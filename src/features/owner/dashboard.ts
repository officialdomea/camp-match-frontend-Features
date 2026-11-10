import type { BookingStatus, PropertyBooking } from "@/types/booking";
import type { ManagedProperty } from "@/types/property";
import { countByStatus, uniqueById } from "@/features/dashboard/insights";

export type OwnerDashboardPropertySnapshot = Pick<
  ManagedProperty,
  "id" | "owner" | "status" | "verification" | "performance" | "activity"
>;

export type OwnerDashboardBookingSnapshot = Pick<PropertyBooking, "id" | "status">;

export type OwnerDashboardSummaryInput = {
  properties?: OwnerDashboardPropertySnapshot[];
  currentUserId: string;
  bookings?: OwnerDashboardBookingSnapshot[];
  unreadMessages?: number | undefined;
  unreadNotifications?: number | undefined;
  actions?: string[] | undefined;
};

export function summarizeOwnerDashboard({
  properties = [],
  currentUserId,
  bookings = [],
  unreadMessages = 0,
  unreadNotifications = 0,
  actions = [],
}: OwnerDashboardSummaryInput) {
  const scopedProperties = uniqueById(
    properties.filter((property) => property.owner.id === currentUserId),
  );
  const scopedBookings = uniqueById(bookings);
  const bookingStatusCounts = countByStatus(
    scopedBookings,
    ["pending", "approved", "rejected", "cancelled", "confirmed", "expired"] as const,
    (booking) => booking.status,
  );

  const totalProperties = scopedProperties.length;
  const publishedProperties = scopedProperties.filter(
    (property) => property.status === "active",
  ).length;
  const pendingVerification = scopedProperties.filter(
    (property) =>
      property.status === "pending_review" ||
      property.verification.overall === "pending" ||
      property.verification.overall === "submitted",
  ).length;
  const rejectedProperties = scopedProperties.filter(
    (property) => property.status === "rejected" || property.verification.overall === "rejected",
  ).length;
  const pendingRequests = bookingStatusCounts.pending;
  const needsAttention = scopedProperties.filter(
    (property) =>
      ["changes_requested", "rejected", "suspended"].includes(property.status) ||
      ["changes_requested", "rejected"].includes(property.verification.overall),
  ).length;
  const newEnquiries = scopedProperties.reduce(
    (total, property) => total + property.performance.enquiries,
    0,
  );

  const activity = [
    pendingVerification > 0 ? `${pendingVerification} property awaiting review` : null,
    pendingRequests > 0 ? `${pendingRequests} booking request awaiting review` : null,
    unreadMessages > 0
      ? `${unreadMessages} unread message${unreadMessages === 1 ? "" : "s"}`
      : null,
    unreadNotifications > 0
      ? `${unreadNotifications} unread notification${unreadNotifications === 1 ? "" : "s"}`
      : null,
  ].filter((value): value is string => Boolean(value));

  const derivedActions =
    actions.length > 0
      ? actions
      : [
          pendingRequests > 0 ? "Review booking requests" : null,
          pendingVerification > 0 ? "Check verification queue" : null,
          publishedProperties === 0 ? "List your first property" : null,
          unreadMessages > 0 ? "Open messages" : null,
          unreadNotifications > 0 ? "Review notifications" : null,
        ].filter((value): value is string => Boolean(value));

  return {
    totalProperties,
    publishedProperties,
    pendingVerification,
    rejectedProperties,
    pendingRequests,
    bookingStatusCounts,
    newEnquiries,
    needsAttention,
    unreadMessages,
    unreadNotifications,
    activity,
    actions: derivedActions,
    emptyState:
      totalProperties === 0
        ? "You haven't started to list any properties yet. Add your first property to start receiving enquiries and booking requests."
        : "",
  };
}
