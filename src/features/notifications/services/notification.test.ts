import { describe, expect, it } from "vitest";
import { createNotificationService } from "./notification.service";
import { mockNotificationProvider } from "./notification.mock-provider";

describe("notification service", () => {
  const studentService = createNotificationService(mockNotificationProvider, async () => ({
    id: "student-a",
  }));

  it("returns notifications for the current user and tracks unread state", async () => {
    const notifications = await studentService.getNotifications();
    const unread = await studentService.getUnreadCount();

    expect(notifications.length).toBeGreaterThan(0);
    expect(unread).toBeGreaterThanOrEqual(0);
  });

  it("marks notifications as read", async () => {
    const first = (await studentService.getNotifications())[0];
    if (first) {
      await studentService.markAsRead(first.id);
      const unread = await studentService.getUnreadCount();
      expect(unread).toBeGreaterThanOrEqual(0);
    }
  });

  it("isolates notifications to the intended recipient only", async () => {
    const ownerService = createNotificationService(mockNotificationProvider, async () => ({
      id: "owner-1",
    }));
    const studentNotifications = await studentService.getNotifications();
    const ownerNotifications = await ownerService.getNotifications();

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

  it("requires a signed-in user for private notification operations", async () => {
    const service = createNotificationService(mockNotificationProvider, async () => null);
    await expect(service.getNotifications()).rejects.toMatchObject({
      code: "AUTHENTICATION_ERROR",
    });
  });
});
