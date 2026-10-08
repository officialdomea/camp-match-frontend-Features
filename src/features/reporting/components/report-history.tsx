import { useQuery } from "@tanstack/react-query";
import { ErrorState, LoadingState } from "@/components/common/states";
import { ProfileSection } from "@/features/profile/components/profile-section";
import { reportingService } from "@/features/reporting/services/reporting.service";
import type { ReportStatus } from "@/types/reporting";

const statusLabels: Record<ReportStatus, string> = {
  submitted: "Submitted",
  under_review: "Under review",
  resolved: "Resolved",
  dismissed: "Dismissed",
};

const targetLabels = {
  user: "User",
  property: "Property",
  conversation: "Conversation",
} as const;

export function ReportHistory({ userId }: { userId: string }) {
  const reports = useQuery({
    queryKey: ["reports", "mine", userId],
    queryFn: () => reportingService.getMyReports(),
    enabled: Boolean(userId),
    retry: false,
  });

  return (
    <ProfileSection title="Reports you submitted">
      {reports.isPending ? (
        <LoadingState label="Loading your reports" />
      ) : reports.isError ? (
        <ErrorState title="We couldn't load your reports" onRetry={() => void reports.refetch()} />
      ) : reports.data?.length ? (
        <ul className="space-y-3">
          {reports.data.map((report) => (
            <li
              key={report.id}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
            >
              <div>
                <p className="text-sm font-medium">
                  {targetLabels[report.targetType]} · {report.reason.replace(/_/g, " ")}
                </p>
                <p className="text-xs text-muted-foreground">
                  Submitted {new Date(report.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {statusLabels[report.status]}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">Reports you submit will appear here.</p>
      )}
    </ProfileSection>
  );
}
