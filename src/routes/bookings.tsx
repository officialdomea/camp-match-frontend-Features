import { createFileRoute } from "@tanstack/react-router";
import { CalendarCheck } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/common/states";

export const Route = createFileRoute("/bookings")({
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
  return (
    <AppShell>
      <div className="space-y-5 px-4 py-6 sm:px-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Bookings</h1>
        <EmptyState
          icon={<CalendarCheck className="size-5" aria-hidden="true" />}
          title="No bookings yet"
          description="Booking requests and payments arrive in a later build phase."
        />
      </div>
    </AppShell>
  );
}
