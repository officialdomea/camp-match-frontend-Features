import { CalendarDays, Eye, MapPin, ShieldCheck, Star } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatNaira } from "@/lib/format";
import type { ManagedProperty } from "@/types/property";

function toStatusTone(status: ManagedProperty["status"]) {
  switch (status) {
    case "active":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300";
    case "pending_review":
      return "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300";
    case "changes_requested":
      return "bg-orange-100 text-orange-800 dark:bg-orange-500/10 dark:text-orange-300";
    case "rejected":
      return "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-300";
    case "unavailable":
    case "suspended":
      return "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200";
    default:
      return "bg-sky-100 text-sky-800 dark:bg-sky-500/10 dark:text-sky-300";
  }
}

export function PropertyManagementCard({ property }: { property: ManagedProperty }) {
  const statusTone = toStatusTone(property.status);

  return (
    <Card className="overflow-hidden">
      <div className="grid gap-4 p-4 md:grid-cols-[180px_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-xl bg-muted">
          <img
            src={property.photos[0]?.url ?? "https://images.unsplash.com/..."}
            alt={property.photos[0]?.alt ?? property.title}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-foreground">{property.title}</h3>
              <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="size-3.5" aria-hidden="true" />
                <span>
                  {property.location.area}, {property.location.city}
                </span>
              </div>
            </div>
            <Badge className={statusTone}>{property.status.replace(/_/g, " ")}</Badge>
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="rounded-full bg-muted px-2 py-1">
              {property.location.universityName}
            </span>
            <span className="rounded-full bg-muted px-2 py-1">{property.availability.status}</span>
            <span className="rounded-full bg-muted px-2 py-1">{property.verification.overall}</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {formatNaira(property.pricing.rent)}
            </span>
            <span>/{property.pricing.period}</span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4" aria-hidden="true" />
              {property.availability.availableFrom}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Eye className="size-4" aria-hidden="true" />
              {property.performance.views}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Star className="size-4" aria-hidden="true" />
              {property.performance.saves}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-4" aria-hidden="true" />
              {property.verification.overall}
            </span>
          </div>

          <div className="flex justify-end">
            <Button asChild size="sm">
              <Link to="/owner/properties/$propertyId" params={{ propertyId: property.id }}>
                Manage property
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
