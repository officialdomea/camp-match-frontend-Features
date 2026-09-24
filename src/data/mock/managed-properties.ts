import type {
  ActivityEvent,
  AuthorizedScout,
  ManagedProperty,
  PropertyPhoto,
  PropertyVerification,
  ScoutAssignment,
  ScoutPermissions,
  ScoutSearchResult,
  VerificationStepStatus,
} from "@/types/property";

import listing1 from "@/assets/listing-1.jpg";
import listing2 from "@/assets/listing-2.jpg";
import listing3 from "@/assets/listing-3.jpg";
import listing4 from "@/assets/listing-4.jpg";
import listing5 from "@/assets/listing-5.jpg";
import listing6 from "@/assets/listing-6.jpg";

/** DEMO DATA — a temporary implementation of the API contract. */

export const DEMO_OWNER = {
  id: "usr_demo_owner",
  name: "John Adeyemi",
  verified: true,
  phoneMasked: "+234 80** *** *214",
};

const photo = (
  id: string,
  url: string,
  alt: string,
  position: number,
  reviewStatus: PropertyPhoto["reviewStatus"] = "accepted",
): PropertyPhoto => ({
  id,
  url,
  alt,
  isPrimary: position === 0,
  position,
  reviewStatus,
});

const fullPermissions: ScoutPermissions = {
  canEditProperty: true,
  canUpdateAvailability: true,
  canManagePhotos: true,
  canRespondToEnquiries: true,
  canViewBookings: true,
};

const limitedPermissions: ScoutPermissions = {
  canEditProperty: false,
  canUpdateAvailability: true,
  canManagePhotos: false,
  canRespondToEnquiries: true,
  canViewBookings: false,
};

const verification = (
  overall: VerificationStepStatus,
  steps: Partial<Record<PropertyVerification["steps"][number]["id"], VerificationStepStatus>> = {},
): PropertyVerification => ({
  overall,
  lastUpdatedAt: "2026-08-28T09:00:00Z",
  steps: [
    { id: "identity", label: "Owner identity", status: steps.identity ?? "verified" },
    { id: "ownership", label: "Proof of ownership", status: steps.ownership ?? "verified" },
    {
      id: "property_review",
      label: "Property review",
      status: steps.property_review ?? overall,
      note:
        (steps.property_review ?? overall) === "pending"
          ? "A Camp Match scout visit is being scheduled."
          : undefined,
    },
    { id: "images", label: "Image review", status: steps.images ?? "verified" },
  ],
});

const activity = (items: [ActivityEvent["type"], string, string, string][]): ActivityEvent[] =>
  items.map(([type, title, description, occurredAt], index) => ({
    id: `act_${index}`,
    type,
    title,
    description,
    occurredAt,
  }));

const scoutAssignment = (
  scoutId: string,
  scoutName: string,
  verified: boolean,
  status: ScoutAssignment["status"],
  permissions: ScoutPermissions,
  authorizedAt: string,
): ScoutAssignment => ({
  scoutId,
  scoutName,
  verified,
  relationship: "authorized_scout",
  status,
  authorizedAt,
  permissions,
});

