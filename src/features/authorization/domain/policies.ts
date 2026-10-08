import type { UserRole, VerificationSubjectType } from "@/types/auth";
import type { ManagedProperty, ScoutPermissions } from "@/types/property";
import type { Report } from "@/types/reporting";
import {
  canAccessConversation,
  type ConversationAccessContext,
} from "@/features/messages/domain/message-access";

export type AuthorizationActor = {
  id: string;
  role: UserRole | null;
};

export function canManageProperty(
  actor: AuthorizationActor | null | undefined,
  property: Pick<ManagedProperty, "owner" | "scouts"> | null | undefined,
  permission?: keyof ScoutPermissions,
): boolean {
  if (!actor || !property) return false;
  if (actor.role === "owner") return property.owner.id === actor.id;
  if (actor.role !== "scout") return false;

  const assignment = property.scouts.find(
    (scout) => scout.scoutId === actor.id && scout.status === "active",
  );
  return Boolean(assignment && (!permission || assignment.permissions[permission]));
}

export function canViewPublicProperty(
  property: Pick<ManagedProperty, "status"> | null | undefined,
): boolean {
  return property?.status === "active";
}

const identitySubjectForRole: Record<UserRole, Exclude<VerificationSubjectType, "property">> = {
  student: "student_identity",
  owner: "owner_identity",
  scout: "scout_identity",
};

export function canAccessPrivateVerification(
  actor: AuthorizationActor | null | undefined,
  subjectType: VerificationSubjectType,
  subjectId: string,
): boolean {
  return Boolean(
    actor?.role && actor.id === subjectId && identitySubjectForRole[actor.role] === subjectType,
  );
}

export function canViewTrustInfo(): true {
  return true;
}

export function canAccessConversationPolicy(context: ConversationAccessContext): boolean {
  return canAccessConversation(context);
}

export function canReportTarget(
  actor: AuthorizationActor | null | undefined,
  targetType: "user" | "property" | "conversation",
  targetId: string,
): boolean {
  return Boolean(
    actor?.id && actor.role && targetId.trim() && !(targetType === "user" && actor.id === targetId),
  );
}

export function canViewReport(
  actor: AuthorizationActor | null | undefined,
  report: Pick<Report, "reporterId"> | null | undefined,
): boolean {
  return Boolean(actor?.id && report?.reporterId === actor.id);
}

export function canChangeReportStatus(): false {
  return false;
}
