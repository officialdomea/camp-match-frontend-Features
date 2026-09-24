import { beforeEach, describe, expect, it } from "vitest";
import { normalizeError } from "@/lib/api/errors";
import { bookingService } from "./booking.service";

const input = {
  propertyId: "listing_test",
  propertyTitle: "Test student home",
  studentId: "student-a",
  requestedFrom: "2026-10-01",
  amount: 400000,
  currency: "NGN" as const,
  pricePeriod: "year" as const,
  availableUnits: 1,
  availabilityStatus: "available" as const,
};

beforeEach(() => {
  const data = new Map<string, string>();
  const localStorage = {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
    clear: () => void data.clear(),
  } as Storage;
  Object.defineProperty(globalThis, "window", { value: { localStorage }, configurable: true });
  Object.defineProperty(globalThis, "localStorage", { value: localStorage, configurable: true });
  localStorage.setItem(
    "campmatch.session",
    JSON.stringify({ user: { id: "student-a", role: "student" } }),
  );
});

describe("booking provider workflow", () => {
  it("creates a pending booking request", async () => {
    const booking = await bookingService.createBookingRequest(input);

    expect(booking.status).toBe("pending");
    expect(booking.paymentStatus).toBe("not_started");
    expect(booking.escrowStatus).toBe("not_started");
    await expect(bookingService.getStudentBookings("student-a")).resolves.toHaveLength(1);
  });

  it("rejects invalid or unavailable booking data", async () => {
    await expect(
      bookingService.createBookingRequest({ ...input, requestedFrom: "" }),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    await expect(
      bookingService.createBookingRequest({ ...input, propertyId: "taken", availableUnits: 0 }),
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("prevents duplicate active requests", async () => {
    await bookingService.createBookingRequest(input);

    await expect(bookingService.createBookingRequest(input)).rejects.toMatchObject({
      code: "CONFLICT",
    });
  });

  it("requires the authenticated student for reads and mutations", async () => {
    await expect(
      bookingService.createBookingRequest({ ...input, studentId: "student-b" }),
    ).rejects.toMatchObject({
      code: "AUTHENTICATION_ERROR",
    });
    await expect(bookingService.getStudentBookings("student-b")).rejects.toMatchObject({
      code: "AUTHENTICATION_ERROR",
    });
  });

  it("allows the student to withdraw a pending request", async () => {
    const booking = await bookingService.createBookingRequest(input);
    const cancelled = await bookingService.cancelBooking(booking.id, "student-a");

    expect(cancelled.status).toBe("cancelled");
    expect(cancelled.transactionLifecycle).toBe("cancelled");
    await expect(bookingService.cancelBooking(booking.id, "student-a")).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
    });
  });

  it("does not fabricate payment success or escrow state", async () => {
    const booking = await bookingService.createBookingRequest(input);

    await expect(
      bookingService.initializePayment({
        bookingId: booking.id,
        studentId: "student-a",
        currency: "NGN",
      }),
    ).resolves.toMatchObject({ availability: "UNAVAILABLE" });
    await expect(bookingService.getPaymentStatus(booking.id, "student-a")).resolves.toBeNull();
    await expect(bookingService.getEscrowStatus(booking.id, "student-a")).resolves.toBeNull();
    expect(normalizeError(new Error("backend failure")).code).toBe("UNKNOWN");
  });

  it("limits owner retrieval and approval to the property owner", async () => {
    const booking = await bookingService.createBookingRequest({
      ...input,
      propertyId: "prop_002",
      propertyTitle: "Two-bedroom shared flat at Ekosodin",
    });

    window.localStorage.setItem(
      "campmatch.session",
      JSON.stringify({ user: { id: "usr_other_owner", role: "owner" } }),
    );
    await expect(bookingService.getOwnerBookingRequests("usr_other_owner")).resolves.toHaveLength(
      0,
    );
    await expect(
      bookingService.approveBooking(booking.id, "usr_other_owner"),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
    });

    window.localStorage.setItem(
      "campmatch.session",
      JSON.stringify({ user: { id: "usr_demo_owner", role: "owner" } }),
    );
    await expect(bookingService.getOwnerBookingRequests("usr_demo_owner")).resolves.toHaveLength(1);
    const approved = await bookingService.approveBooking(booking.id, "usr_demo_owner");
    expect(approved.status).toBe("approved");
    expect(approved.transactionLifecycle).toBe("ready_for_backend_initialization");
    expect(approved.paymentStatus).toBe("not_started");
  });

  it("rejects pending requests once and prevents repeated decisions", async () => {
    const booking = await bookingService.createBookingRequest({
      ...input,
      propertyId: "prop_002",
      propertyTitle: "Two-bedroom shared flat at Ekosodin",
    });
    window.localStorage.setItem(
      "campmatch.session",
      JSON.stringify({ user: { id: "usr_demo_owner", role: "owner" } }),
    );

    const rejected = await bookingService.rejectBooking(
      booking.id,
      "usr_demo_owner",
      "Property unavailable",
    );
    expect(rejected.status).toBe("rejected");
    expect(rejected.reason).toBe("Property unavailable");
    await expect(bookingService.rejectBooking(booking.id, "usr_demo_owner")).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
    });
  });

  it("only exposes assigned Scout activity with booking-view permission", async () => {
    const booking = await bookingService.createBookingRequest({
      ...input,
      propertyId: "prop_001",
      propertyTitle: "Modern self-contained apartment at Satellite Town",
    });
    window.localStorage.setItem(
      "campmatch.session",
      JSON.stringify({ user: { id: "scout_001", role: "scout" } }),
    );

    await expect(bookingService.getScoutBookingActivity("scout_001")).resolves.toEqual([booking]);
    await expect(bookingService.approveBooking(booking.id, "scout_001")).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
    await expect(bookingService.getScoutBookingActivity("scout_other")).rejects.toMatchObject({
      code: "AUTHENTICATION_ERROR",
    });
  });
});
