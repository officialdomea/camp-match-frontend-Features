import { describe, expect, it } from "vitest";
import { validateImageFile, validateImageFiles } from "./media";

function file(name: string, type: string, size: number) {
  return { name, type, size } as File;
}

describe("media validation", () => {
  it("accepts supported image types within the size limit", () => {
    expect(validateImageFile(file("room.png", "image/png", 1024))).toBeNull();
  });

  it("rejects unsupported, empty, and oversized files", () => {
    expect(validateImageFile(file("document.pdf", "application/pdf", 1024))).toContain(
      "supported image",
    );
    expect(validateImageFile(file("empty.jpg", "image/jpeg", 0))).toContain("empty");
    expect(validateImageFile(file("large.jpg", "image/jpeg", 11 * 1024 * 1024))).toContain("10 MB");
  });

  it("enforces a file-count limit", () => {
    expect(
      validateImageFiles(
        [file("one.jpg", "image/jpeg", 100), file("two.jpg", "image/jpeg", 100)],
        1,
      ),
    ).toContain("no more than 1");
  });
});
