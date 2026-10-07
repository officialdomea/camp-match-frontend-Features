import { createAppError } from "@/lib/api/errors";
import type { Notification } from "@/types/notifications";
import type { NotificationProvider } from "./notification.provider";

const STORAGE_KEY = "campmatch.notifications";
const fallbackStore = new Map<string, string>();

const seedNotifications: Notification[] = [
  {
    id: "notif_msg_1",
    type: "NEW_MESSAGE",
    recipientId: "student-a",
    title: "New message",
    body: "Owner responded about your inquiry for property-unical-1.",
    createdAt: "2026-09-24T07:22:00.000Z",
    entityId: "conv_property_unical",
    entityType: "conversation",
    route: "/messages?conversation=conv_property_unical",
  },
  {
    id: "notif_match_1",
    type: "ROOMMATE_MATCH",
    recipientId: "student-a",
    title: "Roommate match available",
    body: "A compatible roommate in your university is ready to connect.",
    createdAt: "2026-09-24T05:46:00.000Z",
    entityId: "match-roommate-1",
    entityType: "roommate-match",
    route: "/roommates",
  },
  {
    id: "notif_booking_1",
    type: "BOOKING",
    recipientId: "owner-1",
    title: "Booking update",
    body: "A student requested to book one of your properties.",
    createdAt: "2026-09-24T06:10:00.000Z",
    entityId: "booking-1",
    entityType: "booking",
    route: "/owner/bookings",
  },
];

function storage(): Storage {
  if (typeof window !== "undefined" && window.localStorage) return window.localStorage;
  return {
    getItem: (key: string) => fallbackStore.get(key) ?? null,
    setItem: (key: string, value: string) => void fallbackStore.set(key, value),
    removeItem: (key: string) => void fallbackStore.delete(key),
    clear: () => void fallbackStore.clear(),
  } as Storage;
}

function readNotifications(): Notification[] {
  try {
    const raw = storage().getItem(STORAGE_KEY);
    if (!raw) return [...seedNotifications];
    const parsed = JSON.parse(raw) as Notification[];
    return parsed.length ? parsed : [...seedNotifications];
  } catch {
    return [...seedNotifications];
  }
}

function writeNotifications(notifications: Notification[]) {
  storage().setItem(STORAGE_KEY, JSON.stringify(notifications));
}

export const mockNotificationProvider: NotificationProvider = {
  async getNotifications(userId: string) {
    return readNotifications().filter((notification) => notification.recipientId === userId);
  },

  async getUnreadCount(userId: string) {
    return (await this.getNotifications(userId)).filter((notification) => !notification.readAt)
      .length;
  },

  async markAsRead(notificationId: string, userId: string) {
    const notifications = readNotifications();
    const next = notifications.find(
      (notification) => notification.id === notificationId && notification.recipientId === userId,
    );
    if (!next) throw createAppError("NOT_FOUND");

    const updated: Notification = {
      ...next,
      readAt: new Date().toISOString(),
    };
    writeNotifications(
      notifications.map((notification) =>
        notification.id === notificationId ? updated : notification,
      ),
    );
    return updated;
  },

  async markAllAsRead(userId: string) {
    const notifications = readNotifications();
    const updated = notifications.map((notification) =>
      notification.recipientId === userId && !notification.readAt
        ? { ...notification, readAt: new Date().toISOString() }
        : notification,
    );
    writeNotifications(updated);
    return updated.filter(
      (notification) => notification.recipientId === userId && notification.readAt,
    ).length;
  },
};
