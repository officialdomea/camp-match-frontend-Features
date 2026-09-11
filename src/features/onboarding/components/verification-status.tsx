import { AlertTriangle, Clock, Loader2, ShieldCheck, ShieldQuestion } from "lucide-react";
import type { IdentityVerificationStatus } from "@/types/auth";
import { cn } from "@/lib/utils";

const config: Record<
  IdentityVerificationStatus,
  { label: string; description: string; tone: string; icon: typeof ShieldCheck }
> = {
  not_started: {
    label: "Verification not started",
    description: "Add a government-issued ID to begin verification.",
    tone: "border-border bg-surface text-muted-foreground",
    icon: ShieldQuestion,
  },
  in_progress: {
    label: "Verification in progress",
    description: "We're uploading and checking your document.",
    tone: "border-primary/30 bg-primary-soft text-primary",
    icon: Loader2,
  },
  pending: {
    label: "Verification pending review",
    description: "Our team is reviewing your details. This usually takes 24–48 hours.",
    tone: "border-accent/40 bg-accent/10 text-foreground",
    icon: Clock,
  },
  verified: {
    label: "Verification successful",
    description: "Your identity has been confirmed.",
    tone: "border-primary/40 bg-primary-soft text-primary",
    icon: ShieldCheck,
  },
  failed: {
    label: "Verification failed",
    description: "We couldn't confirm your details. Please try a different document.",
    tone: "border-destructive/30 bg-destructive/5 text-destructive",
    icon: AlertTriangle,
  },
};

export function VerificationStatus({ status }: { status: IdentityVerificationStatus }) {
  const { label, description, tone, icon: Icon } = config[status];

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("flex items-start gap-3 rounded-2xl border p-4", tone)}
    >
      <Icon
        className={cn(
          "mt-0.5 size-5 shrink-0",
          status === "in_progress" && "animate-spin motion-reduce:animate-none",
        )}
        aria-hidden="true"
      />
      <div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
