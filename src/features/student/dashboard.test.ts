import { describe, expect, it } from "vitest";
import { summarizeStudentDashboard } from "./dashboard";

describe("student dashboard summary", () => {
  it("maps verification, saved properties, bookings, roommate status, and counts", () => {
    const summary = summarizeStudentDashboard({
      user: { identityVerification: "verified" },
      studentId: "student-a",
      savedProperties: [
        {
          id: "prop-1",
          title: "UNICAL Studio",
          price: 250000,
          pricePeriod: "year",
          location: {
            area: "Ekosodin",
            city: "Benin City",
            state: "Edo",
            universityId: "uni_unical",
            universityName: "University of Benin",
            distanceFromCampusKm: 1.2,
            latitude: 6.4,
            longitude: 5.6,
          },
          verification: {
            verified: true,
            checks: [{ id: "identity", label: "Identity check", status: "passed" }],
          },
          images: [{ id: "img-1", url: "/images/prop-1.jpg", alt: "UNICAL Studio" }],
        },
        {
          id: "prop-2",
          title: "Campus View Flat",
          price: 320000,
          pricePeriod: "year",
          location: {
            area: "Ugbowo",
            city: "Benin City",
            state: "Edo",
            universityId: "uni_unical",
            universityName: "University of Benin",
            distanceFromCampusKm: 2.8,
            latitude: 6.42,
            longitude: 5.64,
          },
          verification: {
            verified: false,
            checks: [{ id: "identity", label: "Identity check", status: "pending" }],
          },
          images: [{ id: "img-2", url: "/images/prop-2.jpg", alt: "Campus View Flat" }],
        },
      ],
      bookings: [
        {
          id: "booking-1",
          studentId: "student-a",
          status: "pending",
          createdAt: "2026-10-01T10:00:00Z",
          updatedAt: "2026-10-01T10:00:00Z",
        },
        {
          id: "booking-2",
          studentId: "student-a",
          status: "approved",
          createdAt: "2026-10-02T10:00:00Z",
          updatedAt: "2026-10-02T12:00:00Z",
        },
        {
          id: "booking-1",
          studentId: "student-a",
          status: "pending",
          createdAt: "2026-10-01T10:00:00Z",
          updatedAt: "2026-10-01T10:00:00Z",
        },
        {
          id: "booking-other",
          studentId: "student-b",
          status: "confirmed",
          createdAt: "2026-10-03T10:00:00Z",
          updatedAt: "2026-10-03T10:00:00Z",
        },
      ],
      roommateRequests: [
        {
          id: "request-a",
          requesterId: "student-a",
          recipientId: "student-b",
          requesterAccepted: false,
          recipientAccepted: false,
          status: "pending",
          createdAt: "2026-10-01T10:00:00Z",
          updatedAt: "2026-10-01T10:00:00Z",
        },
        {
          id: "request-other",
          requesterId: "student-c",
          recipientId: "student-d",
          requesterAccepted: false,
          recipientAccepted: false,
          status: "pending",
          createdAt: "2026-10-01T10:00:00Z",
          updatedAt: "2026-10-01T10:00:00Z",
        },
      ],
      confirmedMatches: [
        {
          id: "match-a",
          participantIds: ["student-a", "student-b"],
          status: "matched",
          matchedAt: "2026-10-02T10:00:00Z",
        },
        {
          id: "match-other",
          participantIds: ["student-c", "student-d"],
          status: "matched",
          matchedAt: "2026-10-02T10:00:00Z",
        },
      ],
      roommateStatus: "matched",
      messageCount: 2,
      notificationCount: 3,
      actions: ["Verification complete", "Book a viewing"],
    });

    expect(summary.verification.label).toContain("Identity verified");
    expect(summary.savedProperties).toHaveLength(2);
    expect(summary.bookingSummary.pending).toBe(1);
    expect(summary.bookingSummary.approved).toBe(1);
    expect(summary.bookingSummary.total).toBe(2);
    expect(summary.bookingSummary.active).toBe(2);
    expect(summary.roommateRequestCount).toBe(1);
    expect(summary.confirmedMatchCount).toBe(1);
    expect(summary.roommateStatus).toBe("matched");
    expect(summary.messageCount).toBe(2);
    expect(summary.notificationCount).toBe(3);
    expect(summary.actions).toContain("Book a viewing");
  });

  it("handles empty student dashboard states cleanly", () => {
    const summary = summarizeStudentDashboard({
      user: { identityVerification: "not_started" },
      savedProperties: [],
      bookings: [],
      roommateStatus: "none",
      messageCount: 0,
      notificationCount: 0,
      actions: ["Start verification"],
    });

    expect(summary.verification.label).toContain("Verification required");
    expect(summary.savedProperties).toHaveLength(0);
    expect(summary.bookingSummary.total).toBe(0);
    expect(summary.roommateStatus).toBe("none");
    expect(summary.messageCount).toBe(0);
    expect(summary.notificationCount).toBe(0);
    expect(summary.emptyState).toContain("Save properties");
  });
});
