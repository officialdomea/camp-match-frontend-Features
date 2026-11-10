import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  BellRing,
  BookOpen,
  Bookmark,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  Home,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { useMemo } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/states";
import { PropertyCard } from "@/components/listings/property-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { ActivityTimeline } from "@/features/dashboard/activity-timeline";
import {
  bookingActivityItems,
  confirmedMatchActivityItems,
  conversationActivityItems,
  notificationActivityItems,
  recentDashboardActivity,
  roommateActivityItems,
} from "@/features/dashboard/activity";
import { roommateService } from "@/features/roommates/services/roommate.service";
import { useSavedListings } from "@/features/saved/hooks/use-saved-listings";
import { summarizeStudentDashboard } from "@/features/student/dashboard";
import { VerificationStatus } from "@/features/onboarding/components/verification-status";
import { formatNaira } from "@/lib/format";
import { IntroExperience } from "@/features/intro/intro-experience";
import { useStudentBookings } from "@/features/bookings/hooks/use-bookings";
import { useListingSearch } from "@/features/listings/hooks/use-listings";
import { messagingService } from "@/features/messages/services/messaging.service";
import { notificationService } from "@/features/notifications/services/notification.service";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Camp Match — Verified student housing near your campus" },
      {
        name: "description",
        content:
          "Discover verified student accommodation in Nigeria, compare prices in naira and connect with trusted House Scouts near your university.",
      },
      {
        property: "og:title",
        content: "Camp Match — Verified student housing near your campus",
      },
      {
        property: "og:description",
        content:
          "Discover verified student accommodation in Nigeria and connect with trusted House Scouts.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { user, state } = useAuth();
  const { savedIds } = useSavedListings();
  const savedListingsQuery = useListingSearch({});
  const bookings = useStudentBookings(user?.id);

  const roommateRequests = useQuery({
    queryKey: ["roommates", "requests", user?.id],
    enabled: Boolean(user?.id),
    queryFn: () => roommateService.getRequests(user?.id),
    retry: false,
  });

  const confirmedMatches = useQuery({
    queryKey: ["roommates", "confirmed", user?.id],
    enabled: Boolean(user?.id),
    queryFn: () => roommateService.getConfirmedMatches(user?.id),
    retry: false,
  });

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

  const savedListings = useMemo(
    () => (savedListingsQuery.data?.items ?? []).filter((listing) => savedIds.includes(listing.id)),
    [savedIds, savedListingsQuery.data?.items],
  );

  const roommateStatus = useMemo(() => {
    if (!user?.id) return "none";
    if (confirmedMatches.data && confirmedMatches.data.length > 0) return "matched";
    const pendingRequest = roommateRequests.data?.some(
      (request) =>
        (request.requesterId === user.id || request.recipientId === user.id) &&
        (request.status === "pending" || request.status === "accepted"),
    );
    return pendingRequest ? "pending" : "none";
  }, [confirmedMatches.data, roommateRequests.data, user?.id]);

  const unreadMessages = conversations.data?.reduce(
    (total, conversation) => total + conversation.unreadCount,
    0,
  );

  const summary = useMemo(
    () =>
      summarizeStudentDashboard({
        user: user ? { identityVerification: user.identityVerification } : null,
        studentId: user?.id,
        savedProperties: savedListings.map((listing) => ({
          id: listing.id,
          title: listing.title,
          price: listing.price,
          pricePeriod: listing.pricePeriod,
          location: listing.location,
          verification: listing.verification,
          images: listing.images,
        })),
        bookings: bookings.data ?? [],
        roommateRequests: roommateRequests.data ?? [],
        confirmedMatches: confirmedMatches.data ?? [],
        roommateStatus,
        messageCount: unreadMessages ?? 0,
        notificationCount: unreadNotifications.data ?? 0,
      }),
    [
      bookings.data,
      confirmedMatches.data,
      roommateRequests.data,
      savedListings,
      unreadMessages,
      unreadNotifications.data,
      user,
      roommateStatus,
    ],
  );

  const activityItems = recentDashboardActivity([
    bookingActivityItems(bookings.data ?? [], "student"),
    roommateActivityItems(roommateRequests.data ?? []),
    confirmedMatchActivityItems(confirmedMatches.data ?? []),
    notificationActivityItems(notifications.data ?? [], "student"),
    conversationActivityItems(conversations.data ?? []),
  ]);

  const activityIsPending =
    bookings.isPending ||
    roommateRequests.isPending ||
    confirmedMatches.isPending ||
    notifications.isPending ||
    conversations.isPending;
  const activityHasError =
    bookings.isError ||
    roommateRequests.isError ||
    confirmedMatches.isError ||
    notifications.isError ||
    conversations.isError;

  if (state.status === "checking") {
    return (
      <AppShell>
        <LoadingState label="Checking your account" />
      </AppShell>
    );
  }

  if (!user) {
    return <IntroExperience />;
  }

  const recentConversations = conversations.data?.slice(0, 2) ?? [];
  const recentNotifications = notifications.data?.slice(0, 3) ?? [];

  return (
    <AppShell>
      <div className="space-y-6 px-4 py-6 sm:px-6">
        <header>
          <p className="text-sm font-medium text-muted-foreground">Student dashboard</p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Welcome, {user.fullName.split(" ")[0]}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Your Camp Match status, saved homes and next steps all in one place.
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/discover">
                Browse homes
                <ArrowRight className="ml-2 size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </header>

        <VerificationStatus status={user.identityVerification ?? "not_started"} />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={<ShieldCheck className="size-4" aria-hidden="true" />}
            label="Saved homes"
            value={summary.savedProperties.length}
            helper={
              summary.savedProperties.length === 0 ? "No homes saved yet" : "Ready to compare"
            }
          />
          <SummaryCard
            icon={<CalendarCheck className="size-4" aria-hidden="true" />}
            label="Active bookings"
            value={bookings.isError ? "Unavailable" : summary.bookingSummary.active}
            helper={
              bookings.isError
                ? "Booking data couldn't be loaded"
                : `${summary.bookingSummary.pending} pending`
            }
          />
          <SummaryCard
            icon={<Users className="size-4" aria-hidden="true" />}
            label="Roommate status"
            value={
              roommateRequests.isError || confirmedMatches.isError
                ? "Unavailable"
                : roommateStatus === "matched"
                  ? "Matched"
                  : roommateStatus === "pending"
                    ? "Pending"
                    : "None"
            }
            helper={
              roommateRequests.isError || confirmedMatches.isError
                ? "Roommate data couldn't be loaded"
                : `${summary.roommateRequestCount} requests · ${summary.confirmedMatchCount} matches`
            }
          />
          <SummaryCard
            icon={<BellRing className="size-4" aria-hidden="true" />}
            label="Unread"
            value={
              conversations.isError || unreadNotifications.isError
                ? "Unavailable"
                : (summary.notificationCount ?? 0) + (summary.messageCount ?? 0)
            }
            helper={
              conversations.isError || unreadNotifications.isError
                ? "Unread data couldn't be loaded"
                : "Messages + notifications"
            }
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
          <div className="space-y-6">
            <Section
              title="Saved properties"
              action={<Link to="/saved">View all saved properties</Link>}
            >
              {savedListingsQuery.isPending ? (
                <LoadingState label="Loading saved homes" className="py-8" />
              ) : savedListingsQuery.isError ? (
                <ErrorState
                  title="We couldn't load your saved homes"
                  onRetry={() => void savedListingsQuery.refetch()}
                />
              ) : savedListings.length === 0 ? (
                <EmptyState
                  icon={<Bookmark className="size-5" aria-hidden="true" />}
                  title="No homes saved yet"
                  description="Save properties you want to compare later."
                  action={
                    <Button asChild>
                      <Link to="/discover">Browse homes</Link>
                    </Button>
                  }
                />
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {savedListings.slice(0, 2).map((listing) => (
                    <PropertyCard key={listing.id} listing={listing} saved className="max-w-none" />
                  ))}
                </div>
              )}
            </Section>

            <Section title="Bookings" action={<Link to="/bookings">View all bookings</Link>}>
              {bookings.isPending ? (
                <LoadingState label="Loading bookings" className="py-8" />
              ) : bookings.isError ? (
                <ErrorState
                  title="We couldn't load your bookings"
                  onRetry={() => void bookings.refetch()}
                />
              ) : (bookings.data ?? []).length === 0 ? (
                <EmptyState
                  icon={<CalendarCheck className="size-5" aria-hidden="true" />}
                  title="No bookings yet"
                  description="Start your housing search to create a booking request."
                />
              ) : (
                <div className="space-y-3">
                  {(bookings.data ?? []).slice(0, 3).map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between rounded-xl border border-border bg-surface p-3"
                    >
                      <div>
                        <p className="font-medium text-foreground">{booking.propertyTitle}</p>
                        <p className="text-xs text-muted-foreground">
                          {booking.status === "pending"
                            ? "Pending review"
                            : booking.status === "approved"
                              ? "Approved"
                              : booking.status === "rejected"
                                ? "Rejected"
                                : booking.status}
                        </p>
                      </div>
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                        {booking.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </div>

          <div className="space-y-6">
            <Section
              title="Roommate matching"
              action={<Link to="/roommates">Discover roommates</Link>}
            >
              {roommateStatus === "matched" ? (
                <div className="rounded-2xl border border-primary/20 bg-primary-soft p-4">
                  <div className="flex items-center gap-2 text-primary">
                    <CheckCircle2 className="size-4" aria-hidden="true" />
                    <p className="font-medium">Confirmed match</p>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    You have a compatible roommate match ready to connect with.
                  </p>
                </div>
              ) : roommateStatus === "pending" ? (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
                  <div className="flex items-center gap-2 text-amber-700">
                    <Clock3 className="size-4" aria-hidden="true" />
                    <p className="font-medium">Request pending</p>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Your roommate request is still waiting on a response.
                  </p>
                </div>
              ) : (
                <EmptyState
                  icon={<Users className="size-5" aria-hidden="true" />}
                  title="Find a roommate match"
                  description="Set your preferences and discover compatible students."
                  action={
                    <Button asChild>
                      <Link to="/roommates">Go to roommates</Link>
                    </Button>
                  }
                />
              )}
            </Section>

            <Section title="Messages" action={<Link to="/messages">Open messages</Link>}>
              {conversations.isPending || unreadNotifications.isPending ? (
                <LoadingState label="Loading messages" className="py-8" />
              ) : conversations.isError ? (
                <ErrorState
                  title="We couldn't load messages"
                  onRetry={() => void conversations.refetch()}
                />
              ) : recentConversations.length === 0 ? (
                <EmptyState
                  icon={<MessageSquareText className="size-5" aria-hidden="true" />}
                  title="No conversations yet"
                  description="No messages yet."
                />
              ) : (
                <div className="space-y-3">
                  {recentConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className="rounded-xl border border-border bg-surface p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-foreground">{conversation.title}</p>
                        {conversation.unreadCount > 0 ? (
                          <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                            {conversation.unreadCount}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {conversation.lastMessage}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            <Section title="Notifications" action={<Link to="/messages">View notifications</Link>}>
              {notifications.isPending ? (
                <LoadingState label="Loading notifications" className="py-8" />
              ) : notifications.isError ? (
                <ErrorState
                  title="We couldn't load notifications"
                  onRetry={() => void notifications.refetch()}
                />
              ) : recentNotifications.length === 0 ? (
                <EmptyState
                  icon={<BellRing className="size-5" aria-hidden="true" />}
                  title="No notifications"
                  description="You are all caught up."
                />
              ) : (
                <div className="space-y-3">
                  {recentNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="rounded-xl border border-border bg-surface p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-foreground">{notification.title}</p>
                        {!notification.readAt ? (
                          <span
                            className="h-2.5 w-2.5 rounded-full bg-primary"
                            aria-label="Unread notification"
                          />
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{notification.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </div>
        </div>

        <Section title="Recent activity" action={<Link to="/messages">Open inbox</Link>}>
          <ActivityTimeline
            items={activityItems}
            isPending={activityIsPending}
            isError={activityHasError}
            onRetry={() => {
              void bookings.refetch();
              void roommateRequests.refetch();
              void confirmedMatches.refetch();
              void notifications.refetch();
              void conversations.refetch();
            }}
            emptyDescription="Bookings, roommate requests, messages, and notifications will appear here when available."
          />
        </Section>

        <Section title="Attention" action={<Link to="/messages">Take action</Link>}>
          {summary.activities.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-4 text-sm text-muted-foreground">
              You’re all caught up. There’s nothing urgent for you right now.
            </div>
          ) : (
            <div className="space-y-3">
              {summary.activities.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-xl border border-border bg-surface p-3 text-sm"
                >
                  <AlertTriangle className="mt-0.5 size-4 text-primary" aria-hidden="true" />
                  <p>{item}</p>
                </div>
              ))}
            </div>
          )}
        </Section>

        <div className="rounded-2xl border border-border bg-primary-soft p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 size-5 text-primary" aria-hidden="true" />
            <div className="space-y-1">
              <p className="font-medium text-foreground">Recommended next steps</p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {summary.actions.length === 0 ? (
                  <li>Nothing to do right now.</li>
                ) : (
                  summary.actions.slice(0, 4).map((action) => <li key={action}>{action}</li>)
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  helper,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  helper: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <div className="flex size-8 items-center justify-center rounded-full bg-primary-soft text-primary">
          {icon}
        </div>
      </div>
      <p className="mt-4 text-2xl font-bold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
    </Card>
  );
}

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {action ? <span className="text-sm text-primary">{action}</span> : null}
      </div>
      {children}
    </Card>
  );
}
