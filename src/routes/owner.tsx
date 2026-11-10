import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import {
  ArrowRight,
  BellRing,
  Building2,
  CalendarCheck,
  ClipboardList,
  MessageSquareText,
  Plus,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useMemo, type ReactNode } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useOwnerBookingRequests } from "@/features/bookings/hooks/use-bookings";
import { summarizeOwnerDashboard } from "@/features/owner/dashboard";
import { messagingService } from "@/features/messages/services/messaging.service";
import { notificationService } from "@/features/notifications/services/notification.service";
import { PropertyManagementCard } from "@/features/properties/components/property-management-card";
import { useOwnerProperties } from "@/features/properties/hooks/use-properties";
import { VerificationStatus } from "@/features/onboarding/components/verification-status";
import { formatNaira } from "@/lib/format";

export const Route = createFileRoute("/owner")({
  head: () => ({
    meta: [
      { title: "Owner dashboard — Camp Match" },
      {
        name: "description",
        content:
          "Track your Camp Match property listings, verification status and student enquiries.",
      },
      { property: "og:title", content: "Owner dashboard — Camp Match" },
      {
        property: "og:description",
        content: "Manage your student housing listings on Camp Match.",
      },
    ],
  }),
  component: OwnerHomePage,
});

function SummaryCard({
  icon,
  label,
  value,
  helper,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  helper: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
      <div className="mt-4 text-2xl font-bold tracking-tight text-foreground">{value}</div>
      <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
    </Card>
  );
}

