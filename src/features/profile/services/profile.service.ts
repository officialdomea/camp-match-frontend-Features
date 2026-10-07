import { env } from "@/lib/env";
import { roommateService } from "@/features/roommates/services/roommate.service";
import { apiProfileProvider } from "./profile.api-provider";
import { mockProfileProvider } from "./profile.mock-provider";
import type { ProfileProvider } from "./profile.provider";

const provider: ProfileProvider = env.useMockData ? mockProfileProvider : apiProfileProvider;

export const profileService: ProfileProvider = {
  getProfile: (role) => provider.getProfile(role),
  async updateProfile(input) {
    const updatedUser = await provider.updateProfile(input);
    if (input.role === "student" && updatedUser.studentProfile) {
      const preferences = await roommateService.getPreferences(updatedUser.id);
      if (preferences) {
        await roommateService.updatePreferences({
          ...preferences,
          universityId: updatedUser.studentProfile.universityId,
          preferredArea: updatedUser.studentProfile.preferredArea,
          accommodationTypes: updatedUser.studentProfile.accommodationTypes,
          budgetMin: updatedUser.studentProfile.budgetMin,
          budgetMax: updatedUser.studentProfile.budgetMax,
          livingPreference: updatedUser.studentProfile.livingPreference,
        });
      }
    }
    return updatedUser;
  },
};
