import { env } from "@/lib/env";
import { createAppError } from "@/lib/api/errors";
import { authService } from "@/features/auth/services/auth.service";
import { canReportTarget, canViewReport } from "@/features/authorization/domain/policies";
import type { ReportingProvider } from "./reporting.provider";
import type { ReportingService } from "./reporting.provider";
import { apiReportingProvider } from "./reporting.api-provider";
import { mockReportingProvider } from "./reporting.mock-provider";

const provider: ReportingProvider = env.useMockData ? mockReportingProvider : apiReportingProvider;

export function createReportingService(
  reportProvider: ReportingProvider,
  getCurrentUser: () => Promise<{ id: string; role: "student" | "owner" | "scout" | null } | null>,
): ReportingService {
  const requireReporter = async () => {
    const user = await getCurrentUser();
    if (!user) throw createAppError("AUTHENTICATION_ERROR");
    return user;
  };

  return {
    submitReport: async (input) => {
      const reporter = await requireReporter();
      if (!canReportTarget(reporter, input.targetType, input.targetId)) {
        throw createAppError("FORBIDDEN");
      }
      return reportProvider.submitReport(reporter.id, input);
    },
    getMyReports: async () => {
      const reporter = await requireReporter();
      const reports = await reportProvider.getReportsForReporter(reporter.id);
      return reports.filter((report) => canViewReport(reporter, report));
    },
  };
}

export const reportingService = createReportingService(provider, () =>
  authService.getCurrentUser(),
);
