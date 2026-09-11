import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { OnboardingLayout } from "@/features/onboarding/components/onboarding-layout";
import { StepNavigation } from "@/features/onboarding/components/step-navigation";
import { SelectableCard } from "@/components/forms/selectable-card";
import { FormField } from "@/components/forms/form-field";
import { ErrorBanner } from "@/components/forms/error-banner";
import { VerificationStatus } from "@/features/onboarding/components/verification-status";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { authService } from "@/features/auth/services/auth.service";
import { createAppError, normalizeError, type AppError } from "@/lib/api/errors";

export const Route = createFileRoute("/onboarding/owner")({
  head: () => ({
    meta: [
      { title: "Property owner setup — Camp Match" },
      {
        name: "description",
        content:
          "Set up your Camp Match property owner account and start the ownership verification process.",
      },
      { property: "og:title", content: "Property owner setup — Camp Match" },
      {
        property: "og:description",
        content: "Verify your ownership and list student housing on Camp Match.",
      },
    ],
  }),
  component: OwnerOnboardingPage,
});

const steps = ["About you", "Property", "Verification"];

const evidenceTypes = [
  { value: "certificate-of-occupancy", label: "Certificate of Occupancy" },
  { value: "deed-of-assignment", label: "Deed of Assignment" },
  { value: "tenancy-management-agreement", label: "Management agreement" },
];

const idTypes = [
  { value: "nin", label: "National ID (NIN)" },
  { value: "drivers-licence", label: "Driver's licence" },
  { value: "international-passport", label: "International passport" },
];

function OwnerOnboardingPage() {
  const navigate = useNavigate();
  const { state, setUser } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    displayName: "",
    contactPhone: "",
    city: "",
    propertyAddress: "",
    ownershipEvidenceType: "",
    identityDocumentType: "",
  });
  const [error, setError] = useState<AppError | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (state.status === "unauthenticated") navigate({ to: "/login", replace: true });
  }, [state.status, navigate]);

  const set = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const canContinue =
    step === 0
      ? Boolean(form.displayName && form.contactPhone && form.city)
      : step === 1
        ? Boolean(form.propertyAddress && form.ownershipEvidenceType)
        : Boolean(form.identityDocumentType);

  async function finish() {
    setError(null);
    if (!form.identityDocumentType) {
      setError(
        createAppError("VALIDATION_ERROR", {
          fieldErrors: { identityDocumentType: "Choose a document type." },
        }),
      );
      return;
    }
    setSubmitting(true);
    try {
      const updated = await authService.completeOnboarding({
        role: "owner",
        data: form,
      });
      setUser(updated);
      toast.success("Submitted for verification");
      navigate({ to: "/owner" });
    } catch (caught) {
      setError(normalizeError(caught));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <OnboardingLayout
      eyebrow="Property owner setup"
      steps={steps}
      currentStep={step}
      title={
        step === 0
          ? "Tell us about you"
          : step === 1
            ? "Your first property"
            : "Verify your identity"
      }
      description={
        step === 0
          ? "Students see this name when they contact you."
          : step === 1
            ? "We check ownership before any property goes live."
            : "Verification keeps Camp Match free of fake listings."
      }
      footer={
        <StepNavigation
          onBack={step > 0 ? () => setStep((value) => value - 1) : undefined}
          onNext={() => (step < steps.length - 1 ? setStep((v) => v + 1) : void finish())}
          nextLabel={step === steps.length - 1 ? "Submit for review" : "Continue"}
          nextDisabled={!canContinue}
          isSubmitting={submitting}
          submittingLabel="Submitting"
        />
      }
    >
      <div className="space-y-5">
        <ErrorBanner error={error} />

        {step === 0 ? (
          <div className="space-y-4">
            <FormField
              label="Display name"
              required
              value={form.displayName}
              onChange={set("displayName")}
            />
            <FormField
              label="Contact phone"
              type="tel"
              inputMode="tel"
              placeholder="+234 800 000 0000"
              required
              value={form.contactPhone}
              onChange={set("contactPhone")}
            />
            <FormField
              label="City"
              required
              placeholder="e.g. Benin City"
              value={form.city}
              onChange={set("city")}
            />
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-5">
            <FormField
              label="Property address"
              required
              placeholder="Street, area, city"
              value={form.propertyAddress}
              onChange={set("propertyAddress")}
            />
            <div>
              <p className="mb-2 text-sm font-medium">Proof of ownership</p>
              <div role="radiogroup" aria-label="Proof of ownership" className="space-y-3">
                {evidenceTypes.map((option) => (
                  <SelectableCard
                    key={option.value}
                    selected={form.ownershipEvidenceType === option.value}
                    onSelect={() =>
                      setForm((prev) => ({
                        ...prev,
                        ownershipEvidenceType: option.value,
                      }))
                    }
                    title={option.label}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-5">
            <div role="radiogroup" aria-label="Identity document" className="space-y-3">
              {idTypes.map((option) => (
                <SelectableCard
                  key={option.value}
                  selected={form.identityDocumentType === option.value}
                  onSelect={() =>
                    setForm((prev) => ({
                      ...prev,
                      identityDocumentType: option.value,
                    }))
                  }
                  title={option.label}
                />
              ))}
            </div>
            <VerificationStatus status="not_started" />
          </div>
        ) : null}
      </div>
    </OnboardingLayout>
  );
}
