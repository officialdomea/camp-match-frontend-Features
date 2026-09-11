import { AlertTriangle, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AppError } from "@/lib/api/errors";

export function ErrorBanner({
  error,
  onRetry,
}: {
  error: AppError | null;
  onRetry?: (() => void) | undefined;
}) {
  if (!error) return null;
  const Icon = error.code === "NETWORK_ERROR" ? WifiOff : AlertTriangle;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex items-start gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4"
    >
      <Icon className="mt-0.5 size-4.5 shrink-0 text-destructive" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{error.title}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{error.message}</p>
        {error.retryable && onRetry ? (
          <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
            Try again
          </Button>
        ) : null}
      </div>
    </div>
  );
}
