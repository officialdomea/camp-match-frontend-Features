/**
 * Frontend DTO types. These mirror the JSON the FastAPI backend will return —
 * not database schemas.
 */

export type PricePeriod = "year" | "semester" | "month";

export type AccommodationType =
  "self-contained" | "single-room" | "shared-apartment" | "one-bedroom" | "two-bedroom" | "hostel";

export type VerificationCheck = {
  id: string;
  label: string;
  status: "passed" | "pending" | "failed";
  description?: string;
};

export type Verification = {
  verified: boolean;
  verifiedAt?: string;
  checks: VerificationCheck[];
};

export type University = {
  id: string;
  name: string;
  shortName: string;
  city: string;
  state: string;
};

export type Scout = {
  id: string;
  name: string;
  avatarUrl?: string;
  bio: string;
  phoneMasked: string;
  rating: number;
  reviewCount: number;
  listingCount: number;
  responseTimeMinutes: number;
  verified: boolean;
  joinedAt: string;
};

export type ListingLocation = {
  area: string;
  city: string;
  state: string;
  universityId: string;
  universityName: string;
  distanceFromCampusKm: number;
  latitude: number;
  longitude: number;
};

export type ListingImage = {
  id: string;
  url: string;
  alt: string;
};

export type ListingFeature = {
  id: string;
  label: string;
  icon: string;
};

export type ListingAvailability = {
  status: "available" | "limited" | "taken";
  availableFrom: string;
  unitsAvailable: number;
};

export type Listing = {
  id: string;
  title: string;
  description: string;
  price: number;
  pricePeriod: PricePeriod;
  serviceChargeYear?: number;
  accommodationType: AccommodationType;
  bedrooms: number;
  bathrooms: number;
  images: ListingImage[];
  location: ListingLocation;
  verification: Verification;
  scout: Scout;
  features: ListingFeature[];
  availability: ListingAvailability;
  rating?: number;
  reviewCount?: number;
  createdAt: string;
};

export type ListingSearchParams = {
  query?: string | undefined;
  universityId?: string | undefined;
  area?: string | undefined;
  minPrice?: number | undefined;
  maxPrice?: number | undefined;
  accommodationTypes?: AccommodationType[] | undefined;
  maxDistanceKm?: number | undefined;
  verifiedOnly?: boolean | undefined;
  sort?: ListingSort | undefined;
};

export type ListingSort = "recommended" | "price-asc" | "price-desc" | "distance" | "newest";

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};
