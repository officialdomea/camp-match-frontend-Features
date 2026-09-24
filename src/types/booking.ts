import type { PricePeriod } from "@/types/listing";

export type BookingStatus =
  "pending" | "approved" | "rejected" | "cancelled" | "confirmed" | "expired";

export type TransactionLifecycle =
  | "not_available"
  | "payment_not_eligible"
  | "ready_for_backend_initialization"
  | "initialization_pending"
  | "awaiting_provider_confirmation"
  | "confirmed_by_backend"
  | "failed"
  | "cancelled";

export type PaymentStatus =
  | "not_started"
  | "initializing"
  | "processing"
  | "awaiting_verification"
  | "succeeded"
  | "failed"
  | "cancelled"
  | "refunded";

export type EscrowStatus =
  "not_started" | "funding" | "held" | "release_pending" | "released" | "refunded" | "disputed";

export type PropertyBooking = {
  id: string;
  propertyId: string;
  propertyTitle: string;
  studentId: string;
  ownerId?: string;
  scoutId?: string;
  status: BookingStatus;
  requestedFrom: string;
  amount: number;
  currency: "NGN";
  pricePeriod: PricePeriod;
  paymentStatus: PaymentStatus;
  escrowStatus: EscrowStatus;
  transactionLifecycle: TransactionLifecycle;
  createdAt: string;
  updatedAt: string;
  reason?: string;
};

export type CreateBookingRequest = {
  propertyId: string;
  propertyTitle: string;
  studentId: string;
  requestedFrom: string;
  amount: number;
  currency: "NGN";
  pricePeriod: PricePeriod;
  availableUnits: number;
  availabilityStatus: "available" | "limited" | "taken";
};

export type PaymentTransaction = {
  id: string;
  bookingId: string;
  amount: number;
  currency: "NGN";
  status: PaymentStatus;
  providerReference?: string;
  createdAt: string;
  updatedAt: string;
};

export type EscrowTransaction = {
  id: string;
  bookingId: string;
  transactionId?: string;
  amount: number;
  currency: "NGN";
  status: EscrowStatus;
  releaseStatus: "not_started" | "pending" | "released";
  refundStatus: "not_started" | "pending" | "refunded";
  disputeStatus: "none" | "open" | "resolved";
  createdAt: string;
  updatedAt: string;
};

export type PaymentAvailability = "UNAVAILABLE" | "BACKEND_REQUIRED" | "READY_FOR_INITIALIZATION";

export type InitializeRentPaymentRequest = {
  bookingId: string;
  studentId: string;
  currency: "NGN";
  idempotencyKey?: string;
};

export type PaymentInitializationResult = {
  availability: PaymentAvailability;
  bookingId: string;
  transaction: PaymentTransaction | null;
  message: string;
};
