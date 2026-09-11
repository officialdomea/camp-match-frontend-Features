import { MapPin, Navigation } from "lucide-react";
import type { ListingLocation } from "@/types/listing";
import { formatDistance } from "@/lib/format";

export function PropertyLocation({ location }: { location: ListingLocation }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div
        className="relative h-40 bg-primary-soft"
        role="img"
        aria-label={`Map placeholder for ${location.area}, ${location.city}`}
      >
        <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] [background-size:28px_28px]" />
        <span className="absolute left-1/2 top-1/2 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lift">
          <MapPin className="size-5" aria-hidden="true" />
        </span>
      </div>
      <div className="space-y-1 p-4">
        <p className="font-medium text-foreground">
          {location.area}, {location.city}, {location.state}
        </p>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Navigation className="size-3.5" aria-hidden="true" />
          {formatDistance(location.distanceFromCampusKm)} · {location.universityName}
        </p>
      </div>
    </div>
  );
}
