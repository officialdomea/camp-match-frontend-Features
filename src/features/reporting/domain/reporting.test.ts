import { describe, expect, it } from "vitest";
import { canContinueReport, REPORT_SUBMITTED_CONFIRMATION } from "./reporting";

describe("report submission flow", () => {
  it("requires a reason before review and blocks progress while submitting", () => {
    expect(canContinueReport("", false)).toBe(false);
    expect(canContinueReport("fraud", true)).toBe(false);
    expect(canContinueReport("fraud", false)).toBe(true);
  });

  it("uses a truthful submission confirmation", () => {
    expect(REPORT_SUBMITTED_CONFIRMATION).toBe("Report submitted. Our team will review it.");
  });
});
