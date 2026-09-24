import { env } from "@/lib/env";
import { apiVerificationProvider } from "./verification.api-provider";
import { mockVerificationProvider } from "./verification.mock-provider";
import type { VerificationProvider } from "./verification.provider";

const provider: VerificationProvider = env.useMockData
  ? mockVerificationProvider
  : apiVerificationProvider;

export const verificationService: VerificationProvider = {
  uploadEvidence: (input) => provider.uploadEvidence(input),
  getEvidence: () => provider.getEvidence(),
  removeEvidence: (evidenceId) => provider.removeEvidence(evidenceId),
};
