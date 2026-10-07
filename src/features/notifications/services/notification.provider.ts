import type { Notification } from "@/types/notifications";

export type NotificationProvider = {
  getNotifications(userId: string): Promise<Notification[]>;
  getUnreadCount(userId: string): Promise<number>;
  markAsRead(notificationId: string, userId: string): Promise<Notification | null>;
  markAllAsRead(userId: string): Promise<number>;
};
