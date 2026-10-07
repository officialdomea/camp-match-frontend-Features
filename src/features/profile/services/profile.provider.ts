import type { AuthUser, UserRole } from "@/types/auth";
import type { ProfileUpdateInput } from "@/types/profile";

export type ProfileProvider = {
  getProfile(role: UserRole): Promise<AuthUser>;
  updateProfile(input: ProfileUpdateInput): Promise<AuthUser>;
};
