import { queryOptions, useQuery } from "@tanstack/react-query";
import { listingService } from "../services/listing.service";
import type { ListingSearchParams } from "@/types/listing";

export const listingKeys = {
  all: ["listings"] as const,
  search: (params: ListingSearchParams) => ["listings", "search", params] as const,
  detail: (id: string) => ["listings", "detail", id] as const,
  recommended: ["listings", "recommended"] as const,
  nearby: (universityId?: string) => ["listings", "nearby", universityId] as const,
  recent: ["listings", "recent"] as const,
  universities: ["universities"] as const,
};

export const listingSearchQuery = (params: ListingSearchParams) =>
  queryOptions({
    queryKey: listingKeys.search(params),
    queryFn: () => listingService.searchListings(params),
  });

export const listingDetailQuery = (id: string) =>
  queryOptions({
    queryKey: listingKeys.detail(id),
    queryFn: () => listingService.getListingById(id),
  });

export const recommendedListingsQuery = queryOptions({
  queryKey: listingKeys.recommended,
  queryFn: () => listingService.getRecommendedListings(),
});

export const nearbyListingsQuery = (universityId?: string) =>
  queryOptions({
    queryKey: listingKeys.nearby(universityId),
    queryFn: () => listingService.getNearbyListings(universityId),
  });

export const recentListingsQuery = queryOptions({
  queryKey: listingKeys.recent,
  queryFn: () => listingService.getRecentListings(),
});

export const universitiesQuery = queryOptions({
  queryKey: listingKeys.universities,
  queryFn: () => listingService.getUniversities(),
});

export const useListingSearch = (params: ListingSearchParams) =>
  useQuery(listingSearchQuery(params));
export const useListing = (id: string) => useQuery(listingDetailQuery(id));
export const useRecommendedListings = () => useQuery(recommendedListingsQuery);
export const useNearbyListings = (universityId?: string) =>
  useQuery(nearbyListingsQuery(universityId));
export const useRecentListings = () => useQuery(recentListingsQuery);
export const useUniversities = () => useQuery(universitiesQuery);
