import type { Conversation, Message, SendMessageInput } from "@/types/messages";
import type { MessagingActor } from "@/features/messages/domain/message-access";

export type MessagingProvider = {
  getConversations(actor: MessagingActor): Promise<Conversation[]>;
  getConversation(conversationId: string, actor: MessagingActor): Promise<Conversation | null>;
  getMessages(conversationId: string, actor: MessagingActor): Promise<Message[]>;
  sendMessage(input: SendMessageInput): Promise<Message>;
  markConversationAsRead(
    conversationId: string,
    actor: MessagingActor,
  ): Promise<Conversation | null>;
  getUnreadCount(actor: MessagingActor): Promise<number>;
};
