import type { VerificationRecord, VerificationSubjectType } from "@/types/auth";
import type { AuthorizationActor } from "@/features/authorization/domain/policies";
import type { VerificationEvidence, VerificationEvidenceInput } from "@/types/verification";

export type VerificationSubmissionInput = {
  subjectType: VerificationSubjectType;
  subjectId: string;
  submittedBy?: string | undefined;
  note?: string | undefined;
};

/** Private evidence contract. Implementations must not expose file URLs publicly. */
export type VerificationProvider = {
  uploadEvidence(
    actor: AuthorizationActor,
    input: VerificationEvidenceInput,
  ): Promise<VerificationEvidence>;
  getEvidence(actor: AuthorizationActor): Promise<VerificationEvidence[]>;
  removeEvidence(actor: AuthorizationActor, evidenceId: string): Promise<void>;
  getVerificationStatus(
    actor: AuthorizationActor,
    subjectType: VerificationSubjectType,
    subjectId: string,
  ): Promise<VerificationRecord | null>;
  submitVerification(
    actor: AuthorizationActor,
    input: VerificationSubmissionInput,
  ): Promise<VerificationRecord>;
};
