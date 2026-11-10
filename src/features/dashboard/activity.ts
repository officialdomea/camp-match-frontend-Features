import type { PropertyBooking } from "@/types/booking";
import type { Conversation } from "@/types/messages";
import type { Notification } from "@/types/notifications";
import type { ConfirmedMatch, MatchRequest } from "@/types/roommate";
import type { ManagedProperty } from "@/types/property";
import {
  sortActivity,
  type DashboardActivityDestination,
  type DashboardActivityItem,
} from "./insights";

export type DashboardRole = "student" | "owner" | "scout";

function bookingDestination(role: DashboardRole): DashboardActivityDestination {
  if (role === "owner") return "/owner/bookings";
  if (role === "scout") return "/scout/bookings";
  return "/bookings";
}

export function propertyActivityItems(
  properties: readonly ManagedProperty[],
  role: "owner" | "scout",
): DashboardActivityItem[] {
  const destination = role === "owner" ? "/owner/properties" : "/scout/properties";

  return properties.flatMap((property) =>
    property.activity.map((event) => ({
      id: `property:${property.id}:${event.id}`,
      kind: "property" as const,
      title: event.title,
      description: event.description ?? property.title,
      occurredAt: event.occurredAt,
      destination,
      relatedEntityId: property.id,
    })),
  );
}

export function bookingActivityItems(
  bookings: readonly PropertyBooking[],
  role: DashboardRole,
): DashboardActivityItem[] {
  return bookings.map((booking) => ({
    id: `booking:${booking.id}`,
    kind: "booking" as const,
    title: `Booking status: ${booking.status}`,
    description: booking.propertyTitle,
    occurredAt: booking.updatedAt || booking.createdAt,
    destination: bookingDestination(role),
    relatedEntityId: booking.id,
  }));
}

export function roommateActivityItems(requests: readonly MatchRequest[]): DashboardActivityItem[] {
  return requests.map((request) => ({
    id: `roommate:${request.id}`,
    kind: "roommate" as const,
    title: `Roommate request: ${request.status}`,
    occurredAt: request.updatedAt || request.createdAt,
    destination: "/roommates",
    relatedEntityId: request.id,
  }));
}

export function notificationActivityItems(
  notifications: readonly Notification[],
  role: DashboardRole,
): DashboardActivityItem[] {
  return notifications.map((notification) => {
    let destination: DashboardActivityDestination | undefined;
    let kind: DashboardActivityItem["kind"] = "notification";
    let id = `notification:${notification.id}`;
    if (notification.type === "NEW_MESSAGE" || notification.type === "PROPERTY_COMMUNICATION") {
      destination = "/messages";
      if (notification.entityType === "conversation" && notification.entityId) {
        kind = "message";
        id = `conversation:${notification.entityId}`;
      }
    } else if (notification.type === "ROOMMATE_MATCH" && role === "student") {
      destination = "/roommates";
      if (notification.entityType === "roommate-match" && notification.entityId) {
        kind = "roommate";
        id = `match:${notification.entityId}`;
      }
    } else if (notification.type === "BOOKING") {
      destination = bookingDestination(role);
      if (notification.entityType === "booking" && notification.entityId) {
        kind = "booking";
        id = `booking:${notification.entityId}`;
      }
    }

    return {
      id,
      kind,
      title: notification.title,
      occurredAt: notification.createdAt,
      ...(destination ? { destination } : {}),
      ...(notification.entityId ? { relatedEntityId: notification.entityId } : {}),
    };
  });
}

export function conversationActivityItems(
  conversations: readonly Conversation[],
): DashboardActivityItem[] {
  return conversations.map((conversation) => ({
    id: `conversation:${conversation.id}`,
    kind: "message" as const,
    title: "Conversation activity",
    occurredAt: conversation.updatedAt,
    destination: "/messages",
    relatedEntityId: conversation.id,
  }));
}

export function confirmedMatchActivityItems(
  matches: readonly ConfirmedMatch[],
): DashboardActivityItem[] {
  return matches.map((match) => ({
    id: `match:${match.id}`,
    kind: "roommate" as const,
    title: "Roommate match confirmed",
    occurredAt: match.matchedAt,
    destination: "/roommates",
    relatedEntityId: match.id,
  }));
}

export function recentDashboardActivity(
  sources: readonly (readonly DashboardActivityItem[])[],
  limit = 6,
): DashboardActivityItem[] {
  return sortActivity(sources.flat(), limit);
}
