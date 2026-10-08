import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { ErrorBanner } from "@/components/forms/error-banner";
import { FormField } from "@/components/forms/form-field";
import { SelectableCard } from "@/components/forms/selectable-card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { VerificationStatus } from "@/features/onboarding/components/verification-status";
import {
  canAccessRoleVerification,
  getFriendlyVerificationMessage,
  getRoleVerificationRequirements,
  maskSensitiveValue,
  shouldAllowVerificationSubmission,
} from "@/features/verification/lib/identity-verification";
import { verificationService } from "@/features/verification/services/verification.service";
import { createAppError, normalizeError, type AppError } from "@/lib/api/errors";
import type { AuthUser, UserRole } from "@/types/auth";

export const Route = createFileRoute("/verification/$role")({
  head: () => ({
    meta: [
      { title: "Identity verification — Camp Match" },
      {
        name: "description",
        content:
          "Complete Camp Match identity verification for your student, owner, or scout account.",
      },
      { property: "og:title", content: "Identity verification — Camp Match" },
      {
        property: "og:description",
        content: "Verify your identity safely before continuing on Camp Match.",
      },
    ],
  }),
  component: VerificationRoutePage,
});

function VerificationRoutePage() {
  const navigate = useNavigate();
  const { user, state, setUser } = useAuth();
  const { role } = Route.useParams();
  const targetRole = role as UserRole;
  const requirements = getRoleVerificationRequirements(targetRole);
  const currentUser = user;
  const currentStatus = currentUser?.identityVerification ?? "not_started";
  const [documentType, setDocumentType] = useState("");
  const [documentReference, setDocumentReference] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  useEffect(() => {
    if (state.status === "unauthenticated") {
      navigate({ to: "/login", replace: true });
      return;
    }

    if (state.status === "authenticated") {
      if (!user) {
        navigate({ to: "/login", replace: true });
        return;
      }

      if (!user.role) {
        navigate({ to: "/select-role", replace: true });
      } else if (!canAccessRoleVerification(user.role, targetRole)) {
        navigate({ to: `/${user.role}`, replace: true });
      }
    }
  }, [state, user, targetRole, navigate]);

  if (!currentUser || !currentUser.role) {
    return (
      <AppShell>
        <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
          Loading your verification status…
        </div>
      </AppShell>
    );
  }

  const canSubmit =
    shouldAllowVerificationSubmission(currentStatus) &&
    Boolean(documentType) &&
    documentReference.trim();

  async function handleSubmit() {
    setError(null);
    if (!currentUser || !currentUser.role) {
      setError(
        createAppError("VALIDATION_ERROR", {
          title: "Authentication required",
          message: "Please sign in again to continue with verification.",
        }),
      );
      return;
    }

    if (!canSubmit) {
      setError(
        createAppError("VALIDATION_ERROR", {
          title: "Choose your document and reference",
          message: "Select a document type and add the reference details before submitting.",
        }),
      );
      return;
    }

    setSubmitting(true);
    try {
      const submitted = await verificationService.submitVerification({
        note: `submitted:${documentType}`,
      });

      const updatedUser: AuthUser = {
        id: currentUser.id,
        fullName: currentUser.fullName,
        email: currentUser.email,
        phone: currentUser.phone,
        role: currentUser.role,
        accountStatus: currentUser.accountStatus,
        emailVerified: currentUser.emailVerified,
        onboardingComplete: currentUser.onboardingComplete,
        identityVerification: submitted.status,
        ...(currentUser.profileImageUrl ? { profileImageUrl: currentUser.profileImageUrl } : {}),
        ...(currentUser.livingPreference ? { livingPreference: currentUser.livingPreference } : {}),
        ...(currentUser.studentProfile ? { studentProfile: currentUser.studentProfile } : {}),
        ...(currentUser.ownerProfile ? { ownerProfile: currentUser.ownerProfile } : {}),
        ...(currentUser.scoutProfile ? { scoutProfile: currentUser.scoutProfile } : {}),
      };
      setUser(updatedUser);
      toast.success("Verification submitted for review");
    } catch (caught) {
      setError(normalizeError(caught));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Identity verification
          </p>
          <h1 className="text-3xl font-bold tracking-tight">{requirements.title}</h1>
          <p className="text-sm text-muted-foreground">{requirements.description}</p>
        </div>

        <VerificationStatus status={currentStatus} />

        {shouldAllowVerificationSubmission(currentStatus) ? (
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <div className="space-y-5">
              <ErrorBanner error={error} />

              <div>
                <p className="mb-2 text-sm font-medium">Choose a document type</p>
                <div className="space-y-3" role="radiogroup" aria-label="Identity document type">
                  {requirements.documentOptions.map((option) => (
                    <SelectableCard
                      key={option.value}
                      selected={documentType === option.value}
                      onSelect={() => setDocumentType(option.value)}
                      title={option.label}
                      description={option.description}
                    />
                  ))}
                </div>
              </div>

              <FormField
                label="Document reference"
                helperText="We mask sensitive values in the UI and never display full identity numbers publicly."
                placeholder="e.g. ABC12345"
                value={documentReference}
                onChange={(event) => setDocumentReference(event.target.value)}
                aria-label="Document reference"
              />

              {documentReference.trim() ? (
                <p className="rounded-xl border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
                  Preview: {maskSensitiveValue(documentReference)}
                </p>
              ) : null}

              <div className="rounded-xl border border-dashed border-border bg-background p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">What happens next</p>
                <p className="mt-2">{getFriendlyVerificationMessage(currentStatus)}</p>
              </div>

              <Button
                type="button"
                size="lg"
                className="w-full"
                onClick={() => void handleSubmit()}
                disabled={!canSubmit || submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
                    Submitting…
                  </>
                ) : currentStatus === "rejected" ? (
                  "Resubmit verification"
                ) : (
                  "Submit for review"
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-surface p-5">
            <p className="text-sm text-muted-foreground">
              {currentStatus === "verified"
                ? "Your identity verification is complete and your account is ready for the role-specific Camp Match workflow."
                : currentStatus === "pending"
                  ? "Your identity verification is under review. We will notify you as soon as a decision is ready."
                  : "Your verification is being reviewed. Please wait for the next update before submitting again."}
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
