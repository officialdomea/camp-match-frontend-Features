import { env } from "@/lib/env";
import { apiListingProvider } from "./listing.api-provider";
import { mockListingProvider } from "./listing.mock-provider";
import type { ListingProvider } from "./listing.provider";

const provider: ListingProvider = env.useMockData ? mockListingProvider : apiListingProvider;

export const listingService: ListingProvider = {
  searchListings: (params) => provider.searchListings(params),
  getListingById: (id) => provider.getListingById(id),
  getRecommendedListings: () => provider.getRecommendedListings(),
  getNearbyListings: (universityId) => provider.getNearbyListings(universityId),
  getRecentListings: () => provider.getRecentListings(),
  getUniversities: () => provider.getUniversities(),
};
