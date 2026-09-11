import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/states";
import { ErrorBanner } from "@/components/forms/error-banner";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useManagedProperty } from "@/features/properties/hooks/use-properties";
import { propertyService } from "@/features/properties/services/property.service";
import { normalizeError, type AppError } from "@/lib/api/errors";
import type { AccommodationType, PricePeriod } from "@/types/property";

export const Route = createFileRoute("/scout/properties/$propertyId/edit")({
  component: ScoutEditPropertyPage,
});

function ScoutEditPropertyPage() {
  const navigate = useNavigate();
  const { propertyId } = Route.useParams();
  const { data, isPending, isError, error, refetch } = useManagedProperty(propertyId);
  const [form, setForm] = useState<{
    title: string;
    description: string;
    accommodationType: AccommodationType;
    rent: number;
    period: PricePeriod;
  }>({
    title: "",
    description: "",
    accommodationType: "single-room",
    rent: 0,
    period: "year",
  });
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<AppError | null>(null);

  const isAccommodationType = (value: string): value is AccommodationType =>
    ["single-room", "self-contained", "shared-apartment", "one-bedroom", "two-bedroom", "hostel"].includes(
      value as AccommodationType,
    );

  const isPricePeriod = (value: string): value is PricePeriod =>
    ["year", "semester", "month"].includes(value as PricePeriod);

  useEffect(() => {
    if (!data) return;
    setForm({
      title: data.title,
      description: data.description,
      accommodationType: data.accommodationType,
      rent: data.pricing.rent,
      period: data.pricing.period,
    });
  }, [data]);

  if (isPending)
    return (
      <AppShell>
        <LoadingState label="Loading property" />
      </AppShell>
    );

  if (isError || !data) {
    const appError = normalizeError(error ?? null);
    return (
      <AppShell>
        <div className="px-4 py-6 sm:px-6">
          {appError.code === "FORBIDDEN" ? (
            <ErrorState
              title="Edit access is restricted"
              description="This property cannot be edited by your current Scout permissions."
            />
          ) : appError.code === "NOT_FOUND" ? (
            <EmptyState
              title="Property not found"
              description="The property you’re trying to edit no longer exists or is not assigned to you."
            />
          ) : (
            <ErrorState title="We couldn't load this property" onRetry={() => void refetch()} />
          )}
        </div>
      </AppShell>
    );
  }

  if (!data.myRelationship.permissions.canEditProperty) {
    return (
      <AppShell>
        <div className="px-4 py-6 sm:px-6">
          <ErrorState
            title="Edit access is restricted"
            description="Your current permission set does not allow editing this listing."
          />
        </div>
      </AppShell>
    );
  }

  const handleChange = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setDirty(true);
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const save = async () => {
    setSubmitError(null);
    setSaving(true);
    try {
      await propertyService.updateProperty(data.id, {
        title: form.title,
        description: form.description,
        accommodationType: form.accommodationType,
        pricing: {
          rent: form.rent,
          period: form.period,
        },
      });
      setDirty(false);
      toast.success("Property updated");
      navigate({ to: "/scout/properties/$propertyId", params: { propertyId: data.id } });
    } catch (caught) {
      setSubmitError(normalizeError(caught));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 px-4 py-6 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">House Scout</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">Edit property</h1>
          </div>
          <Button onClick={() => void save()} disabled={saving || !dirty}>
            {saving ? "Saving…" : dirty ? "Save changes" : "Saved"}
          </Button>
        </div>

        <Card className="p-4">
          <ErrorBanner error={submitError} />
          <div className="space-y-5">
            <FormField
              label="Title"
              value={form.title}
              onChange={(event) => handleChange("title", event.target.value)}
            />
            <div>
              <label className="mb-1 block text-sm font-medium">Description</label>
              <Textarea
                value={form.description}
                onChange={(event) => handleChange("description", event.target.value)}
                rows={5}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Accommodation type</label>
              <Select
                value={form.accommodationType}
                onValueChange={(value) => {
                  if (!isAccommodationType(value)) return;
                  handleChange("accommodationType", value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single-room">Single room</SelectItem>
                  <SelectItem value="self-contained">Self-contained</SelectItem>
                  <SelectItem value="one-bedroom">One-bedroom</SelectItem>
                  <SelectItem value="two-bedroom">Two-bedroom</SelectItem>
                  <SelectItem value="shared-apartment">Shared apartment</SelectItem>
                  <SelectItem value="hostel">Hostel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Rent"
                type="number"
                value={String(form.rent)}
                onChange={(event) => handleChange("rent", Number(event.target.value))}
              />
              <div>
                <label className="mb-1 block text-sm font-medium">Period</label>
                <Select
                  value={form.period}
                  onValueChange={(value) => {
                    if (!isPricePeriod(value)) return;
                    handleChange("period", value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="year">Year</SelectItem>
                    <SelectItem value="semester">Semester</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
