export type DashboardActivityKind =
  "property" | "booking" | "roommate" | "message" | "notification";

export type DashboardActivityDestination =
  | "/bookings"
  | "/roommates"
  | "/messages"
  | "/owner/bookings"
  | "/owner/properties"
  | "/scout/bookings"
  | "/scout/properties";

export type DashboardActivityItem = {
  id: string;
  kind: DashboardActivityKind;
  title: string;
  description?: string | undefined;
  occurredAt?: string | null | undefined;
  destination?: DashboardActivityDestination | undefined;
  relatedEntityId?: string | undefined;
};

export function uniqueById<T extends { id: string }>(records: readonly T[]): T[] {
  const seen = new Set<string>();
  return records.filter((record) => {
    if (!record.id || seen.has(record.id)) return false;
    seen.add(record.id);
    return true;
  });
}

export function countByStatus<T extends { id: string }, TStatus extends string>(
  records: readonly T[],
  statuses: readonly TStatus[],
  getStatus: (record: T) => string | undefined,
): Record<TStatus, number> {
  const counts = Object.fromEntries(statuses.map((status) => [status, 0])) as Record<
    TStatus,
    number
  >;

  for (const record of uniqueById(records)) {
    const status = getStatus(record);
    if (status && status in counts) counts[status as TStatus] += 1;
  }

  return counts;
}

function timestampValue(value: string | null | undefined): number | null {
  if (!value) return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

export function sortActivity(
  items: readonly DashboardActivityItem[],
  limit = 6,
): DashboardActivityItem[] {
  if (limit <= 0) return [];

  return uniqueById(items)
    .map((item, index) => ({ item, index, timestamp: timestampValue(item.occurredAt) }))
    .sort((left, right) => {
      if (left.timestamp === null && right.timestamp !== null) return 1;
      if (left.timestamp !== null && right.timestamp === null) return -1;
      if (left.timestamp !== null && right.timestamp !== null) {
        const difference = right.timestamp - left.timestamp;
        if (difference !== 0) return difference;
      }
      return left.index - right.index;
    })
    .slice(0, limit)
    .map(({ item }) => item);
}

export function formatActivityTimestamp(value: string | null | undefined): string {
  const timestamp = timestampValue(value);
  if (timestamp === null) return "Time unavailable";

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(timestamp);
}
