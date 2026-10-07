import { createAppError } from "@/lib/api/errors";
import type { AuthUser, UserRole } from "@/types/auth";
import type { ProfileUpdateInput } from "@/types/profile";
import type { ProfileProvider } from "./profile.provider";

function unavailable(): never {
  throw createAppError("SERVER_ERROR", {
    title: "Profile service is not connected",
    message: "Profile access requires an approved FastAPI contract.",
  });
}

export const apiProfileProvider: ProfileProvider = {
  getProfile: async (_role: UserRole): Promise<AuthUser> => unavailable(),
  updateProfile: async (_input: ProfileUpdateInput): Promise<AuthUser> => unavailable(),
};
