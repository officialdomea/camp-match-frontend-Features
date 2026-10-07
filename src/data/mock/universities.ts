import type { University } from "@/types/listing";

export const supportedUniversityIds = ["UNICAL", "UNICROSS", "UNIPORT", "RSU", "UNILAG"] as const;

export const supportedUniversities: University[] = [
  {
    id: "UNICAL",
    name: "University of Calabar",
    shortName: "UNICAL",
    city: "Calabar",
    state: "Cross River",
  },
  {
    id: "UNICROSS",
    name: "University of Cross River State",
    shortName: "UNICROSS",
    city: "Calabar",
    state: "Cross River",
  },
  {
    id: "UNIPORT",
    name: "University of Port Harcourt",
    shortName: "UNIPORT",
    city: "Port Harcourt",
    state: "Rivers",
  },
  {
    id: "RSU",
    name: "Rivers State University",
    shortName: "RSU",
    city: "Port Harcourt",
    state: "Rivers",
  },
  {
    id: "UNILAG",
    name: "University of Lagos",
    shortName: "UNILAG",
    city: "Lagos",
    state: "Lagos",
  },
];

export const universityById = Object.fromEntries(
  supportedUniversities.map((university) => [university.id, university]),
) as Record<string, University>;

export function findUniversityById(universityId?: string | null): University | undefined {
  if (!universityId) return undefined;
  return universityById[universityId.trim()];
}

export function isSupportedUniversityId(
  universityId?: string | null,
): universityId is (typeof supportedUniversityIds)[number] {
  if (!universityId) return false;
  return supportedUniversityIds.includes(
    universityId.trim() as (typeof supportedUniversityIds)[number],
  );
}
