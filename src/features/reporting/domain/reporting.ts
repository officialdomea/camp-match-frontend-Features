import type { ReportReason } from "@/types/reporting";

export const REPORT_SUBMITTED_CONFIRMATION = "Report submitted. Our team will review it.";

export function canContinueReport(reason: ReportReason | "", isSubmitting: boolean): boolean {
  return Boolean(reason) && !isSubmitting;
}
