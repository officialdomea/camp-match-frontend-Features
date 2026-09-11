import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Building2, MapPin, PoundSterling, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { ErrorBanner } from "@/components/forms/error-banner";
import { FormField } from "@/components/forms/form-field";
import { SelectableCard } from "@/components/forms/selectable-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { propertyService } from "@/features/properties/services/property.service";
import type { AccommodationType, PricePeriod } from "@/types/listing";
import type { PropertyDraftInput } from "@/types/property";
import type { AppError } from "@/lib/api/errors";
import { normalizeError } from "@/lib/api/errors";

export const Route = createFileRoute("/owner/properties/new")({
  component: CreatePropertyPage,
});

const accommodationOptions: { value: AccommodationType; label: string }[] = [
  { value: "single-room", label: "Single room" },
  { value: "self-contained", label: "Self-contained" },
  { value: "shared-apartment", label: "Shared apartment" },
  { value: "one-bedroom", label: "One-bedroom" },
  { value: "two-bedroom", label: "Two-bedroom" },
  { value: "hostel", label: "Hostel" },
];

const featureOptions = [
  "water",
  "electricity",
  "prepaid-meter",
  "parking",
  "security",
  "internet",
  "kitchen",
  "furnished",
  "generator",
  "wardrobe",
];

const steps = [
  { key: "basic", label: "Basic info" },
  { key: "location", label: "Location" },
  { key: "pricing", label: "Pricing" },
  { key: "features", label: "Features" },
  { key: "photos", label: "Photos" },
  { key: "review", label: "Review" },
] as const;

const accommodationTypeValues = [
  "single-room",
  "self-contained",
  "shared-apartment",
  "one-bedroom",
  "two-bedroom",
  "hostel",
] as const satisfies readonly AccommodationType[];

const pricePeriodValues = ["year", "semester", "month"] as const satisfies readonly PricePeriod[];

const isAccommodationType = (value: string): value is AccommodationType =>
  accommodationTypeValues.includes(value as AccommodationType);

const isPricePeriod = (value: string): value is PricePeriod =>
  pricePeriodValues.includes(value as PricePeriod);

