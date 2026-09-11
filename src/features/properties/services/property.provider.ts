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

/**
 * The contract every property-management data source must satisfy. Swapping
 * mock data for the real API means swapping the provider — no UI changes.
 * These names are conceptual and do NOT mirror backend endpoint names.
 */
export type PropertyProvider = {
  getOwnerDashboard(): Promise<OwnerDashboardSummary>;
  getOwnerProperties(params?: PropertyListParams): Promise<ManagedProperty[]>;
  getProperty(id: string): Promise<ManagedProperty>;
  createProperty(input: PropertyDraftInput): Promise<ManagedProperty>;
  updateProperty(id: string, input: PropertyUpdateInput): Promise<ManagedProperty>;
  updateAvailability(
    id: string,
    availability: Partial<PropertyAvailability>,
  ): Promise<ManagedProperty>;
  uploadImages(id: string, files: File[]): Promise<UploadedPhoto[]>;
  deleteImage(id: string, photoId: string): Promise<ManagedProperty>;
  setPrimaryImage(id: string, photoId: string): Promise<ManagedProperty>;
  reorderImages(id: string, photoIds: string[]): Promise<ManagedProperty>;
  getPropertyVerificationStatus(id: string): Promise<PropertyVerification>;

  getAuthorizedScouts(): Promise<AuthorizedScout[]>;
  searchScouts(query: string): Promise<ScoutSearchResult[]>;
  authorizeScout(scoutId: string, propertyIds: string[]): Promise<AuthorizedScout>;
  removeScout(scoutId: string): Promise<void>;

  getScoutDashboard(): Promise<ScoutDashboardSummary>;
  getManagedProperties(params?: PropertyListParams): Promise<ScoutManagedProperty[]>;
  getManagedProperty(id: string): Promise<ScoutManagedProperty>;
};
