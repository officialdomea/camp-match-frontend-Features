import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { OnboardingLayout } from "@/features/onboarding/components/onboarding-layout";
import { StepNavigation } from "@/features/onboarding/components/step-navigation";
import { UniversitySelector } from "@/features/onboarding/components/university-selector";
import { BudgetSelector } from "@/features/onboarding/components/budget-selector";
import { SelectableCard } from "@/components/forms/selectable-card";
import { FormField } from "@/components/forms/form-field";
import { ErrorBanner } from "@/components/forms/error-banner";
import { accommodationOptions } from "@/components/listings/accommodation-labels";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { authService } from "@/features/auth/services/auth.service";
import { normalizeError, type AppError } from "@/lib/api/errors";

export const Route = createFileRoute("/onboarding/student")({
  head: () => ({
    meta: [
      { title: "Student setup — Camp Match" },
      {
        name: "description",
        content:
          "Tell Camp Match your university, housing type and budget so we can match you with verified homes.",
      },
      { property: "og:title", content: "Student setup — Camp Match" },
      {
        property: "og:description",
        content: "Set your university, housing type and budget on Camp Match.",
      },
    ],
  }),
  component: StudentOnboardingPage,
});

const steps = ["University", "Preferences", "Budget"];

function StudentOnboardingPage() {
  const navigate = useNavigate();
  const { state, setUser } = useAuth();
  const [step, setStep] = useState(0);
  const [universityId, setUniversityId] = useState<string | null>(null);
  const [types, setTypes] = useState<string[]>([]);
  const [preferredArea, setPreferredArea] = useState("");
  const [budget, setBudget] = useState({ min: 200_000, max: 800_000 });
  const [error, setError] = useState<AppError | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (state.status === "unauthenticated") navigate({ to: "/login", replace: true });
  }, [state.status, navigate]);

  async function finish() {
    if (!universityId) return;
    setError(null);
    setSubmitting(true);
    try {
      const updated = await authService.completeOnboarding({
        role: "student",
        data: {
          universityId,
          accommodationTypes: types,
          budgetMin: budget.min,
          budgetMax: budget.max,
          preferredArea,
        },
      });
      setUser(updated);
      toast.success("You're all set");
      navigate({ to: "/" });
    } catch (caught) {
      setError(normalizeError(caught));
    } finally {
      setSubmitting(false);
    }
  }

  const canContinue = step === 0 ? Boolean(universityId) : step === 1 ? types.length > 0 : true;

  return (
    <OnboardingLayout
      eyebrow="Student setup"
      steps={steps}
      currentStep={step}
      title={
        step === 0
          ? "Where do you study?"
          : step === 1
            ? "What kind of place suits you?"
            : "What's your yearly budget?"
      }
      description={
        step === 0
          ? "We use this to show homes closest to your campus."
          : step === 1
            ? "Pick every option you'd consider — you can change this later."
            : "We'll prioritise homes inside this range."
      }
      footer={
        <StepNavigation
          onBack={step > 0 ? () => setStep((value) => value - 1) : undefined}
          onNext={() => (step < steps.length - 1 ? setStep((v) => v + 1) : void finish())}
          nextLabel={step === steps.length - 1 ? "Finish setup" : "Continue"}
          nextDisabled={!canContinue}
          isSubmitting={submitting}
        />
      }
    >
      <div className="space-y-5">
        <ErrorBanner error={error} />

        {step === 0 ? <UniversitySelector value={universityId} onChange={setUniversityId} /> : null}

        {step === 1 ? (
          <div className="space-y-5">
            <div role="group" aria-label="Accommodation types" className="space-y-3">
              {accommodationOptions.map((option) => (
                <SelectableCard
                  key={option.value}
                  multi
                  selected={types.includes(option.value)}
                  onSelect={() =>
                    setTypes((prev) =>
                      prev.includes(option.value)
                        ? prev.filter((value) => value !== option.value)
                        : [...prev, option.value],
                    )
                  }
                  title={option.label}
                />
              ))}
            </div>

            <FormField
              label="Preferred area (optional)"
              name="preferredArea"
              placeholder="e.g. Ekosodin, Akoka, Satellite Town"
              value={preferredArea}
              onChange={(event) => setPreferredArea(event.target.value)}
            />
          </div>
        ) : null}

        {step === 2 ? (
          <BudgetSelector min={budget.min} max={budget.max} onChange={setBudget} />
        ) : null}
      </div>
    </OnboardingLayout>
  );
}
