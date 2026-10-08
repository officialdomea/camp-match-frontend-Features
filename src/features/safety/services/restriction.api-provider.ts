import type { RestrictionProvider } from "./restriction.provider";

export const apiRestrictionProvider: RestrictionProvider = {
  async isRestricted() {
    return false;
  },
  async createRestriction() {
    return false;
  },
  async removeRestriction() {
    return false;
  },
};
