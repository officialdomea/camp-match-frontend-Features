import { Link, createFileRoute } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState, ErrorState } from "@/components/common/states";
import { PropertyGrid } from "@/components/listings/property-grid";
import { PropertyGridSkeleton } from "@/components/listings/property-card-skeleton";
import { Button } from "@/components/ui/button";
import { useListingSearch } from "@/features/listings/hooks/use-listings";
import { useSavedListings } from "@/features/saved/hooks/use-saved-listings";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "Saved homes — Camp Match" },
      {
        name: "description",
        content: "Every student home you saved on Camp Match, ready to compare side by side.",
      },
      { property: "og:title", content: "Saved homes — Camp Match" },
      {
        property: "og:description",
        content: "Compare the student homes you saved on Camp Match.",
      },
    ],
  }),
  component: SavedPage,
});

function SavedPage() {
  const { savedIds } = useSavedListings();
  const { data, isPending, isError, refetch } = useListingSearch({});
  const listings = (data?.items ?? []).filter((listing) => savedIds.includes(listing.id));

  return (
    <AppShell>
      <div className="space-y-5 px-4 py-6 sm:px-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Saved</h1>
          <p className="mt-1 text-sm text-muted-foreground">Homes you tapped the heart on.</p>
        </div>

        {isPending ? (
          <PropertyGridSkeleton count={3} />
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : listings.length === 0 ? (
          <EmptyState
            icon={<Heart className="size-5" aria-hidden="true" />}
            title="Nothing saved yet"
            description="Tap the heart on any home to keep it here for later."
            action={
              <Button asChild>
                <Link to="/discover">Browse homes</Link>
              </Button>
            }
          />
        ) : (
          <PropertyGrid listings={listings} />
        )}
      </div>
    </AppShell>
  );
}
