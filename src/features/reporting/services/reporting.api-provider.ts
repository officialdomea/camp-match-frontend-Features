import { createAppError } from "@/lib/api/errors";
import type { Report, ReportSubmissionInput } from "@/types/reporting";
import type { ReportingProvider } from "./reporting.provider";

export const apiReportingProvider: ReportingProvider = {
  async submitReport(_reporterId: string, _input: ReportSubmissionInput): Promise<Report> {
    throw createAppError("SERVER_ERROR", {
      title: "Reporting is not connected",
      message: "The moderation backend is not available yet. This is a frontend-only foundation.",
    });
  },

  async getReportsForReporter(_reporterId: string): Promise<Report[]> {
    throw createAppError("SERVER_ERROR", {
      title: "Reporting is not connected",
      message: "The moderation backend is not available yet. This is a frontend-only foundation.",
    });
  },
};