function CreatePropertyPage() {
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [form, setForm] = useState<PropertyDraftInput>({
    title: "",
    description: "",
    accommodationType: "single-room",
    location: {
      universityId: "uni_unical",
      universityName: "University of Calabar",
      area: "",
      address: "",
      city: "Calabar",
      state: "Cross River",
    },
    pricing: {
      rent: 0,
      period: "year",
    },
    features: {
      bedrooms: 1,
      bathrooms: 1,
      amenities: [],
    },
    availability: {
      availableFrom: new Date().toISOString().slice(0, 10),
      unitsAvailable: 1,
    },
    photos: [],
  });

  const currentStep = steps[stepIndex] ?? steps[0];

  const canContinue = useMemo(() => {
    if (currentStep.key === "basic") {
      return Boolean(form.title.trim() && form.description.trim() && form.accommodationType);
    }
    if (currentStep.key === "location") {
      return Boolean(form.location.area && form.location.address && form.location.city);
    }
    if (currentStep.key === "pricing") {
      return Boolean(form.pricing.rent > 0 && form.pricing.period);
    }
    if (currentStep.key === "features") {
      return Boolean(form.features.bedrooms > 0 && form.features.bathrooms >= 0);
    }
    if (currentStep.key === "photos") {
      return true;
    }
    return true;
  }, [currentStep.key, form]);

  const updateForm = <K extends keyof PropertyDraftInput>(key: K, value: PropertyDraftInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const nextStep = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex((value) => value + 1);
      setError(null);
    }
  };

  const previousStep = () => {
    if (stepIndex > 0) setStepIndex((value) => value - 1);
  };

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await propertyService.createProperty(form);
      toast.success("Property submitted successfully");
      navigate({ to: "/owner/properties" });
    } catch (caught) {
      setError(normalizeError(caught));
    } finally {
      setSubmitting(false);
    }
  };

  const toggleAmenity = (amenity: string) => {
    setForm((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        amenities: prev.features.amenities.includes(amenity)
          ? prev.features.amenities.filter((value) => value !== amenity)
          : [...prev.features.amenities, amenity],
      },
    }));
  };

  const renderStep = () => {
    switch (currentStep.key) {
      case "basic":
        return (
          <div className="space-y-5">
            <FormField
              label="Property title"
              required
              value={form.title}
              onChange={(event) => updateForm("title", event.target.value)}
            />
            <div>
              <p className="mb-2 text-sm font-medium">Accommodation type</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {accommodationOptions.map((option) => (
                  <SelectableCard
                    key={option.value}
                    selected={form.accommodationType === option.value}
                    onSelect={() => updateForm("accommodationType", option.value)}
                    title={option.label}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Description</label>
              <Textarea
                value={form.description}
                onChange={(event) => updateForm("description", event.target.value)}
                rows={5}
                placeholder="Describe the room, amenities and what makes it ideal for students."
              />
            </div>
          </div>
        );
      case "location":
        return (
          <div className="space-y-5">
            <FormField
              label="University"
              value={form.location.universityName ?? ""}
              onChange={(event) =>
                updateForm("location", { ...form.location, universityName: event.target.value })
              }
            />
            <FormField
              label="Area"
              required
              value={form.location.area}
              onChange={(event) =>
                updateForm("location", { ...form.location, area: event.target.value })
              }
            />
            <FormField
              label="Address"
              required
              value={form.location.address}
              onChange={(event) =>
                updateForm("location", { ...form.location, address: event.target.value })
              }
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="City"
                value={form.location.city ?? ""}
                onChange={(event) =>
                  updateForm("location", { ...form.location, city: event.target.value })
                }
              />
              <FormField
                label="State"
                value={form.location.state ?? ""}
                onChange={(event) =>
                  updateForm("location", { ...form.location, state: event.target.value })
                }
              />
            </div>
          </div>
        );
      case "pricing":
        return (
          <div className="space-y-5">
            <FormField
              label="Rent"
              type="number"
              value={String(form.pricing.rent)}
              onChange={(event) =>
                updateForm("pricing", { ...form.pricing, rent: Number(event.target.value) })
              }
            />
            <div>
              <label className="mb-1 block text-sm font-medium">Payment frequency</label>
              <Select
                value={form.pricing.period}
                onValueChange={(value) => {
                  if (!isPricePeriod(value)) return;
                  updateForm("pricing", {
                    ...form.pricing,
                    period: value,
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose rent period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="year">Per year</SelectItem>
                  <SelectItem value="semester">Per semester</SelectItem>
                  <SelectItem value="month">Per month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <FormField
              label="Available from"
              type="date"
              value={form.availability.availableFrom}
              onChange={(event) =>
                updateForm("availability", {
                  ...form.availability,
                  availableFrom: event.target.value,
                })
              }
            />
          </div>
        );
      case "features":
        return (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Bedrooms"
                type="number"
                value={String(form.features.bedrooms)}
                onChange={(event) =>
                  updateForm("features", { ...form.features, bedrooms: Number(event.target.value) })
                }
              />
              <FormField
                label="Bathrooms"
                type="number"
                value={String(form.features.bathrooms)}
                onChange={(event) =>
                  updateForm("features", {
                    ...form.features,
                    bathrooms: Number(event.target.value),
                  })
                }
              />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Amenities</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {featureOptions.map((feature) => (
                  <SelectableCard
                    key={feature}
                    selected={form.features.amenities.includes(feature)}
                    onSelect={() => toggleAmenity(feature)}
                    title={feature.replace(/-/g, " ")}
                    className="p-3"
                  />
                ))}
              </div>
            </div>
          </div>
        );
      case "photos":
        return (
          <div className="space-y-4">
            <div className="rounded-2xl border border-dashed border-border bg-surface p-6 text-center">
              <Sparkles className="mx-auto size-8 text-primary" aria-hidden="true" />
              <p className="mt-3 text-base font-medium">Add photos later</p>
              <p className="mt-1 text-sm text-muted-foreground">
                You can upload images after the property is created, or add one URL below.
              </p>
            </div>
            <FormField
              label="Primary photo URL"
              value={form.photos[0]?.url ?? ""}
              onChange={(event) =>
                updateForm("photos", [
                  {
                    id: `temp-${Date.now()}`,
                    url: event.target.value,
                    alt: form.title || "Property photo",
                    isPrimary: true,
                  },
                ])
              }
            />
          </div>
        );
      case "review":
        return (
          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="text-base font-semibold">Basic information</h3>
              <p className="mt-2 text-sm text-muted-foreground">{form.title}</p>
              <p className="mt-2 text-sm">{form.description}</p>
            </Card>
            <Card className="p-4">
              <h3 className="text-base font-semibold">Location</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {form.location.area}, {form.location.address}, {form.location.city}
              </p>
            </Card>
            <Card className="p-4">
              <h3 className="text-base font-semibold">Pricing</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                ₦{form.pricing.rent.toLocaleString()} / {form.pricing.period}
              </p>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 px-4 py-6 sm:px-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Property owner
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Add property</h1>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="mb-4 flex flex-wrap gap-2">
            {steps.map((step, index) => (
              <Button
                key={step.key}
                type="button"
                variant={index === stepIndex ? "default" : "outline"}
                size="sm"
                onClick={() => setStepIndex(index)}
              >
                {step.label}
              </Button>
            ))}
          </div>

          <ErrorBanner error={error} />
          <div className="mt-4 space-y-5">
            <div className="flex items-start gap-3 rounded-xl bg-primary-soft p-3">
              {currentStep.key === "basic" ? (
                <Building2 className="mt-0.5 size-5 text-primary" aria-hidden="true" />
              ) : null}
              {currentStep.key === "location" ? (
                <MapPin className="mt-0.5 size-5 text-primary" aria-hidden="true" />
              ) : null}
              {currentStep.key === "pricing" ? (
                <PoundSterling className="mt-0.5 size-5 text-primary" aria-hidden="true" />
              ) : null}
              <div>
                <p className="text-base font-semibold">{currentStep.label}</p>
                <p className="text-sm text-muted-foreground">
                  {currentStep.key === "basic"
                    ? "Tell us about your property"
                    : currentStep.key === "location"
                      ? "Where is the property?"
                      : currentStep.key === "pricing"
                        ? "Set your pricing"
                        : "Complete the next step"}
                </p>
              </div>
            </div>

            {renderStep()}

            <div className="flex items-center gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={previousStep}
                disabled={stepIndex === 0 || submitting}
              >
                Back
              </Button>
              {stepIndex < steps.length - 1 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!canContinue || submitting}
                  className="flex-1"
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => void handleSubmit()}
                  disabled={submitting || !canContinue}
                  className="flex-1"
                >
                  {submitting ? "Submitting…" : "Submit property"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
