import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { CalendarCheck } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useListing } from "@/features/listings/hooks/use-listings";
import {
  useCancelBooking,
  useCreateBookingRequest,
  useStudentBookings,
} from "@/features/bookings/hooks/use-bookings";
import { normalizeError } from "@/lib/api/errors";
import { formatNaira, formatPricePeriod } from "@/lib/format";

export const Route = createFileRoute("/bookings")({
  validateSearch: z.object({ propertyId: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Bookings — Camp Match" },
      {
        name: "description",
        content:
          "Track your Camp Match booking requests, inspection dates and confirmations in one place.",
      },
      { property: "og:title", content: "Bookings — Camp Match" },
      {
        property: "og:description",
        content: "Track your Camp Match booking requests and confirmations.",
      },
    ],
  }),
  component: BookingsPage,
});

function BookingsPage() {
  const { user } = useAuth();
  const search = Route.useSearch();
  const listing = useListing(search.propertyId ?? "");
  const bookings = useStudentBookings(user?.id);
  const createBooking = useCreateBookingRequest(user?.id);
  const cancelBooking = useCancelBooking(user?.id);
  const [requestedFrom, setRequestedFrom] = useState("");
  const [error, setError] = useState<string | null>(null);

  const selectedListing = search.propertyId ? listing.data : undefined;

  async function submitRequest() {
    if (!selectedListing) return;
    setError(null);
    try {
      await createBooking.mutateAsync({
        propertyId: selectedListing.id,
        propertyTitle: selectedListing.title,
        requestedFrom,
        amount: selectedListing.price,
        currency: "NGN",
        pricePeriod: selectedListing.pricePeriod,
        availableUnits: selectedListing.availability.unitsAvailable,
        availabilityStatus: selectedListing.availability.status,
      });
    } catch (caught) {
      setError(normalizeError(caught).message);
    }
  }

  async function withdraw(id: string) {
    setError(null);
    try {
      await cancelBooking.mutateAsync(id);
    } catch (caught) {
      setError(normalizeError(caught).message);
    }
  }

  return (
    <AppShell>
      <div className="space-y-6 px-4 py-6 sm:px-6">
        <header>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Bookings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track requests and backend-confirmed booking states.
          </p>
        </header>

        {selectedListing ? (
          <section
            className="rounded-2xl border border-border bg-surface p-5"
            aria-labelledby="request-heading"
          >
            <h2 id="request-heading" className="font-semibold">
              Request this property
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{selectedListing.title}</p>
            <p className="mt-2 text-sm font-medium">
              {formatNaira(selectedListing.price)} /{" "}
              {formatPricePeriod(selectedListing.pricePeriod)}
            </p>
            <label className="mt-4 block text-sm font-medium" htmlFor="requested-from">
              Preferred move-in date
            </label>
            <input
              id="requested-from"
              type="date"
              value={requestedFrom}
              onChange={(event) => setRequestedFrom(event.target.value)}
              className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary sm:max-w-xs"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              This creates a request only. Payment, escrow, and confirmation require backend
              approval.
            </p>
            {error ? (
              <p className="mt-3 text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            <Button
              className="mt-4"
              onClick={() => void submitRequest()}
              disabled={!requestedFrom || createBooking.isPending}
            >
              {createBooking.isPending ? "Sending request…" : "Send booking request"}
            </Button>
          </section>
        ) : null}

        {bookings.isPending ? <LoadingState label="Loading your bookings" /> : null}
        {bookings.isError ? <ErrorState onRetry={() => void bookings.refetch()} /> : null}
        {!bookings.isPending && !bookings.isError && !bookings.data?.length ? (
          <EmptyState
            icon={<CalendarCheck className="size-5" aria-hidden="true" />}
            title="No booking requests yet"
            description="Open a property and send a request when you are ready to discuss move-in details."
            action={
              <Button asChild variant="outline">
                <Link to="/discover">Discover properties</Link>
              </Button>
            }
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
                      Move-in requested: {booking.requestedFrom}
                    </p>
                  </div>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium capitalize">
                    {booking.status}
                  </span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {formatNaira(booking.amount)} / {formatPricePeriod(booking.pricePeriod)} ·
                  Payment: {booking.paymentStatus.replaceAll("_", " ")}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Escrow: {booking.escrowStatus.replaceAll("_", " ")} · Confirmation is
                  backend-controlled.
                </p>
                {booking.status === "approved" ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Owner approval makes this request eligible for rent payment, but payment
                    initialization is not available in this development environment.
                  </p>
                ) : null}
                {booking.status === "pending" ? (
                  <Button
                    className="mt-4"
                    variant="outline"
                    size="sm"
                    disabled={cancelBooking.isPending}
                    onClick={() => void withdraw(booking.id)}
                  >
                    {cancelBooking.isPending ? "Withdrawing…" : "Withdraw request"}
                  </Button>
                ) : null}
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
