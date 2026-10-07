import { describe, expect, it } from "vitest";

import { supportedUniversities, isSupportedUniversityId } from "./universities";
import { mockListings } from "./listings";

describe("supported universities", () => {
  it("contains only the current Camp Match initial universities", () => {
    expect(supportedUniversities.map((university) => university.id).sort()).toEqual([
      "RSU",
      "UNICAL",
      "UNICROSS",
      "UNILAG",
      "UNIPORT",
    ]);

    expect(supportedUniversities.map((university) => university.name).sort()).toEqual([
      "Rivers State University",
      "University of Calabar",
      "University of Cross River State",
      "University of Lagos",
      "University of Port Harcourt",
    ]);
  });

  it("keeps active student listing fixtures within the supported catalog", () => {
    expect(
      mockListings.every((listing) => isSupportedUniversityId(listing.location.universityId)),
    ).toBe(true);
  });
});
