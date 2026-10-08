import { env } from "@/lib/env";
import { createAppError } from "@/lib/api/errors";
import { authService } from "@/features/auth/services/auth.service";
import { apiRestrictionProvider } from "./restriction.api-provider";
import { mockRestrictionProvider } from "./restriction.mock-provider";
import type { RestrictionProvider, RestrictionService } from "./restriction.provider";

const provider: RestrictionProvider = env.useMockData
  ? mockRestrictionProvider
  : apiRestrictionProvider;

export function createRestrictionService(
  restrictionProvider: RestrictionProvider,
  getCurrentUser: () => Promise<{ id: string } | null>,
): RestrictionService {
  return {
    async isInteractionRestricted(targetId: string) {
      const user = await getCurrentUser();
      if (!user) throw createAppError("AUTHENTICATION_ERROR");
      if (!targetId.trim() || targetId === user.id) return false;
      return restrictionProvider.isRestricted(user.id, targetId);
    },
  };
}

export const restrictionService = createRestrictionService(provider, () =>
  authService.getCurrentUser(),
);
