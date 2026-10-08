import { describe, expect, it } from "vitest";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { VerificationRecord } from "@/types/auth";
import type { PropertyVerification } from "@/types/property";
import { TrustIndicator } from "@/features/verification/components/trust-indicator";
import {
  getFriendlyPropertyVerificationMessage,
  isIdentityVerified,
  isPropertyVerificationPending,
  isPropertyVerified,
  isVerificationPending,
  normalizeVerificationStatus,
  shouldAllowPropertyVerificationSubmission,
  subjectLabel,
  wasVerificationRejected,
} from "./verification-trust";

describe("verification trust foundation", () => {
  it("supports the core verification states and subject types", () => {
    const studentRecord: VerificationRecord = {
      id: "ver_student_001",
      subjectType: "student_identity",
      subjectId: "student-001",
      status: "pending",
      submittedAt: "2026-09-10T10:00:00.000Z",
      updatedAt: "2026-09-10T10:00:00.000Z",
    };

    expect(studentRecord.status).toBe("pending");
    expect(normalizeVerificationStatus("pending")).toBe("pending");
    expect(subjectLabel("owner_identity")).toBe("Owner identity");
  });

  it("keeps identity verification independent from property verification", () => {
    const ownerVerified = isIdentityVerified("verified");
    const propertyPending: PropertyVerification = {
      overall: "pending",
      steps: [
        { id: "identity", label: "Owner identity", status: "verified" },
        { id: "property_review", label: "Property review", status: "pending" },
      ],
    };

    expect(ownerVerified).toBe(true);
    expect(isPropertyVerified(propertyPending)).toBe(false);
    expect(isPropertyVerificationPending(propertyPending)).toBe(true);
  });

  it("keeps a verified scout separate from property ownership status", () => {
    const scoutVerified = isIdentityVerified("verified");
    const propertyVerified: PropertyVerification = {
      overall: "verified",
      steps: [{ id: "identity", label: "Identity", status: "verified" }],
    };

    expect(scoutVerified).toBe(true);
    expect(isPropertyVerified(propertyVerified)).toBe(true);
    expect(isVerificationPending("not_started")).toBe(false);
  });

  it("preserves safe rejection reasons without exposing sensitive evidence", () => {
    const rejectedRecord: VerificationRecord = {
      id: "ver_owner_001",
      subjectType: "owner_identity",
      subjectId: "owner-001",
      status: "rejected",
      submittedAt: "2026-09-08T09:00:00.000Z",
      reviewedAt: "2026-09-09T14:30:00.000Z",
      rejectionReason: "Please upload a clearer government-issued ID photo.",
      updatedAt: "2026-09-09T14:30:00.000Z",
    };

    expect(wasVerificationRejected(rejectedRecord.status)).toBe(true);
    expect(rejectedRecord.rejectionReason).toContain("clearer");
    expect(rejectedRecord).not.toHaveProperty("documentValue");
  });

  it("supports property verification workflow states without conflating them with identity checks", () => {
    const propertyStatus = "pending" as const;

    expect(shouldAllowPropertyVerificationSubmission("not_started")).toBe(true);
    expect(shouldAllowPropertyVerificationSubmission("rejected")).toBe(true);
    expect(shouldAllowPropertyVerificationSubmission(propertyStatus)).toBe(false);
    expect(getFriendlyPropertyVerificationMessage("pending")).toContain("under review");
    expect(getFriendlyPropertyVerificationMessage("changes_requested")).toContain("review");
  });

  it("renders trusted status badges only for meaningful public states", () => {
    expect(
      renderToStaticMarkup(
        React.createElement(TrustIndicator, { status: "verified", subject: "property" }),
      ),
    ).toContain("Verified property");
    expect(
      renderToStaticMarkup(
        React.createElement(TrustIndicator, { status: "pending", subject: "identity" }),
      ),
    ).toContain("Verification pending");
    expect(
      renderToStaticMarkup(
        React.createElement(TrustIndicator, { status: "not_started", subject: "property" }),
      ),
    ).toBe("");
  });
});
