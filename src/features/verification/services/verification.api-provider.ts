import { apiClient } from "@/lib/api/client";
import { createAppError } from "@/lib/api/errors";
import type { AuthorizationActor } from "@/features/authorization/domain/policies";
import type { VerificationRecord, VerificationSubjectType } from "@/types/auth";
import type { VerificationEvidence, VerificationEvidenceInput } from "@/types/verification";
import type { VerificationProvider, VerificationSubmissionInput } from "./verification.provider";

export const apiVerificationProvider: VerificationProvider = {
  async uploadEvidence(_actor: AuthorizationActor, input) {
    const body = new FormData();
    body.append("kind", input.kind);
    body.append("documentType", input.documentType);
    body.append("file", input.file);
    return apiClient.post<VerificationEvidence>("/verification/evidence", { body });
  },

  getEvidence: () => apiClient.get<VerificationEvidence[]>("/verification/evidence"),
  removeEvidence: (_actor, evidenceId) =>
    apiClient.delete<void>(`/verification/evidence/${evidenceId}`),

  async getVerificationStatus(
    _actor: AuthorizationActor,
    _subjectType: VerificationSubjectType,
    _subjectId: string,
  ) {
    throw createAppError("SERVER_ERROR", {
      title: "Verification status is not connected",
      message: "Verification status is a backend-authoritative workflow and is not yet wired up.",
    });
  },

  async submitVerification(
    _actor: AuthorizationActor,
    _input: VerificationSubmissionInput,
  ): Promise<VerificationRecord> {
    throw createAppError("SERVER_ERROR", {
      title: "Verification submission is not connected",
      message: "Verification workflow is not yet connected to the backend.",
    });
  },
};
