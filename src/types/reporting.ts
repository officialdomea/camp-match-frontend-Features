export type ReportTargetType = "user" | "property" | "conversation";
export type ReportStatus = "submitted" | "under_review" | "resolved" | "dismissed";
export type ReportReason =
  "spam" | "fraud" | "harassment" | "misrepresentation" | "unsafe_listing" | "other";

export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: "spam", label: "Spam or unwanted contact" },
  { value: "fraud", label: "Fraud or scam" },
  { value: "harassment", label: "Harassment" },
  { value: "misrepresentation", label: "False information" },
  { value: "unsafe_listing", label: "Suspicious or unsafe property" },
  { value: "other", label: "Other" },
];

export type Report = {
  id: string;
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  description?: string | undefined;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
};

export type ReportSubmissionInput = {
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  description?: string | undefined;
};
