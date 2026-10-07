import { env } from "@/lib/env";
import { apiNotificationProvider } from "./notification.api-provider";
import { mockNotificationProvider } from "./notification.mock-provider";
import type { NotificationProvider } from "./notification.provider";

const provider: NotificationProvider = env.useMockData
  ? mockNotificationProvider
  : apiNotificationProvider;

export const notificationService: NotificationProvider = {
  getNotifications: (userId) => provider.getNotifications(userId),
  getUnreadCount: (userId) => provider.getUnreadCount(userId),
  markAsRead: (notificationId, userId) => provider.markAsRead(notificationId, userId),
  markAllAsRead: (userId) => provider.markAllAsRead(userId),
};
