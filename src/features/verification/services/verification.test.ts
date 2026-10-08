import { describe, expect, it } from "vitest";
import { createVerificationService } from "./verification.service";
import { mockVerificationProvider } from "./verification.mock-provider";

describe("verification service authorization", () => {
  it("keeps private evidence scoped to the authenticated user", async () => {
    const owner = createVerificationService(
      mockVerificationProvider,
      async () => ({ id: "verification_owner_01", role: "owner" }),
      async () => true,
    );
    const otherOwner = createVerificationService(
      mockVerificationProvider,
      async () => ({ id: "verification_owner_02", role: "owner" }),
      async () => true,
    );

    const uploaded = await owner.uploadEvidence({
      kind: "identity",
      documentType: "nin",
      file: new File(["document"], "identity.png", { type: "image/png" }),
    });

    expect(uploaded.status).toBe("pending");
    expect(uploaded.mediaReference.startsWith("private://")).toBe(true);
    expect(uploaded).not.toHaveProperty("url");
    await expect(owner.getEvidence()).resolves.toHaveLength(1);
    await expect(otherOwner.getEvidence()).resolves.toHaveLength(0);

    await owner.removeEvidence(uploaded.id);
    await expect(owner.getEvidence()).resolves.toHaveLength(0);
  });

  it("denies access to another user's private verification status", async () => {
    const owner = createVerificationService(
      mockVerificationProvider,
      async () => ({ id: "viewer_owner", role: "owner" }),
      async () => true,
    );

    await expect(owner.getVerificationStatus("owner_identity", "owner-001")).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("binds identity submissions to the current actor and omits reviewer-only data", async () => {
    const student = createVerificationService(
      mockVerificationProvider,
      async () => ({ id: "verification_student_01", role: "student" }),
      async () => true,
    );

    const submitted = await student.submitVerification({ note: "submitted:student-id" });

    expect(submitted.subjectType).toBe("student_identity");
    expect(submitted.subjectId).toBe("verification_student_01");
    expect(submitted.status).toBe("pending");
    expect(submitted).not.toHaveProperty("rejectionReason");
    expect(submitted).not.toHaveProperty("documentValue");
  });

  it("requires property ownership before submitting property verification", async () => {
    const unauthorizedOwner = createVerificationService(
      mockVerificationProvider,
      async () => ({ id: "owner_01", role: "owner" }),
      async () => false,
    );
    await expect(
      unauthorizedOwner.submitPropertyVerification("property_of_someone_else"),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });

    const owner = createVerificationService(
      mockVerificationProvider,
      async () => ({ id: "owner_01", role: "owner" }),
      async (_actor, propertyId) => propertyId === "owner_01_property",
    );
    const submitted = await owner.submitPropertyVerification("owner_01_property");
    expect(submitted.subjectType).toBe("property");
    expect(submitted.subjectId).toBe("owner_01_property");
  });
});
