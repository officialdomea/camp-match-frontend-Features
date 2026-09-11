import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
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
import { useProperty } from "@/features/properties/hooks/use-properties";
import { propertyService } from "@/features/properties/services/property.service";
import { normalizeError, type AppError } from "@/lib/api/errors";
import type { AccommodationType, PricePeriod } from "@/types/property";

export const Route = createFileRoute("/owner/properties/$propertyId/edit")({
  component: EditPropertyPage,
});

function EditPropertyPage() {
  const navigate = useNavigate();
  const { propertyId } = Route.useParams();
  const { data, isPending, isError, refetch } = useProperty(propertyId);
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
  const [error, setError] = useState<AppError | null>(null);

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

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const handleChange = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setDirty(true);
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const save = async () => {
    if (!data) return;
    setSaving(true);
    setError(null);
    try {
      await propertyService.updateProperty(data.id, {
        title: form.title,
        description: form.description,
        accommodationType: form.accommodationType,
        pricing: { rent: form.rent, period: form.period },
      });
      setDirty(false);
      toast.success("Property saved");
      navigate({ to: "/owner/properties/$propertyId", params: { propertyId: data.id } });
    } catch (caught) {
      setError(normalizeError(caught));
    } finally {
      setSaving(false);
    }
  };

  if (isPending)
    return (
      <AppShell>
        <div className="p-4 sm:p-6">Loading…</div>
      </AppShell>
    );
  if (isError || !data)
    return (
      <AppShell>
        <div className="p-4 sm:p-6">
          <Button onClick={() => void refetch()}>Retry</Button>
        </div>
      </AppShell>
    );

  return (
    <AppShell>
      <div className="space-y-6 px-4 py-6 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Manage property</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">Edit property</h1>
          </div>
          <Button onClick={() => void save()} disabled={saving || !dirty}>
            {saving ? "Saving…" : dirty ? "Save changes" : "Saved"}
          </Button>
        </div>

        <Card className="p-4">
          <ErrorBanner error={error} />
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
