import type { InitializeRentPaymentRequest, PaymentInitializationResult } from "@/types/booking";
import type { BookingProvider } from "./booking.provider";

const unavailable = (): never => {
  throw new Error(
    "Booking API provider is not implemented until the FastAPI contract is approved.",
  );
};

export const apiBookingProvider: BookingProvider = {
  getStudentBookings: async () => unavailable(),
  getOwnerBookingRequests: async () => unavailable(),
  getScoutBookingActivity: async () => unavailable(),
  createBookingRequest: async () => unavailable(),
  cancelBooking: async () => unavailable(),
  approveBooking: async () => unavailable(),
  rejectBooking: async () => unavailable(),
  initializePayment: async (
    request: InitializeRentPaymentRequest,
  ): Promise<PaymentInitializationResult> => ({
    availability: "BACKEND_REQUIRED",
    bookingId: request.bookingId,
    transaction: null,
    message: "Payment initialization requires the future FastAPI provider.",
  }),
  getPaymentStatus: async () => unavailable(),
  getEscrowStatus: async () => unavailable(),
};
