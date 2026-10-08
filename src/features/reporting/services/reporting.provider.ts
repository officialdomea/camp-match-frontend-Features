import type { Report, ReportSubmissionInput } from "@/types/reporting";

export type ReportingProvider = {
  submitReport(reporterId: string, input: ReportSubmissionInput): Promise<Report>;
  getReportsForReporter(reporterId: string): Promise<Report[]>;
};

export type ReportingService = {
  submitReport(input: ReportSubmissionInput): Promise<Report>;
  getMyReports(): Promise<Report[]>;
};
