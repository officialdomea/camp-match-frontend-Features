import { env } from "@/lib/env";
import { createAppError } from "@/lib/api/errors";
import { authService } from "@/features/auth/services/auth.service";
import { apiMessagingProvider } from "./messaging.api-provider";
import { mockMessagingProvider } from "./messaging.mock-provider";
import type { MessagingProvider, MessagingService } from "./messaging.provider";
import type { MessagingActor } from "@/features/messages/domain/message-access";

const provider: MessagingProvider = env.useMockData ? mockMessagingProvider : apiMessagingProvider;

export function createMessagingService(
  messageProvider: MessagingProvider,
  getCurrentUser: () => Promise<MessagingActor | null>,
): MessagingService {
  const requireActor = async (): Promise<MessagingActor> => {
    const actor = await getCurrentUser();
    if (!actor) throw createAppError("AUTHENTICATION_ERROR");
    if (!actor.role) throw createAppError("FORBIDDEN");
    return actor;
  };

  return {
    getConversations: async () => messageProvider.getConversations(await requireActor()),
    getConversation: async (conversationId) =>
      messageProvider.getConversation(conversationId, await requireActor()),
    getMessages: async (conversationId) =>
      messageProvider.getMessages(conversationId, await requireActor()),
    sendMessage: async ({ conversationId, body }) => {
      const actor = await requireActor();
      return messageProvider.sendMessage({
        conversationId,
        senderId: actor.id,
        senderRole: actor.role,
        body,
      });
    },
    markConversationAsRead: async (conversationId) =>
      messageProvider.markConversationAsRead(conversationId, await requireActor()),
    getUnreadCount: async () => messageProvider.getUnreadCount(await requireActor()),
  };
}

export const messagingService = createMessagingService(provider, async () => {
  const user = await authService.getCurrentUser();
  return user ? { id: user.id, role: user.role } : null;
});
