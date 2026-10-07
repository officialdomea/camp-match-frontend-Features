import type { UserRole } from "@/types/auth";
import type { Notification } from "@/types/notifications";

/** Frontend-only route check; the backend remains authoritative for access. */
type NotificationAccessContext = {
  currentUserId: string;
  currentUserRole: UserRole | null;
  notification: Pick<Notification, "recipientId" | "route" | "entityId" | "entityType">;
  accessibleConversationIds: string[];
};

export function canAccessNotificationDestination({
  currentUserId,
  currentUserRole,
  notification,
  accessibleConversationIds,
}: NotificationAccessContext): boolean {
  if (notification.recipientId !== currentUserId || !notification.route) {
    return false;
  }

  let destination: URL;
  try {
    destination = new URL(notification.route, "https://camp-match.local");
  } catch {
    return false;
  }

  if (destination.origin !== "https://camp-match.local") {
    return false;
  }

  if (destination.pathname === "/messages") {
    const conversationId = destination.searchParams.get("conversation");
    return Boolean(
      conversationId &&
      notification.entityType === "conversation" &&
      notification.entityId === conversationId &&
      accessibleConversationIds.includes(conversationId),
    );
  }

  if (destination.pathname === "/roommates") {
    return currentUserRole === "student";
  }

  if (destination.pathname === "/owner/bookings" || destination.pathname === "/owner/properties") {
    return currentUserRole === "owner";
  }

  if (destination.pathname === "/scout/properties" || destination.pathname === "/scout/bookings") {
    return currentUserRole === "scout";
  }

  return false;
}
