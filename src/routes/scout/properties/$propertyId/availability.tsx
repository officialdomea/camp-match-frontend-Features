import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { ErrorState, LoadingState } from "@/components/common/states";
import { ErrorBanner } from "@/components/forms/error-banner";
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
import { useManagedProperty } from "@/features/properties/hooks/use-properties";
import { propertyService } from "@/features/properties/services/property.service";
import { normalizeError, type AppError } from "@/lib/api/errors";
import type { AvailabilityStatus } from "@/types/property";

export const Route = createFileRoute("/scout/properties/$propertyId/availability")({
  component: ScoutAvailabilityPage,
});

function ScoutAvailabilityPage() {
  const navigate = useNavigate();
  const { propertyId } = Route.useParams();
  const { data, isPending, isError, error, refetch } = useManagedProperty(propertyId);
  const [form, setForm] = useState<{
    status: AvailabilityStatus;
    availableFrom: string;
    unitsAvailable: number;
    note: string;
  }>({
    status: "available",
    availableFrom: "",
    unitsAvailable: 1,
    note: "",
  });
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<AppError | null>(null);

  const availabilityStatusValues = [
    "available",
    "unavailable",
    "reserved",
    "temporarily_unavailable",
    "under_review",
  ] as const satisfies readonly AvailabilityStatus[];

  const isAvailabilityStatus = (value: string): value is AvailabilityStatus =>
    availabilityStatusValues.includes(value as AvailabilityStatus);

  useEffect(() => {
    if (!data) return;
    setForm({
      status: data.availability.status,
      availableFrom: data.availability.availableFrom,
      unitsAvailable: data.availability.unitsAvailable,
      note: data.availability.note ?? "",
    });
  }, [data]);

  if (isPending)
    return (
      <AppShell>
        <LoadingState label="Loading availability" />
      </AppShell>
    );
  if (isError || !data) {
    const appError = normalizeError(error ?? null);
    return (
      <AppShell>
        <div className="px-4 py-6 sm:px-6">
          {appError.code === "FORBIDDEN" ? (
            <ErrorState
              title="Availability access is restricted"
              description="Your Scout permissions do not allow changes to this property's availability."
            />
          ) : (
            <ErrorState title="We couldn't load this property" onRetry={() => void refetch()} />
          )}
        </div>
      </AppShell>
    );
  }

  if (!data.myRelationship.permissions.canUpdateAvailability) {
    return (
      <AppShell>
        <div className="px-4 py-6 sm:px-6">
          <ErrorState
            title="Availability access is restricted"
            description="This listing cannot be updated by your current Scout permissions."
          />
        </div>
      </AppShell>
    );
  }

  const save = async () => {
    setSubmitError(null);
    setSaving(true);
    try {
      await propertyService.updateAvailability(data.id, {
        status: form.status,
        availableFrom: form.availableFrom,
        unitsAvailable: form.unitsAvailable,
        note: form.note,
      });
      toast.success("Availability updated");
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
            <h1 className="mt-1 text-2xl font-bold tracking-tight">Availability</h1>
          </div>
          <Button onClick={() => void save()} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>

        <Card className="p-4">
          <ErrorBanner error={submitError} />
          <div className="space-y-5">
            <div>
              <label className="mb-1 block text-sm font-medium">Status</label>
              <Select
                value={form.status}
                onValueChange={(value) => {
                  if (!isAvailabilityStatus(value)) return;
                  setForm((previous) => ({ ...previous, status: value }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Availability status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="temporarily_unavailable">Temporarily unavailable</SelectItem>
                  <SelectItem value="under_review">Under review</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Available from</label>
                <Input
                  type="date"
                  value={form.availableFrom}
                  onChange={(event) =>
                    setForm((previous) => ({ ...previous, availableFrom: event.target.value }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Units available</label>
                <Input
                  type="number"
                  min={0}
                  value={form.unitsAvailable}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      unitsAvailable: Number(event.target.value),
                    }))
                  }
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Note</label>
              <Textarea
                value={form.note}
                rows={4}
                onChange={(event) =>
                  setForm((previous) => ({ ...previous, note: event.target.value }))
                }
                placeholder="Optional note for students and owners"
              />
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
