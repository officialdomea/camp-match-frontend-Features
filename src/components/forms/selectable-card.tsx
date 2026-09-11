import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Shared selection primitive used by role cards, accommodation chips and any
 * other "pick one / pick many" step. Behaves as a radio or checkbox for AT.
 */
export function SelectableCard({
  selected,
  onSelect,
  title,
  description,
  visual,
  multi,
  disabled,
  className,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  description?: string | undefined;
  visual?: ReactNode;
  multi?: boolean | undefined;
  disabled?: boolean | undefined;
  className?: string | undefined;
}) {
  return (
    <button
      type="button"
      role={multi ? "checkbox" : "radio"}
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "group relative flex w-full items-start gap-4 rounded-2xl border bg-surface p-4 text-left transition-all duration-150 motion-reduce:transition-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        "active:scale-[0.99] motion-reduce:active:scale-100",
        selected
          ? "border-primary bg-primary-soft shadow-card"
          : "border-border hover:border-primary/40",
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      {visual ? (
        <span
          aria-hidden="true"
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl text-xl transition-colors",
            selected ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
          )}
        >
          {visual}
        </span>
      ) : null}

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-foreground">{title}</span>
        {description ? (
          <span className="mt-1 block text-sm text-muted-foreground">{description}</span>
        ) : null}
      </span>

      <span
        aria-hidden="true"
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
          selected
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-background",
        )}
      >
        {selected ? <Check className="size-3.5" /> : null}
      </span>
    </button>
  );
}
