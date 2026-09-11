import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function OnboardingProgress({ steps, current }: { steps: string[]; current: number }) {
  return (
    <nav aria-label="Onboarding progress">
      <p className="sr-only" aria-live="polite">
        Step {current + 1} of {steps.length}: {steps[current]}
      </p>
      <ol className="flex items-center">
        {steps.map((step, index) => {
          const done = index < current;
          const active = index === current;
          return (
            <li
              key={step}
              className={cn("flex items-center", index < steps.length - 1 && "flex-1")}
            >
              <span
                aria-current={active ? "step" : undefined}
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors motion-reduce:transition-none",
                  done && "border-primary bg-primary text-primary-foreground",
                  active && "border-primary bg-primary-soft text-primary",
                  !done && !active && "border-border bg-surface text-muted-foreground",
                )}
              >
                {done ? <Check className="size-4" aria-hidden="true" /> : index + 1}
                <span className="sr-only">{step}</span>
              </span>
              {index < steps.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    "mx-1 h-0.5 flex-1 rounded-full transition-colors",
                    done ? "bg-primary" : "bg-border",
                  )}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
