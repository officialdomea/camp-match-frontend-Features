import { createAppError } from "@/lib/api/errors";
import {
  canAccessConversation,
  type ConversationAccessContext,
  type MessagingActor,
} from "@/features/messages/domain/message-access";
import type { UserRole } from "@/types/auth";
import type { Conversation, Message, SendMessageInput } from "@/types/messages";
import type { MessagingProvider } from "./messaging.provider";

const STORAGE_KEY = "campmatch.messaging.conversations";
const MESSAGE_STORAGE_KEY = "campmatch.messaging.messages";

const fallbackStore = new Map<string, string>();

const mockParticipantRoles: Record<string, UserRole> = {
  "student-a": "student",
  "student-b": "student",
  "student-c": "student",
  "student-z": "student",
  "owner-1": "owner",
  "owner-2": "owner",
  "scout-1": "scout",
  "scout-2": "scout",
};

const mockPropertyRelationships: Record<
  string,
  NonNullable<ConversationAccessContext["propertyRelationship"]>
> = {
  "property-unical-1": {
    propertyId: "property-unical-1",
    ownerId: "owner-1",
    authorizedScoutIds: ["scout-1"],
  },
  "property-other-1": {
    propertyId: "property-other-1",
    ownerId: "owner-2",
    authorizedScoutIds: ["scout-2"],
  },
};

const mockRoommateRelationships: Record<
  string,
  NonNullable<ConversationAccessContext["roommateMatchRelationship"]>
> = {
  "match-roommate-1": {
    matchId: "match-roommate-1",
    participantIds: ["student-a", "student-b"],
    compatible: true,
  },
  "match-unrelated-1": {
    matchId: "match-unrelated-1",
    participantIds: ["student-z", "student-c"],
    compatible: false,
  },
};

