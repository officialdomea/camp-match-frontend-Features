import { createFileRoute } from "@tanstack/react-router";
import { Activity, ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useScoutDashboard } from "@/features/properties/hooks/use-properties";

export const Route = createFileRoute("/scout/activity")({
  component: ScoutActivityPage,
});

function ScoutActivityPage() {
  const { data, isPending, isError, refetch } = useScoutDashboard();

  return (
    <AppShell>
      <div className="space-y-6 px-4 py-6 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              House Scout
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Recent activity</h1>
          </div>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 size-4" aria-hidden="true" />
            Back
          </Button>
        </div>

        {isPending ? (
          <LoadingState label="Loading activity" />
        ) : isError ? (
          <ErrorState title="We couldn't load your activity" onRetry={() => void refetch()} />
        ) : !data || data.recentActivity.length === 0 ? (
          <EmptyState
            title="No recent activity"
            description="Your managed properties and enquiry updates will appear here."
            icon={<Activity className="size-5" aria-hidden="true" />}
          />
        ) : (
          <div className="space-y-3">
            {data.recentActivity.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex gap-3">
                  <div className="mt-1 flex size-8 items-center justify-center rounded-full bg-primary-soft text-primary">
                    <Activity className="size-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{item.title}</p>
                    {item.description ? (
                      <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                    ) : null}
                    <p className="mt-2 text-xs text-muted-foreground">
                      {new Date(item.occurredAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
