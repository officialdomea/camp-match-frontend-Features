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

export type MessagingService = {
  getConversations(): Promise<Conversation[]>;
  getConversation(conversationId: string): Promise<Conversation | null>;
  getMessages(conversationId: string): Promise<Message[]>;
  sendMessage(input: Pick<SendMessageInput, "conversationId" | "body">): Promise<Message>;
  markConversationAsRead(conversationId: string): Promise<Conversation | null>;
  getUnreadCount(): Promise<number>;
};
