import type { Listing } from "@/types/listing";
import { PropertyCard } from "./property-card";
import { useSavedListings } from "@/features/saved/hooks/use-saved-listings";
import { cn } from "@/lib/utils";

export function PropertyGrid({ listings, className }: { listings: Listing[]; className?: string }) {
  const { isSaved, toggleSaved } = useSavedListings();

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4",
        className,
      )}
    >
      {listings.map((listing, index) => (
        <PropertyCard
          key={listing.id}
          listing={listing}
          saved={isSaved(listing.id)}
          onToggleSave={toggleSaved}
          priority={index < 2}
        />
      ))}
    </div>
  );
}
