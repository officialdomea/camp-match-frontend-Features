export type RestrictionProvider = {
  isRestricted(userId: string, targetId: string): Promise<boolean>;
  createRestriction(userId: string, targetId: string): Promise<boolean>;
  removeRestriction(userId: string, targetId: string): Promise<boolean>;
};

export type RestrictionService = {
  isInteractionRestricted(targetId: string): Promise<boolean>;
};
