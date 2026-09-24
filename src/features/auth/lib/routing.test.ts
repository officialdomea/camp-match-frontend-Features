import { describe, expect, it } from "vitest";
import { isRoleRouteAllowed } from "./routing";

describe("role route permissions", () => {
  it("allows students into student routes only", () => {
    expect(isRoleRouteAllowed("/roommates", "student")).toBe(true);
    expect(isRoleRouteAllowed("/owner/properties", "student")).toBe(false);
    expect(isRoleRouteAllowed("/scout/properties", "student")).toBe(false);
  });

  it("blocks owners and scouts from roommate routes", () => {
    expect(isRoleRouteAllowed("/roommates", "owner")).toBe(false);
    expect(isRoleRouteAllowed("/roommates", "scout")).toBe(false);
    expect(isRoleRouteAllowed("/saved", "owner")).toBe(false);
    expect(isRoleRouteAllowed("/bookings", "scout")).toBe(false);
  });

  it("keeps owner and scout management routes separated", () => {
    expect(isRoleRouteAllowed("/owner", "owner")).toBe(true);
    expect(isRoleRouteAllowed("/scout", "scout")).toBe(true);
    expect(isRoleRouteAllowed("/owner/properties", "scout")).toBe(false);
    expect(isRoleRouteAllowed("/scout/properties", "owner")).toBe(false);
    expect(isRoleRouteAllowed("/owner/bookings", "owner")).toBe(true);
    expect(isRoleRouteAllowed("/scout/bookings", "scout")).toBe(true);
    expect(isRoleRouteAllowed("/owner/bookings", "scout")).toBe(false);
    expect(isRoleRouteAllowed("/scout/bookings", "owner")).toBe(false);
  });

  it("fails closed for missing roles on protected role routes", () => {
    expect(isRoleRouteAllowed("/roommates", null)).toBe(false);
    expect(isRoleRouteAllowed("/owner", null)).toBe(false);
    expect(isRoleRouteAllowed("/scout", null)).toBe(false);
  });
});
