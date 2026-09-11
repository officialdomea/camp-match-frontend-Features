import type { AccommodationType } from "@/types/listing";

export const accommodationLabels: Record<AccommodationType, string> = {
  "self-contained": "Self-contained",
  "single-room": "Single room",
  "shared-apartment": "Shared apartment",
  "one-bedroom": "One bedroom",
  "two-bedroom": "Two bedroom",
  hostel: "Hostel",
};

export const accommodationOptions = Object.entries(accommodationLabels).map(([value, label]) => ({
  value: value as AccommodationType,
  label,
}));