const seedConversations: Conversation[] = [
  {
    id: "conv_property_unical",
    type: "PROPERTY_INQUIRY",
    participantIds: ["student-a", "owner-1"],
    propertyId: "property-unical-1",
    createdAt: "2026-09-24T07:15:00.000Z",
    updatedAt: "2026-09-24T07:35:00.000Z",
    lastMessage: "Is this still available for next month?",
    unreadCount: 1,
    readAtByUser: { "owner-1": "2026-09-24T07:30:00.000Z" },
    title: "Property inquiry",
    contextLabel: "Property: property-unical-1",
  },
  {
    id: "conv_scout_unical",
    type: "PROPERTY_MANAGEMENT",
    participantIds: ["student-a", "scout-1"],
    propertyId: "property-unical-1",
    createdAt: "2026-09-24T06:00:00.000Z",
    updatedAt: "2026-09-24T06:50:00.000Z",
    lastMessage: "I can arrange a viewing tomorrow morning.",
    unreadCount: 0,
    readAtByUser: {
      "student-a": "2026-09-24T06:55:00.000Z",
      "scout-1": "2026-09-24T06:55:00.000Z",
    },
    title: "Property managed by scout",
    contextLabel: "Managed by scout-1",
  },
  {
    id: "conv_roommate_match",
    type: "ROOMMATE",
    participantIds: ["student-a", "student-b"],
    roommateMatchId: "match-roommate-1",
    createdAt: "2026-09-24T05:40:00.000Z",
    updatedAt: "2026-09-24T05:50:00.000Z",
    lastMessage: "Would you want to split a room in Ekosodin?",
    unreadCount: 1,
    readAtByUser: { "student-b": "2026-09-24T05:45:00.000Z" },
    title: "Roommate match",
    contextLabel: "Roommate match: match-roommate-1",
  },
  {
    id: "conv_owner_relevant_scout",
    type: "PROPERTY_MANAGEMENT",
    participantIds: ["scout-1", "owner-1"],
    propertyId: "property-unical-1",
    createdAt: "2026-09-24T06:00:00.000Z",
    updatedAt: "2026-09-24T06:20:00.000Z",
    lastMessage: "I’ve confirmed the listing details for the viewing.",
    unreadCount: 0,
    readAtByUser: { "owner-1": "2026-09-24T06:10:00.000Z" },
    title: "Scout coordination",
    contextLabel: "Managed by scout-1",
  },
  {
    id: "conv_scout_unrelated",
    type: "PROPERTY_MANAGEMENT",
    participantIds: ["student-z", "scout-2"],
    propertyId: "property-other-1",
    createdAt: "2026-09-24T04:15:00.000Z",
    updatedAt: "2026-09-24T04:16:00.000Z",
    lastMessage: "The property has a different owner profile.",
    unreadCount: 0,
    readAtByUser: { "student-z": "2026-09-24T04:16:00.000Z" },
    title: "Unrelated scout",
    contextLabel: "Managed by scout-2",
  },
  {
    id: "conv_owner_unrelated_scout",
    type: "PROPERTY_MANAGEMENT",
    participantIds: ["scout-1", "owner-2"],
    propertyId: "property-other-1",
    createdAt: "2026-09-24T04:00:00.000Z",
    updatedAt: "2026-09-24T04:02:00.000Z",
    lastMessage: "I can help with a different property.",
    unreadCount: 0,
    readAtByUser: { "scout-1": "2026-09-24T04:02:00.000Z" },
    title: "Unrelated property conversation",
    contextLabel: "Property: property-other-1",
  },
  {
    id: "conv_student_unrelated",
    type: "ROOMMATE",
    participantIds: ["student-z", "student-c"],
    roommateMatchId: "match-unrelated-1",
    createdAt: "2026-09-24T03:50:00.000Z",
    updatedAt: "2026-09-24T03:56:00.000Z",
    lastMessage: "I’m looking for a different roommate match.",
    unreadCount: 0,
    readAtByUser: { "student-c": "2026-09-24T03:56:00.000Z" },
    title: "Unrelated roommate conversation",
    contextLabel: "Roommate match: match-unrelated-1",
  },
  {
    id: "conv_owner_unrelated",
    type: "PROPERTY_INQUIRY",
    participantIds: ["student-z", "owner-2"],
    propertyId: "property-other-1",
    createdAt: "2026-09-24T04:00:00.000Z",
    updatedAt: "2026-09-24T04:05:00.000Z",
    lastMessage: "The room is available.",
    unreadCount: 0,
    readAtByUser: { "student-z": "2026-09-24T04:05:00.000Z" },
    title: "Unrelated owner",
    contextLabel: "Property: property-other-1",
  },
];

