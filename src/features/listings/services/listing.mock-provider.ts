import { mockListings } from "@/data/mock/listings";
import { mockUniversities } from "@/data/mock/universities";
import type { Listing, ListingSearchParams, Paginated, University } from "@/types/listing";
import type { ListingProvider } from "./listing.provider";

/** Simulates network latency so loading states are exercised in development. */
function delay<T>(value: T, ms = 450): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function matches(listing: Listing, params: ListingSearchParams) {
  const {
    query,
    universityId,
    area,
    minPrice,
    maxPrice,
    accommodationTypes,
    maxDistanceKm,
    verifiedOnly,
  } = params;

  if (query) {
    const haystack = [
      listing.title,
      listing.location.area,
      listing.location.city,
      listing.location.universityName,
      listing.accommodationType,
    ]
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(query.trim().toLowerCase())) return false;
  }
  if (universityId && listing.location.universityId !== universityId) return false;
  if (area && listing.location.area !== area) return false;
  if (typeof minPrice === "number" && listing.price < minPrice) return false;
  if (typeof maxPrice === "number" && listing.price > maxPrice) return false;
  if (accommodationTypes?.length && !accommodationTypes.includes(listing.accommodationType))
    return false;
  if (typeof maxDistanceKm === "number" && listing.location.distanceFromCampusKm > maxDistanceKm)
    return false;
  if (verifiedOnly && !listing.verification.verified) return false;
  return true;
}

function sortListings(listings: Listing[], sort: ListingSearchParams["sort"]) {
  const copy = [...listings];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price);
    case "distance":
      return copy.sort((a, b) => a.location.distanceFromCampusKm - b.location.distanceFromCampusKm);
    case "newest":
      return copy.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    default:
      return copy.sort(
        (a, b) =>
          Number(b.verification.verified) - Number(a.verification.verified) ||
          (b.rating ?? 0) - (a.rating ?? 0),
      );
  }
}

export const mockListingProvider: ListingProvider = {
  async searchListings(params = {}): Promise<Paginated<Listing>> {
    const filtered = sortListings(
      mockListings.filter((listing) => matches(listing, params)),
      params.sort,
    );
    return delay({
      items: filtered,
      total: filtered.length,
      page: 1,
      pageSize: filtered.length,
    });
  },

  async getListingById(id: string): Promise<Listing> {
    const listing = mockListings.find((item) => item.id === id);
    if (!listing) throw new Error(`Listing ${id} was not found`);
    return delay(listing);
  },

  async getRecommendedListings(): Promise<Listing[]> {
    return delay(
      [...mockListings]
        .filter((listing) => listing.verification.verified)
        .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
        .slice(0, 6),
    );
  },

  async getNearbyListings(universityId?: string): Promise<Listing[]> {
    const scope = universityId
      ? mockListings.filter((l) => l.location.universityId === universityId)
      : mockListings;
    return delay(
      [...scope]
        .sort((a, b) => a.location.distanceFromCampusKm - b.location.distanceFromCampusKm)
        .slice(0, 6),
    );
  },

  async getRecentListings(): Promise<Listing[]> {
    return delay(
      [...mockListings]
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
        .slice(0, 6),
    );
  },

  async getUniversities(): Promise<University[]> {
    return delay(mockUniversities, 200);
  },
};
