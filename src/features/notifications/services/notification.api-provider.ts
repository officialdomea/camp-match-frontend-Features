import { createAppError } from "@/lib/api/errors";
import type { Notification } from "@/types/notifications";
import type { NotificationProvider } from "./notification.provider";

export const apiNotificationProvider: NotificationProvider = {
  async getNotifications() {
    throw createAppError("SERVER_ERROR", {
      title: "Notifications are not connected yet",
      message: "The backend notifications API is not available in this build.",
    });
  },
  async getUnreadCount() {
    return 0;
  },
  async markAsRead(): Promise<Notification | null> {
    throw createAppError("SERVER_ERROR", {
      title: "Notifications are not connected yet",
      message: "The backend notifications API is not available in this build.",
    });
  },
  async markAllAsRead() {
    return 0;
  },
};
