import type { UserRole } from "@/types/auth";
import type { Conversation } from "@/types/messages";

/**
 * Frontend-only authorization policy. The backend remains authoritative.
 * Providers supply relationship facts; this module only evaluates them.
 */
export type MessagingActor = {
  id: string;
  role: UserRole | null;
};

export type ConversationAccessContext = {
  actor: MessagingActor;
  conversation: Pick<
    Conversation,
    "type" | "participantIds" | "propertyId" | "bookingId" | "roommateMatchId"
  >;
  participantRoles: Record<string, UserRole | undefined>;
  propertyRelationship?: {
    propertyId: string;
    ownerId: string;
    authorizedScoutIds: string[];
  };
  roommateMatchRelationship?: {
    matchId: string;
    participantIds: string[];
    compatible: boolean;
  };
  bookingRelationship?: {
    bookingId: string;
    propertyId: string;
    studentId: string;
    ownerId: string;
  };
};

function hasExactlyTwoParticipants(
  conversation: ConversationAccessContext["conversation"],
): boolean {
  return (
    conversation.participantIds.length === 2 && new Set(conversation.participantIds).size === 2
  );
}

function hasActor(context: ConversationAccessContext): boolean {
  return Boolean(
    context.actor.role &&
    hasExactlyTwoParticipants(context.conversation) &&
    context.conversation.participantIds.includes(context.actor.id),
  );
}

function hasRoles(
  context: ConversationAccessContext,
  firstRole: UserRole,
  secondRole: UserRole,
): boolean {
  const roles = context.conversation.participantIds.map((participantId) =>
    participantId === context.actor.id
      ? context.actor.role
      : context.participantRoles[participantId],
  );
  return roles.includes(firstRole) && roles.includes(secondRole);
}

function hasPropertyRelationship(context: ConversationAccessContext): boolean {
  const propertyId = context.conversation.propertyId;
  return Boolean(
    propertyId &&
    context.propertyRelationship?.propertyId === propertyId &&
    context.propertyRelationship.ownerId &&
    context.propertyRelationship.authorizedScoutIds,
  );
}

export function canMessageStudentToOwner(context: ConversationAccessContext): boolean {
  const relationship = context.propertyRelationship;
  return Boolean(
    hasActor(context) &&
    hasRoles(context, "student", "owner") &&
    hasPropertyRelationship(context) &&
    relationship?.ownerId &&
    context.conversation.participantIds.includes(relationship.ownerId),
  );
}

export function canMessageStudentToScout(context: ConversationAccessContext): boolean {
  const relationship = context.propertyRelationship;
  return Boolean(
    hasActor(context) &&
    hasRoles(context, "student", "scout") &&
    hasPropertyRelationship(context) &&
    relationship?.authorizedScoutIds.some((scoutId) =>
      context.conversation.participantIds.includes(scoutId),
    ),
  );
}

export function canMessageScoutToOwner(context: ConversationAccessContext): boolean {
  const relationship = context.propertyRelationship;
  return Boolean(
    hasActor(context) &&
    hasRoles(context, "scout", "owner") &&
    hasPropertyRelationship(context) &&
    relationship?.ownerId &&
    context.conversation.participantIds.includes(relationship.ownerId) &&
    relationship.authorizedScoutIds.some((scoutId) =>
      context.conversation.participantIds.includes(scoutId),
    ),
  );
}

export function canMessageOwnerToStudent(context: ConversationAccessContext): boolean {
  const relationship = context.propertyRelationship;
  return Boolean(
    hasActor(context) &&
    context.actor.role === "owner" &&
    hasRoles(context, "student", "owner") &&
    hasPropertyRelationship(context) &&
    relationship?.ownerId === context.actor.id &&
    context.conversation.participantIds.includes(relationship.ownerId),
  );
}

export function canMessageOwnerToScout(context: ConversationAccessContext): boolean {
  const relationship = context.propertyRelationship;
  return Boolean(
    hasActor(context) &&
    context.actor.role === "owner" &&
    hasRoles(context, "scout", "owner") &&
    hasPropertyRelationship(context) &&
    relationship?.ownerId === context.actor.id &&
    relationship.authorizedScoutIds.some((scoutId) =>
      context.conversation.participantIds.includes(scoutId),
    ),
  );
}

export function canMessageScoutToStudent(context: ConversationAccessContext): boolean {
  const relationship = context.propertyRelationship;
  return Boolean(
    hasActor(context) &&
    context.actor.role === "scout" &&
    hasRoles(context, "student", "scout") &&
    hasPropertyRelationship(context) &&
    relationship?.authorizedScoutIds.includes(context.actor.id),
  );
}

export function canMessageStudentToStudent(context: ConversationAccessContext): boolean {
  const relationship = context.roommateMatchRelationship;
  const matchId = context.conversation.roommateMatchId;
  return Boolean(
    hasActor(context) &&
    context.actor.role === "student" &&
    hasRoles(context, "student", "student") &&
    matchId &&
    relationship?.matchId === matchId &&
    relationship.compatible &&
    context.conversation.participantIds.every((participantId) =>
      relationship.participantIds.includes(participantId),
    ),
  );
}

export function canAccessConversation(context: ConversationAccessContext): boolean {
  if (!hasActor(context)) {
    return false;
  }

  switch (context.conversation.type) {
    case "PROPERTY_INQUIRY":
      return canMessageStudentToOwner(context) || canMessageOwnerToStudent(context);
    case "PROPERTY_MANAGEMENT":
      return (
        canMessageStudentToScout(context) ||
        canMessageScoutToStudent(context) ||
        canMessageScoutToOwner(context) ||
        canMessageOwnerToScout(context)
      );
    case "ROOMMATE":
      return canMessageStudentToStudent(context);
    case "BOOKING": {
      const booking = context.bookingRelationship;
      return Boolean(
        booking &&
        context.conversation.bookingId === booking.bookingId &&
        context.conversation.propertyId === booking.propertyId &&
        hasPropertyRelationship(context) &&
        context.propertyRelationship?.ownerId === booking.ownerId &&
        context.conversation.participantIds.includes(booking.studentId) &&
        context.conversation.participantIds.includes(booking.ownerId) &&
        hasRoles(context, "student", "owner"),
      );
    }
  }
}
