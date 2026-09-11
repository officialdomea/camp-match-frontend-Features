import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function StepNavigation({
  onBack,
  onNext,
  nextLabel = "Continue",
  backLabel = "Back",
  nextDisabled,
  isSubmitting,
  submittingLabel = "Saving",
}: {
  onBack?: (() => void) | undefined;
  onNext: () => void;
  nextLabel?: string;
  backLabel?: string;
  nextDisabled?: boolean | undefined;
  isSubmitting?: boolean | undefined;
  submittingLabel?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      {onBack ? (
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onBack}
          disabled={isSubmitting}
          className="h-12 rounded-xl"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {backLabel}
        </Button>
      ) : null}
      <Button
        type="button"
        size="lg"
        onClick={onNext}
        disabled={nextDisabled || isSubmitting}
        className="h-12 flex-1 rounded-xl"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            {submittingLabel}…
          </>
        ) : (
          nextLabel
        )}
      </Button>
    </div>
  );
}
