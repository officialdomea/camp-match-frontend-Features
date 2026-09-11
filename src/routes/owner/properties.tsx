import { createFileRoute, Link } from "@tanstack/react-router";
import { Filter, Plus, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PropertyManagementCard } from "@/features/properties/components/property-management-card";
import { useOwnerProperties } from "@/features/properties/hooks/use-properties";
import type { PropertyStatus } from "@/types/property";

export const Route = createFileRoute("/owner/properties")({
  component: OwnerPropertiesPage,
});

const statusOptions: Array<{ value: PropertyStatus | "all"; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "pending_review", label: "Pending review" },
  { value: "active", label: "Active" },
  { value: "unavailable", label: "Unavailable" },
  { value: "changes_requested", label: "Changes requested" },
  { value: "rejected", label: "Rejected" },
  { value: "suspended", label: "Suspended" },
];

function OwnerPropertiesPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<PropertyStatus | "all">("all");
  const [sort, setSort] = useState<"newest" | "oldest" | "price-asc" | "price-desc">("newest");

  const params = useMemo(
    () => ({
      query: query.trim() || undefined,
      status: status === "all" ? undefined : status,
      sort,
    }),
    [query, status, sort],
  );

  const { data, isPending, isError, refetch } = useOwnerProperties(params);

  return (
    <AppShell>
      <div className="space-y-6 px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Property owner
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">My Properties</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage the properties you own.</p>
          </div>
          <Button asChild>
            <Link to="/owner/properties/new">
              <Plus className="size-4" aria-hidden="true" />
              Add property
            </Link>
          </Button>
        </div>

        <div className="grid gap-3 rounded-2xl border border-border bg-surface p-4 md:grid-cols-[minmax(0,1fr)_220px_180px]">
          <label className="relative block">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search properties"
              className="pl-9"
            />
          </label>

          <Select
            value={status}
            onValueChange={(value) => setStatus(value as PropertyStatus | "all")}
          >
            <SelectTrigger className="w-full">
              <Filter className="mr-2 size-4" aria-hidden="true" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={(value) => setSort(value as typeof sort)}>
            <SelectTrigger className="w-full">
              <SlidersHorizontal className="mr-2 size-4" aria-hidden="true" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="price-asc">Price: low to high</SelectItem>
              <SelectItem value="price-desc">Price: high to low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isPending ? (
          <LoadingState label="Loading your properties" />
        ) : isError ? (
          <ErrorState title="We couldn't load your properties" onRetry={() => void refetch()} />
        ) : !data || data.length === 0 ? (
          <EmptyState
            title="You don't have any properties yet"
            description="Add your first property and start building your Camp Match portfolio."
            action={
              <Button asChild>
                <Link to="/owner/properties/new">+ Add property</Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {data.map((property) => (
              <PropertyManagementCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
