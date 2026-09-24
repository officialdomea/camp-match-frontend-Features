import { createFileRoute } from "@tanstack/react-router";
import { CalendarCheck } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/use-auth";
import {
  useBookingDecision,
  useOwnerBookingRequests,
} from "@/features/bookings/hooks/use-bookings";
import { normalizeError } from "@/lib/api/errors";

export const Route = createFileRoute("/owner/bookings")({
  component: OwnerBookingsPage,
});

function OwnerBookingsPage() {
  const { user } = useAuth();
  const bookings = useOwnerBookingRequests(user?.id);
  const decisions = useBookingDecision(user?.id);
  const [error, setError] = useState<string | null>(null);

  async function decide(action: Promise<unknown>) {
    setError(null);
    try {
      await action;
    } catch (caught) {
      setError(normalizeError(caught).message);
    }
  }

  return (
    <AppShell>
      <div className="space-y-6 px-4 py-6 sm:px-6">
        <header>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Property owner
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Booking requests</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review requests for properties you own. Approval makes rent payment eligible; it does
            not confirm payment.
          </p>
        </header>

        {error ? (
          <p
            className="rounded-xl border border-destructive/25 bg-destructive/5 p-3 text-sm text-destructive"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        {bookings.isPending ? <LoadingState label="Loading booking requests" /> : null}
        {bookings.isError ? <ErrorState onRetry={() => void bookings.refetch()} /> : null}
        {!bookings.isPending && !bookings.isError && !bookings.data?.length ? (
          <EmptyState
            icon={<CalendarCheck className="size-5" aria-hidden="true" />}
            title="No booking requests"
            description="Requests for your owned properties will appear here when students submit them."
          />
        ) : null}

        {bookings.data?.length ? (
          <div className="space-y-3">
            {bookings.data.map((booking) => (
              <article key={booking.id} className="rounded-2xl border border-border bg-surface p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold">{booking.propertyTitle}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Requested move-in: {booking.requestedFrom}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Student request status: {booking.status}
                    </p>
                  </div>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium capitalize">
                    {booking.status}
                  </span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Payment eligibility is backend-controlled. No balance, settlement, or commission
                  is shown here.
                </p>
                {booking.status === "pending" ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      disabled={decisions.approve.isPending || decisions.reject.isPending}
                      onClick={() => void decide(decisions.approve.mutateAsync(booking.id))}
                    >
                      {decisions.approve.isPending ? "Approving…" : "Approve request"}
                    </Button>
                    <Button
                      variant="outline"
                      disabled={decisions.approve.isPending || decisions.reject.isPending}
                      onClick={() =>
                        void decide(decisions.reject.mutateAsync({ bookingId: booking.id }))
                      }
                    >
                      {decisions.reject.isPending ? "Rejecting…" : "Reject request"}
                    </Button>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
