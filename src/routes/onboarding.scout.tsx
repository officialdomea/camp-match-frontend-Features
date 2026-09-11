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
import { normalizeError, type AppError } from "@/lib/api/errors";

export const Route = createFileRoute("/onboarding/scout")({
  head: () => ({
    meta: [
      { title: "House scout setup — Camp Match" },
      {
        name: "description",
        content:
          "Become a verified Camp Match house scout and help students find trusted accommodation.",
      },
      { property: "og:title", content: "House scout setup — Camp Match" },
      {
        property: "og:description",
        content: "Join Camp Match as a verified house scout.",
      },
    ],
  }),
  component: ScoutOnboardingPage,
});

const steps = ["About you", "Coverage", "Verification"];

const experienceLevels = [
  { value: "new", label: "New to scouting", description: "Less than a year helping students." },
  { value: "experienced", label: "1–3 years", description: "You know your area well." },
  { value: "veteran", label: "3+ years", description: "You place students every session." },
];

const idTypes = [
  { value: "nin", label: "National ID (NIN)" },
  { value: "drivers-licence", label: "Driver's licence" },
  { value: "international-passport", label: "International passport" },
];

function ScoutOnboardingPage() {
  const navigate = useNavigate();
  const { state, setUser } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    displayName: "",
    contactPhone: "",
    city: "",
    coverageAreas: "",
    experience: "",
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
        ? Boolean(form.coverageAreas && form.experience)
        : Boolean(form.identityDocumentType);

  async function finish() {
    setError(null);
    setSubmitting(true);
    try {
      const updated = await authService.completeOnboarding({
        role: "scout",
        data: form,
      });
      setUser(updated);
      toast.success("Submitted for verification");
      navigate({ to: "/scout" });
    } catch (caught) {
      setError(normalizeError(caught));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <OnboardingLayout
      eyebrow="House scout setup"
      steps={steps}
      currentStep={step}
      title={
        step === 0
          ? "Tell us about you"
          : step === 1
            ? "Where do you scout?"
            : "Verify your identity"
      }
      description={
        step === 0
          ? "Students see this name on the listings you manage."
          : step === 1
            ? "Coverage helps us route the right students to you."
            : "Only verified scouts can manage property access."
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
              placeholder="e.g. Calabar"
              value={form.city}
              onChange={set("city")}
            />
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-5">
            <FormField
              label="Coverage areas"
              required
              helperText="Separate areas with commas."
              placeholder="Satellite Town, Etta Agbor"
              value={form.coverageAreas}
              onChange={set("coverageAreas")}
            />
            <div>
              <p className="mb-2 text-sm font-medium">Experience</p>
              <div role="radiogroup" aria-label="Experience" className="space-y-3">
                {experienceLevels.map((option) => (
                  <SelectableCard
                    key={option.value}
                    selected={form.experience === option.value}
                    onSelect={() => setForm((prev) => ({ ...prev, experience: option.value }))}
                    title={option.label}
                    description={option.description}
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
