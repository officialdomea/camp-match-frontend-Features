import type { University } from "@/types/listing";

/** DEMO DATA — replace with GET /api/v1/universities */
export const mockUniversities: University[] = [
  {
    id: "uni_unical",
    name: "University of Calabar",
    shortName: "UNICAL",
    city: "Calabar",
    state: "Cross River",
  },
  {
    id: "uni_uniben",
    name: "University of Benin",
    shortName: "UNIBEN",
    city: "Benin City",
    state: "Edo",
  },
  {
    id: "uni_unilag",
    name: "University of Lagos",
    shortName: "UNILAG",
    city: "Lagos",
    state: "Lagos",
  },
  {
    id: "uni_ui",
    name: "University of Ibadan",
    shortName: "UI",
    city: "Ibadan",
    state: "Oyo",
  },
  {
    id: "uni_unn",
    name: "University of Nigeria, Nsukka",
    shortName: "UNN",
    city: "Nsukka",
    state: "Enugu",
  },
];
