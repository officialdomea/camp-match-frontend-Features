import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bookingService } from "../services/booking.service";
import type { CreateBookingRequest } from "@/types/booking";

export const bookingKeys = {
  all: ["bookings"] as const,
  student: (studentId: string) => ["bookings", "student", studentId] as const,
  owner: (ownerId: string) => ["bookings", "owner", ownerId] as const,
  scout: (scoutId: string) => ["bookings", "scout", scoutId] as const,
};

export function useStudentBookings(studentId?: string) {
  return useQuery({
    queryKey: bookingKeys.student(studentId ?? "anonymous"),
    queryFn: () => bookingService.getStudentBookings(studentId ?? ""),
    enabled: Boolean(studentId),
  });
}

export function useCreateBookingRequest(studentId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<CreateBookingRequest, "studentId">) =>
      bookingService.createBookingRequest({ ...input, studentId: studentId ?? "" }),
    onSuccess: () => {
      if (studentId)
        void queryClient.invalidateQueries({ queryKey: bookingKeys.student(studentId) });
    },
  });
}

export function useCancelBooking(studentId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) => bookingService.cancelBooking(bookingId, studentId ?? ""),
    onSuccess: () => {
      if (studentId)
        void queryClient.invalidateQueries({ queryKey: bookingKeys.student(studentId) });
    },
  });
}

export function useOwnerBookingRequests(ownerId?: string) {
  return useQuery({
    queryKey: bookingKeys.owner(ownerId ?? "anonymous"),
    queryFn: () => bookingService.getOwnerBookingRequests(ownerId ?? ""),
    enabled: Boolean(ownerId),
  });
}

export function useScoutBookingActivity(scoutId?: string) {
  return useQuery({
    queryKey: bookingKeys.scout(scoutId ?? "anonymous"),
    queryFn: () => bookingService.getScoutBookingActivity(scoutId ?? ""),
    enabled: Boolean(scoutId),
  });
}

export function useBookingDecision(ownerId?: string) {
  const queryClient = useQueryClient();
  const invalidate = () => {
    if (ownerId) void queryClient.invalidateQueries({ queryKey: bookingKeys.owner(ownerId) });
  };

  return {
    approve: useMutation({
      mutationFn: (bookingId: string) => bookingService.approveBooking(bookingId, ownerId ?? ""),
      onSuccess: invalidate,
    }),
    reject: useMutation({
      mutationFn: ({ bookingId, reason }: { bookingId: string; reason?: string }) =>
        bookingService.rejectBooking(bookingId, ownerId ?? "", reason),
      onSuccess: invalidate,
    }),
  };
}
