import { env } from "@/lib/env";
import { createAppError } from "@/lib/api/errors";
import { authService } from "@/features/auth/services/auth.service";
import {
  canAccessPrivateVerification,
  type AuthorizationActor,
} from "@/features/authorization/domain/policies";
import { identityVerificationSubjectMap } from "@/features/verification/lib/identity-verification";
import { propertyService } from "@/features/properties/services/property.service";
import { apiVerificationProvider } from "./verification.api-provider";
import { mockVerificationProvider } from "./verification.mock-provider";
import type { VerificationProvider } from "./verification.provider";
import type { VerificationEvidence, VerificationEvidenceInput } from "@/types/verification";
import type { VerificationRecord, VerificationSubjectType } from "@/types/auth";

const provider: VerificationProvider = env.useMockData
  ? mockVerificationProvider
  : apiVerificationProvider;

export type VerificationService = {
  uploadEvidence(input: VerificationEvidenceInput): Promise<VerificationEvidence>;
  getEvidence(): Promise<VerificationEvidence[]>;
  removeEvidence(evidenceId: string): Promise<void>;
  getVerificationStatus(
    subjectType: VerificationSubjectType,
    subjectId: string,
  ): Promise<VerificationRecord | null>;
  submitVerification(input?: { note?: string }): Promise<VerificationRecord>;
  submitPropertyVerification(propertyId: string, note?: string): Promise<VerificationRecord>;
};

export function createVerificationService(
  verificationProvider: VerificationProvider,
  getCurrentUser: () => Promise<
    | (AuthorizationActor & {
        identityVerification?: import("@/types/auth").IdentityVerificationStatus;
      })
    | null
  >,
  canManageOwnedProperty: (actor: AuthorizationActor, propertyId: string) => Promise<boolean>,
): VerificationService {
  const requireActor = async () => {
    const actor = await getCurrentUser();
    if (!actor) throw createAppError("AUTHENTICATION_ERROR");
    if (!actor.role) throw createAppError("FORBIDDEN");
    return actor;
  };

  return {
    uploadEvidence: async (input) =>
      verificationProvider.uploadEvidence(await requireActor(), input),
    getEvidence: async () => verificationProvider.getEvidence(await requireActor()),
    removeEvidence: async (evidenceId) =>
      verificationProvider.removeEvidence(await requireActor(), evidenceId),
    getVerificationStatus: async (subjectType, subjectId) => {
      const actor = await requireActor();
      if (!canAccessPrivateVerification(actor, subjectType, subjectId)) {
        throw createAppError("FORBIDDEN");
      }
      return verificationProvider.getVerificationStatus(actor, subjectType, subjectId);
    },
    submitVerification: async ({ note } = {}) => {
      const actor = await requireActor();
      const subjectType = identityVerificationSubjectMap[actor.role!];
      return verificationProvider.submitVerification(actor, {
        subjectType,
        subjectId: actor.id,
        ...(note ? { note } : {}),
      });
    },
    submitPropertyVerification: async (propertyId, note) => {
      const actor = await requireActor();
      if (actor.role !== "owner" || !(await canManageOwnedProperty(actor, propertyId))) {
        throw createAppError("FORBIDDEN");
      }
      return verificationProvider.submitVerification(actor, {
        subjectType: "property",
        subjectId: propertyId,
        ...(note ? { note } : {}),
      });
    },
  };
}

export const verificationService = createVerificationService(
  provider,
  async () => {
    const user = await authService.getCurrentUser();
    return user ? { id: user.id, role: user.role } : null;
  },
  async (actor, propertyId) => {
    const property = await propertyService.getProperty(propertyId);
    return property.owner.id === actor.id;
  },
);
