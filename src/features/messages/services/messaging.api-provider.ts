import { createAppError } from "@/lib/api/errors";
import type { Conversation, Message, SendMessageInput } from "@/types/messages";
import type { MessagingProvider } from "./messaging.provider";

export const apiMessagingProvider: MessagingProvider = {
  async getConversations() {
    throw createAppError("SERVER_ERROR", {
      title: "Messaging is not connected yet",
      message: "The backend messaging API is not available in this build.",
    });
  },
  async getConversation() {
    throw createAppError("SERVER_ERROR", {
      title: "Messaging is not connected yet",
      message: "The backend messaging API is not available in this build.",
    });
  },
  async getMessages() {
    throw createAppError("SERVER_ERROR", {
      title: "Messaging is not connected yet",
      message: "The backend messaging API is not available in this build.",
    });
  },
  async sendMessage(_input: SendMessageInput): Promise<Message> {
    throw createAppError("SERVER_ERROR", {
      title: "Messaging is not connected yet",
      message: "The backend messaging API is not available in this build.",
    });
  },
  async markConversationAsRead(): Promise<Conversation | null> {
    throw createAppError("SERVER_ERROR", {
      title: "Messaging is not connected yet",
      message: "The backend messaging API is not available in this build.",
    });
  },
  async getUnreadCount() {
    return 0;
  },
};
