import type { IdentityVerificationStatus } from "@/types/auth";

export function canCreateProperty(status: IdentityVerificationStatus | null | undefined): boolean {
  return status === "verified";
}