export const mockManagedProperties: ManagedProperty[] = [
  {
    id: "prop_001",
    title: "Modern self-contained apartment at Satellite Town",
    description:
      "A freshly painted self-contained apartment five minutes from the UNICAL main gate, with a private kitchenette, prepaid meter and gated compound.",
    accommodationType: "self-contained",
    status: "active",
    owner: DEMO_OWNER,
    location: {
      universityId: "uni_unical",
      universityName: "University of Calabar",
      area: "Satellite Town",
      address: "14 Ekpo Abasi Close, Satellite Town",
      city: "Calabar",
      state: "Cross River",
      distanceFromCampusKm: 1.2,
    },
    pricing: { rent: 450000, period: "year", serviceChargeYear: 35000 },
    features: {
      bedrooms: 1,
      bathrooms: 1,
      amenities: ["water", "prepaid-meter", "kitchen", "security", "tiled"],
    },
    photos: [
      photo("ph1", listing1, "Bedroom area with study desk", 0),
      photo("ph2", listing5, "Private kitchenette", 1),
      photo("ph3", listing6, "Private bathroom", 2),
    ],
    availability: { status: "available", availableFrom: "2026-09-15", unitsAvailable: 3 },
    performance: {
      views: 1240,
      saves: 86,
      enquiries: 24,
      bookingRequests: 6,
      period: "Last 30 days",
    },
    verification: verification("verified"),
    scouts: [
      scoutAssignment(
        "scout_001",
        "Emmanuel Etim",
        true,
        "active",
        fullPermissions,
        "2026-07-02T09:00:00Z",
      ),
    ],
    activity: activity([
      [
        "view",
        "Property viewed 24 times",
        "Students who searched near UNICAL",
        "2026-09-07T06:00:00Z",
      ],
      ["enquiry", "New enquiry received", "From a 200-level student", "2026-09-06T14:20:00Z"],
      ["update", "Property information updated", "Pricing and description", "2026-08-28T10:05:00Z"],
      ["status", "Property approved", "Listing is now live", "2026-08-25T08:00:00Z"],
    ]),
    createdAt: "2026-07-01T08:30:00Z",
    updatedAt: "2026-08-28T10:05:00Z",
  },
  {
    id: "prop_002",
    title: "Two-bedroom shared flat at Ekosodin",
    description:
      "Spacious two-bedroom flat for coursemates splitting rent. Tiled throughout with a balcony and evening generator.",
    accommodationType: "two-bedroom",
    status: "pending_review",
    owner: DEMO_OWNER,
    location: {
      universityId: "uni_uniben",
      universityName: "University of Benin",
      area: "Ekosodin",
      address: "7 Ekosodin Road, Ugbowo",
      city: "Benin City",
      state: "Edo",
      distanceFromCampusKm: 1.9,
    },
    pricing: { rent: 900000, period: "year", serviceChargeYear: 60000 },
    features: {
      bedrooms: 2,
      bathrooms: 2,
      amenities: ["generator", "water", "prepaid-meter", "kitchen", "parking", "furnished"],
    },
    photos: [
      photo("ph1", listing4, "Furnished living room", 0),
      photo("ph2", listing1, "Bedroom with wardrobe", 1, "pending"),
    ],
    availability: { status: "under_review", availableFrom: "2026-10-01", unitsAvailable: 2 },
    performance: {
      views: 312,
      saves: 21,
      enquiries: 4,
      bookingRequests: 0,
      period: "Last 30 days",
    },
    verification: verification("pending", { property_review: "pending", images: "pending" }),
    scouts: [
      scoutAssignment(
        "scout_002",
        "Aisha Bello",
        true,
        "active",
        limitedPermissions,
        "2026-08-14T09:00:00Z",
      ),
    ],
    activity: activity([
      [
        "status",
        "Submitted for review",
        "Awaiting Camp Match verification",
        "2026-08-30T09:00:00Z",
      ],
      ["photo", "3 photos uploaded", "Living room, bedroom, kitchen", "2026-08-30T08:40:00Z"],
    ]),
    createdAt: "2026-08-30T08:00:00Z",
    updatedAt: "2026-08-30T09:00:00Z",
  },
  {
    id: "prop_003",
    title: "Quiet single room in a student-only compound",
    description:
      "Affordable single room in a compound occupied entirely by students, with a cleaning rota for shared spaces.",
    accommodationType: "single-room",
    status: "changes_requested",
    owner: DEMO_OWNER,
    location: {
      universityId: "uni_unical",
      universityName: "University of Calabar",
      area: "Etta Agbor",
      address: "22 Etta Agbor Road",
      city: "Calabar",
      state: "Cross River",
      distanceFromCampusKm: 0.8,
    },
    pricing: { rent: 180000, period: "year" },
    features: { bedrooms: 1, bathrooms: 0, amenities: ["water", "security", "tiled"] },
    photos: [photo("ph1", listing3, "Single room with bed and desk", 0, "review_required")],
    availability: {
      status: "temporarily_unavailable",
      availableFrom: "2026-09-20",
      unitsAvailable: 1,
    },
    performance: { views: 148, saves: 9, enquiries: 2, bookingRequests: 0, period: "Last 30 days" },
    verification: verification("changes_requested", {
      property_review: "changes_requested",
      images: "changes_requested",
    }),
    scouts: [],
    activity: activity([
      [
        "status",
        "Changes requested",
        "Clearer photos of the shared bathroom",
        "2026-09-01T11:00:00Z",
      ],
      ["update", "Property information updated", "Description", "2026-08-27T16:30:00Z"],
    ]),
    createdAt: "2026-08-20T10:00:00Z",
    updatedAt: "2026-09-01T11:00:00Z",
  },
  {
    id: "prop_004",
    title: "Renovated self-contained at Marian Road",
    description:
      "Renovated self-contained unit on a tarred street with new tiles, fresh paint and a treated water tank.",
    accommodationType: "self-contained",
    status: "active",
    owner: DEMO_OWNER,
    location: {
      universityId: "uni_unical",
      universityName: "University of Calabar",
      area: "Marian Road",
      address: "5 Marian Road",
      city: "Calabar",
      state: "Cross River",
      distanceFromCampusKm: 3.4,
    },
    pricing: { rent: 520000, period: "year" },
    features: {
      bedrooms: 1,
      bathrooms: 1,
      amenities: ["water", "prepaid-meter", "kitchen", "tiled", "wardrobe"],
    },
    photos: [
      photo("ph1", listing2, "Street view of the building", 0),
      photo("ph2", listing6, "New bathroom", 1),
    ],
    availability: { status: "reserved", availableFrom: "2026-09-25", unitsAvailable: 0 },
    performance: {
      views: 890,
      saves: 54,
      enquiries: 15,
      bookingRequests: 4,
      period: "Last 30 days",
    },
    verification: verification("verified"),
    scouts: [
      scoutAssignment(
        "scout_001",
        "Emmanuel Etim",
        true,
        "active",
        fullPermissions,
        "2026-07-20T09:00:00Z",
      ),
    ],
    activity: activity([
      [
        "enquiry",
        "New enquiry received",
        "Asking about rent payment inside Camp Match",
        "2026-09-05T09:10:00Z",
      ],
      ["status", "Marked as reserved", "Awaiting tenant confirmation", "2026-09-02T12:00:00Z"],
    ]),
    createdAt: "2026-06-15T09:00:00Z",
    updatedAt: "2026-09-02T12:00:00Z",
  },
  {
    id: "prop_005",
    title: "Newly built one-bedroom at Odenigwe",
    description:
      "Brand new one-bedroom flat with a separate sitting room, fitted kitchen and prepaid meter in a gated estate.",
    accommodationType: "one-bedroom",
    status: "draft",
    owner: DEMO_OWNER,
    location: {
      universityId: "uni_unn",
      universityName: "University of Nigeria, Nsukka",
      area: "Odenigwe",
      address: "3 Odenigwe Estate Road",
      city: "Nsukka",
      state: "Enugu",
    },
    pricing: { rent: 700000, period: "year" },
    features: { bedrooms: 1, bathrooms: 1, amenities: ["water", "prepaid-meter", "security"] },
    photos: [photo("ph1", listing4, "Sitting room", 0, "pending")],
    availability: { status: "unavailable", availableFrom: "2026-10-05", unitsAvailable: 1 },
    performance: { views: 0, saves: 0, enquiries: 0, bookingRequests: 0, period: "Last 30 days" },
    verification: verification("not_started", {
      identity: "verified",
      ownership: "not_started",
      property_review: "not_started",
      images: "not_started",
    }),
    scouts: [],
    activity: activity([["update", "Draft created", "Not yet submitted", "2026-09-04T07:30:00Z"]]),
    createdAt: "2026-09-04T07:30:00Z",
    updatedAt: "2026-09-04T07:30:00Z",
  },
  {
    id: "prop_006",
    title: "Shared apartment for three at Akoka",
    description:
      "Three-share apartment a ten-minute walk from the UNILAG second gate. Each tenant gets a lockable room.",
    accommodationType: "shared-apartment",
    status: "suspended",
    owner: DEMO_OWNER,
    location: {
      universityId: "uni_unilag",
      universityName: "University of Lagos",
      area: "Akoka",
      address: "18 Akoka Street",
      city: "Lagos",
      state: "Lagos",
      distanceFromCampusKm: 1.1,
    },
    pricing: { rent: 620000, period: "year", serviceChargeYear: 80000 },
    features: {
      bedrooms: 3,
      bathrooms: 2,
      amenities: ["generator", "water", "internet", "furnished", "security"],
    },
    photos: [photo("ph1", listing4, "Shared living room", 0, "rejected")],
    availability: { status: "unavailable", availableFrom: "2026-09-10", unitsAvailable: 0 },
    performance: {
      views: 402,
      saves: 18,
      enquiries: 3,
      bookingRequests: 1,
      period: "Last 30 days",
    },
    verification: verification("rejected", { property_review: "rejected", images: "rejected" }),
    scouts: [
      scoutAssignment(
        "scout_004",
        "Tolu Adeyemi",
        false,
        "pending",
        limitedPermissions,
        "2026-08-29T09:00:00Z",
      ),
    ],
    activity: activity([
      [
        "status",
        "Listing suspended",
        "Photos did not match the scout visit",
        "2026-09-03T15:00:00Z",
      ],
    ]),
    createdAt: "2026-08-01T09:00:00Z",
    updatedAt: "2026-09-03T15:00:00Z",
  },
];

