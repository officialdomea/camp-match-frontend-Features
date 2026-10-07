import { authService } from "@/features/auth/services/auth.service";
import { createAppError } from "@/lib/api/errors";
import type { AuthUser, UserRole } from "@/types/auth";
import type { ProfileUpdateInput } from "@/types/profile";
import type { ProfileProvider } from "./profile.provider";

function requireRole(user: AuthUser | null, role: UserRole): AuthUser {
  if (!user) throw createAppError("AUTHENTICATION_ERROR");
  if (user.role !== role) throw createAppError("FORBIDDEN");
  return user;
}

export const mockProfileProvider: ProfileProvider = {
  async getProfile(role) {
    return requireRole(await authService.getCurrentUser(), role);
  },

  async updateProfile(input: ProfileUpdateInput) {
    const user = requireRole(await authService.getCurrentUser(), input.role);
    if (user.role !== input.role) throw createAppError("FORBIDDEN");
    return authService.updateUserProfile(input);
  },
};
