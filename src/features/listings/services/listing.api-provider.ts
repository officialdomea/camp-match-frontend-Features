import { apiClient } from "@/lib/api/client";
import type { Listing, ListingSearchParams, Paginated, University } from "@/types/listing";
import type { ListingProvider } from "./listing.provider";

/**
 * Real backend implementation. Not active until VITE_USE_MOCK_DATA=false and
 * the FastAPI service is reachable.
 */
export const apiListingProvider: ListingProvider = {
  searchListings: (params: ListingSearchParams = {}) =>
    apiClient.get<Paginated<Listing>>("/listings", {
      query: {
        q: params.query,
        university_id: params.universityId,
        area: params.area,
        min_price: params.minPrice,
        max_price: params.maxPrice,
        accommodation_types: params.accommodationTypes?.join(","),
        max_distance_km: params.maxDistanceKm,
        verified_only: params.verifiedOnly,
        sort: params.sort,
      },
    }),

  getListingById: (id: string) => apiClient.get<Listing>(`/listings/${id}`),

  getRecommendedListings: () => apiClient.get<Listing[]>("/listings/recommended"),

  getNearbyListings: (universityId?: string) =>
    apiClient.get<Listing[]>("/listings/nearby", {
      query: { university_id: universityId },
    }),

  getRecentListings: () => apiClient.get<Listing[]>("/listings/recent"),

  getUniversities: () => apiClient.get<University[]>("/universities"),
};
