import { describe, expect, it } from "vitest";
import {
  canAccessRoleVerification,
  getFriendlyVerificationMessage,
  getRoleVerificationRequirements,
  maskSensitiveValue,
  shouldAllowVerificationSubmission,
} from "./identity-verification";

describe("identity verification workflow helpers", () => {
  it("allows only the matching role to access that verification workflow", () => {
    expect(canAccessRoleVerification("student", "student")).toBe(true);
    expect(canAccessRoleVerification("owner", "owner")).toBe(true);
    expect(canAccessRoleVerification("student", "owner")).toBe(false);
    expect(canAccessRoleVerification("owner", "scout")).toBe(false);
  });

  it("enforces the validation state transitions for submissions", () => {
    expect(shouldAllowVerificationSubmission("not_started")).toBe(true);
    expect(shouldAllowVerificationSubmission("rejected")).toBe(true);
    expect(shouldAllowVerificationSubmission("pending")).toBe(false);
    expect(shouldAllowVerificationSubmission("verified")).toBe(false);
  });

  it("provides role-aware verification messaging", () => {
    expect(getRoleVerificationRequirements("student")).toMatchObject({
      role: "student",
      title: expect.stringMatching(/student/i),
    });
    expect(getFriendlyVerificationMessage("not_started")).toContain("Verification required");
    expect(getFriendlyVerificationMessage("pending")).toContain("under review");
    expect(getFriendlyVerificationMessage("verified")).toContain("Identity verified");
    expect(getFriendlyVerificationMessage("rejected")).toContain("Verification needs attention");
  });

  it("masks sensitive values without exposing full numbers", () => {
    expect(maskSensitiveValue("1234567890")).toBe("********7890");
    expect(maskSensitiveValue("NIN-1234")).toBe("********1234");
  });
});
