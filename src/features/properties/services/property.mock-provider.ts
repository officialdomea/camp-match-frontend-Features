import {
  mockAuthorizedScouts,
  mockManagedProperties,
  mockScoutDirectory,
} from "@/data/mock/managed-properties";
import { createAppError } from "@/lib/api/errors";
import type {
  ActivityEvent,
  AuthorizedScout,
  ManagedProperty,
  OwnerDashboardSummary,
  PropertyAvailability,
  PropertyDraftInput,
  PropertyListParams,
  PropertyUpdateInput,
  ScoutDashboardSummary,
  ScoutManagedProperty,
  ScoutSearchResult,
  UploadedPhoto,
} from "@/types/property";
import type { UserRole } from "@/types/auth";
import type { PropertyProvider } from "./property.provider";

function delay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

/** Temporary in-memory store standing in for the API. */
let store: ManagedProperty[] = clone(mockManagedProperties);
let scouts: AuthorizedScout[] = clone(mockAuthorizedScouts);

function find(id: string): ManagedProperty {
  const property = store.find((item) => item.id === id);
  if (!property) throw createAppError("NOT_FOUND");
  return property;
}

function touch(property: ManagedProperty, event: ActivityEvent) {
  property.updatedAt = new Date().toISOString();
  property.activity = [event, ...property.activity];
}

function event(type: ActivityEvent["type"], title: string, description?: string): ActivityEvent {
  return {
    id: `act_${Math.random().toString(36).slice(2, 9)}`,
    type,
    title,
    ...(description ? { description } : {}),
    occurredAt: new Date().toISOString(),
  };
}

function applyParams<T extends ManagedProperty>(items: T[], params: PropertyListParams = {}) {
  const { query, status, sort } = params;
  let result = [...items];
  if (query?.trim()) {
    const needle = query.trim().toLowerCase();
    result = result.filter((item) =>
      [item.title, item.location.area, item.location.city, item.location.universityName]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }
  if (status && status !== "all") {
    result = result.filter((item) => item.status === status);
  }
  switch (sort) {
    case "oldest":
      return result.sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
    case "price-asc":
      return result.sort((a, b) => a.pricing.rent - b.pricing.rent);
    case "price-desc":
      return result.sort((a, b) => b.pricing.rent - a.pricing.rent);
    case "views":
      return result.sort((a, b) => b.performance.views - a.performance.views);
    default:
      return result.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  }
}

type PropertyActor = { id: string; role: UserRole };

function currentActor(): PropertyActor | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem("campmatch.session");
    if (!raw) return null;
    const session = JSON.parse(raw) as { user?: { id?: string; role?: UserRole | null } };
    const user = session.user;
    if (!user?.id || !user.role) return null;
    return { id: user.id, role: user.role };
  } catch {
    return null;
  }
}

function requireActor(role: UserRole): PropertyActor {
  const actor = currentActor();
  if (!actor) throw createAppError("AUTHENTICATION_ERROR");
  if (actor.role !== role) throw createAppError("FORBIDDEN");
  return actor;
}

function toScoutProperty(property: ManagedProperty, scoutId: string): ScoutManagedProperty | null {
  const assignment = property.scouts.find(
    (item) => item.scoutId === scoutId && item.status === "active",
  );
  if (!assignment) return null;
  return {
    ...property,
    myRelationship: {
      relationship: assignment.relationship,
      status: assignment.status,
      permissions: assignment.permissions,
    },
  };
}

