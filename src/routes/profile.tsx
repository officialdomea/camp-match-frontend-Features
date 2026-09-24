import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { ProfilePhoto } from "@/components/common/profile-photo";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useSavedListings } from "@/features/saved/hooks/use-saved-listings";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your profile — Camp Match" },
      {
        name: "description",
        content:
          "Manage your Camp Match student profile, university and saved housing preferences.",
      },
      { property: "og:title", content: "Your profile — Camp Match" },
      {
        property: "og:description",
        content: "Manage your Camp Match student profile and preferences.",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { savedIds } = useSavedListings();
  const { user, setUser } = useAuth();
  const role = user?.role;
  const name = user?.fullName ?? "Camp Match user";
  const roleLabel =
    role === "owner" ? "Property owner" : role === "scout" ? "House scout" : "Student";
  const roleDescription =
    role === "owner"
      ? "Manage your owner account and property verification."
      : role === "scout"
        ? "Manage your scout profile and authorization status."
        : "Manage your student profile and housing preferences.";

  return (
    <AppShell>
      <div className="space-y-6 px-4 py-6 sm:px-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Profile</h1>

        <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-5">
          {user ? <ProfilePhoto user={user} editable onUserChange={setUser} /> : null}
          <div>
            <p className="text-base font-semibold">{name}</p>
            <p className="text-sm text-muted-foreground">{roleLabel}</p>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border bg-surface p-4">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Saved homes</dt>
            <dd className="mt-1 text-2xl font-semibold">{savedIds.length}</dd>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Bookings</dt>
            <dd className="mt-1 text-2xl font-semibold">0</dd>
          </div>
        </dl>

        <div className="flex items-start gap-3 rounded-2xl border border-border bg-primary-soft p-4">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
          <p className="text-sm text-foreground">
            {roleDescription} Identity verification, accounts and settings arrive in a later build
            phase.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
