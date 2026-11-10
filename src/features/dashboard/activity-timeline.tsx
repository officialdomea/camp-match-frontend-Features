import { Link } from "@tanstack/react-router";
import {
  Bell,
  Building2,
  CalendarCheck,
  ChevronRight,
  MessageSquareText,
  Users,
} from "lucide-react";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/states";
import { formatActivityTimestamp, type DashboardActivityItem } from "./insights";

type ActivityTimelineProps = {
  items: DashboardActivityItem[];
  isPending?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
};

const activityIcons = {
  property: Building2,
  booking: CalendarCheck,
  roommate: Users,
  message: MessageSquareText,
  notification: Bell,
} as const;

export function ActivityTimeline({
  items,
  isPending = false,
  isError = false,
  onRetry,
  emptyTitle = "No recent activity",
  emptyDescription = "Activity will appear here as you use Camp Match.",
}: ActivityTimelineProps) {
  if (isPending && items.length === 0) return <LoadingState label="Loading recent activity" />;

  if (isError && items.length === 0) {
    return (
      <ErrorState
        title="Statistics are currently unavailable"
        description="Please try again."
        onRetry={onRetry}
      />
    );
  }

  if (items.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="space-y-3">
      {isError ? (
        <p className="text-sm text-muted-foreground" role="status">
          Some activity sources are unavailable; showing the records that loaded.
        </p>
      ) : null}
      <ol className="divide-y divide-border">
        {items.map((item) => {
          const Icon = activityIcons[item.kind];
          const content = (
            <>
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-foreground">{item.title}</span>
                {item.description ? (
                  <span className="mt-0.5 block text-sm text-muted-foreground">
                    {item.description}
                  </span>
                ) : null}
                <time
                  className="mt-1 block text-xs text-muted-foreground"
                  dateTime={item.occurredAt ?? undefined}
                >
                  {formatActivityTimestamp(item.occurredAt)}
                </time>
              </span>
              {item.destination ? (
                <ChevronRight
                  className="mt-1 size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
              ) : null}
            </>
          );

          return (
            <li key={item.id}>
              {item.destination ? (
                <Link
                  to={item.destination}
                  className="flex items-start gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={`${item.title}, ${formatActivityTimestamp(item.occurredAt)}`}
                >
                  {content}
                </Link>
              ) : (
                <div className="flex items-start gap-3 px-2 py-3">{content}</div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
