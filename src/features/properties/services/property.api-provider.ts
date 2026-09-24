import { apiClient } from "@/lib/api/client";
import type {
  AuthorizedScout,
  ManagedProperty,
  OwnerDashboardSummary,
  PropertyAvailability,
  PropertyDraftInput,
  PropertyListParams,
  PropertyUpdateInput,
  PropertyVerification,
  ScoutDashboardSummary,
  ScoutManagedProperty,
  ScoutSearchResult,
  UploadedPhoto,
} from "@/types/property";
import type { PropertyProvider } from "./property.provider";

export const apiPropertyProvider: PropertyProvider = {
  getOwnerDashboard: () => apiClient.get<OwnerDashboardSummary>("/properties/owner/dashboard"),

  getOwnerProperties: (params?: PropertyListParams) =>
    apiClient.get<ManagedProperty[]>("/properties/owner", {
      query: {
        q: params?.query,
        status: params?.status,
        sort: params?.sort,
      },
    }),

  getProperty: (id: string) => apiClient.get<ManagedProperty>(`/properties/${id}`),

  createProperty: (input: PropertyDraftInput) =>
    apiClient.post<ManagedProperty>("/properties", { body: input }),

  updateProperty: (id: string, input: PropertyUpdateInput) =>
    apiClient.patch<ManagedProperty>(`/properties/${id}`, { body: input }),

  updateAvailability: (id: string, availability: Partial<PropertyAvailability>) =>
    apiClient.patch<ManagedProperty>(`/properties/${id}/availability`, { body: availability }),

  uploadImages: (id: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    return apiClient.post<UploadedPhoto[]>(`/properties/${id}/images`, {
      body: formData,
    });
  },

  deleteImage: (id: string, photoId: string) =>
    apiClient.delete<ManagedProperty>(`/properties/${id}/images/${photoId}`),

  setPrimaryImage: (id: string, photoId: string) =>
    apiClient.patch<ManagedProperty>(`/properties/${id}/images/${photoId}/primary`),

  reorderImages: (id: string, photoIds: string[]) =>
    apiClient.patch<ManagedProperty>(`/properties/${id}/images/reorder`, { body: { photoIds } }),

  getPropertyVerificationStatus: (id: string) =>
    apiClient.get<PropertyVerification>(`/properties/${id}/verification`),

  getAuthorizedScouts: () => apiClient.get<AuthorizedScout[]>("/properties/authorized-scouts"),

  searchScouts: (query: string) =>
    apiClient.get<ScoutSearchResult[]>("/scouts/search", {
      query: { q: query },
    }),

  authorizeScout: (scoutId: string, propertyIds: string[]) =>
    apiClient.post<AuthorizedScout>("/properties/scouts/authorize", {
      body: { scoutId, propertyIds },
    }),

  removeScout: (scoutId: string) => apiClient.delete<void>(`/properties/scouts/${scoutId}`),

  getScoutDashboard: () => apiClient.get<ScoutDashboardSummary>("/properties/scout/dashboard"),

  getManagedProperties: (params?: PropertyListParams) =>
    apiClient.get<ScoutManagedProperty[]>("/properties/managed", {
      query: {
        q: params?.query,
        status: params?.status,
        sort: params?.sort,
      },
    }),

  getManagedProperty: (id: string) =>
    apiClient.get<ScoutManagedProperty>(`/properties/managed/${id}`),
};
