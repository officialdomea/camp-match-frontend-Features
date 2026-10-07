import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ErrorState, LoadingState } from "@/components/common/states";
import { AppShell } from "@/components/layout/app-shell";
import { authKeys, useAuth } from "@/features/auth/hooks/use-auth";
import { OwnerProfile } from "@/features/profile/components/owner-profile";
import { ProfileShell } from "@/features/profile/components/profile-shell";
import { ScoutProfile } from "@/features/profile/components/scout-profile";
import { StudentProfile } from "@/features/profile/components/student-profile";
import { profileService } from "@/features/profile/services/profile.service";
import type { ProfileUpdateInput } from "@/types/profile";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your profile — Camp Match" },
      {
        name: "description",
        content: "Manage your role-specific Camp Match profile and account.",
      },
      { property: "og:title", content: "Your profile — Camp Match" },
      {
        property: "og:description",
        content: "Manage your role-specific Camp Match profile and account.",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, setUser } = useAuth();
  const queryClient = useQueryClient();
  const [saveError, setSaveError] = useState<string | null>(null);
  const profile = useQuery({
    queryKey: ["profile", user?.id, user?.role],
    queryFn: () => profileService.getProfile(user!.role!),
    enabled: Boolean(user?.id && user.role),
    retry: false,
  });
  const update = useMutation({
    mutationFn: (input: ProfileUpdateInput) => profileService.updateProfile(input),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      queryClient.setQueryData(["profile", updatedUser.id, updatedUser.role], updatedUser);
      queryClient.setQueryData(authKeys.currentUser, updatedUser);
    },
    onError: (error: Error) => setSaveError(error.message),
  });

  const saveProfile = async (input: ProfileUpdateInput) => {
    setSaveError(null);
    await update.mutateAsync(input);
  };
  const currentUser = profile.data ?? user;

  if (!currentUser?.role) {
    return (
      <AppShell>
        <LoadingState label="Loading your profile" />
      </AppShell>
    );
  }

  return (
    <AppShell>
      {profile.isPending ? (
        <LoadingState label="Loading your profile" />
      ) : profile.isError ? (
        <ErrorState title="We couldn't load your profile" onRetry={() => void profile.refetch()} />
      ) : currentUser.role === "student" ? (
        <ProfileShell
          user={currentUser}
          displayName={currentUser.fullName}
          roleLabel="Student"
          onUserChange={setUser}
        >
          <StudentProfile
            user={currentUser}
            saving={update.isPending}
            error={saveError}
            onSave={saveProfile}
          />
        </ProfileShell>
      ) : currentUser.role === "owner" ? (
        <ProfileShell
          user={currentUser}
          displayName={currentUser.ownerProfile?.displayName || currentUser.fullName}
          roleLabel="Property owner"
          onUserChange={setUser}
        >
          <OwnerProfile
            user={currentUser}
            saving={update.isPending}
            error={saveError}
            onSave={saveProfile}
          />
        </ProfileShell>
      ) : (
        <ProfileShell
          user={currentUser}
          displayName={currentUser.scoutProfile?.displayName || currentUser.fullName}
          roleLabel="House scout"
          onUserChange={setUser}
        >
          <ScoutProfile
            user={currentUser}
            saving={update.isPending}
            error={saveError}
            onSave={saveProfile}
          />
        </ProfileShell>
      )}
    </AppShell>
  );
}
