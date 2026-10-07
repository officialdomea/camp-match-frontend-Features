import { describe, expect, it } from "vitest";
import {
  canAccessConversation,
  canMessageOwnerToStudent,
  canMessageOwnerToScout,
  canMessageScoutToOwner,
  canMessageStudentToOwner,
  canMessageStudentToScout,
  canMessageStudentToStudent,
  canMessageScoutToStudent,
  type ConversationAccessContext,
} from "@/features/messages/domain/message-access";
import { messagingService } from "./messaging.service";

function propertyContext(
  actor: ConversationAccessContext["actor"],
  participantIds: string[],
  propertyId = "property-unical-1",
  relationshipPropertyId = propertyId,
): ConversationAccessContext {
  const ownerId = relationshipPropertyId === "property-unical-1" ? "owner-1" : "owner-2";
  const scoutId = relationshipPropertyId === "property-unical-1" ? "scout-1" : "scout-2";
  const roles = {
    "student-a": "student",
    "student-z": "student",
    "owner-1": "owner",
    "owner-2": "owner",
    "scout-1": "scout",
    "scout-2": "scout",
  } as const;
  const participantRoles = Object.fromEntries(
    participantIds.map((participantId) => [
      participantId,
      roles[participantId as keyof typeof roles],
    ]),
  );
  const participantRoleValues = Object.values(participantRoles);

  return {
    actor,
    conversation: {
      type:
        participantRoleValues.includes("student") && participantRoleValues.includes("owner")
          ? "PROPERTY_INQUIRY"
          : "PROPERTY_MANAGEMENT",
      participantIds,
      propertyId,
    },
    participantRoles,
    propertyRelationship: {
      propertyId: relationshipPropertyId,
      ownerId,
      authorizedScoutIds: [scoutId],
    },
  };
}

describe("messaging authorization policy", () => {
  it("allows Student to relevant Owner conversation access", () => {
    const context = propertyContext({ id: "student-a", role: "student" }, ["student-a", "owner-1"]);
    expect(canMessageStudentToOwner(context)).toBe(true);
    expect(canAccessConversation(context)).toBe(true);
  });

  it("denies Student to unrelated Owner relationship", () => {
    const context = propertyContext(
      { id: "student-a", role: "student" },
      ["student-a", "owner-2"],
      "property-other-1",
      "property-unical-1",
    );
    expect(canMessageStudentToOwner(context)).toBe(false);
    expect(canAccessConversation(context)).toBe(false);
  });

  it("allows Student to authorized Scout conversation", () => {
    const context = propertyContext({ id: "student-a", role: "student" }, ["student-a", "scout-1"]);
    expect(canMessageStudentToScout(context)).toBe(true);
    expect(canAccessConversation(context)).toBe(true);
  });

  it("denies Student to unrelated Scout relationship", () => {
    const context = propertyContext(
      { id: "student-a", role: "student" },
      ["student-a", "scout-2"],
      "property-other-1",
      "property-unical-1",
    );
    expect(canMessageStudentToScout(context)).toBe(false);
    expect(canAccessConversation(context)).toBe(false);
  });

  it("allows authorized Scout to relevant Owner conversation", () => {
    const context = propertyContext({ id: "scout-1", role: "scout" }, ["scout-1", "owner-1"]);
    expect(canMessageScoutToOwner(context)).toBe(true);
    expect(canAccessConversation(context)).toBe(true);
  });

  it("denies Scout to unrelated Owner relationship", () => {
    const context = propertyContext(
      { id: "scout-1", role: "scout" },
      ["scout-1", "owner-2"],
      "property-other-1",
    );
    expect(canMessageScoutToOwner(context)).toBe(false);
    expect(canAccessConversation(context)).toBe(false);
  });

  it("allows Owner to relevant Student and authorized Scout", () => {
    const studentContext = propertyContext({ id: "owner-1", role: "owner" }, [
      "owner-1",
      "student-a",
    ]);
    const scoutContext = propertyContext({ id: "owner-1", role: "owner" }, ["owner-1", "scout-1"]);
    expect(canMessageOwnerToStudent(studentContext)).toBe(true);
    expect(canMessageOwnerToScout(scoutContext)).toBe(true);
    expect(canAccessConversation(studentContext)).toBe(true);
    expect(canAccessConversation(scoutContext)).toBe(true);
  });

  it("allows compatible roommate match communication only", () => {
    const context: ConversationAccessContext = {
      actor: { id: "student-a", role: "student" },
      conversation: {
        type: "ROOMMATE",
        participantIds: ["student-a", "student-b"],
        roommateMatchId: "match-roommate-1",
      },
      participantRoles: { "student-b": "student" },
      roommateMatchRelationship: {
        matchId: "match-roommate-1",
        participantIds: ["student-a", "student-b"],
        compatible: true,
      },
    };
    expect(canMessageStudentToStudent(context)).toBe(true);
    expect(canAccessConversation(context)).toBe(true);
  });

  it("denies unrelated or incompatible student relationships", () => {
    const context: ConversationAccessContext = {
      actor: { id: "student-a", role: "student" },
      conversation: {
        type: "ROOMMATE",
        participantIds: ["student-a", "student-c"],
        roommateMatchId: "match-unrelated-1",
      },
      participantRoles: { "student-c": "student" },
      roommateMatchRelationship: {
        matchId: "match-unrelated-1",
        participantIds: ["student-a", "student-c"],
        compatible: false,
      },
    };
    expect(canMessageStudentToStudent(context)).toBe(false);
    expect(canAccessConversation(context)).toBe(false);
  });

  it("requires an authorized Scout participant for Scout-to-Student access", () => {
    const context = propertyContext(
      { id: "scout-2", role: "scout" },
      ["scout-2", "student-a"],
      "property-other-1",
    );
    expect(canMessageScoutToStudent(context)).toBe(true);
  });
});

describe("messaging provider boundary", () => {
  it("returns only authorized conversations for the actor", async () => {
    const conversations = await messagingService.getConversations({
      id: "student-a",
      role: "student",
    });
    expect(conversations.map((conversation) => conversation.id)).toEqual(
      expect.arrayContaining(["conv_property_unical", "conv_scout_unical", "conv_roommate_match"]),
    );
    expect(conversations.some((conversation) => conversation.id === "conv_owner_unrelated")).toBe(
      false,
    );
  });

  it("denies an unauthorized direct conversation route lookup", async () => {
    await expect(
      messagingService.getConversation("conv_owner_unrelated", {
        id: "student-a",
        role: "student",
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("does not allow message submission to an unauthorized conversation", async () => {
    await expect(
      messagingService.sendMessage({
        conversationId: "conv_owner_unrelated",
        senderId: "student-a",
        senderRole: "student",
        body: "Can I message here?",
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("updates unread state only for a conversation the actor can access", async () => {
    const actor = { id: "student-a", role: "student" as const };
    await messagingService.markConversationAsRead("conv_property_unical", actor);
    await expect(
      messagingService.markConversationAsRead("conv_owner_unrelated", actor),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
