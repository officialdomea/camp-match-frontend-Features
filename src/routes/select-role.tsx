import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { AuthLayout } from "@/features/auth/components/auth-layout";
import { RoleCard, roleOptions } from "@/features/auth/components/role-card";
import { ErrorBanner } from "@/components/forms/error-banner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { authService } from "@/features/auth/services/auth.service";
import { onboardingPath } from "@/features/auth/lib/routing";
import { normalizeError, type AppError } from "@/lib/api/errors";
import type { UserRole } from "@/types/auth";

export const Route = createFileRoute("/select-role")({
  head: () => ({
    meta: [
      { title: "Choose how you'll use Camp Match" },
      {
        name: "description",
        content:
          "Tell Camp Match whether you're a student, property owner or house scout to tailor your experience.",
      },
      { property: "og:title", content: "Choose how you'll use Camp Match" },
      {
        property: "og:description",
        content: "Student, property owner or house scout — pick your Camp Match role.",
      },
    ],
  }),
  component: SelectRolePage,
});

function SelectRolePage() {
  const navigate = useNavigate();
  const { state, setUser } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [error, setError] = useState<AppError | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (state.status === "unauthenticated") navigate({ to: "/login", replace: true });
  }, [state.status, navigate]);

  async function handleContinue() {
    if (!role) return;
    setError(null);
    setSubmitting(true);
    try {
      const updated = await authService.selectRole(role);
      setUser(updated);
      navigate({ to: onboardingPath[role] });
    } catch (caught) {
      setError(normalizeError(caught));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="How will you use Camp Match?"
      subtitle="You can only pick one for now — this shapes your whole experience."
    >
      <div className="space-y-4">
        <ErrorBanner error={error} />

        <div role="radiogroup" aria-label="Account type" className="space-y-3">
          {roleOptions.map((option) => (
            <RoleCard
              key={option.role}
              option={option}
              selected={role === option.role}
              onSelect={() => setRole(option.role)}
            />
          ))}
        </div>

        <Button
          type="button"
          size="lg"
          className="h-12 w-full rounded-xl"
          disabled={!role || submitting}
          onClick={() => void handleContinue()}
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Saving…
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </div>
    </AuthLayout>
  );
}
