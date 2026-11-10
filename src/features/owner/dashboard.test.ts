import { describe, expect, it } from "vitest";
import { summarizeOwnerDashboard } from "./dashboard";

describe("owner dashboard summary", () => {
  it("calculates property and booking counts from the owner-scoped data", () => {
    const summary = summarizeOwnerDashboard({
      currentUserId: "usr_demo_owner",
      properties: [
        {
          id: "prop-1",
          owner: { id: "usr_demo_owner", name: "John", verified: true },
          status: "active",
          verification: {
            overall: "verified",
            steps: [
              { id: "identity", label: "Owner identity", status: "verified" },
              { id: "ownership", label: "Proof of ownership", status: "verified" },
              { id: "property_review", label: "Property review", status: "verified" },
              { id: "images", label: "Image review", status: "verified" },
            ],
          },
          performance: { views: 120, saves: 10, enquiries: 4, bookingRequests: 2, period: "Last 30 days" },
          activity: [],
        },
        {
          id: "prop-2",
          owner: { id: "usr_demo_owner", name: "John", verified: true },
          status: "pending_review",
          verification: {
            overall: "pending",
            steps: [
              { id: "identity", label: "Owner identity", status: "verified" },
              { id: "ownership", label: "Proof of ownership", status: "verified" },
              { id: "property_review", label: "Property review", status: "pending" },
              { id: "images", label: "Image review", status: "verified" },
            ],
          },
          performance: { views: 80, saves: 3, enquiries: 2, bookingRequests: 1, period: "Last 30 days" },
          activity: [],
        },
        {
          id: "prop-3",
          owner: { id: "usr_other_owner", name: "Other", verified: true },
          status: "active",
          verification: {
            overall: "verified",
            steps: [
              { id: "identity", label: "Owner identity", status: "verified" },
              { id: "ownership", label: "Proof of ownership", status: "verified" },
              { id: "property_review", label: "Property review", status: "verified" },
              { id: "images", label: "Image review", status: "verified" },
            ],
          },
          performance: { views: 220, saves: 11, enquiries: 9, bookingRequests: 9, period: "Last 30 days" },
          activity: [],
        },
      ],
      bookings: [
        { id: "booking-1", status: "pending" },
        { id: "booking-2", status: "approved" },
        { id: "booking-3", status: "pending" },
        { id: "booking-1", status: "pending" },
      ],
      unreadMessages: 2,
      unreadNotifications: 3,
      actions: ["Review booking requests"],
    });

    expect(summary.totalProperties).toBe(2);
    expect(summary.publishedProperties).toBe(1);
    expect(summary.pendingVerification).toBe(1);
    expect(summary.pendingRequests).toBe(2);
    expect(summary.bookingStatusCounts).toMatchObject({ pending: 2, approved: 1, rejected: 0 });
    expect(summary.newEnquiries).toBe(6);
    expect(summary.unreadMessages).toBe(2);
    expect(summary.unreadNotifications).toBe(3);
    expect(summary.actions).toContain("Review booking requests");
  });

  it("returns empty state guidance when the owner has no properties or requests", () => {
    const summary = summarizeOwnerDashboard({
      currentUserId: "usr_demo_owner",
      properties: [],
      bookings: [],
      unreadMessages: 0,
      unreadNotifications: 0,
    });

    expect(summary.totalProperties).toBe(0);
    expect(summary.publishedProperties).toBe(0);
    expect(summary.pendingRequests).toBe(0);
    expect(summary.emptyState).toContain("list any properties");
  });
});
