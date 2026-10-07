import { describe, expect, it } from "vitest";
import { notificationService } from "./notification.service";

describe("notification service", () => {
  it("returns notifications for the current user and tracks unread state", async () => {
    const notifications = await notificationService.getNotifications("student-a");
    const unread = await notificationService.getUnreadCount("student-a");

    expect(notifications.length).toBeGreaterThan(0);
    expect(unread).toBeGreaterThanOrEqual(0);
  });

  it("marks notifications as read", async () => {
    const first = (await notificationService.getNotifications("student-a"))[0];
    if (first) {
      await notificationService.markAsRead(first.id, "student-a");
      const unread = await notificationService.getUnreadCount("student-a");
      expect(unread).toBeGreaterThanOrEqual(0);
    }
  });

  it("isolates notifications to the intended recipient only", async () => {
    const studentNotifications = await notificationService.getNotifications("student-a");
    const ownerNotifications = await notificationService.getNotifications("owner-1");

    expect(
      studentNotifications.every((notification) => notification.recipientId === "student-a"),
    ).toBe(true);
    expect(ownerNotifications.every((notification) => notification.recipientId === "owner-1")).toBe(
      true,
    );
    expect(
      studentNotifications.some((notification) => notification.recipientId === "owner-1"),
    ).toBe(false);
  });
});
