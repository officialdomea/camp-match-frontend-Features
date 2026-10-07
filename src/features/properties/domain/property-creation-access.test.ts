import { describe, expect, it } from "vitest";
import { canCreateProperty } from "./property-creation-access";

describe("owner property creation access", () => {
  it.each([
    ["not_started", false],
    ["in_progress", false],
    ["pending", false],
    ["verified", true],
    ["failed", false],
    [undefined, false],
  ] as const)("returns %s access as %s", (status, allowed) => {
    expect(canCreateProperty(status)).toBe(allowed);
  });
});
