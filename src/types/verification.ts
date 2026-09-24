export type VerificationEvidenceKind = "identity" | "ownership";
export type VerificationEvidenceStatus = "uploaded" | "pending" | "approved" | "rejected";

/** Private verification metadata. The media reference is never a public image URL. */
export type VerificationEvidence = {
  id: string;
  kind: VerificationEvidenceKind;
  documentType: string;
  mediaReference: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  status: VerificationEvidenceStatus;
  createdAt: string;
};

export type VerificationEvidenceInput = {
  kind: VerificationEvidenceKind;
  documentType: string;
  file: File;
};
