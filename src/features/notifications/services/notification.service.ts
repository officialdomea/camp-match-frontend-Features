import { env } from "@/lib/env";
import { createAppError } from "@/lib/api/errors";
import { authService } from "@/features/auth/services/auth.service";
import { apiNotificationProvider } from "./notification.api-provider";
import { mockNotificationProvider } from "./notification.mock-provider";
import type { NotificationProvider, NotificationService } from "./notification.provider";

const provider: NotificationProvider = env.useMockData
  ? mockNotificationProvider
  : apiNotificationProvider;

export function createNotificationService(
  notificationProvider: NotificationProvider,
  getCurrentUser: () => Promise<{ id: string } | null>,
): NotificationService {
  const requireUserId = async () => {
    const user = await getCurrentUser();
    if (!user) throw createAppError("AUTHENTICATION_ERROR");
    return user.id;
  };

  return {
    getNotifications: async () => {
      const userId = await requireUserId();
      return (await notificationProvider.getNotifications(userId)).filter(
        (notification) => notification.recipientId === userId,
      );
    },
    getUnreadCount: async () => notificationProvider.getUnreadCount(await requireUserId()),
    markAsRead: async (notificationId) =>
      notificationProvider.markAsRead(notificationId, await requireUserId()),
    markAllAsRead: async () => notificationProvider.markAllAsRead(await requireUserId()),
  };
}

export const notificationService = createNotificationService(provider, () =>
  authService.getCurrentUser(),
);
