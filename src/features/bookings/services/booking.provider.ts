import type {
  CreateBookingRequest,
  EscrowTransaction,
  InitializeRentPaymentRequest,
  PaymentTransaction,
  PaymentInitializationResult,
  PropertyBooking,
} from "@/types/booking";

export type BookingProvider = {
  getStudentBookings(studentId: string): Promise<PropertyBooking[]>;
  getOwnerBookingRequests(ownerId: string): Promise<PropertyBooking[]>;
  getScoutBookingActivity(scoutId: string): Promise<PropertyBooking[]>;
  createBookingRequest(input: CreateBookingRequest): Promise<PropertyBooking>;
  cancelBooking(bookingId: string, actingUserId: string): Promise<PropertyBooking>;
  approveBooking(bookingId: string, actingUserId: string): Promise<PropertyBooking>;
  rejectBooking(bookingId: string, actingUserId: string, reason?: string): Promise<PropertyBooking>;
  initializePayment(request: InitializeRentPaymentRequest): Promise<PaymentInitializationResult>;
  getPaymentStatus(bookingId: string, actingUserId: string): Promise<PaymentTransaction | null>;
  getEscrowStatus(bookingId: string, actingUserId: string): Promise<EscrowTransaction | null>;
};