function DashboardSection({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {action ? <div className="text-sm text-primary">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

function OwnerHomePage() {
  const { user, setUser } = useAuth();
  const pathname = useLocation({ select: (location) => location.pathname });

  const properties = useOwnerProperties({ sort: "newest" });
  const bookings = useOwnerBookingRequests(user?.id);

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

  const unreadMessages = conversations.data?.reduce(
    (total, conversation) => total + conversation.unreadCount,
    0,
  );

  const summary = useMemo(
    () =>
      summarizeOwnerDashboard({
        properties: properties.data ?? [],
        currentUserId: user?.id ?? "",
        bookings: bookings.data ?? [],
        unreadMessages: unreadMessages ?? 0,
        unreadNotifications: unreadNotifications.data ?? 0,
      }),
    [bookings.data, properties.data, unreadMessages, unreadNotifications.data, user?.id],
  );

  const recentConversations = conversations.data?.slice(0, 2) ?? [];
  const recentNotifications = notifications.data?.slice(0, 2) ?? [];
  const activityItems = recentDashboardActivity([
    propertyActivityItems(properties.data ?? [], "owner"),
    bookingActivityItems(bookings.data ?? [], "owner"),
    notificationActivityItems(notifications.data ?? [], "owner"),
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

  if (pathname !== "/owner") return <Outlet />;

  if (!user) {
    return (
      <AppShell>
        <LoadingState label="Checking your account" />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6 px-4 py-6 sm:px-6">
        <header>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Property owner
          </p>
          <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {user.fullName ? `Welcome, ${user.fullName.split(" ")[0]}` : "Your properties"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Review performance, booking requests and your next actions at a glance.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link to="/owner/properties">
                  <Building2 className="mr-2 size-4" aria-hidden="true" />
                  Manage properties
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/owner/properties/new">
                  <Plus className="mr-2 size-4" aria-hidden="true" />
                  Add property
                </Link>
              </Button>
            </div>
          </div>
        </header>

        {user ? <ProfilePhoto user={user} editable onUserChange={setUser} /> : null}

        <VerificationStatus status={user.identityVerification ?? "not_started"} />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <SummaryCard
            icon={<Building2 className="size-4" aria-hidden="true" />}
            label="Properties"
            value={
              properties.isPending
                ? "—"
                : properties.isError
                  ? "Unavailable"
                  : summary.totalProperties
            }
            helper={
              properties.isError
                ? "Property data couldn't be loaded"
                : summary.totalProperties === 0
                  ? "No listings yet"
                  : "Owned by you"
            }
          />
          <SummaryCard
            icon={<ShieldCheck className="size-4" aria-hidden="true" />}
            label="Published"
            value={
              properties.isPending
                ? "—"
                : properties.isError
                  ? "Unavailable"
                  : summary.publishedProperties
            }
            helper={
              properties.isError
                ? "Property data couldn't be loaded"
                : `${summary.newEnquiries} enquiries`
            }
          />
          <SummaryCard
            icon={<ClipboardList className="size-4" aria-hidden="true" />}
            label="Awaiting review"
            value={
              properties.isPending
                ? "—"
                : properties.isError
                  ? "Unavailable"
                  : summary.pendingVerification
            }
            helper={
              properties.isError
                ? "Property data couldn't be loaded"
                : `${summary.rejectedProperties} rejected · ${summary.needsAttention} need attention`
            }
          />
          <SummaryCard
            icon={<CalendarCheck className="size-4" aria-hidden="true" />}
            label="Booking requests"
            value={
              bookings.isPending ? "—" : bookings.isError ? "Unavailable" : summary.pendingRequests
            }
            helper={
              bookings.isError
                ? "Booking data couldn't be loaded"
                : `${summary.bookingStatusCounts.approved} approved · ${summary.bookingStatusCounts.rejected} rejected`
            }
          />
          <SummaryCard
            icon={<BellRing className="size-4" aria-hidden="true" />}
            label="Unread"
            value={
              conversations.isError || unreadNotifications.isError
                ? "Unavailable"
                : (summary.unreadMessages ?? 0) + (summary.unreadNotifications ?? 0)
            }
            helper={
              conversations.isError || unreadNotifications.isError
                ? "Unread data couldn't be loaded"
                : "Messages + notifications"
            }
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
          <DashboardSection
            title="My properties"
            action={<Link to="/owner/properties">View all</Link>}
          >
            {properties.isPending ? (
              <LoadingState label="Loading your properties" className="py-8" />
            ) : properties.isError ? (
              <ErrorState
                title="We couldn't load your properties"
                onRetry={() => void properties.refetch()}
              />
            ) : !properties.data || properties.data.length === 0 ? (
              <EmptyState
                icon={<Building2 className="size-5" aria-hidden="true" />}
                title="You haven't listed any properties yet"
                description="Add your first property and start receiving enquiries and booking requests."
                action={
                  <Button asChild>
                    <Link to="/owner/properties/new">
                      <Plus className="size-4" aria-hidden="true" />
                      Add property
                    </Link>
                  </Button>
                }
              />
            ) : (
              <div className="space-y-4">
                {properties.data.slice(0, 3).map((property) => (
                  <PropertyManagementCard key={property.id} property={property} />
                ))}
                <div className="flex justify-end">
                  <Button asChild size="sm" variant="outline">
                    <Link to="/owner/properties">
                      Manage properties
                      <ArrowRight className="ml-2 size-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </DashboardSection>

          <div className="space-y-6">
            <DashboardSection
              title="Booking requests"
              action={<Link to="/owner/bookings">Review all</Link>}
            >
              {bookings.isPending ? (
                <LoadingState label="Loading booking requests" className="py-8" />
              ) : bookings.isError ? (
                <ErrorState
                  title="We couldn't load booking requests"
                  onRetry={() => void bookings.refetch()}
                />
              ) : !bookings.data || bookings.data.length === 0 ? (
                <EmptyState
                  icon={<CalendarCheck className="size-5" aria-hidden="true" />}
                  title="No booking requests yet"
                  description="Student requests for your properties will appear here once they are submitted."
                />
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Status totals: {summary.bookingStatusCounts.pending} pending ·{" "}
                    {summary.bookingStatusCounts.approved} approved ·{" "}
                    {summary.bookingStatusCounts.rejected} rejected ·{" "}
                    {summary.bookingStatusCounts.cancelled} cancelled ·{" "}
                    {summary.bookingStatusCounts.confirmed} confirmed ·{" "}
                    {summary.bookingStatusCounts.expired} expired
                  </p>
                  {bookings.data.slice(0, 3).map((booking) => (
                    <div
                      key={booking.id}
                      className="rounded-xl border border-border bg-background p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-foreground">{booking.propertyTitle}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Requested: {booking.requestedFrom}
                          </p>
                        </div>
                        <Badge
                          variant={
                            booking.status === "pending"
                              ? "secondary"
                              : booking.status === "approved"
                                ? "default"
                                : "outline"
                          }
                        >
                          {booking.status}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {formatNaira(booking.amount)} •{" "}
                        {booking.status === "pending"
                          ? "Owner review required"
                          : "Booking status updated"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </DashboardSection>

            <DashboardSection
              title="Messages & notifications"
              action={<Link to="/messages">Open inbox</Link>}
            >
              {conversations.isPending ||
              notifications.isPending ||
              unreadNotifications.isPending ? (
                <LoadingState label="Loading messages and notifications" className="py-8" />
              ) : conversations.isError || notifications.isError || unreadNotifications.isError ? (
                <ErrorState
                  title="We couldn't load your messages"
                  onRetry={() => {
                    void conversations.refetch();
                    void notifications.refetch();
                    void unreadNotifications.refetch();
                  }}
                />
              ) : recentConversations.length === 0 && recentNotifications.length === 0 ? (
                <EmptyState
                  icon={<Sparkles className="size-5" aria-hidden="true" />}
                  title="You're all caught up"
                  description="Your inbox and notifications are clear right now."
                />
              ) : (
                <div className="space-y-3">
                  {recentConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">
                          {conversation.title ?? "Conversation"}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {conversation.lastMessage ?? "No messages yet"}
                        </p>
                      </div>
                      {conversation.unreadCount > 0 ? (
                        <Badge variant="secondary">{conversation.unreadCount} unread</Badge>
                      ) : null}
                    </div>
                  ))}
                  {recentNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{notification.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{notification.body}</p>
                      </div>
                      {notification.readAt ? null : <Badge variant="outline">New</Badge>}
                    </div>
                  ))}
                </div>
              )}
            </DashboardSection>
          </div>
        </div>

        <DashboardSection title="Recent activity">
          <ActivityTimeline
            items={activityItems}
            isPending={activityIsPending}
            isError={activityHasError}
            onRetry={retryActivity}
            emptyDescription="Property updates, booking status changes, messages, and notifications will appear here when recorded."
          />
        </DashboardSection>

        <DashboardSection title="Needs attention">
          {summary.activity.length === 0 ? (
            <EmptyState
              icon={<MessageSquareText className="size-5" aria-hidden="true" />}
              title="You're all caught up"
              description="No immediate actions are waiting on your listings or bookings right now."
            />
          ) : (
            <ul className="space-y-3">
              {summary.activity.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 rounded-xl border border-border bg-background p-3 text-sm text-foreground"
                >
                  <span className="mt-0.5 size-2 rounded-full bg-primary" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </DashboardSection>
      </div>
    </AppShell>
  );
}
