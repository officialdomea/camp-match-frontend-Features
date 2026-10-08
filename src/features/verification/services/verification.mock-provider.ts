import { createAppError } from "@/lib/api/errors";
import { canAccessPrivateVerification } from "@/features/authorization/domain/policies";
import type { AuthorizationActor } from "@/features/authorization/domain/policies";
import type { VerificationRecord, VerificationSubjectType } from "@/types/auth";
import type { VerificationEvidence, VerificationEvidenceInput } from "@/types/verification";
import type { VerificationProvider, VerificationSubmissionInput } from "./verification.provider";

const MAX_EVIDENCE_BYTES = 15 * 1024 * 1024;
const allowedTypes = new Set(["application/pdf", "image/jpeg", "image/png"]);
const evidence = new Map<string, VerificationEvidence[]>();
const verificationRecords = new Map<string, VerificationRecord>([
  [
    "student_identity:student-001",
    {
      id: "ver_student_001",
      subjectType: "student_identity",
      subjectId: "student-001",
      status: "pending",
      submittedAt: "2026-09-10T10:00:00.000Z",
      updatedAt: "2026-09-10T10:00:00.000Z",
    },
  ],
  [
    "owner_identity:owner-001",
    {
      id: "ver_owner_001",
      subjectType: "owner_identity",
      subjectId: "owner-001",
      status: "rejected",
      submittedAt: "2026-09-08T09:00:00.000Z",
      reviewedAt: "2026-09-09T14:30:00.000Z",
      rejectionReason: "Please upload a clearer government-issued ID photo.",
      updatedAt: "2026-09-09T14:30:00.000Z",
    },
  ],
  [
    "scout_identity:scout-001",
    {
      id: "ver_scout_001",
      subjectType: "scout_identity",
      subjectId: "scout-001",
      status: "verified",
      submittedAt: "2026-09-02T07:15:00.000Z",
      reviewedAt: "2026-09-03T11:00:00.000Z",
      updatedAt: "2026-09-03T11:00:00.000Z",
    },
  ],
  [
    "property:prop_verified_01",
    {
      id: "ver_property_verified_01",
      subjectType: "property",
      subjectId: "prop_verified_01",
      status: "verified",
      submittedAt: "2026-09-06T12:00:00.000Z",
      reviewedAt: "2026-09-07T10:00:00.000Z",
      updatedAt: "2026-09-07T10:00:00.000Z",
    },
  ],
  [
    "property:prop_pending_01",
    {
      id: "ver_property_pending_01",
      subjectType: "property",
      subjectId: "prop_pending_01",
      status: "pending",
      submittedAt: "2026-09-12T09:00:00.000Z",
      updatedAt: "2026-09-12T09:00:00.000Z",
    },
  ],
]);

function requireActor(actor: AuthorizationActor): string {
  if (!actor.id || !actor.role) throw createAppError("AUTHENTICATION_ERROR");
  return actor.id;
}

function validate(input: VerificationEvidenceInput) {
  if (!input.file || input.file.size <= 0) return "Choose a non-empty verification file.";
  if (!allowedTypes.has(input.file.type)) return "Use a PDF, JPG, or PNG verification file.";
  if (input.file.size > MAX_EVIDENCE_BYTES) return "Verification files must be 15 MB or smaller.";
  return null;
}

export const mockVerificationProvider: VerificationProvider = {
  async uploadEvidence(actor, input) {
    const actorId = requireActor(actor);
    const error = validate(input);
    if (error)
      throw createAppError("VALIDATION_ERROR", {
        title: "Evidence file needs attention",
        message: error,
      });

    const item: VerificationEvidence = {
      id: `evidence_${Math.random().toString(36).slice(2, 10)}`,
      kind: input.kind,
      documentType: input.documentType,
      mediaReference: `private://verification/${actorId}/${Date.now()}`,
      fileName: input.file.name,
      mimeType: input.file.type,
      sizeBytes: input.file.size,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    const existing = evidence.get(actorId) ?? [];
    evidence.set(actorId, [...existing, item]);
    return item;
  },

  async getEvidence(actor) {
    return [...(evidence.get(requireActor(actor)) ?? [])];
  },

  async removeEvidence(actor, evidenceId) {
    const actorId = requireActor(actor);
    evidence.set(
      actorId,
      (evidence.get(actorId) ?? []).filter((item) => item.id !== evidenceId),
    );
  },

  async getVerificationStatus(actor, subjectType: VerificationSubjectType, subjectId: string) {
    if (!canAccessPrivateVerification(actor, subjectType, subjectId)) {
      throw createAppError("FORBIDDEN");
    }
    return verificationRecords.get(`${subjectType}:${subjectId}`) ?? null;
  },

  async submitVerification(actor, input: VerificationSubmissionInput) {
    if (input.subjectType === "property") {
      if (actor.role !== "owner") throw createAppError("FORBIDDEN");
    } else if (!canAccessPrivateVerification(actor, input.subjectType, input.subjectId)) {
      throw createAppError("FORBIDDEN");
    }
    const now = new Date().toISOString();
    const record: VerificationRecord = {
      id: `ver_${Math.random().toString(36).slice(2, 10)}`,
      subjectType: input.subjectType,
      subjectId: input.subjectId,
      status: "pending",
      submittedAt: now,
      updatedAt: now,
    };
    verificationRecords.set(`${input.subjectType}:${input.subjectId}`, record);
    return record;
  },
};
