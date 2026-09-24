import { apiClient } from "@/lib/api/client";
import type { VerificationEvidence, VerificationEvidenceInput } from "@/types/verification";
import type { VerificationProvider } from "./verification.provider";

export const apiVerificationProvider: VerificationProvider = {
  async uploadEvidence(input) {
    const body = new FormData();
    body.append("kind", input.kind);
    body.append("documentType", input.documentType);
    body.append("file", input.file);
    return apiClient.post<VerificationEvidence>("/verification/evidence", { body });
  },

  getEvidence: () => apiClient.get<VerificationEvidence[]>("/verification/evidence"),
  removeEvidence: (evidenceId) => apiClient.delete<void>(`/verification/evidence/${evidenceId}`),
};
