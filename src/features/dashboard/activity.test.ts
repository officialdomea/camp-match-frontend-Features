import { describe, expect, it } from "vitest";
import {
  conversationActivityItems,
  notificationActivityItems,
  propertyActivityItems,
  recentDashboardActivity,
} from "./activity";
import type { ManagedProperty } from "@/types/property";
import type { Conversation } from "@/types/messages";
import type { Notification } from "@/types/notifications";

describe("dashboard activity composition", () => {
  it("maps property events to role-specific destinations and preserves their timestamps", () => {
    const property = {
      id: "property-1",
      title: "Student apartment",
      activity: [
        {
          id: "event-1",
          type: "update",
          title: "Availability updated",
          occurredAt: "2026-10-01T12:00:00Z",
        },
      ],
    } as ManagedProperty;

    expect(propertyActivityItems([property], "owner")).toEqual([
      {
        id: "property:property-1:event-1",
        kind: "property",
        title: "Availability updated",
        description: "Student apartment",
        occurredAt: "2026-10-01T12:00:00Z",
        destination: "/owner/properties",
        relatedEntityId: "property-1",
      },
    ]);
    expect(propertyActivityItems([property], "scout")[0]?.destination).toBe("/scout/properties");
  });

  it("does not expose conversation content or untrusted notification routes", () => {
    const conversation: Conversation = {
      id: "conversation-1",
      type: "PROPERTY_INQUIRY",
      participantIds: ["student-1", "owner-1"],
      createdAt: "2026-10-01T09:00:00Z",
      updatedAt: "2026-10-02T10:00:00Z",
      unreadCount: 1,
      lastMessage: "Private message body",
    };
    const notification: Notification = {
      id: "notification-1",
      type: "BOOKING",
      recipientId: "owner-1",
      title: "Booking update",
      body: "Private notification details",
      createdAt: "2026-10-02T11:00:00Z",
      entityId: "booking-1",
      entityType: "booking",
      route: "/reports/private",
    };

    const conversationItem = conversationActivityItems([conversation])[0]!;
    const notificationItem = notificationActivityItems([notification], "owner")[0]!;

    expect(conversationItem).not.toHaveProperty("description");
    expect(JSON.stringify(conversationItem)).not.toContain("Private message body");
    expect(notificationItem).not.toHaveProperty("description");
    expect(notificationItem.destination).toBe("/owner/bookings");
    expect(JSON.stringify(notificationItem)).not.toContain("Private notification details");
    expect(notificationItem.destination).not.toBe(notification.route);
    expect(notificationItem.id).toBe("booking:booking-1");
  });

  it("sorts events from multiple sources and handles records without timestamps", () => {
    const sorted = recentDashboardActivity([
      [
        { id: "first", kind: "property", title: "Older", occurredAt: "2026-10-01T00:00:00Z" },
        { id: "missing", kind: "property", title: "No date" },
      ],
      [{ id: "second", kind: "booking", title: "Newer", occurredAt: "2026-10-03T00:00:00Z" }],
    ]);

    expect(sorted.map((item) => item.id)).toEqual(["second", "first", "missing"]);
  });
});
