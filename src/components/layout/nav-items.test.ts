import { describe, expect, it } from "vitest";
import { getNavItems } from "./nav-items";

describe("role-aware navigation", () => {
  it("keeps student matching features with students", () => {
    const labels = getNavItems("student").map((item) => item.label);

    expect(labels).toContain("Roommates");
    expect(labels).toContain("Saved");
    expect(labels).not.toContain("My Properties");
    expect(labels).not.toContain("Managed Properties");
  });

  it("gives owners property navigation without roommate features", () => {
    const labels = getNavItems("owner").map((item) => item.label);

    expect(labels).toEqual([
      "Dashboard",
      "My Properties",
      "Booking Requests",
      "Messages",
      "Profile",
    ]);
    expect(labels).not.toContain("Roommates");
  });

  it("gives scouts managed-property navigation without roommate features", () => {
    const labels = getNavItems("scout").map((item) => item.label);

    expect(labels).toEqual([
      "Dashboard",
      "Managed Properties",
      "Booking Activity",
      "Activity",
      "Messages",
      "Profile",
    ]);
    expect(labels).not.toContain("Roommates");
  });

  it("has no navigation for an unknown role", () => {
    expect(getNavItems(null)).toEqual([]);
  });

  it("uses role-specific booking surfaces", () => {
    expect(getNavItems("owner").some((item) => item.to === "/owner/bookings")).toBe(true);
    expect(getNavItems("scout").some((item) => item.to === "/scout/bookings")).toBe(true);
    expect(getNavItems("student").some((item) => item.to === "/owner/bookings")).toBe(false);
  });
});
