import type { RestrictionProvider } from "./restriction.provider";

export function createMockRestrictionProvider(
  initialRestrictions: Record<string, string[]> = {},
): RestrictionProvider {
  const restrictions = new Map<string, Set<string>>(
    Object.entries(initialRestrictions).map(([userId, targets]) => [userId, new Set(targets)]),
  );

  return {
    async isRestricted(userId: string, targetId: string) {
      const blockedTargets = restrictions.get(userId);
      return Boolean(blockedTargets?.has(targetId));
    },
    async createRestriction(userId: string, targetId: string) {
      const blockedTargets = restrictions.get(userId) ?? new Set<string>();
      blockedTargets.add(targetId);
      restrictions.set(userId, blockedTargets);
      return true;
    },
    async removeRestriction(userId: string, targetId: string) {
      const blockedTargets = restrictions.get(userId);
      if (!blockedTargets) {
        return false;
      }

      const removed = blockedTargets.delete(targetId);
      if (blockedTargets.size === 0) {
        restrictions.delete(userId);
      }
      return removed;
    },
  };
}

export const mockRestrictionProvider = createMockRestrictionProvider({
  usr_student_01: ["usr_owner_02", "usr_scout_01"],
  usr_owner_01: ["usr_student_02"],
});