const seedMessages: Record<string, Message[]> = {
  conv_property_unical: [
    {
      id: "msg_1",
      conversationId: "conv_property_unical",
      senderId: "student-a",
      body: "Hi, is this still available for next month?",
      createdAt: "2026-09-24T07:10:00.000Z",
    },
    {
      id: "msg_2",
      conversationId: "conv_property_unical",
      senderId: "owner-1",
      body: "Yes, it is still available. Would you like a viewing?",
      createdAt: "2026-09-24T07:22:00.000Z",
    },
    {
      id: "msg_3",
      conversationId: "conv_property_unical",
      senderId: "student-a",
      body: "Is this still available for next month?",
      createdAt: "2026-09-24T07:35:00.000Z",
    },
  ],
  conv_scout_unical: [
    {
      id: "msg_4",
      conversationId: "conv_scout_unical",
      senderId: "scout-1",
      body: "I can arrange a viewing tomorrow morning.",
      createdAt: "2026-09-24T06:40:00.000Z",
    },
    {
      id: "msg_5",
      conversationId: "conv_scout_unical",
      senderId: "student-a",
      body: "Perfect, thank you.",
      createdAt: "2026-09-24T06:50:00.000Z",
    },
  ],
  conv_roommate_match: [
    {
      id: "msg_6",
      conversationId: "conv_roommate_match",
      senderId: "student-b",
      body: "Would you want to split a room in Ekosodin?",
      createdAt: "2026-09-24T05:44:00.000Z",
    },
    {
      id: "msg_7",
      conversationId: "conv_roommate_match",
      senderId: "student-a",
      body: "That sounds good. I can share more details.",
      createdAt: "2026-09-24T05:50:00.000Z",
    },
  ],
  conv_owner_relevant_scout: [
    {
      id: "msg_9",
      conversationId: "conv_owner_relevant_scout",
      senderId: "scout-1",
      body: "I’ve confirmed the handling details for the property listing.",
      createdAt: "2026-09-24T06:10:00.000Z",
    },
  ],
  conv_scout_unrelated: [
    {
      id: "msg_10",
      conversationId: "conv_scout_unrelated",
      senderId: "scout-2",
      body: "The property is not connected to your current listing.",
      createdAt: "2026-09-24T04:16:00.000Z",
    },
  ],
  conv_owner_unrelated_scout: [
    {
      id: "msg_11",
      conversationId: "conv_owner_unrelated_scout",
      senderId: "owner-2",
      body: "I’m working with a different property owner.",
      createdAt: "2026-09-24T04:02:00.000Z",
    },
  ],
  conv_student_unrelated: [
    {
      id: "msg_12",
      conversationId: "conv_student_unrelated",
      senderId: "student-z",
      body: "I’m trying a different roommate match.",
      createdAt: "2026-09-24T03:55:00.000Z",
    },
  ],
  conv_owner_unrelated: [
    {
      id: "msg_8",
      conversationId: "conv_owner_unrelated",
      senderId: "owner-2",
      body: "The room is available.",
      createdAt: "2026-09-24T04:05:00.000Z",
    },
  ],
};

function storage(): Storage {
  if (typeof window !== "undefined" && window.localStorage) return window.localStorage;
  return {
    getItem: (key: string) => fallbackStore.get(key) ?? null,
    setItem: (key: string, value: string) => void fallbackStore.set(key, value),
    removeItem: (key: string) => void fallbackStore.delete(key),
    clear: () => void fallbackStore.clear(),
  } as Storage;
}

function readConversations(): Conversation[] {
  try {
    const raw = storage().getItem(STORAGE_KEY);
    if (!raw) return [...seedConversations];
    const parsed = JSON.parse(raw) as Conversation[];
    return parsed.length ? parsed : [...seedConversations];
  } catch {
    return [...seedConversations];
  }
}

function writeConversations(conversations: Conversation[]) {
  storage().setItem(STORAGE_KEY, JSON.stringify(conversations));
}

function readMessages(): Record<string, Message[]> {
  try {
    const raw = storage().getItem(MESSAGE_STORAGE_KEY);
    if (!raw) return { ...seedMessages };
    const parsed = JSON.parse(raw) as Record<string, Message[]>;
    return Object.keys(parsed).length ? parsed : { ...seedMessages };
  } catch {
    return { ...seedMessages };
  }
}

function writeMessages(messages: Record<string, Message[]>) {
  storage().setItem(MESSAGE_STORAGE_KEY, JSON.stringify(messages));
}

function computeUnreadCount(conversation: Conversation, userId: string): number {
  const messages = readMessages()[conversation.id] ?? [];
  const lastReadAt = conversation.readAtByUser?.[userId] ?? null;

  return messages.filter((message) => {
    if (message.senderId === userId) return false;
    if (!lastReadAt) return true;
    return new Date(message.createdAt).getTime() > new Date(lastReadAt).getTime();
  }).length;
}

function normalizeConversation(conversation: Conversation, viewerId: string): Conversation {
  const unreadCount = computeUnreadCount(conversation, viewerId);
  return {
    ...conversation,
    unreadCount,
    lastMessage:
      (readMessages()[conversation.id] ?? []).at(-1)?.body ?? conversation.lastMessage ?? "",
  };
}

