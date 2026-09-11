import type { AccommodationType, University } from "@/types/listing";
import { accommodationOptions } from "./accommodation-labels";
import { formatNaira } from "@/lib/format";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Props = {
  universities: University[];
  universityId?: string | undefined;
  onUniversityChange: (id: string | undefined) => void;
  verifiedOnly: boolean;
  onVerifiedChange: (value: boolean) => void;
  maxPrice: number;
  onMaxPriceChange: (value: number) => void;
  maxDistanceKm: number;
  onMaxDistanceChange: (value: number) => void;
  accommodationTypes: AccommodationType[];
  onAccommodationTypesChange: (value: AccommodationType[]) => void;
  onReset: () => void;
};

export function DiscoverFilters({
  universities,
  universityId,
  onUniversityChange,
  verifiedOnly,
  onVerifiedChange,
  maxPrice,
  onMaxPriceChange,
  maxDistanceKm,
  onMaxDistanceChange,
  accommodationTypes,
  onAccommodationTypesChange,
  onReset,
}: Props) {
  const toggleType = (type: AccommodationType) => {
    onAccommodationTypesChange(
      accommodationTypes.includes(type)
        ? accommodationTypes.filter((item) => item !== type)
        : [...accommodationTypes, type],
    );
  };

  return (
    <div className="space-y-6 rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Filters</h2>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 text-xs text-primary"
          onClick={onReset}
        >
          Reset
        </Button>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          University
        </legend>
        <div className="flex flex-wrap gap-2">
          <FilterChip active={!universityId} onClick={() => onUniversityChange(undefined)}>
            All
          </FilterChip>
          {universities.map((university) => (
            <FilterChip
              key={university.id}
              active={universityId === university.id}
              onClick={() => onUniversityChange(university.id)}
            >
              {university.shortName}
            </FilterChip>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Accommodation type
        </legend>
        <div className="flex flex-wrap gap-2">
          {accommodationOptions.map((option) => (
            <FilterChip
              key={option.value}
              active={accommodationTypes.includes(option.value)}
              onClick={() => toggleType(option.value)}
            >
              {option.label}
            </FilterChip>
          ))}
        </div>
      </fieldset>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="max-price"
            className="text-xs uppercase tracking-wide text-muted-foreground"
          >
            Max price
          </Label>
          <span className="text-sm font-medium">{formatNaira(maxPrice)}</span>
        </div>
        <Slider
          id="max-price"
          min={50000}
          max={1000000}
          step={25000}
          value={[maxPrice]}
          onValueChange={([value]) => onMaxPriceChange(value ?? maxPrice)}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="max-distance"
            className="text-xs uppercase tracking-wide text-muted-foreground"
          >
            Max distance
          </Label>
          <span className="text-sm font-medium">{maxDistanceKm} km</span>
        </div>
        <Slider
          id="max-distance"
          min={0.5}
          max={10}
          step={0.5}
          value={[maxDistanceKm]}
          onValueChange={([value]) => onMaxDistanceChange(value ?? maxDistanceKm)}
        />
      </div>

      <div className="flex items-center justify-between gap-3 rounded-xl bg-muted p-3">
        <Label htmlFor="verified-only" className="text-sm font-medium">
          Verified listings only
        </Label>
        <Switch id="verified-only" checked={verifiedOnly} onCheckedChange={onVerifiedChange} />
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={
        active
          ? "rounded-full border border-primary bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
          : "rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40"
      }
    >
      {children}
    </button>
  );
}
