import type { UserRole } from "@/types/auth";

export type ConversationType = "PROPERTY_INQUIRY" | "PROPERTY_MANAGEMENT" | "ROOMMATE" | "BOOKING";

export type Conversation = {
  id: string;
  type: ConversationType;
  participantIds: string[];
  propertyId?: string;
  bookingId?: string;
  roommateMatchId?: string;
  createdAt: string;
  updatedAt: string;
  lastMessage?: string;
  unreadCount: number;
  readAtByUser?: Record<string, string>;
  title?: string;
  contextLabel?: string;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
  readAt?: string | null;
};

export type SendMessageInput = {
  conversationId: string;
  senderId: string;
  senderRole: UserRole | null;
  body: string;
};

/** Backend authorization inputs; IDs reference domain records, not embedded objects. */
export type MessagingAuthorizationContract = {
  authenticatedUser: { id: string; role: UserRole | null };
  conversation: {
    participantIds: string[];
    propertyId?: string;
    bookingId?: string;
    roommateMatchId?: string;
  };
  relationships: {
    propertyOwnerId?: string;
    authorizedScoutIds?: string[];
    roommateMatchParticipantIds?: string[];
    bookingStudentId?: string;
    bookingOwnerId?: string;
  };
};

export function normalizeMessageBody(body: string): string {
  return body.trim();
}

export function createConversationContextLabel(
  conversation: Pick<Conversation, "type" | "propertyId" | "roommateMatchId">,
): string {
  if (conversation.type === "PROPERTY_INQUIRY" || conversation.type === "PROPERTY_MANAGEMENT") {
    return conversation.propertyId
      ? `Property: ${conversation.propertyId}`
      : "Property conversation";
  }

  if (conversation.type === "ROOMMATE") {
    return conversation.roommateMatchId
      ? `Roommate match: ${conversation.roommateMatchId}`
      : "Roommate conversation";
  }

  return "Booking conversation";
}
