import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, CheckCircle2, Clock3, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { ErrorState, LoadingState } from "@/components/common/states";
import { SelectableCard } from "@/components/forms/selectable-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProperty } from "@/features/properties/hooks/use-properties";
import {
  getFriendlyPropertyVerificationMessage,
  shouldAllowPropertyVerificationSubmission,
} from "@/features/verification/domain/verification-trust";
import { EvidenceUploader } from "@/features/verification/components/evidence-uploader";
import { verificationService } from "@/features/verification/services/verification.service";
import { normalizeError, type AppError } from "@/lib/api/errors";

export const Route = createFileRoute("/owner/properties/$propertyId/verification")({
  component: PropertyVerificationPage,
});

const evidenceOptions = [
  { value: "property-photos", label: "Property photos" },
  { value: "ownership-documents", label: "Ownership documents" },
  { value: "listing-package", label: "Listing package" },
];

function PropertyVerificationPage() {
  const { propertyId } = Route.useParams();
  const { data, isPending, isError, refetch } = useProperty(propertyId);
  const [selectedEvidenceType, setSelectedEvidenceType] = useState("property-photos");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  if (isPending)
    return (
      <AppShell>
        <LoadingState label="Loading property verification" />
      </AppShell>
    );

  if (isError || !data)
    return (
      <AppShell>
        <div className="p-4 sm:p-6">
          <ErrorState title="We couldn't load this property" onRetry={() => void refetch()} />
        </div>
      </AppShell>
    );

  const canSubmit = shouldAllowPropertyVerificationSubmission(data.verification.overall);

  const submit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await verificationService.submitPropertyVerification(
        propertyId,
        "Property verification requested by the owner.",
      );
      toast.success("Property verification submitted for review");
      await refetch();
    } catch (caught) {
      setError(normalizeError(caught));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Property verification
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">{data.title}</h1>
          </div>
          <Button asChild variant="outline">
            <Link to="/owner/properties/$propertyId" params={{ propertyId: data.id }}>
              <ArrowLeft className="mr-2 size-4" />
              Back to property
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Overall status</p>
              <div className="mt-2 flex items-center gap-2">
                {data.verification.overall === "verified" ? (
                  <CheckCircle2 className="size-4 text-emerald-600" />
                ) : data.verification.overall === "rejected" ? (
                  <AlertCircle className="size-4 text-red-600" />
                ) : data.verification.overall === "pending" ||
                  data.verification.overall === "submitted" ? (
                  <Clock3 className="size-4 text-amber-600" />
                ) : (
                  <ShieldCheck className="size-4 text-blue-600" />
                )}
                <span className="font-medium">{data.verification.overall}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Review guidance</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {getFriendlyPropertyVerificationMessage(data.verification.overall)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Checklist</p>
              <p className="mt-2 text-sm font-medium">
                {data.verification.steps.filter((step) => step.status === "verified").length}/
                {data.verification.steps.length} passed
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Verification checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.verification.steps.map((step) => (
              <div
                key={step.id}
                className="flex items-center justify-between rounded-xl border p-3"
              >
                <div>
                  <p className="font-medium">{step.label}</p>
                  {step.note ? <p className="text-sm text-muted-foreground">{step.note}</p> : null}
                </div>
                <span className="rounded-full bg-muted px-2 py-1 text-xs uppercase tracking-wide">
                  {step.status}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upload property evidence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {evidenceOptions.map((option) => (
                <SelectableCard
                  key={option.value}
                  selected={selectedEvidenceType === option.value}
                  onSelect={() => setSelectedEvidenceType(option.value)}
                  title={option.label}
                />
              ))}
            </div>
            <EvidenceUploader kind="property" documentType={selectedEvidenceType} />
          </CardContent>
        </Card>

        {canSubmit ? (
          <Button onClick={() => void submit()} disabled={submitting}>
            {submitting ? "Submitting…" : "Submit property for review"}
          </Button>
        ) : (
          <p className="rounded-xl border border-dashed border-border bg-muted/20 p-3 text-sm text-muted-foreground">
            This listing is already in progress. Camp Match will review it and contact you if any
            updates are needed.
          </p>
        )}
      </div>
    </AppShell>
  );
}
