import type { Listing, ListingSearchParams, Paginated, University } from "@/types/listing";

/**
 * The contract every data source must satisfy. Swapping mock data for the
 * FastAPI backend means swapping the provider — no UI component changes.
 */
export type ListingProvider = {
  searchListings(params?: ListingSearchParams): Promise<Paginated<Listing>>;
  getListingById(id: string): Promise<Listing>;
  getRecommendedListings(): Promise<Listing[]>;
  getNearbyListings(universityId?: string): Promise<Listing[]>;
  getRecentListings(): Promise<Listing[]>;
  getUniversities(): Promise<University[]>;
};