function accessContext(
  conversation: Conversation,
  actor: MessagingActor,
): ConversationAccessContext {
  const propertyRelationship = conversation.propertyId
    ? mockPropertyRelationships[conversation.propertyId]
    : undefined;
  const roommateMatchRelationship = conversation.roommateMatchId
    ? mockRoommateRelationships[conversation.roommateMatchId]
    : undefined;

  return {
    actor,
    conversation,
    participantRoles: Object.fromEntries(
      conversation.participantIds.map((participantId) => [
        participantId,
        mockParticipantRoles[participantId],
      ]),
    ),
    ...(propertyRelationship ? { propertyRelationship } : {}),
    ...(roommateMatchRelationship ? { roommateMatchRelationship } : {}),
  };
}

function requireAuthorizedConversation(conversation: Conversation, actor: MessagingActor): void {
  if (
    !conversation.participantIds.includes(actor.id) ||
    !canAccessConversation(accessContext(conversation, actor))
  ) {
    throw createAppError("FORBIDDEN", {
      title: "This conversation is not available",
      message: "You don't have access to this conversation.",
    });
  }
}

export const mockMessagingProvider: MessagingProvider = {
  async getConversations(actor: MessagingActor) {
    const conversations = readConversations();
    return conversations
      .filter((conversation) => {
        try {
          requireAuthorizedConversation(conversation, actor);
          return true;
        } catch {
          return false;
        }
      })
      .map((conversation) => normalizeConversation(conversation, actor.id))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  async getConversation(conversationId: string, actor: MessagingActor) {
    const conversation = readConversations().find((item) => item.id === conversationId);
    if (!conversation) throw createAppError("NOT_FOUND");
    requireAuthorizedConversation(conversation, actor);
    return normalizeConversation(conversation, actor.id);
  },

  async getMessages(conversationId: string, actor: MessagingActor) {
    const conversation = await this.getConversation(conversationId, actor);
    if (!conversation) return [];
    return (readMessages()[conversationId] ?? []).map((message) => ({ ...message }));
  },

  async sendMessage(input: SendMessageInput) {
    if (!input.body.trim()) {
      throw createAppError("VALIDATION_ERROR", {
        title: "Message can't be empty",
        message: "Write a message before sending.",
      });
    }

    const conversations = readConversations();
    const conversation = conversations.find((item) => item.id === input.conversationId);
    if (!conversation) throw createAppError("NOT_FOUND");
    try {
      requireAuthorizedConversation(conversation, { id: input.senderId, role: input.senderRole });
    } catch {
      throw createAppError("FORBIDDEN", {
        title: "This conversation is not available",
        message: "Your account can't send messages in this thread.",
      });
    }

    const now = new Date().toISOString();
    const message: Message = {
      id: `msg_${Math.random().toString(36).slice(2, 10)}`,
      conversationId: input.conversationId,
      senderId: input.senderId,
      body: input.body.trim(),
      createdAt: now,
    };

    const nextMessages = {
      ...readMessages(),
      [input.conversationId]: [...(readMessages()[input.conversationId] ?? []), message],
    };
    writeMessages(nextMessages);

    const nextConversations = conversations.map((item) => {
      if (item.id !== input.conversationId) return item;
      const updated: Conversation = {
        ...item,
        updatedAt: now,
        lastMessage: input.body.trim(),
        readAtByUser: {
          ...item.readAtByUser,
          [input.senderId]: now,
        },
      };
      return updated;
    });
    writeConversations(nextConversations);

    return message;
  },

  async markConversationAsRead(conversationId: string, actor: MessagingActor) {
    const conversation = await this.getConversation(conversationId, actor);
    if (!conversation) return null;
    const conversations = readConversations();
    const next = conversations.map((item) => {
      if (item.id !== conversationId) return item;
      return {
        ...item,
        readAtByUser: {
          ...(item.readAtByUser ?? {}),
          [actor.id]: new Date().toISOString(),
        },
      };
    });
    writeConversations(next);
    return this.getConversation(conversationId, actor);
  },

  async getUnreadCount(actor: MessagingActor) {
    return (await this.getConversations(actor)).reduce(
      (total, conversation) => total + conversation.unreadCount,
      0,
    );
  },
};
