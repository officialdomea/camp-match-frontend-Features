import { createFileRoute } from "@tanstack/react-router";
import { CalendarCheck } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/states";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useScoutBookingActivity } from "@/features/bookings/hooks/use-bookings";

export const Route = createFileRoute("/scout/bookings")({
  component: ScoutBookingsPage,
});

function ScoutBookingsPage() {
  const { user } = useAuth();
  const activity = useScoutBookingActivity(user?.id);

  return (
    <AppShell>
      <div className="space-y-6 px-4 py-6 sm:px-6">
        <header>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            House Scout
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Booking activity</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Read-only activity for properties assigned to you with booking-view permission.
          </p>
        </header>

        {activity.isPending ? <LoadingState label="Loading booking activity" /> : null}
        {activity.isError ? (
          <ErrorState
            title="Booking activity is restricted or unavailable"
            description="Only authorized Scouts can view requests for assigned properties."
            onRetry={() => void activity.refetch()}
          />
        ) : null}
        {!activity.isPending && !activity.isError && !activity.data?.length ? (
          <EmptyState
            icon={<CalendarCheck className="size-5" aria-hidden="true" />}
            title="No booking activity"
            description="Authorized activity for your assigned properties will appear here. Owner approval remains final."
          />
        ) : null}
        {activity.data?.length ? (
          <div className="space-y-3">
            {activity.data.map((booking) => (
              <article key={booking.id} className="rounded-2xl border border-border bg-surface p-4">
                <h2 className="font-semibold">{booking.propertyTitle}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Requested move-in: {booking.requestedFrom}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Booking status: {booking.status}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Read-only. No Scout approval, commission, balance, or settlement data is
                  available.
                </p>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
