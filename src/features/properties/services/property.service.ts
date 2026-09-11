import { env } from "@/lib/env";
import { apiPropertyProvider } from "./property.api-provider";
import { mockPropertyProvider } from "./property.mock-provider";
import type { PropertyProvider } from "./property.provider";

const provider: PropertyProvider = env.useMockData ? mockPropertyProvider : apiPropertyProvider;

export const propertyService: PropertyProvider = {
  getOwnerDashboard: () => provider.getOwnerDashboard(),
  getOwnerProperties: (params) => provider.getOwnerProperties(params),
  getProperty: (id) => provider.getProperty(id),
  createProperty: (input) => provider.createProperty(input),
  updateProperty: (id, input) => provider.updateProperty(id, input),
  updateAvailability: (id, availability) => provider.updateAvailability(id, availability),
  uploadImages: (id, files) => provider.uploadImages(id, files),
  deleteImage: (id, photoId) => provider.deleteImage(id, photoId),
  setPrimaryImage: (id, photoId) => provider.setPrimaryImage(id, photoId),
  reorderImages: (id, photoIds) => provider.reorderImages(id, photoIds),
  getPropertyVerificationStatus: (id) => provider.getPropertyVerificationStatus(id),
  getAuthorizedScouts: () => provider.getAuthorizedScouts(),
  searchScouts: (query) => provider.searchScouts(query),
  authorizeScout: (scoutId, propertyIds) => provider.authorizeScout(scoutId, propertyIds),
  removeScout: (scoutId) => provider.removeScout(scoutId),
  getScoutDashboard: () => provider.getScoutDashboard(),
  getManagedProperties: (params) => provider.getManagedProperties(params),
  getManagedProperty: (id) => provider.getManagedProperty(id),
};
