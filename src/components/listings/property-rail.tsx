import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import type { Listing } from "@/types/listing";
import { PropertyCard } from "./property-card";
import { PropertyCardSkeleton } from "./property-card-skeleton";
import { useSavedListings } from "@/features/saved/hooks/use-saved-listings";
import { ErrorState } from "@/components/common/states";

type PropertyRailProps = {
  title: string;
  subtitle?: string | undefined;
  listings?: Listing[] | undefined;
  isLoading?: boolean | undefined;
  isError?: boolean | undefined;
  onRetry?: (() => void) | undefined;
};

export function PropertyRail({
  title,
  subtitle,
  listings,
  isLoading,
  isError,
  onRetry,
}: PropertyRailProps) {
  const { isSaved, toggleSaved } = useSavedListings();

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-4 px-4 sm:px-6">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
        <Link
          to="/discover"
          className="flex shrink-0 items-center gap-0.5 text-sm font-medium text-primary"
        >
          See all
          <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      {isError ? (
        <div className="px-4 sm:px-6">
          <ErrorState onRetry={onRetry} />
        </div>
      ) : (
        <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:px-6">
          {isLoading
            ? Array.from({ length: 3 }).map((_, index) => (
                <PropertyCardSkeleton key={index} className="w-[78vw] shrink-0 sm:w-72" />
              ))
            : listings?.map((listing, index) => (
                <PropertyCard
                  key={listing.id}
                  listing={listing}
                  saved={isSaved(listing.id)}
                  onToggleSave={toggleSaved}
                  priority={index === 0}
                  className="w-[78vw] shrink-0 snap-start sm:w-72"
                />
              ))}
        </div>
      )}
    </section>
  );
}
