import { beforeEach, describe, expect, it } from "vitest";
import { profileService } from "./profile.service";
import { roommateService } from "@/features/roommates/services/roommate.service";
import { createDefaultRoommatePreferences } from "@/types/roommate";
import type { AuthUser, Session } from "@/types/auth";

let storage: Storage;

beforeEach(() => {
  const data = new Map<string, string>();
  storage = {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
    clear: () => void data.clear(),
  } as Storage;
  Object.defineProperty(globalThis, "window", {
    value: { localStorage: storage },
    configurable: true,
  });
});

function setSession(user: AuthUser) {
  const session: Session = {
    user,
    accessToken: "mock-token",
    refreshToken: "mock-refresh",
    tokenType: "bearer",
  };
  storage.setItem("campmatch.session", JSON.stringify(session));
}

function createUser(role: AuthUser["role"]): AuthUser {
  return {
    id: "profile-user",
    fullName: "Profile User",
    email: "profile@campmatch.local",
    phone: "+2348000000000",
    role,
    accountStatus: "active",
    emailVerified: true,
    onboardingComplete: true,
    identityVerification: "pending",
    ...(role === "owner"
      ? {
          ownerProfile: {
            displayName: "Owner Name",
            contactPhone: "+2348000000000",
            city: "Calabar",
            ownershipEvidenceType: "deed-of-assignment",
            propertyAddress: "Private property address",
            identityDocumentType: "nin",
          },
        }
      : {}),
    ...(role === "scout"
      ? {
          scoutProfile: {
            displayName: "Scout Name",
            contactPhone: "+2348000000000",
            city: "Calabar",
            coverageAreas: "Calabar",
            experience: "new",
            identityDocumentType: "nin",
          },
        }
      : {}),
    ...(role === "student"
      ? {
          studentProfile: {
            universityId: "UNICAL",
            state: "Cross River",
            department: "Computer Science",
            academicLevel: "200",
            accommodationTypes: ["shared-apartment"],
            budgetMin: 200000,
            budgetMax: 800000,
            preferredArea: "Calabar",
            livingPreference: "find-roommate" as const,
          },
        }
      : {}),
  };
}

describe("role-specific profile provider", () => {
  it("updates permitted Student fields and derives state from the selected university", async () => {
    const student = createUser("student");
    setSession(student);
    storage.setItem(
      "campmatch.roommate",
      JSON.stringify({ [student.id]: createDefaultRoommatePreferences(student.id) }),
    );
    const updated = await profileService.updateProfile({
      role: "student",
      fullName: "Updated Student",
      phone: "+2348111111111",
      studentProfile: {
        ...student.studentProfile!,
        universityId: "UNILAG",
        state: "Cross River",
        department: "Petroleum Engineering",
        academicLevel: "300",
      },
    });

    expect(updated.fullName).toBe("Updated Student");
    expect(updated.studentProfile?.department).toBe("Petroleum Engineering");
    expect(updated.studentProfile?.academicLevel).toBe("300");
    expect(updated.studentProfile?.state).toBe("Lagos");
    expect(updated.identityVerification).toBe("pending");
    await expect(roommateService.getPreferences(student.id)).resolves.toMatchObject({
      universityId: "UNILAG",
      preferredArea: updated.studentProfile?.preferredArea,
    });
  });

  it("updates Owner contact fields without changing verification or private document metadata", async () => {
    setSession(createUser("owner"));
    const updated = await profileService.updateProfile({
      role: "owner",
      ownerProfile: { displayName: "Updated Owner", contactPhone: "+2348222222222", city: "Lagos" },
    });

    expect(updated.ownerProfile?.displayName).toBe("Updated Owner");
    expect(updated.ownerProfile?.identityDocumentType).toBe("nin");
    expect(updated.ownerProfile?.propertyAddress).toBe("Private property address");
    expect(updated.identityVerification).toBe("pending");
  });

  it("updates Scout coverage without changing verification or private document metadata", async () => {
    setSession(createUser("scout"));
    const updated = await profileService.updateProfile({
      role: "scout",
      scoutProfile: {
        displayName: "Updated Scout",
        contactPhone: "+2348333333333",
        city: "Port Harcourt",
        coverageAreas: "Rumuola, Choba",
        experience: "experienced",
      },
    });

    expect(updated.scoutProfile?.coverageAreas).toBe("Rumuola, Choba");
    expect(updated.scoutProfile?.identityDocumentType).toBe("nin");
    expect(updated.identityVerification).toBe("pending");
  });

  it("blocks role-specific profile reads and writes for another role", async () => {
    setSession(createUser("student"));
    await expect(profileService.getProfile("owner")).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(
      profileService.updateProfile({
        role: "owner",
        ownerProfile: { displayName: "Not allowed", contactPhone: "", city: "" },
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
