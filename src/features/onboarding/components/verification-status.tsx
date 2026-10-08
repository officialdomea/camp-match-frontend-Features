import { AlertTriangle, Clock, Loader2, ShieldCheck, ShieldQuestion } from "lucide-react";
import type { IdentityVerificationStatus } from "@/types/auth";
import { cn } from "@/lib/utils";

const config: Record<
  IdentityVerificationStatus,
  { label: string; description: string; tone: string; icon: typeof ShieldCheck }
> = {
  not_started: {
    label: "Verification required",
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
  submitted: {
    label: "Verification under review",
    description: "Your document has been submitted for review.",
    tone: "border-accent/40 bg-accent/10 text-foreground",
    icon: Clock,
  },
  pending: {
    label: "Verification under review",
    description: "Our team is reviewing your details.",
    tone: "border-accent/40 bg-accent/10 text-foreground",
    icon: Clock,
  },
  changes_requested: {
    label: "Verification needs attention",
    description: "Please upload a clearer document or update the details provided.",
    tone: "border-amber-500/40 bg-amber-500/10 text-amber-700",
    icon: AlertTriangle,
  },
  verified: {
    label: "Identity verified",
    description: "Your identity has been confirmed.",
    tone: "border-primary/40 bg-primary-soft text-primary",
    icon: ShieldCheck,
  },
  rejected: {
    label: "Verification needs attention",
    description: "We couldn't confirm your details. Please try a different document.",
    tone: "border-destructive/30 bg-destructive/5 text-destructive",
    icon: AlertTriangle,
  },
  failed: {
    label: "Verification needs attention",
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