export const mockAuthorizedScouts: AuthorizedScout[] = [
  {
    id: "scout_001",
    name: "Emmanuel Etim",
    verified: true,
    email: "emmanuel.etim@campmatch.ng",
    phoneMasked: "+234 80** *** *412",
    managedPropertyCount: 2,
    status: "active",
    authorizedAt: "2026-07-02T09:00:00Z",
    propertyIds: ["prop_001", "prop_004"],
  },
  {
    id: "scout_002",
    name: "Aisha Bello",
    verified: true,
    email: "aisha.bello@campmatch.ng",
    phoneMasked: "+234 70** *** *807",
    managedPropertyCount: 1,
    status: "active",
    authorizedAt: "2026-08-14T09:00:00Z",
    propertyIds: ["prop_002"],
  },
  {
    id: "scout_004",
    name: "Tolu Adeyemi",
    verified: false,
    email: "tolu.adeyemi@campmatch.ng",
    phoneMasked: "+234 90** *** *551",
    managedPropertyCount: 1,
    status: "pending",
    authorizedAt: "2026-08-29T09:00:00Z",
    propertyIds: ["prop_006"],
  },
];

export const mockScoutDirectory: ScoutSearchResult[] = [
  {
    id: "scout_003",
    name: "Chidi Okonkwo",
    verified: true,
    email: "chidi.okonkwo@campmatch.ng",
    phoneMasked: "+234 81** *** *233",
    coverageAreas: ["Nsukka", "Odenigwe"],
    alreadyAuthorized: false,
  },
  {
    id: "scout_005",
    name: "Sarah Williams",
    verified: true,
    email: "sarah.williams@campmatch.ng",
    phoneMasked: "+234 80** *** *990",
    coverageAreas: ["Calabar", "Satellite Town"],
    alreadyAuthorized: false,
  },
  {
    id: "scout_001",
    name: "Emmanuel Etim",
    verified: true,
    email: "emmanuel.etim@campmatch.ng",
    phoneMasked: "+234 80** *** *412",
    coverageAreas: ["Etta Agbor", "Satellite Town"],
    alreadyAuthorized: true,
  },
];

/** The scout signed in on the demo account. */
export const DEMO_SCOUT_ID = "scout_001";
