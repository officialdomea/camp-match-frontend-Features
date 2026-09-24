import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, BedDouble, CalendarDays, Heart, ShowerHead } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { PropertyGallery } from "@/components/listings/property-gallery";
import { PropertyFeatures } from "@/components/listings/property-features";
import { PropertyLocation } from "@/components/listings/property-location";
import { ScoutCard } from "@/components/listings/scout-card";
import { VerificationBadge, VerificationCard } from "@/components/listings/verification-badge";
import { accommodationLabels } from "@/components/listings/accommodation-labels";
import { ErrorState, LoadingState } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { useListing } from "@/features/listings/hooks/use-listings";
import { useSavedListings } from "@/features/saved/hooks/use-saved-listings";
import { formatDistance, formatNaira, formatPricePeriod } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/listings/$listingId")({
  head: () => ({
    meta: [
      { title: "Property details — Camp Match" },
      {
        name: "description",
        content:
          "See photos, price, verification checks and Scout details for this student home before you book.",
      },
      { property: "og:title", content: "Property details — Camp Match" },
      {
        property: "og:description",
        content: "Photos, verification checks and Scout details for this verified student home.",
      },
    ],
  }),
  component: ListingDetailPage,
});

function ListingDetailPage() {
  const { listingId } = Route.useParams();
  const navigate = useNavigate();
  const { data: listing, isPending, isError, refetch } = useListing(listingId);
  const { isSaved, toggleSaved } = useSavedListings();

  if (isPending) {
    return (
      <AppShell>
        <LoadingState label="Loading this home" />
      </AppShell>
    );
  }

  if (isError || !listing) {
    return (
      <AppShell>
        <div className="p-4 sm:p-6">
          <ErrorState
            title="We couldn't load this home"
            description="The listing may have been removed or the connection failed."
            onRetry={() => refetch()}
          />
        </div>
      </AppShell>
    );
  }

  const saved = isSaved(listing.id);

  return (
    <AppShell>
      <div className="pb-28 lg:pb-8">
        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link
            to="/discover"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back
          </Link>
          <button
            type="button"
            onClick={() => toggleSaved(listing.id)}
            aria-pressed={saved}
            aria-label={saved ? "Remove from saved" : "Save this home"}
            className="flex size-10 items-center justify-center rounded-full border border-border bg-surface transition-transform active:scale-90"
          >
            <Heart
              className={cn(
                "size-4.5",
                saved ? "fill-destructive text-destructive" : "text-foreground",
              )}
              aria-hidden="true"
            />
          </button>
        </div>

        <div className="grid gap-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-8">
            <PropertyGallery images={listing.images} title={listing.title} />

            <div className="space-y-4 px-4 sm:px-0">
              <div className="space-y-2">
                <VerificationBadge verified={listing.verification.verified} />
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{listing.title}</h1>
                <p className="text-sm text-muted-foreground">
                  {listing.location.area}, {listing.location.city} ·{" "}
                  {formatDistance(listing.location.distanceFromCampusKm)}
                </p>
              </div>

              <p className="text-2xl text-foreground price-text">
                {formatNaira(listing.price)}
                <span className="text-base font-medium text-muted-foreground">
                  {" "}
                  / {formatPricePeriod(listing.pricePeriod)}
                </span>
              </p>

              <div className="flex flex-wrap gap-2 text-xs font-medium text-muted-foreground">
                <span className="rounded-full bg-muted px-3 py-1.5">
                  {accommodationLabels[listing.accommodationType]}
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5">
                  <BedDouble className="size-3.5" aria-hidden="true" />
                  {listing.bedrooms} bedroom{listing.bedrooms > 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5">
                  <ShowerHead className="size-3.5" aria-hidden="true" />
                  {listing.bathrooms > 0
                    ? `${listing.bathrooms} private bathroom`
                    : "Shared bathroom"}
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5">
                  <CalendarDays className="size-3.5" aria-hidden="true" />
                  Available {listing.availability.availableFrom}
                </span>
              </div>

              <section aria-labelledby="about-heading" className="pt-2">
                <h2 id="about-heading" className="text-base font-semibold">
                  About this home
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {listing.description}
                </p>
                {listing.serviceChargeYear ? (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Service charge:{" "}
                    <span className="font-medium text-foreground">
                      {formatNaira(listing.serviceChargeYear)} / year
                    </span>
                  </p>
                ) : null}
              </section>

              <section aria-labelledby="features-heading" className="pt-2">
                <h2 id="features-heading" className="mb-3 text-base font-semibold">
                  What this place offers
                </h2>
                <PropertyFeatures features={listing.features} />
              </section>

              <section aria-labelledby="location-heading" className="pt-2">
                <h2 id="location-heading" className="mb-3 text-base font-semibold">
                  Location
                </h2>
                <PropertyLocation location={listing.location} />
              </section>

              <div className="pt-2 lg:hidden">
                <VerificationCard verification={listing.verification} />
              </div>
              <div className="lg:hidden">
                <ScoutCard
                  scout={listing.scout}
                  onContact={() => toast("Messaging arrives in a later phase.")}
                />
              </div>
            </div>
          </div>

          <div className="hidden space-y-4 lg:block">
            <div className="sticky top-20 space-y-4">
              <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
                <p className="text-xl text-foreground price-text">
                  {formatNaira(listing.price)}
                  <span className="text-sm font-medium text-muted-foreground">
                    {" "}
                    / {formatPricePeriod(listing.pricePeriod)}
                  </span>
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {listing.availability.unitsAvailable} unit
                  {listing.availability.unitsAvailable > 1 ? "s" : ""} available from{" "}
                  {listing.availability.availableFrom}
                </p>
                <Button
                  className="mt-4 w-full"
                  size="lg"
                  onClick={() => navigate({ to: "/bookings", search: { propertyId: listing.id } })}
                >
                  Request booking
                </Button>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  You won't be charged yet.
                </p>
              </div>
              <VerificationCard verification={listing.verification} />
              <ScoutCard
                scout={listing.scout}
                onContact={() => toast("Messaging arrives in a later phase.")}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-36 z-30 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <p className="truncate text-base text-foreground price-text">
              {formatNaira(listing.price)}
              <span className="text-xs font-medium text-muted-foreground">
                {" "}
                / {formatPricePeriod(listing.pricePeriod)}
              </span>
            </p>
          </div>
          <Button
            className="ml-auto h-12 flex-1"
            onClick={() => navigate({ to: "/bookings", search: { propertyId: listing.id } })}
          >
            Request booking
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
