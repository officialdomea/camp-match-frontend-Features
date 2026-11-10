import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { Activity, ArrowRight, BarChart3, MapPinned, Users } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/states";
import { ProfilePhoto } from "@/components/common/profile-photo";
import { ActivityTimeline } from "@/features/dashboard/activity-timeline";
import {
  bookingActivityItems,
  conversationActivityItems,
  notificationActivityItems,
  propertyActivityItems,
  recentDashboardActivity,
} from "@/features/dashboard/activity";
import { countByStatus } from "@/features/dashboard/insights";
import { useScoutBookingActivity } from "@/features/bookings/hooks/use-bookings";
import { messagingService } from "@/features/messages/services/messaging.service";
import { notificationService } from "@/features/notifications/services/notification.service";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { VerificationStatus } from "@/features/onboarding/components/verification-status";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useManagedProperties } from "@/features/properties/hooks/use-properties";

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
  const { user, setUser } = useAuth();
  const properties = useManagedProperties();
  const bookings = useScoutBookingActivity(user?.id);
  const pathname = useLocation({ select: (location) => location.pathname });

  const conversations = useQuery({
    queryKey: ["messages", "conversations", user?.id],
    enabled: Boolean(user?.id),
    queryFn: () => messagingService.getConversations(),
    retry: false,
  });

  const notifications = useQuery({
    queryKey: ["notifications", user?.id],
    enabled: Boolean(user?.id),
    queryFn: () => notificationService.getNotifications(),
    retry: false,
  });

  const unreadNotifications = useQuery({
    queryKey: ["notifications", "unread", user?.id],
    enabled: Boolean(user?.id),
    queryFn: () => notificationService.getUnreadCount(),
    retry: false,
  });

  const managedProperties = properties.data ?? [];
  const bookingStatusCounts = countByStatus(
    bookings.data ?? [],
    ["pending", "approved", "rejected", "cancelled", "confirmed", "expired"] as const,
    (booking) => booking.status,
  );
  const activityItems = recentDashboardActivity([
    propertyActivityItems(managedProperties, "scout"),
    bookingActivityItems(bookings.data ?? [], "scout"),
    notificationActivityItems(notifications.data ?? [], "scout"),
    conversationActivityItems(conversations.data ?? []),
  ]);
  const activityIsPending =
    properties.isPending ||
    bookings.isPending ||
    notifications.isPending ||
    conversations.isPending;
  const activityHasError =
    properties.isError || bookings.isError || notifications.isError || conversations.isError;
  const retryActivity = () => {
    void properties.refetch();
    void bookings.refetch();
    void notifications.refetch();
    void conversations.refetch();
  };
  const pendingReview = managedProperties.filter(
    (property) =>
      property.status === "pending_review" ||
      property.verification.overall === "pending" ||
      property.verification.overall === "submitted",
  ).length;
  const newEnquiries = managedProperties.reduce(
    (total, property) => total + property.performance.enquiries,
    0,
  );
  const unreadMessages = conversations.data?.reduce(
    (total, conversation) => total + conversation.unreadCount,
    0,
  );

  if (pathname !== "/scout") return <Outlet />;

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

        {user ? <ProfilePhoto user={user} editable onUserChange={setUser} /> : null}

        <VerificationStatus status={user?.identityVerification ?? "pending"} />

        {properties.isPending ? (
          <LoadingState label="Loading scout dashboard" />
        ) : properties.isError ? (
          <ErrorState
            title="We couldn't load your dashboard"
            onRetry={() => void properties.refetch()}
          />
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              <Card className="p-4">
                <p className="text-xs text-muted-foreground">Managed properties</p>
                <p className="mt-2 text-2xl font-bold">{managedProperties.length}</p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-muted-foreground">Active listings</p>
                <p className="mt-2 text-2xl font-bold">
                  {managedProperties.filter((property) => property.status === "active").length}
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-muted-foreground">Pending review</p>
                <p className="mt-2 text-2xl font-bold">{pendingReview}</p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-muted-foreground">New enquiries</p>
                <p className="mt-2 text-2xl font-bold">{newEnquiries}</p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-muted-foreground">Unread</p>
                <p className="mt-2 text-2xl font-bold">
                  {conversations.isError || unreadNotifications.isError
                    ? "Unavailable"
                    : (unreadMessages ?? 0) + (unreadNotifications.data ?? 0)}
                </p>
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

                <div className="mt-4">
                  <p className="mb-2 text-xs text-muted-foreground">
                    Authorized bookings: {bookingStatusCounts.pending} pending ·{" "}
                    {bookingStatusCounts.approved} approved · {bookingStatusCounts.rejected}{" "}
                    rejected
                  </p>
                  <ActivityTimeline
                    items={activityItems}
                    isPending={activityIsPending}
                    isError={activityHasError}
                    onRetry={retryActivity}
                    emptyDescription="Assigned property updates and permitted booking activity will appear here when recorded."
                  />
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
