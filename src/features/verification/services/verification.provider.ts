import type { VerificationEvidence, VerificationEvidenceInput } from "@/types/verification";

/** Private evidence contract. Implementations must not expose file URLs publicly. */
export type VerificationProvider = {
  uploadEvidence(input: VerificationEvidenceInput): Promise<VerificationEvidence>;
  getEvidence(): Promise<VerificationEvidence[]>;
  removeEvidence(evidenceId: string): Promise<void>;
};
