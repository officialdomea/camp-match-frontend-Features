/**
 * Frontend DTO types for property management (Owner + Scout).
 * These mirror the JSON the API contract is expected to return — never a
 * database schema. The backend stays authoritative for status, verification,
 * permissions and analytics.
 */

import type { AccommodationType, PricePeriod } from "@/types/listing";

export type { AccommodationType, PricePeriod } from "@/types/listing";

export type PropertyStatus =
  | "draft"
  | "pending_review"
  | "active"
  | "unavailable"
  | "changes_requested"
  | "rejected"
  | "suspended";

export type AvailabilityStatus =
  "available" | "unavailable" | "reserved" | "under_review" | "temporarily_unavailable";

/** Backend-provided image review state. The frontend never computes this. */
export type ImageReviewStatus = "accepted" | "pending" | "review_required" | "rejected";

export type VerificationStepStatus =
  "not_started" | "submitted" | "pending" | "verified" | "changes_requested" | "rejected";

export type PropertyPhoto = {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  position: number;
  reviewStatus: ImageReviewStatus;
  reviewNote?: string | undefined;
};

export type PropertyLocation = {
  universityId: string;
  universityName: string;
  area: string;
  address: string;
  city: string;
  state: string;
  /** Resolved by the backend — the frontend only displays it. */
  distanceFromCampusKm?: number | undefined;
};

export type PropertyPricing = {
  rent: number;
  period: PricePeriod;
  serviceChargeYear?: number | undefined;
};

export type PropertyFeatures = {
  bedrooms: number;
  bathrooms: number;
  /** Feature ids from the API contract's feature catalogue. */
  amenities: string[];
};

export type PropertyAvailability = {
  status: AvailabilityStatus;
  availableFrom: string;
  unitsAvailable: number;
  note?: string | undefined;
};

export type PropertyPerformance = {
  views: number;
  saves: number;
  enquiries: number;
  bookingRequests: number;
  /** Backend-provided period label, e.g. "Last 30 days". */
  period: string;
};

export type PropertyVerification = {
  overall: VerificationStepStatus;
  steps: {
    id: "identity" | "ownership" | "property_review" | "images";
    label: string;
    status: VerificationStepStatus;
    note?: string | undefined;
  }[];
  lastUpdatedAt?: string | undefined;
};

export type PropertyOwnerSummary = {
  id: string;
  name: string;
  profileImageUrl?: string;
  verified: boolean;
  phoneMasked?: string | undefined;
};

/** What a scout may do on a property. Backend-driven — UX only. */
export type ScoutPermissions = {
  canEditProperty: boolean;
  canUpdateAvailability: boolean;
  canManagePhotos: boolean;
  canRespondToEnquiries: boolean;
  canViewBookings: boolean;
};

export type ScoutAssignment = {
  scoutId: string;
  scoutName: string;
  verified: boolean;
  relationship: "authorized_scout";
  status: "active" | "pending" | "revoked";
  authorizedAt: string;
  permissions: ScoutPermissions;
};

export type ActivityEvent = {
  id: string;
  type: "view" | "enquiry" | "update" | "status" | "photo" | "scout";
  title: string;
  description?: string | undefined;
  occurredAt: string;
};

export type ManagedProperty = {
  id: string;
  title: string;
  description: string;
  accommodationType: AccommodationType;
  status: PropertyStatus;
  owner: PropertyOwnerSummary;
  location: PropertyLocation;
  pricing: PropertyPricing;
  features: PropertyFeatures;
  photos: PropertyPhoto[];
  availability: PropertyAvailability;
  performance: PropertyPerformance;
  verification: PropertyVerification;
  scouts: ScoutAssignment[];
  activity: ActivityEvent[];
  createdAt: string;
  updatedAt: string;
};

/** A property as seen by a scout: same DTO plus their relationship to it. */
export type ScoutManagedProperty = ManagedProperty & {
  myRelationship: {
    relationship: "authorized_scout";
    status: ScoutAssignment["status"];
    permissions: ScoutPermissions;
  };
};

export type PropertyDraftInput = {
  title: string;
  description: string;
  accommodationType: AccommodationType;
  location: Omit<PropertyLocation, "distanceFromCampusKm" | "universityName" | "city" | "state"> & {
    universityName?: string | undefined;
    city?: string | undefined;
    state?: string | undefined;
  };
  pricing: PropertyPricing;
  features: PropertyFeatures;
  availability: Pick<PropertyAvailability, "availableFrom" | "unitsAvailable">;
  photos: { id: string; url: string; alt: string; isPrimary: boolean }[];
};

export type PropertyUpdateInput = Partial<
  Pick<ManagedProperty, "title" | "description" | "accommodationType"> & {
    location: Partial<PropertyLocation>;
    pricing: Partial<PropertyPricing>;
    features: Partial<PropertyFeatures>;
  }
>;

export type PropertyListParams = {
  query?: string | undefined;
  status?: PropertyStatus | "all" | undefined;
  sort?: "newest" | "oldest" | "price-asc" | "price-desc" | "views" | undefined;
};

export type OwnerDashboardSummary = {
  totalProperties: number;
  activeProperties: number;
  pendingVerification: number;
  needsAttention: number;
  bookingRequests: number;
  newEnquiries: number;
  recentActivity: ActivityEvent[];
};

export type ScoutDashboardSummary = {
  managedProperties: number;
  activeListings: number;
  pendingReview: number;
  newEnquiries: number;
  recentActivity: ActivityEvent[];
};

/** A scout record as an owner sees it in /owner/scouts. */
export type AuthorizedScout = {
  id: string;
  name: string;
  verified: boolean;
  email: string;
  phoneMasked: string;
  managedPropertyCount: number;
  status: "active" | "pending" | "revoked";
  authorizedAt: string;
  propertyIds: string[];
};

export type ScoutSearchResult = {
  id: string;
  name: string;
  verified: boolean;
  email: string;
  phoneMasked: string;
  coverageAreas: string[];
  alreadyAuthorized: boolean;
};

export type UploadedPhoto = {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  reviewStatus: ImageReviewStatus;
};
