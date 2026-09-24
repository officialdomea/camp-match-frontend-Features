import { beforeEach, describe, expect, it } from "vitest";
import { mockVerificationProvider } from "./verification.mock-provider";

describe("verification evidence provider", () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        localStorage: { getItem: () => JSON.stringify({ user: { id: "verification-user" } }) },
      },
    });
  });

  it("stores private evidence metadata without exposing a public URL", async () => {
    const result = await mockVerificationProvider.uploadEvidence({
      kind: "identity",
      documentType: "nin",
      file: new File(["document"], "identity.png", { type: "image/png" }),
    });

    expect(result.status).toBe("pending");
    expect(result.mediaReference.startsWith("private://")).toBe(true);
    expect(result).not.toHaveProperty("url");
    await expect(mockVerificationProvider.getEvidence()).resolves.toHaveLength(1);

    await mockVerificationProvider.removeEvidence(result.id);
    await expect(mockVerificationProvider.getEvidence()).resolves.toHaveLength(0);
  });
});
