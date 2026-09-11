import { useMemo, useState } from "react";
import { GraduationCap, Search } from "lucide-react";
import { useUniversities } from "@/features/listings/hooks/use-listings";
import { fieldInputClass } from "@/components/forms/form-field";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBanner } from "@/components/forms/error-banner";
import { normalizeError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

/**
 * Searchable university picker. Data comes from the listings provider, so it
 * switches to the FastAPI backend with no changes here.
 */
export function UniversitySelector({
  value,
  onChange,
  error,
}: {
  value: string | null;
  onChange: (universityId: string) => void;
  error?: string | undefined;
}) {
  const [query, setQuery] = useState("");
  const { data, isPending, isError, error: queryError, refetch } = useUniversities();

  const results = useMemo(() => {
    const list = data ?? [];
    const term = query.trim().toLowerCase();
    if (!term) return list;
    return list.filter((uni) =>
      [uni.name, uni.shortName, uni.city, uni.state].join(" ").toLowerCase().includes(term),
    );
  }, [data, query]);

  if (isError) {
    return <ErrorBanner error={normalizeError(queryError)} onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <label htmlFor="university-search" className="sr-only">
          Search universities
        </label>
        <input
          id="university-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search your university"
          className={cn(fieldInputClass, "pl-10")}
        />
      </div>

      <div
        role="radiogroup"
        aria-label="University"
        className="max-h-[22rem] space-y-2 overflow-y-auto pr-0.5"
      >
        {isPending ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-2xl" />
          ))
        ) : results.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No university matches “{query}”. Try a shorter search.
          </p>
        ) : (
          results.map((uni) => {
            const selected = uni.id === value;
            return (
              <button
                key={uni.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChange(uni.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl border bg-surface p-4 text-left transition-all duration-150 motion-reduce:transition-none",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-[0.99] motion-reduce:active:scale-100",
                  selected
                    ? "border-primary bg-primary-soft shadow-card"
                    : "border-border hover:border-primary/40",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-xl",
                    selected ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                  )}
                >
                  <GraduationCap className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-foreground">
                    {uni.name}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {uni.shortName} · {uni.city}, {uni.state}
                  </span>
                </span>
              </button>
            );
          })
        )}
      </div>

      {error ? (
        <p className="text-xs font-medium text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
