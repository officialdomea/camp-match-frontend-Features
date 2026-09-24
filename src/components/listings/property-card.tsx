import { Link } from "@tanstack/react-router";
import { Heart, MapPin, Star } from "lucide-react";
import type { Listing } from "@/types/listing";
import { formatDistance, formatNaira, formatPricePeriod } from "@/lib/format";
import { VerificationBadge } from "./verification-badge";
import { accommodationLabels } from "./accommodation-labels";
import { cn } from "@/lib/utils";
import { SafeImage } from "@/components/common/safe-image";

type PropertyCardProps = {
  listing: Listing;
  saved?: boolean | undefined;
  onToggleSave?: ((id: string) => void) | undefined;
  className?: string | undefined;
  priority?: boolean | undefined;
};

export function PropertyCard({
  listing,
  saved = false,
  onToggleSave,
  className,
  priority = false,
}: PropertyCardProps) {
  const cover = listing.images[0];

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-surface shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift focus-within:-translate-y-0.5",
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {cover ? (
          <SafeImage
            src={cover.url}
            alt={cover.alt}
            width={1024}
            height={768}
            loading={priority ? "eager" : "lazy"}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            fallbackLabel="Property image unavailable"
          />
        ) : (
          <SafeImage alt={listing.title} className="size-full" fallbackLabel="No property image" />
        )}

        <div className="absolute left-3 top-3">
          <VerificationBadge
            verified={listing.verification.verified}
            className="bg-surface/95 backdrop-blur-sm"
          />
        </div>

        {onToggleSave ? (
          <button
            type="button"
            onClick={() => onToggleSave(listing.id)}
            aria-pressed={saved}
            aria-label={saved ? `Remove ${listing.title} from saved` : `Save ${listing.title}`}
            className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-full bg-surface/90 text-foreground shadow-card backdrop-blur-sm transition-transform active:scale-90"
          >
            <Heart
              className={cn(
                "size-4.5 transition-colors",
                saved ? "fill-destructive text-destructive" : "text-foreground",
              )}
              aria-hidden="true"
            />
          </button>
        ) : null}
      </div>

      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
            <Link
              to="/listings/$listingId"
              params={{ listingId: listing.id }}
              className="after:absolute after:inset-0 after:content-['']"
            >
              {listing.title}
            </Link>
          </h3>
          {listing.rating ? (
            <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-muted-foreground">
              <Star className="size-3.5 fill-accent text-accent" aria-hidden="true" />
              {listing.rating.toFixed(1)}
            </span>
          ) : null}
        </div>

        <p className="text-lg text-foreground price-text">
          {formatNaira(listing.price)}
          <span className="text-sm font-medium text-muted-foreground">
            {" "}
            / {formatPricePeriod(listing.pricePeriod)}
          </span>
        </p>

        <div className="space-y-1 text-sm text-muted-foreground">
          <p className="flex items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">
              {listing.location.area}, {listing.location.city}
            </span>
          </p>
          <p className="text-xs">
            {formatDistance(listing.location.distanceFromCampusKm)} ·{" "}
            {listing.location.universityName}
          </p>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            {accommodationLabels[listing.accommodationType]}
          </span>
          {listing.availability.status === "limited" ? (
            <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent-foreground">
              Only {listing.availability.unitsAvailable} left
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
