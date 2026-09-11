import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { z } from "zod";
import { AppShell } from "@/components/layout/app-shell";
import { PropertyGrid } from "@/components/listings/property-grid";
import { PropertyGridSkeleton } from "@/components/listings/property-card-skeleton";
import { EmptyState, ErrorState } from "@/components/common/states";
import { DiscoverFilters } from "@/components/listings/discover-filters";
import { useListingSearch, useUniversities } from "@/features/listings/hooks/use-listings";
import type { AccommodationType, ListingSort } from "@/types/listing";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const searchSchema = z.object({
  q: z.string().optional(),
  university: z.string().optional(),
  verified: z.boolean().optional(),
  sort: z.enum(["recommended", "price-asc", "price-desc", "distance", "newest"]).optional(),
});

export const Route = createFileRoute("/discover")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Discover student housing — Camp Match" },
      {
        name: "description",
        content:
          "Filter verified student accommodation by university, area, price, distance and room type across Nigeria.",
      },
      { property: "og:title", content: "Discover student housing — Camp Match" },
      {
        property: "og:description",
        content:
          "Filter verified student accommodation by university, price and distance from campus.",
      },
    ],
  }),
  component: DiscoverPage,
});

function DiscoverPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/discover" });
  const universities = useUniversities();

  const [query, setQuery] = useState(search.q ?? "");
  const [maxPrice, setMaxPrice] = useState<number>(1000000);
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(10);
  const [accommodationTypes, setAccommodationTypes] = useState<AccommodationType[]>([]);

  const params = useMemo(
    () => ({
      query: search.q,
      universityId: search.university,
      verifiedOnly: search.verified,
      sort: (search.sort ?? "recommended") as ListingSort,
      maxPrice,
      maxDistanceKm,
      accommodationTypes,
    }),
    [search, maxPrice, maxDistanceKm, accommodationTypes],
  );

  const listings = useListingSearch(params);
  const results = listings.data?.items ?? [];

  const filters = (
    <DiscoverFilters
      universities={universities.data ?? []}
      universityId={search.university}
      onUniversityChange={(university) => navigate({ search: (prev) => ({ ...prev, university }) })}
      verifiedOnly={search.verified ?? false}
      onVerifiedChange={(verified) =>
        navigate({ search: (prev) => ({ ...prev, verified: verified || undefined }) })
      }
      maxPrice={maxPrice}
      onMaxPriceChange={setMaxPrice}
      maxDistanceKm={maxDistanceKm}
      onMaxDistanceChange={setMaxDistanceKm}
      accommodationTypes={accommodationTypes}
      onAccommodationTypesChange={setAccommodationTypes}
      onReset={() => {
        setMaxPrice(1000000);
        setMaxDistanceKm(10);
        setAccommodationTypes([]);
        navigate({ search: { q: search.q } });
      }}
    />
  );

  return (
    <AppShell>
      <div className="py-6">
        <div className="px-4 sm:px-6">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Discover</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Verified homes near Nigerian campuses.
          </p>

          <form
            role="search"
            className="mt-4"
            onSubmit={(event) => {
              event.preventDefault();
              navigate({ search: (prev) => ({ ...prev, q: query || undefined }) });
            }}
          >
            <label htmlFor="discover-search" className="sr-only">
              Search listings
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                id="discover-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by university, area or property"
                className="h-12 w-full rounded-2xl border border-border bg-surface pl-11 pr-4 text-sm shadow-card outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
              />
            </div>
          </form>

          <div className="mt-4 flex items-center gap-2">
            <FiltersSheet trigger={filters} />
            <Select
              value={search.sort ?? "recommended"}
              onValueChange={(value) =>
                navigate({
                  search: (prev) => ({ ...prev, sort: value as ListingSort }),
                })
              }
            >
              <SelectTrigger className="h-10 w-44 rounded-full bg-surface">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">Recommended</SelectItem>
                <SelectItem value="price-asc">Price: low to high</SelectItem>
                <SelectItem value="price-desc">Price: high to low</SelectItem>
                <SelectItem value="distance">Closest to campus</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>
            <p className="ml-auto text-sm text-muted-foreground" aria-live="polite">
              {listings.isPending ? "Searching…" : `${results.length} homes`}
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-6 px-4 sm:px-6">
          <div className="hidden w-72 shrink-0 xl:block">{filters}</div>
          <div className="min-w-0 flex-1">
            {listings.isPending ? (
              <PropertyGridSkeleton />
            ) : listings.isError ? (
              <ErrorState onRetry={() => listings.refetch()} />
            ) : results.length === 0 ? (
              <EmptyState
                title="No homes match these filters"
                description="Try widening your price range or distance from campus."
                action={
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMaxPrice(1000000);
                      setMaxDistanceKm(10);
                      setAccommodationTypes([]);
                      navigate({ search: {} });
                    }}
                  >
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <PropertyGrid listings={results} />
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function FiltersSheet({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant="outline"
        className="h-10 rounded-full bg-surface xl:hidden"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        <SlidersHorizontal className="size-4" aria-hidden="true" />
        Filters
      </Button>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end bg-foreground/40 xl:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Filters"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[85vh] w-full overflow-y-auto rounded-t-3xl bg-background p-4 pb-8 animate-in slide-in-from-bottom duration-200"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border" />
            {trigger}
            <Button className="mt-4 w-full" onClick={() => setOpen(false)}>
              Show results
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
}
