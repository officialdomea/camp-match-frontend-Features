import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Search, ShieldCheck, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PropertyRail } from "@/components/listings/property-rail";
import {
  useNearbyListings,
  useRecentListings,
  useRecommendedListings,
  useUniversities,
} from "@/features/listings/hooks/use-listings";
import { greetingForNow } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Camp Match — Verified student housing near your campus" },
      {
        name: "description",
        content:
          "Discover verified student accommodation in Nigeria, compare prices in naira and connect with trusted House Scouts near your university.",
      },
      {
        property: "og:title",
        content: "Camp Match — Verified student housing near your campus",
      },
      {
        property: "og:description",
        content:
          "Discover verified student accommodation in Nigeria and connect with trusted House Scouts.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [universityId, setUniversityId] = useState<string | undefined>("uni_unical");

  const universities = useUniversities();
  const recommended = useRecommendedListings();
  const nearby = useNearbyListings(universityId);
  const recent = useRecentListings();

  return (
    <AppShell>
      <div className="space-y-8 py-6">
        <header className="px-4 sm:px-6">
          <p className="text-sm text-muted-foreground">{greetingForNow()}, Amara</p>
          <h1 className="mt-1 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Find a place
            <br />
            that feels like home.
          </h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Discover verified student housing near your campus.
          </p>

          <form
            role="search"
            className="mt-5"
            onSubmit={(event) => {
              event.preventDefault();
              navigate({ to: "/discover", search: { q: query || undefined } });
            }}
          >
            <label htmlFor="home-search" className="sr-only">
              Search by university, area or property
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                id="home-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by university, area or property"
                className="h-13 w-full rounded-2xl border border-border bg-surface pl-11 pr-4 text-sm shadow-card outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
              />
            </div>
          </form>

          <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            {universities.data?.map((university) => {
              const active = university.id === universityId;
              return (
                <button
                  key={university.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setUniversityId(university.id)}
                  className={
                    active
                      ? "shrink-0 rounded-full border border-primary bg-primary px-4 py-2 text-xs font-medium text-primary-foreground"
                      : "shrink-0 rounded-full border border-border bg-surface px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40"
                  }
                >
                  {university.shortName}
                </button>
              );
            })}
          </div>
        </header>

        <div className="px-4 sm:px-6">
          <div className="flex items-start gap-3 rounded-2xl border border-border bg-primary-soft p-4">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
            <p className="text-sm text-foreground">
              <span className="font-semibold">Verified before you pay.</span> Every Camp Match
              listing is visited by a Scout who confirms the landlord, the rooms and the price.
            </p>
          </div>
        </div>

        <PropertyRail
          title="Recommended for you"
          subtitle="Highly rated, fully verified homes"
          listings={recommended.data}
          isLoading={recommended.isPending}
          isError={recommended.isError}
          onRetry={() => recommended.refetch()}
        />

        <PropertyRail
          title="Near your campus"
          subtitle="Shortest walk to lectures"
          listings={nearby.data}
          isLoading={nearby.isPending}
          isError={nearby.isError}
          onRetry={() => nearby.refetch()}
        />

        <PropertyRail
          title="Recently added"
          subtitle="Fresh listings this week"
          listings={recent.data}
          isLoading={recent.isPending}
          isError={recent.isError}
          onRetry={() => recent.refetch()}
        />

        <div className="px-4 sm:px-6">
          <div className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4">
            <Sparkles className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              You're viewing demo data. Bookings, messages and payments arrive in later phases.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
