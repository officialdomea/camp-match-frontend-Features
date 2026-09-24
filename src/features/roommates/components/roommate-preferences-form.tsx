import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RoommatePreferences } from "@/types/roommate";

const lifestyleOptions = [
  "study-focused",
  "quiet",
  "clean",
  "social",
  "independent",
  "pet-friendly",
  "early-bird",
  "night-owl",
];

const studyOptions = ["morning-person", "night-owl", "balanced"];
const sleepOptions = ["early-bird", "night-owl", "flexible"];
const noiseOptions = ["quiet", "moderate", "lively"];
const cleanlinessOptions = ["low", "moderate", "high"];
const socialOptions = ["quiet", "moderate", "social"];

function toggleListValue(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export function RoommatePreferencesForm({
  value,
  onChange,
  onSave,
  saving,
  error,
}: {
  value: RoommatePreferences;
  onChange: (next: RoommatePreferences) => void;
  onSave: () => void;
  saving: boolean;
  error?: string | null;
}) {
  const update = <K extends keyof RoommatePreferences>(
    field: K,
    nextValue: RoommatePreferences[K],
  ) => {
    onChange({ ...value, [field]: nextValue });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Roommate preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="space-y-2">
          <Label>Living preference</Label>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              { value: "find-roommate", label: "I want to find a roommate" },
              { value: "live-alone", label: "I want to live alone" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                className={[
                  "rounded-xl border p-3 text-left transition-colors",
                  value.livingPreference === option.value
                    ? "border-primary bg-primary-soft text-primary"
                    : "border-border bg-background hover:border-primary/40",
                ].join(" ")}
                onClick={() =>
                  update(
                    "livingPreference",
                    option.value as RoommatePreferences["livingPreference"],
                  )
                }
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="preferredArea">Preferred area</Label>
            <Input
              id="preferredArea"
              value={value.preferredArea}
              placeholder="Ekosodin"
              onChange={(event) => update("preferredArea", event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="universityId">University</Label>
            <Input
              id="universityId"
              value={value.universityId}
              placeholder="univ-1"
              onChange={(event) => update("universityId", event.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="budgetMin">Budget minimum</Label>
            <Input
              id="budgetMin"
              type="number"
              value={value.budgetMin}
              onChange={(event) => update("budgetMin", Number(event.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="budgetMax">Budget maximum</Label>
            <Input
              id="budgetMax"
              type="number"
              value={value.budgetMax}
              onChange={(event) => update("budgetMax", Number(event.target.value))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Accommodation types</Label>
          <div className="flex flex-wrap gap-2">
            {["shared", "studio", "private", "duplex", "one-bedroom"].map((option) => {
              const selected = value.accommodationTypes.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() =>
                    update(
                      "accommodationTypes",
                      selected
                        ? value.accommodationTypes.filter((item) => item !== option)
                        : [...value.accommodationTypes, option],
                    )
                  }
                  className={[
                    "rounded-full border px-3 py-1.5 text-xs font-medium",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background",
                  ].join(" ")}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Lifestyle cues</Label>
          <div className="flex flex-wrap gap-2">
            {lifestyleOptions.map((option) => {
              const selected = value.lifestylePreferences.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() =>
                    update(
                      "lifestylePreferences",
                      toggleListValue(value.lifestylePreferences, option),
                    )
                  }
                  className={[
                    "rounded-full border px-3 py-1.5 text-xs font-medium",
                    selected
                      ? "border-primary bg-primary-soft text-primary"
                      : "border-border bg-background",
                  ].join(" ")}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="studyHabits">Study habits</Label>
            <select
              id="studyHabits"
              value={value.studyHabits}
              onChange={(event) => update("studyHabits", event.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {studyOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sleepSchedule">Sleep schedule</Label>
            <select
              id="sleepSchedule"
              value={value.sleepSchedule}
              onChange={(event) => update("sleepSchedule", event.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {sleepOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="noisePreference">Noise preference</Label>
            <select
              id="noisePreference"
              value={value.noisePreference}
              onChange={(event) => update("noisePreference", event.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {noiseOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cleanlinessPreference">Cleanliness</Label>
            <select
              id="cleanlinessPreference"
              value={value.cleanlinessPreference}
              onChange={(event) => update("cleanlinessPreference", event.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {cleanlinessOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="socialPreference">Social style</Label>
            <select
              id="socialPreference"
              value={value.socialPreference}
              onChange={(event) => update("socialPreference", event.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {socialOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <textarea
            id="notes"
            value={value.notes ?? ""}
            onChange={(event) => update("notes", event.target.value)}
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Anything else a roommate should know?"
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={onSave} disabled={saving}>
            {saving ? "Saving..." : "Save preferences"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
