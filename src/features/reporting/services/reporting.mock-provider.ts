import { createAppError } from "@/lib/api/errors";
import {
  REPORT_REASONS,
  type Report,
  type ReportSubmissionInput,
  type ReportTargetType,
} from "@/types/reporting";
import type { ReportingProvider } from "./reporting.provider";

const reportFixtures: Report[] = [
  {
    id: "rpt_property_01",
    reporterId: "usr_student_01",
    targetType: "property",
    targetId: "prop_verified_01",
    reason: "misrepresentation",
    description: "Listing does not match the advertised property details.",
    status: "under_review",
    createdAt: "2026-09-10T12:00:00.000Z",
    updatedAt: "2026-09-10T12:00:00.000Z",
  },
  {
    id: "rpt_user_01",
    reporterId: "usr_student_02",
    targetType: "user",
    targetId: "usr_owner_02",
    reason: "harassment",
    description: "Unprofessional contact in messages.",
    status: "submitted",
    createdAt: "2026-09-11T08:30:00.000Z",
    updatedAt: "2026-09-11T08:30:00.000Z",
  },
  {
    id: "rpt_conversation_01",
    reporterId: "usr_student_01",
    targetType: "conversation",
    targetId: "conv_property_unical",
    reason: "harassment",
    status: "resolved",
    createdAt: "2026-09-12T09:00:00.000Z",
    updatedAt: "2026-09-14T11:30:00.000Z",
  },
  {
    id: "rpt_user_02",
    reporterId: "usr_student_02",
    targetType: "user",
    targetId: "usr_scout_01",
    reason: "spam",
    status: "dismissed",
    createdAt: "2026-09-13T09:00:00.000Z",
    updatedAt: "2026-09-14T11:30:00.000Z",
  },
];

const targetTypes: ReportTargetType[] = ["user", "property", "conversation"];

export function createMockReportingProvider(initialReports: Report[] = reportFixtures) {
  const reports = new Map(initialReports.map((report) => [report.id, { ...report }]));
  let nextId = reports.size + 1;

  const provider: ReportingProvider = {
    async submitReport(reporterId: string, input: ReportSubmissionInput) {
      if (!reporterId.trim()) {
        throw createAppError("AUTHENTICATION_ERROR");
      }
      if (!targetTypes.includes(input.targetType) || !input.targetId.trim()) {
        throw createAppError("VALIDATION_ERROR");
      }
      if (!REPORT_REASONS.some((reason) => reason.value === input.reason)) {
        throw createAppError("VALIDATION_ERROR");
      }
      if (input.targetType === "user" && input.targetId === reporterId) {
        throw createAppError("VALIDATION_ERROR", {
          message: "You can't report your own account.",
        });
      }

      const alreadyOpen = [...reports.values()].some(
        (report) =>
          report.reporterId === reporterId &&
          report.targetType === input.targetType &&
          report.targetId === input.targetId &&
          (report.status === "submitted" || report.status === "under_review"),
      );
      if (alreadyOpen) {
        throw createAppError("CONFLICT", {
          title: "Report already submitted",
          message: "You already have an open report for this item.",
          retryable: false,
        });
      }

      const now = new Date().toISOString();
      const id = `rpt_mock_${String(nextId++).padStart(3, "0")}`;
      const report: Report = {
        id,
        reporterId,
        targetType: input.targetType,
        targetId: input.targetId,
        reason: input.reason,
        description: input.description?.trim() || undefined,
        status: "submitted",
        createdAt: now,
        updatedAt: now,
      };
      reports.set(report.id, report);
      return { ...report };
    },

    async getReportsForReporter(reporterId) {
      return [...reports.values()]
        .filter((report) => report.reporterId === reporterId)
        .map((report) => ({ ...report }));
    },
  };

  return provider;
}

export const mockReportingProvider = createMockReportingProvider();

export async function assertReportsAreDeterministic() {
  const report = await mockReportingProvider.submitReport("usr_student_01", {
    targetType: "property",
    targetId: "prop_pending_01",
    reason: "unsafe_listing",
    description: "This listing appears to be inactive but still live.",
  });

  if (report.status !== "submitted") {
    throw createAppError("VALIDATION_ERROR", {
      title: "Mock report state invalid",
      message: "Report status should be submitted for the mock provider fixture.",
    });
  }

  return report;
}
