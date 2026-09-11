import { createFileRoute } from "@tanstack/react-router";
import { Building2, ClipboardList, Plus } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { VerificationStatus } from "@/features/onboarding/components/verification-status";
import { useAuth } from "@/features/auth/hooks/use-auth";

export const Route = createFileRoute("/owner")({
  head: () => ({
    meta: [
      { title: "Owner dashboard — Camp Match" },
      {
        name: "description",
        content:
          "Track your Camp Match property listings, verification status and student enquiries.",
      },
      { property: "og:title", content: "Owner dashboard — Camp Match" },
      {
        property: "og:description",
        content: "Manage your student housing listings on Camp Match.",
      },
    ],
  }),
  component: OwnerHomePage,
});

function OwnerHomePage() {
  const { user } = useAuth();

  return (
    <AppShell>
      <div className="space-y-6 px-4 py-6 sm:px-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Property owner
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            {user?.fullName ? `Welcome, ${user.fullName.split(" ")[0]}` : "Your properties"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Listings go live once ownership and identity checks pass.
          </p>
        </div>

        <VerificationStatus status={user?.identityVerification ?? "pending"} />

        <EmptyState
          icon={<Building2 className="size-5" aria-hidden="true" />}
          title="No properties yet"
          description="Once verification clears you'll be able to publish your first listing here."
          action={
            <Button disabled>
              <Plus className="size-4" aria-hidden="true" />
              Add property
            </Button>
          }
        />

        <div className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-5">
          <ClipboardList className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold">What happens next</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Our team reviews your ownership evidence, then a Camp Match scout visits the property
              to confirm the details students will see.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
