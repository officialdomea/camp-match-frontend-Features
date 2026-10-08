import { AlertTriangle, BadgeCheck, Clock3, ShieldQuestion } from "lucide-react";
import type { IdentityVerificationStatus, VerificationState } from "@/types/auth";
import type { PropertyVerification } from "@/types/property";
import { cn } from "@/lib/utils";
import {
  getTrustIndicatorLabel,
  getTrustIndicatorState,
  type TrustIndicatorState,
  type TrustIndicatorSubject,
} from "@/features/verification/domain/verification-trust";

type TrustIndicatorStatus =
  | IdentityVerificationStatus
  | VerificationState
  | PropertyVerification["overall"]
  | null
  | undefined;

export function TrustIndicator({
  status,
  subject = "identity",
  className,
  showNotStarted = false,
}: {
  status: TrustIndicatorStatus;
  subject?: TrustIndicatorSubject;
  className?: string;
  showNotStarted?: boolean;
}) {
  const state = getTrustIndicatorState(status) as TrustIndicatorState;

  if (!showNotStarted && state === "not_started") {
    return null;
  }

  const config: Record<
    TrustIndicatorState,
    { label: string; icon: typeof BadgeCheck; className: string }
  > = {
    verified: {
      label: getTrustIndicatorLabel(subject, "verified"),
      icon: BadgeCheck,
      className: "border-primary/20 bg-primary-soft text-primary",
    },
    pending: {
      label: getTrustIndicatorLabel(subject, "pending"),
      icon: Clock3,
      className: "border-warning/30 bg-warning/10 text-warning-foreground",
    },
    rejected: {
      label: getTrustIndicatorLabel(subject, "rejected"),
      icon: AlertTriangle,
      className: "border-destructive/30 bg-destructive/5 text-destructive",
    },
    not_started: {
      label:
        subject === "property"
          ? "Property verification required"
          : "Identity verification required",
      icon: ShieldQuestion,
      className: "border-border bg-muted text-muted-foreground",
    },
  };

  const { label, icon: Icon, className: badgeClassName } = config[state];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        badgeClassName,
        className,
      )}
      aria-label={label}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}
