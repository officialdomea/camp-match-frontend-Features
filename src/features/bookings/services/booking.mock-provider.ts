import { createAppError } from "@/lib/api/errors";
import { DEMO_SCOUT_ID, mockManagedProperties } from "@/data/mock/managed-properties";
import type {
  CreateBookingRequest,
  EscrowTransaction,
  InitializeRentPaymentRequest,
  PaymentTransaction,
  PaymentInitializationResult,
  PropertyBooking,
} from "@/types/booking";
import type { Session } from "@/types/auth";
import type { BookingProvider } from "./booking.provider";

const STORAGE_KEY = "campmatch.booking-requests";
const SESSION_KEY = "campmatch.session";
const fallbackStore = new Map<string, string>();

function storage(): Storage {
  if (typeof window !== "undefined" && window.localStorage) return window.localStorage;
  return {
    getItem: (key) => fallbackStore.get(key) ?? null,
    setItem: (key, value) => void fallbackStore.set(key, value),
    removeItem: (key) => void fallbackStore.delete(key),
    clear: () => void fallbackStore.clear(),
    key: () => null,
    length: fallbackStore.size,
  };
}

function currentSession(): Session | null {
  try {
    const raw = storage().getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function readBookings(): PropertyBooking[] {
  try {
    const raw = storage().getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PropertyBooking[]) : [];
  } catch {
    return [];
  }
}

function writeBookings(bookings: PropertyBooking[]) {
  storage().setItem(STORAGE_KEY, JSON.stringify(bookings));
}

function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function requireRole(actingUserId: string, role: "student" | "owner" | "scout") {
  const user = currentSession()?.user;
  if (!user || user.id !== actingUserId) throw createAppError("AUTHENTICATION_ERROR");
  if (user.role !== role) throw createAppError("FORBIDDEN");
}

function propertyIdForTitle(title: string): string | undefined {
  return mockManagedProperties.find((property) => property.title === title)?.id;
}

function propertyForBooking(booking: PropertyBooking) {
  return mockManagedProperties.find(
    (property) =>
      property.id === booking.propertyId ||
      property.id === propertyIdForTitle(booking.propertyTitle),
  );
}

function paymentUnavailable(request: InitializeRentPaymentRequest): PaymentInitializationResult {
  return {
    availability: "BACKEND_REQUIRED",
    bookingId: request.bookingId,
    transaction: null,
    message: "Rent payment is not available until the backend payment service is enabled.",
  };
}

export const mockBookingProvider: BookingProvider = {
  async getStudentBookings(studentId) {
    requireRole(studentId, "student");
    return delay(readBookings().filter((booking) => booking.studentId === studentId));
  },

  async getOwnerBookingRequests(ownerId) {
    requireRole(ownerId, "owner");
    return delay(
      readBookings().filter((booking) => propertyForBooking(booking)?.owner.id === ownerId),
    );
  },

  async getScoutBookingActivity(scoutId) {
    requireRole(scoutId, "scout");
    return delay(
      readBookings().filter((booking) => {
        const property = propertyForBooking(booking);
        const assignment = property?.scouts.find((scout) => scout.scoutId === scoutId);
        return assignment?.status === "active" && assignment.permissions.canViewBookings;
      }),
    );
  },

  async createBookingRequest(input: CreateBookingRequest) {
    requireRole(input.studentId, "student");
    if (!input.propertyId.trim() || !input.propertyTitle.trim() || !input.requestedFrom.trim()) {
      throw createAppError("VALIDATION_ERROR", {
        title: "Booking details are incomplete",
        message: "Choose a valid move-in date before requesting this property.",
      });
    }
    if (input.amount <= 0 || input.availableUnits <= 0 || input.availabilityStatus === "taken") {
      throw createAppError("CONFLICT", {
        title: "This property is not available",
        message: "Choose another available property or try again later.",
      });
    }

    const bookings = readBookings();
    const duplicate = bookings.some(
      (booking) =>
        booking.studentId === input.studentId &&
        booking.propertyId === input.propertyId &&
        ["pending", "approved", "confirmed"].includes(booking.status),
    );
    if (duplicate) {
      throw createAppError("CONFLICT", {
        title: "Booking request already exists",
        message: "You already have an active request for this property.",
      });
    }

    const now = new Date().toISOString();
    const booking: PropertyBooking = {
      id: `booking_${Math.random().toString(36).slice(2, 10)}`,
      propertyId: input.propertyId,
      propertyTitle: input.propertyTitle,
      studentId: input.studentId,
      status: "pending",
      requestedFrom: input.requestedFrom,
      amount: input.amount,
      currency: input.currency,
      pricePeriod: input.pricePeriod,
      paymentStatus: "not_started",
      escrowStatus: "not_started",
      transactionLifecycle: "payment_not_eligible",
      createdAt: now,
      updatedAt: now,
    };
    writeBookings([...bookings, booking]);
    return delay(booking, 500);
  },

  async cancelBooking(bookingId, actingUserId) {
    requireRole(actingUserId, "student");
    const bookings = readBookings();
    const booking = bookings.find((item) => item.id === bookingId);
    if (!booking) throw createAppError("NOT_FOUND");
    if (booking.studentId !== actingUserId) throw createAppError("FORBIDDEN");
    if (booking.status !== "pending") {
      throw createAppError("VALIDATION_ERROR", {
        title: "This booking cannot be cancelled",
        message: "Only pending booking requests can be withdrawn.",
      });
    }
    const next = {
      ...booking,
      status: "cancelled" as const,
      transactionLifecycle: "cancelled" as const,
      updatedAt: new Date().toISOString(),
    };
    writeBookings(bookings.map((item) => (item.id === bookingId ? next : item)));
    return delay(next);
  },

  async approveBooking(bookingId, actingUserId) {
    requireRole(actingUserId, "owner");
    const bookings = readBookings();
    const booking = bookings.find((item) => item.id === bookingId);
    if (!booking) throw createAppError("NOT_FOUND");
    if (propertyForBooking(booking)?.owner.id !== actingUserId) throw createAppError("FORBIDDEN");
    if (booking.status !== "pending") {
      throw createAppError("VALIDATION_ERROR", {
        title: "This booking cannot be approved",
        message: "Only pending booking requests can be approved.",
      });
    }
    const next = {
      ...booking,
      status: "approved" as const,
      transactionLifecycle: "ready_for_backend_initialization" as const,
      updatedAt: new Date().toISOString(),
    };
    writeBookings(bookings.map((item) => (item.id === bookingId ? next : item)));
    return delay(next);
  },

  async rejectBooking(bookingId, actingUserId, reason) {
    requireRole(actingUserId, "owner");
    const bookings = readBookings();
    const booking = bookings.find((item) => item.id === bookingId);
    if (!booking) throw createAppError("NOT_FOUND");
    if (propertyForBooking(booking)?.owner.id !== actingUserId) throw createAppError("FORBIDDEN");
    if (booking.status !== "pending") {
      throw createAppError("VALIDATION_ERROR", {
        title: "This booking cannot be rejected",
        message: "Only pending booking requests can be rejected.",
      });
    }
    const next: PropertyBooking = {
      ...booking,
      status: "rejected" as const,
      transactionLifecycle: "cancelled" as const,
      updatedAt: new Date().toISOString(),
      ...(reason?.trim() ? { reason: reason.trim() } : {}),
    };
    writeBookings(bookings.map((item) => (item.id === bookingId ? next : item)));
    return delay(next);
  },

  async initializePayment(request) {
    requireRole(request.studentId, "student");
    const booking = readBookings().find(
      (item) => item.id === request.bookingId && item.studentId === request.studentId,
    );
    if (!booking) throw createAppError("NOT_FOUND");
    if (booking.status !== "approved") {
      return {
        ...paymentUnavailable(request),
        availability: "UNAVAILABLE" as const,
        message: "Owner approval is required before rent payment can be initialized.",
      };
    }
    return paymentUnavailable(request);
  },

  async getPaymentStatus(bookingId, actingUserId): Promise<PaymentTransaction | null> {
    requireRole(actingUserId, "student");
    const booking = readBookings().find(
      (item) => item.id === bookingId && item.studentId === actingUserId,
    );
    if (!booking) throw createAppError("NOT_FOUND");
    return delay(null);
  },

  async getEscrowStatus(bookingId, actingUserId): Promise<EscrowTransaction | null> {
    requireRole(actingUserId, "student");
    const booking = readBookings().find(
      (item) => item.id === bookingId && item.studentId === actingUserId,
    );
    if (!booking) throw createAppError("NOT_FOUND");
    return delay(null);
  },
};
