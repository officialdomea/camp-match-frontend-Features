import { env } from "@/lib/env";
import { apiMessagingProvider } from "./messaging.api-provider";
import { mockMessagingProvider } from "./messaging.mock-provider";
import type { MessagingProvider } from "./messaging.provider";
import type { MessagingActor } from "@/features/messages/domain/message-access";

const provider: MessagingProvider = env.useMockData ? mockMessagingProvider : apiMessagingProvider;

export const messagingService: MessagingProvider = {
  getConversations: (actor) => provider.getConversations(actor),
  getConversation: (conversationId, actor) => provider.getConversation(conversationId, actor),
  getMessages: (conversationId, actor) => provider.getMessages(conversationId, actor),
  sendMessage: (input) => provider.sendMessage(input),
  markConversationAsRead: (conversationId, viewerId) =>
    provider.markConversationAsRead(conversationId, viewerId),
  getUnreadCount: (actor: MessagingActor) => provider.getUnreadCount(actor),
};
