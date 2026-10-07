import type { OwnerProfile, ScoutProfile, StudentProfile } from "@/types/auth";

export type ProfileUpdateInput =
  | {
      role: "student";
      fullName: string;
      phone: string;
      studentProfile: StudentProfile;
    }
  | {
      role: "owner";
      ownerProfile: Pick<OwnerProfile, "displayName" | "contactPhone" | "city">;
    }
  | {
      role: "scout";
      scoutProfile: Pick<
        ScoutProfile,
        "displayName" | "contactPhone" | "city" | "coverageAreas" | "experience"
      >;
    };
