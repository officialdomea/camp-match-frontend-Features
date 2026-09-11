import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, ArrowRight, BarChart3, MapPinned, Users } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { VerificationStatus } from "@/features/onboarding/components/verification-status";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useScoutDashboard } from "@/features/properties/hooks/use-properties";

export const Route = createFileRoute("/scout")({
  head: () => ({
    meta: [
      { title: "Scout dashboard — Camp Match" },
      {
        name: "description",
        content: "Manage the properties you scout and the students you're helping on Camp Match.",
      },
      { property: "og:title", content: "Scout dashboard — Camp Match" },
      {
        property: "og:description",
        content: "Manage your scouted properties and student requests on Camp Match.",
      },
    ],
  }),
  component: ScoutHomePage,
});

function ScoutHomePage() {
  const { user } = useAuth();
  const { data, isPending, isError, refetch } = useScoutDashboard();

  return (
    <AppShell>
      <div className="space-y-6 px-4 py-6 sm:px-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            House scout
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            {user?.fullName ? `Welcome, ${user.fullName.split(" ")[0]}` : "Your scouting"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review your managed properties, recent enquiries and property updates.
          </p>
        </div>

        <VerificationStatus status={user?.identityVerification ?? "pending"} />

        {isPending ? (
          <LoadingState label="Loading scout dashboard" />
        ) : isError ? (
          <ErrorState title="We couldn't load your dashboard" onRetry={() => void refetch()} />
        ) : !data ? (
          <EmptyState
            title="No scout data yet"
            description="Your managed properties will appear here once you’re active."
          />
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="p-4">
                <p className="text-xs text-muted-foreground">Managed properties</p>
                <p className="mt-2 text-2xl font-bold">{data.managedProperties}</p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-muted-foreground">Active listings</p>
                <p className="mt-2 text-2xl font-bold">{data.activeListings}</p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-muted-foreground">Pending review</p>
                <p className="mt-2 text-2xl font-bold">{data.pendingReview}</p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-muted-foreground">New enquiries</p>
                <p className="mt-2 text-2xl font-bold">{data.newEnquiries}</p>
              </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
              <Card className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="size-4 text-primary" aria-hidden="true" />
                    <h2 className="font-semibold">Recent activity</h2>
                  </div>
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/scout/activity">
                      View all
                      <ArrowRight className="ml-1 size-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>

                <div className="mt-4 space-y-3">
                  {data.recentActivity.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No activity yet.</p>
                  ) : (
                    data.recentActivity.slice(0, 4).map((item) => (
                      <div key={item.id} className="flex gap-3 rounded-xl border border-border p-3">
                        <div className="mt-1 flex size-8 items-center justify-center rounded-full bg-primary-soft text-primary">
                          <Activity className="size-4" aria-hidden="true" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">{item.title}</p>
                          {item.description ? (
                            <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                          ) : null}
                          <p className="mt-1 text-xs text-muted-foreground">
                            {new Date(item.occurredAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>

              <Card className="p-5">
                <div className="flex items-center gap-2">
                  <Users className="size-4 text-primary" aria-hidden="true" />
                  <h2 className="font-semibold">Scout tools</h2>
                </div>
                <div className="mt-4 space-y-3">
                  <Button asChild className="w-full justify-between">
                    <Link to="/scout/properties">
                      Managed properties
                      <ArrowRight className="ml-2 size-4" aria-hidden="true" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-between">
                    <Link to="/scout/activity">
                      Recent activity
                      <ArrowRight className="ml-2 size-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
              </Card>
            </div>
          </>
        )}

        <div className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-5">
          <MapPinned className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold">Coverage areas</p>
            <p className="mt-1 text-sm text-muted-foreground">
              We route students to the scout closest to the property they're viewing, so keep your
              areas accurate.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
