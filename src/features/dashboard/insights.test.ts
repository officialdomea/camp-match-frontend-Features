import { describe, expect, it } from "vitest";
import {
  countByStatus,
  formatActivityTimestamp,
  sortActivity,
  type DashboardActivityItem,
} from "./insights";

describe("dashboard insight utilities", () => {
  it("groups unique records by known status without counting duplicate ids", () => {
    const records = [
      { id: "one", status: "pending" },
      { id: "two", status: "approved" },
      { id: "two", status: "pending" },
      { id: "three", status: "unknown" },
    ];

    expect(
      countByStatus(
        records,
        ["pending", "approved", "rejected"] as const,
        (record) => record.status,
      ),
    ).toEqual({
      pending: 1,
      approved: 1,
      rejected: 0,
    });
  });

  it("sorts activity newest-first, removes duplicate ids, and leaves missing timestamps last", () => {
    const items: DashboardActivityItem[] = [
      { id: "old", kind: "booking", title: "Old booking", occurredAt: "2026-01-01T00:00:00Z" },
      { id: "new", kind: "booking", title: "New booking", occurredAt: "2026-02-01T00:00:00Z" },
      {
        id: "old",
        kind: "booking",
        title: "Duplicate booking",
        occurredAt: "2026-03-01T00:00:00Z",
      },
      { id: "unknown-time", kind: "property", title: "Property update", occurredAt: "not-a-date" },
      { id: "missing-time", kind: "notification", title: "Notification" },
    ];

    expect(sortActivity(items).map((item) => item.id)).toEqual([
      "new",
      "old",
      "unknown-time",
      "missing-time",
    ]);
    expect(sortActivity(items, 2)).toHaveLength(2);
    expect(sortActivity(items, 0)).toEqual([]);
  });

  it("formats absent or invalid timestamps without producing an invalid date", () => {
    expect(formatActivityTimestamp(undefined)).toBe("Time unavailable");
    expect(formatActivityTimestamp("not-a-date")).toBe("Time unavailable");
    expect(formatActivityTimestamp("2026-09-24T07:15:00.000Z")).not.toBe("Time unavailable");
  });
});
