import { describe, expect, it } from "vitest";
import type { ManagedProperty } from "@/types/property";
import type { Report } from "@/types/reporting";
import {
  canAccessPrivateVerification,
  canChangeReportStatus,
  canManageProperty,
  canReportTarget,
  canViewPublicProperty,
  canViewReport,
  canViewTrustInfo,
} from "./policies";

function property(overrides: Partial<ManagedProperty> = {}): ManagedProperty {
  return {
    id: "prop_01",
    title: "Sample property",
    description: "A sample home",
    accommodationType: "single-room",
    status: "active",
    owner: { id: "owner_01", name: "Owner", verified: true },
    location: {
      universityId: "uni_01",
      universityName: "Sample University",
      area: "Campus area",
      address: "Address",
      city: "City",
      state: "State",
    },
    pricing: { rent: 1, period: "year" },
    features: { bedrooms: 1, bathrooms: 1, amenities: [] },
    photos: [],
    availability: { status: "available", availableFrom: "2026-10-01", unitsAvailable: 1 },
    performance: { views: 0, saves: 0, enquiries: 0, bookingRequests: 0, period: "Last 30 days" },
    verification: { overall: "verified", steps: [] },
    scouts: [
      {
        scoutId: "scout_01",
        scoutName: "Scout",
        verified: true,
        relationship: "authorized_scout",
        status: "active",
        authorizedAt: "2026-09-01T00:00:00.000Z",
        permissions: {
          canEditProperty: true,
          canUpdateAvailability: true,
          canManagePhotos: true,
          canRespondToEnquiries: true,
          canViewBookings: true,
        },
      },
    ],
    activity: [],
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-09-01T00:00:00.000Z",
    ...overrides,
  };
}

function reportFixture(reporterId: string): Report {
  return {
    id: "report_01",
    reporterId,
    targetType: "user",
    targetId: "usr_target",
    reason: "harassment",
    status: "submitted",
    createdAt: "2026-10-01T00:00:00.000Z",
    updatedAt: "2026-10-01T00:00:00.000Z",
  };
}

describe("central authorization policies", () => {
  it("allows an Owner to manage only their own property", () => {
    expect(canManageProperty({ id: "owner_01", role: "owner" }, property())).toBe(true);
    expect(canManageProperty({ id: "owner_02", role: "owner" }, property())).toBe(false);
  });

  it("allows only active, explicitly assigned Scouts with the requested permission", () => {
    const managed = property();
    expect(canManageProperty({ id: "scout_01", role: "scout" }, managed)).toBe(true);
    expect(
      canManageProperty({ id: "scout_other", role: "scout" }, managed, "canEditProperty"),
    ).toBe(false);
    expect(
      canManageProperty(
        { id: "scout_01", role: "scout" },
        property({ scouts: managed.scouts.map((item) => ({ ...item, status: "pending" })) }),
      ),
    ).toBe(false);
  });

  it("allows public details only for active properties and keeps trust information public-safe", () => {
    expect(canViewPublicProperty(property())).toBe(true);
    expect(canViewPublicProperty(property({ status: "draft" }))).toBe(false);
    expect(canViewTrustInfo()).toBe(true);
  });

  it("limits private identity verification to the matching signed-in role and subject", () => {
    expect(
      canAccessPrivateVerification({ id: "owner_01", role: "owner" }, "owner_identity", "owner_01"),
    ).toBe(true);
    expect(
      canAccessPrivateVerification({ id: "owner_01", role: "owner" }, "owner_identity", "owner_02"),
    ).toBe(false);
    expect(
      canAccessPrivateVerification({ id: "owner_01", role: "owner" }, "scout_identity", "owner_01"),
    ).toBe(false);
    expect(
      canAccessPrivateVerification({ id: "student_01", role: "student" }, "property", "prop_01"),
    ).toBe(false);
  });

  it("prevents self-reporting and limits report visibility to its reporter", () => {
    expect(canReportTarget({ id: "usr_01", role: "student" }, "user", "usr_02")).toBe(true);
    expect(canReportTarget({ id: "usr_01", role: "student" }, "user", "usr_01")).toBe(false);
    expect(canViewReport({ id: "usr_01", role: "student" }, reportFixture("usr_01"))).toBe(true);
    expect(canViewReport({ id: "usr_02", role: "student" }, reportFixture("usr_01"))).toBe(false);
    expect(canChangeReportStatus()).toBe(false);
  });
});
