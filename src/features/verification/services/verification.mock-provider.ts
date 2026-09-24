import { createAppError } from "@/lib/api/errors";
import type { VerificationEvidence, VerificationEvidenceInput } from "@/types/verification";
import type { VerificationProvider } from "./verification.provider";

const MAX_EVIDENCE_BYTES = 15 * 1024 * 1024;
const allowedTypes = new Set(["application/pdf", "image/jpeg", "image/png"]);
const evidence = new Map<string, VerificationEvidence[]>();

function currentUserId() {
  if (typeof window === "undefined") return "mock-user";
  try {
    const session = JSON.parse(window.localStorage.getItem("campmatch.session") ?? "null") as {
      user?: { id?: string };
    } | null;
    return session?.user?.id ?? "mock-user";
  } catch {
    return "mock-user";
  }
}

function validate(input: VerificationEvidenceInput) {
  if (!input.file || input.file.size <= 0) return "Choose a non-empty verification file.";
  if (!allowedTypes.has(input.file.type)) return "Use a PDF, JPG, or PNG verification file.";
  if (input.file.size > MAX_EVIDENCE_BYTES) return "Verification files must be 15 MB or smaller.";
  return null;
}

export const mockVerificationProvider: VerificationProvider = {
  async uploadEvidence(input) {
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
      mediaReference: `private://verification/${currentUserId()}/${Date.now()}`,
      fileName: input.file.name,
      mimeType: input.file.type,
      sizeBytes: input.file.size,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    const existing = evidence.get(currentUserId()) ?? [];
    evidence.set(currentUserId(), [...existing, item]);
    return item;
  },

  async getEvidence() {
    return [...(evidence.get(currentUserId()) ?? [])];
  },

  async removeEvidence(evidenceId) {
    evidence.set(
      currentUserId(),
      (evidence.get(currentUserId()) ?? []).filter((item) => item.id !== evidenceId),
    );
  },
};
