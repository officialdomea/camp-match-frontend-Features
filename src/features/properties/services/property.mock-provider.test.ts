import { beforeEach, describe, expect, it } from "vitest";
import { mockManagedProperties } from "@/data/mock/managed-properties";
import { mockPropertyProvider } from "./property.mock-provider";

function setActor(id: string, role: "student" | "owner" | "scout") {
  window.localStorage.setItem("campmatch.session", JSON.stringify({ user: { id, role } }));
}

beforeEach(() => {
  const values = new Map<string, string>();
  const localStorage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => void values.set(key, value),
    removeItem: (key: string) => void values.delete(key),
    clear: () => void values.clear(),
  } as Storage;
  Object.defineProperty(globalThis, "window", { value: { localStorage }, configurable: true });
});

describe("mock property provider dashboard scope", () => {
  it("returns only properties owned by the authenticated owner", async () => {
    setActor("usr_demo_owner", "owner");

    const properties = await mockPropertyProvider.getOwnerProperties();
    const expectedIds = mockManagedProperties
      .filter((property) => property.owner.id === "usr_demo_owner")
      .map((property) => property.id);

    expect(properties.map((property) => property.id).sort()).toEqual(expectedIds.sort());

    setActor("usr_unrelated_owner", "owner");
    await expect(mockPropertyProvider.getOwnerProperties()).resolves.toEqual([]);
    await expect(mockPropertyProvider.getOwnerDashboard()).resolves.toMatchObject({
      totalProperties: 0,
      activeProperties: 0,
      bookingRequests: 0,
      newEnquiries: 0,
      recentActivity: [],
    });
  });

  it("includes only active properties assigned to the authenticated scout", async () => {
    setActor("scout_002", "scout");

    const properties = await mockPropertyProvider.getManagedProperties();
    expect(properties.length).toBeGreaterThan(0);
    expect(
      properties.every(
        (property) =>
          property.scouts.some(
            (assignment) => assignment.scoutId === "scout_002" && assignment.status === "active",
          ) && property.myRelationship.status === "active",
      ),
    ).toBe(true);
    expect(properties.map((property) => property.id)).not.toContain("prop_001");
  });

  it("does not return pending assignments or reveal an unassigned property", async () => {
    setActor("scout_pending", "scout");

    await expect(mockPropertyProvider.getManagedProperties()).resolves.toEqual([]);
    await expect(mockPropertyProvider.getManagedProperty("prop_001")).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("rejects dashboard access from a role outside the endpoint scope", async () => {
    setActor("student_a", "student");

    await expect(mockPropertyProvider.getOwnerProperties()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
    await expect(mockPropertyProvider.getManagedProperties()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });
});
