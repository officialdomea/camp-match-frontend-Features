import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function PropertyCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-border bg-surface", className)}>
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-3 w-3/5" />
        <Skeleton className="h-3 w-2/5" />
      </div>
    </div>
  );
}

export function PropertyGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, index) => (
        <PropertyCardSkeleton key={index} />
      ))}
    </div>
  );
}
