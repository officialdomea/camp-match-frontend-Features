import { Slider } from "@/components/ui/slider";
import { formatNaira } from "@/lib/format";

const MIN = 50_000;
const MAX = 2_000_000;
const STEP = 25_000;

const presets: Array<{ label: string; min: number; max: number }> = [
  { label: "Under ₦200k", min: MIN, max: 200_000 },
  { label: "₦200k – ₦500k", min: 200_000, max: 500_000 },
  { label: "₦500k – ₦1m", min: 500_000, max: 1_000_000 },
  { label: "₦1m+", min: 1_000_000, max: MAX },
];

/** Annual naira budget range used by student onboarding and, later, search. */
export function BudgetSelector({
  min,
  max,
  onChange,
}: {
  min: number;
  max: number;
  onChange: (range: { min: number; max: number }) => void;
}) {
  return (
    <div className="space-y-5 rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Yearly budget
          </p>
          <p className="mt-1 text-lg font-bold tabular-nums text-foreground">
            {formatNaira(min)} – {formatNaira(max)}
          </p>
        </div>
      </div>

      <Slider
        value={[min, max]}
        min={MIN}
        max={MAX}
        step={STEP}
        minStepsBetweenThumbs={1}
        aria-label="Budget range"
        onValueChange={(range) => {
          const [nextMin, nextMax] = range as [number, number];
          onChange({ min: nextMin, max: nextMax });
        }}
      />

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatNaira(MIN)}</span>
        <span>{formatNaira(MAX)}+</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => {
          const active = preset.min === min && preset.max === max;
          return (
            <button
              key={preset.label}
              type="button"
              aria-pressed={active}
              onClick={() => onChange({ min: preset.min, max: preset.max })}
              className={
                active
                  ? "rounded-full border border-primary bg-primary-soft px-3 py-1.5 text-xs font-medium text-primary"
                  : "rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              }
            >
              {preset.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
