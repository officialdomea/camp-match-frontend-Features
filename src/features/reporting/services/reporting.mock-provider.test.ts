import { describe, expect, it } from "vitest";
import type { Report, ReportReason } from "@/types/reporting";
import { createMockReportingProvider, mockReportingProvider } from "./reporting.mock-provider";
import { createReportingService } from "./reporting.service";

function report(overrides: Partial<Report> = {}): Report {
  return {
    id: "rpt_fixture_01",
    reporterId: "usr_reporter_01",
    targetType: "property",
    targetId: "prop_01",
    reason: "fraud",
    status: "submitted",
    createdAt: "2026-09-10T12:00:00.000Z",
    updatedAt: "2026-09-10T12:00:00.000Z",
    ...overrides,
  };
}

describe("reporting provider and service", () => {
  it("accepts property, user, and conversation reports with target IDs only", async () => {
    const provider = createMockReportingProvider([]);
    const cases = [
      { targetType: "property", targetId: "prop_target_01", reason: "unsafe_listing" },
      { targetType: "user", targetId: "usr_target_01", reason: "harassment" },
      { targetType: "conversation", targetId: "conv_target_01", reason: "spam" },
    ] as const;

    for (const input of cases) {
      const created = await provider.submitReport("usr_reporter_01", input);
      expect(created.status).toBe("submitted");
      expect(created.targetType).toBe(input.targetType);
      expect(created.targetId).toBe(input.targetId);
      expect(Object.keys(created)).not.toContain("target");
    }
  });

  it("accepts an optional description and rejects a missing controlled reason", async () => {
    const provider = createMockReportingProvider([]);
    const created = await provider.submitReport("usr_reporter_01", {
      targetType: "property",
      targetId: "prop_description_01",
      reason: "other",
      description: "  Details for the review team.  ",
    });

    expect(created.description).toBe("Details for the review team.");
    const withoutDescription = await provider.submitReport("usr_reporter_01", {
      targetType: "property",
      targetId: "prop_no_description_01",
      reason: "other",
    });
    expect(withoutDescription.description).toBeUndefined();
    await expect(
      provider.submitReport("usr_reporter_01", {
        targetType: "property",
        targetId: "prop_missing_reason",
        reason: "" as ReportReason,
      }),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  });

  it("returns a clear conflict for an accidental duplicate open report", async () => {
    const provider = createMockReportingProvider([]);
    const input = {
      targetType: "conversation" as const,
      targetId: "conv_duplicate_01",
      reason: "harassment" as const,
    };
    await provider.submitReport("usr_reporter_01", input);

    await expect(provider.submitReport("usr_reporter_01", input)).rejects.toMatchObject({
      code: "CONFLICT",
      message: "You already have an open report for this item.",
    });
  });

  it("uses authenticated identity and limits report history to that reporter", async () => {
    const provider = createMockReportingProvider([
      report({ id: "rpt_own_01", targetId: "prop_own_01" }),
      report({ id: "rpt_other_01", reporterId: "usr_other_01", targetId: "prop_other_01" }),
    ]);
    const service = createReportingService(provider, async () => ({
      id: "usr_reporter_01",
      role: "student",
    }));
    const untrustedInput = {
      reporterId: "usr_other_01",
      targetType: "user" as const,
      targetId: "usr_target_01",
      reason: "fraud" as const,
    };

    const created = await service.submitReport(untrustedInput);
    const visibleReports = await service.getMyReports();

    expect(created.reporterId).toBe("usr_reporter_01");
    expect(visibleReports.every((item) => item.reporterId === "usr_reporter_01")).toBe(true);
    expect(visibleReports.some((item) => item.id === "rpt_other_01")).toBe(false);
  });

  it("represents submitted, under-review, resolved, and dismissed without client transitions", async () => {
    const provider = createMockReportingProvider([
      report({ id: "rpt_submitted", status: "submitted" }),
      report({ id: "rpt_under_review", status: "under_review" }),
      report({ id: "rpt_resolved", status: "resolved" }),
      report({ id: "rpt_dismissed", status: "dismissed" }),
    ]);
    const statuses = (await provider.getReportsForReporter("usr_reporter_01")).map(
      (item) => item.status,
    );

    expect(statuses).toEqual(["submitted", "under_review", "resolved", "dismissed"]);
    expect(provider).not.toHaveProperty("resolveReport");
    expect(provider).not.toHaveProperty("dismissReport");
  });

  it("ships only a small deterministic set of existing status examples", async () => {
    const reporterReports = await mockReportingProvider.getReportsForReporter("usr_student_01");
    const statuses = reporterReports.map((item) => item.status);

    expect(statuses).toContain("under_review");
    expect(statuses).toContain("resolved");
    expect(reporterReports).toHaveLength(2);
  });

  it("requires authenticated identity for creation and private history", async () => {
    const service = createReportingService(createMockReportingProvider([]), async () => null);

    await expect(
      service.submitReport({ targetType: "property", targetId: "prop_01", reason: "fraud" }),
    ).rejects.toMatchObject({ code: "AUTHENTICATION_ERROR" });
    await expect(service.getMyReports()).rejects.toMatchObject({ code: "AUTHENTICATION_ERROR" });
  });
});
