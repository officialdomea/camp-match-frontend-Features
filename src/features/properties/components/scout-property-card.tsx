import { ArrowRight, Building2, MapPin, ShieldCheck, UserRound } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatNaira } from "@/lib/format";
import type { ScoutManagedProperty } from "@/types/property";
import { SafeImage } from "@/components/common/safe-image";

function statusTone(status: ScoutManagedProperty["status"]) {
  switch (status) {
    case "active":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300";
    case "pending_review":
      return "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300";
    case "changes_requested":
      return "bg-orange-100 text-orange-800 dark:bg-orange-500/10 dark:text-orange-300";
    case "rejected":
      return "bg-red-100 text-red-800 dark:bg-red-300 dark:text-red-200";
    case "unavailable":
    case "suspended":
      return "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200";
    default:
      return "bg-sky-100 text-sky-800 dark:bg-sky-500/10 dark:text-sky-300";
  }
}

export function ScoutPropertyCard({ property }: { property: ScoutManagedProperty }) {
  return (
    <Card className="overflow-hidden">
      <div className="grid gap-4 p-4 md:grid-cols-[180px_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-xl bg-muted">
          <SafeImage
            src={property.photos[0]?.url}
            alt={property.photos[0]?.alt ?? property.title}
            className="h-full w-full object-cover"
            fallbackLabel="No property image"
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
            <Badge className={statusTone(property.status)}>
              {property.status.replace(/_/g, " ")}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-1">
              <UserRound className="size-3.5" aria-hidden="true" />
              Owner: {property.owner.name}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-1">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              Your role: House Scout
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {formatNaira(property.pricing.rent)}
            </span>
            <span>/{property.pricing.period}</span>
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="size-4" aria-hidden="true" />
              {property.accommodationType.replace(/-/g, " ")}
            </span>
          </div>

          <div className="flex justify-end">
            <Button asChild size="sm">
              <Link to="/scout/properties/$propertyId" params={{ propertyId: property.id }}>
                View property
                <ArrowRight className="ml-2 size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
