import { env } from "@/lib/env";
import { apiBookingProvider } from "./booking.api-provider";
import { mockBookingProvider } from "./booking.mock-provider";
import type { BookingProvider } from "./booking.provider";

const provider: BookingProvider = env.useMockData ? mockBookingProvider : apiBookingProvider;

export const bookingService: BookingProvider = {
  getStudentBookings: (studentId) => provider.getStudentBookings(studentId),
  getOwnerBookingRequests: (ownerId) => provider.getOwnerBookingRequests(ownerId),
  getScoutBookingActivity: (scoutId) => provider.getScoutBookingActivity(scoutId),
  createBookingRequest: (input) => provider.createBookingRequest(input),
  cancelBooking: (bookingId, actingUserId) => provider.cancelBooking(bookingId, actingUserId),
  approveBooking: (bookingId, actingUserId) => provider.approveBooking(bookingId, actingUserId),
  rejectBooking: (bookingId, actingUserId, reason) =>
    provider.rejectBooking(bookingId, actingUserId, reason),
  initializePayment: (request) => provider.initializePayment(request),
  getPaymentStatus: (bookingId, actingUserId) => provider.getPaymentStatus(bookingId, actingUserId),
  getEscrowStatus: (bookingId, actingUserId) => provider.getEscrowStatus(bookingId, actingUserId),
};