export const mockPropertyProvider: PropertyProvider = {
  async getOwnerDashboard(): Promise<OwnerDashboardSummary> {
    const actor = requireActor("owner");
    const ownedProperties = store.filter((property) => property.owner.id === actor.id);
    const recentActivity = ownedProperties
      .flatMap((property) =>
        property.activity.slice(0, 2).map((item) => ({
          ...item,
          id: `${property.id}_${item.id}`,
          description: item.description ?? property.title,
        })),
      )
      .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt))
      .slice(0, 6);

    return delay({
      totalProperties: ownedProperties.length,
      activeProperties: ownedProperties.filter((p) => p.status === "active").length,
      pendingVerification: ownedProperties.filter((p) => p.verification.overall === "pending")
        .length,
      needsAttention: ownedProperties.filter((p) =>
        ["changes_requested", "rejected", "suspended"].includes(p.status),
      ).length,
      bookingRequests: ownedProperties.reduce((sum, p) => sum + p.performance.bookingRequests, 0),
      newEnquiries: ownedProperties.reduce((sum, p) => sum + p.performance.enquiries, 0),
      recentActivity,
    });
  },

  async getOwnerProperties(params) {
    const actor = requireActor("owner");
    const ownedProperties = store.filter((property) => property.owner.id === actor.id);
    return delay(clone(applyParams(ownedProperties, params)));
  },

  async getProperty(id) {
    return delay(clone(find(id)));
  },

  async createProperty(input: PropertyDraftInput, ownerId) {
    const actor = requireActor("owner");
    if (ownerId && ownerId !== actor.id) throw createAppError("FORBIDDEN");
    const now = new Date().toISOString();
    const property: ManagedProperty = {
      id: `prop_${Math.random().toString(36).slice(2, 8)}`,
      title: input.title,
      description: input.description,
      accommodationType: input.accommodationType,
      status: "pending_review",
      owner: {
        ...(store[0]?.owner ?? { id: "usr_demo_owner", name: "You", verified: true }),
        id: actor.id,
      },
      location: {
        universityId: input.location.universityId,
        universityName: input.location.universityName ?? "",
        area: input.location.area,
        address: input.location.address,
        city: input.location.city ?? "",
        state: input.location.state ?? "",
      },
      pricing: input.pricing,
      features: input.features,
      photos: input.photos.map((photo, index) => ({
        ...photo,
        position: index,
        isPrimary: photo.isPrimary || index === 0,
        reviewStatus: "pending",
      })),
      availability: {
        status: "under_review",
        availableFrom: input.availability.availableFrom,
        unitsAvailable: input.availability.unitsAvailable,
      },
      performance: { views: 0, saves: 0, enquiries: 0, bookingRequests: 0, period: "Last 30 days" },
      verification: {
        overall: "submitted",
        lastUpdatedAt: now,
        steps: [
          { id: "identity", label: "Owner identity", status: "verified" },
          { id: "ownership", label: "Proof of ownership", status: "submitted" },
          { id: "property_review", label: "Property review", status: "pending" },
          { id: "images", label: "Image review", status: "pending" },
        ],
      },
      scouts: [],
      activity: [event("status", "Submitted for review", "Awaiting Camp Match verification")],
      createdAt: now,
      updatedAt: now,
    };
    store = [property, ...store];
    return delay(clone(property), 700);
  },

  async updateProperty(id, input: PropertyUpdateInput) {
    const property = find(id);
    if (input.title !== undefined) property.title = input.title;
    if (input.description !== undefined) property.description = input.description;
    if (input.accommodationType) property.accommodationType = input.accommodationType;
    if (input.location) property.location = { ...property.location, ...input.location };
    if (input.pricing) property.pricing = { ...property.pricing, ...input.pricing };
    if (input.features) property.features = { ...property.features, ...input.features };
    touch(property, event("update", "Property information updated"));
    return delay(clone(property), 650);
  },

  async updateAvailability(id, availability: Partial<PropertyAvailability>) {
    const property = find(id);
    property.availability = { ...property.availability, ...availability };
    touch(property, event("update", "Availability updated", property.availability.status));
    return delay(clone(property), 550);
  },

  async uploadImages(id, files: File[]) {
    const property = find(id);
    // Mock-only preview references; the API provider returns durable object-storage references.
    const uploaded: UploadedPhoto[] = files.map((file, index) => ({
      id: `ph_${Math.random().toString(36).slice(2, 9)}`,
      url: URL.createObjectURL(file),
      alt: file.name.replace(/\.[^.]+$/, ""),
      isPrimary: property.photos.length === 0 && index === 0,
      reviewStatus: "pending" as const,
    }));
    property.photos = [
      ...property.photos,
      ...uploaded.map((photo, index) => ({
        ...photo,
        position: property.photos.length + index,
      })),
    ];
    touch(property, event("photo", `${files.length} photo(s) uploaded`));
    return delay(uploaded, 900);
  },

  async deleteImage(id, photoId) {
    const property = find(id);
    property.photos = property.photos
      .filter((photo) => photo.id !== photoId)
      .map((photo, index) => ({ ...photo, position: index }));
    if (property.photos.length && !property.photos.some((photo) => photo.isPrimary)) {
      property.photos[0]!.isPrimary = true;
    }
    touch(property, event("photo", "Photo removed"));
    return delay(clone(property), 400);
  },

  async setPrimaryImage(id, photoId) {
    const property = find(id);
    property.photos = property.photos.map((photo) => ({
      ...photo,
      isPrimary: photo.id === photoId,
    }));
    touch(property, event("photo", "Primary photo changed"));
    return delay(clone(property), 350);
  },

  async reorderImages(id, photoIds) {
    const property = find(id);
    const byId = new Map(property.photos.map((photo) => [photo.id, photo]));
    property.photos = photoIds
      .map((photoId, index) => {
        const photo = byId.get(photoId);
        return photo ? { ...photo, position: index } : null;
      })
      .filter((photo): photo is NonNullable<typeof photo> => photo !== null);
    touch(property, event("photo", "Photos reordered"));
    return delay(clone(property), 350);
  },

  async getPropertyVerificationStatus(id) {
    return delay(clone(find(id).verification));
  },

  async getAuthorizedScouts() {
    return delay(clone(scouts));
  },

  async searchScouts(query: string): Promise<ScoutSearchResult[]> {
    const needle = query.trim().toLowerCase();
    if (!needle) return delay([]);
    const results = mockScoutDirectory
      .filter((scout) =>
        [scout.name, scout.email, scout.phoneMasked, scout.id]
          .join(" ")
          .toLowerCase()
          .includes(needle),
      )
      .map((scout) => ({
        ...scout,
        alreadyAuthorized: scouts.some((item) => item.id === scout.id),
      }));
    return delay(results, 600);
  },

  async authorizeScout(scoutId, propertyIds, ownerId) {
    const match = mockScoutDirectory.find((scout) => scout.id === scoutId);
    if (!match) throw createAppError("NOT_FOUND");
    if (scouts.some((scout) => scout.id === scoutId)) throw createAppError("CONFLICT");
    if (
      propertyIds.some((propertyId) => {
        const property = store.find((item) => item.id === propertyId);
        return !property || (ownerId && property.owner.id !== ownerId);
      })
    ) {
      throw createAppError("FORBIDDEN");
    }
    const authorized: AuthorizedScout = {
      id: match.id,
      name: match.name,
      verified: match.verified,
      email: match.email,
      phoneMasked: match.phoneMasked,
      managedPropertyCount: propertyIds.length,
      status: "pending",
      authorizedAt: new Date().toISOString(),
      propertyIds,
    };
    scouts = [authorized, ...scouts];
    for (const property of store) {
      if (!propertyIds.includes(property.id)) continue;
      property.scouts = [
        ...property.scouts,
        {
          scoutId,
          scoutName: match.name,
          verified: match.verified,
          relationship: "authorized_scout",
          status: "pending",
          authorizedAt: authorized.authorizedAt,
          permissions: {
            canEditProperty: false,
            canUpdateAvailability: false,
            canManagePhotos: false,
            canRespondToEnquiries: false,
            canViewBookings: false,
          },
        },
      ];
    }
    return delay(clone(authorized), 700);
  },

  async removeScout(scoutId, propertyIds = []) {
    const scopedPropertyIds = new Set(propertyIds);
    for (const property of store) {
      if (scopedPropertyIds.has(property.id)) {
        property.scouts = property.scouts.filter((item) => item.scoutId !== scoutId);
      }
    }
    scouts = scouts
      .map((scout) =>
        scout.id === scoutId
          ? {
              ...scout,
              propertyIds: scout.propertyIds.filter(
                (propertyId) => !scopedPropertyIds.has(propertyId),
              ),
              managedPropertyCount: scout.propertyIds.filter(
                (propertyId) => !scopedPropertyIds.has(propertyId),
              ).length,
            }
          : scout,
      )
      .filter((scout) => scout.propertyIds.length > 0);
    return delay(undefined, 500);
  },

  async getScoutDashboard(): Promise<ScoutDashboardSummary> {
    const actor = requireActor("scout");
    const managed = store
      .map((property) => toScoutProperty(property, actor.id))
      .filter((item): item is ScoutManagedProperty => item !== null);
    return delay({
      managedProperties: managed.length,
      activeListings: managed.filter((item) => item.status === "active").length,
      pendingReview: managed.filter((item) => item.status === "pending_review").length,
      newEnquiries: managed.reduce((sum, item) => sum + item.performance.enquiries, 0),
      recentActivity: managed
        .flatMap((property) =>
          property.activity.slice(0, 2).map((item) => ({
            ...item,
            id: `${property.id}_${item.id}`,
            description: item.description ?? property.title,
          })),
        )
        .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt))
        .slice(0, 6),
    });
  },

  async getManagedProperties(params) {
    const actor = requireActor("scout");
    const managed = store
      .map((property) => toScoutProperty(property, actor.id))
      .filter((item): item is ScoutManagedProperty => item !== null);
    return delay(clone(applyParams(managed, params)));
  },

  async getManagedProperty(id) {
    const actor = requireActor("scout");
    const managed = toScoutProperty(find(id), actor.id);
    if (!managed) throw createAppError("FORBIDDEN");
    return delay(clone(managed));
  },
};
