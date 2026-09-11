import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { AuthLayout } from "@/features/auth/components/auth-layout";
import { VerificationCodeInput } from "@/features/auth/components/verification-code-input";
import { ErrorBanner } from "@/components/forms/error-banner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { authService } from "@/features/auth/services/auth.service";
import { nextPathForUser } from "@/features/auth/lib/routing";
import { normalizeError, type AppError } from "@/lib/api/errors";

export const Route = createFileRoute("/verify")({
  head: () => ({
    meta: [
      { title: "Verify your account — Camp Match" },
      {
        name: "description",
        content: "Enter the 6-digit code we sent you to confirm your Camp Match account.",
      },
      { property: "og:title", content: "Verify your account — Camp Match" },
      {
        property: "og:description",
        content: "Confirm your Camp Match account with the code we sent you.",
      },
    ],
  }),
  component: VerifyPage,
});

const RESEND_SECONDS = 30;

function VerifyPage() {
  const navigate = useNavigate();
  const { user, state, setUser } = useAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState<AppError | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (state.status === "unauthenticated") navigate({ to: "/login", replace: true });
  }, [state.status, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  async function submit(value: string) {
    setError(null);
    setSubmitting(true);
    try {
      const updated = await authService.verifyAccount({ code: value });
      setUser(updated);
      toast.success("Account verified");
      navigate({ to: nextPathForUser(updated) });
    } catch (caught) {
      setError(normalizeError(caught));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Verify your account"
      subtitle={
        user?.email
          ? `We sent a 6-digit code to ${user.email}.`
          : "Enter the 6-digit code we sent you."
      }
    >
      <div className="space-y-5">
        <ErrorBanner error={error} />

        <VerificationCodeInput
          value={code}
          onChange={(value) => {
            setCode(value);
            if (error) setError(null);
          }}
          onComplete={(value) => void submit(value)}
          disabled={submitting}
          invalid={Boolean(error)}
        />

        <Button
          type="button"
          size="lg"
          className="h-12 w-full rounded-xl"
          disabled={code.length < 6 || submitting}
          onClick={() => void submit(code)}
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Verifying…
            </>
          ) : (
            "Verify account"
          )}
        </Button>

        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <MailCheck className="size-4 text-primary" aria-hidden="true" />
          {cooldown > 0 ? (
            <span>Resend code in {cooldown}s</span>
          ) : (
            <button
              type="button"
              className="font-semibold text-primary hover:underline"
              onClick={async () => {
                await authService.resendVerificationCode();
                setCooldown(RESEND_SECONDS);
                toast.success("New code sent");
              }}
            >
              Resend code
            </button>
          )}
        </div>
      </div>
    </AuthLayout>
  );
}
