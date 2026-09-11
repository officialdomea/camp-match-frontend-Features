import { BadgeCheck, Clock, ShieldCheck, XCircle } from "lucide-react";
import type { Verification, VerificationCheck } from "@/types/listing";
import { cn } from "@/lib/utils";

export function VerificationBadge({
  verified,
  size = "sm",
  className,
}: {
  verified: boolean;
  size?: "sm" | "md";
  className?: string;
}) {
  const label = verified ? "Camp Match Verified" : "Verification pending";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm",
        verified
          ? "border-primary/20 bg-primary-soft text-primary"
          : "border-warning/30 bg-warning/10 text-warning-foreground",
        className,
      )}
    >
      {verified ? (
        <BadgeCheck className="size-3.5" aria-hidden="true" />
      ) : (
        <Clock className="size-3.5" aria-hidden="true" />
      )}
      {label}
    </span>
  );
}

function CheckRow({ check }: { check: VerificationCheck }) {
  const Icon =
    check.status === "passed" ? BadgeCheck : check.status === "pending" ? Clock : XCircle;
  const tone =
    check.status === "passed"
      ? "text-success"
      : check.status === "pending"
        ? "text-warning"
        : "text-destructive";

  return (
    <li className="flex gap-3">
      <Icon className={cn("mt-0.5 size-4 shrink-0", tone)} aria-hidden="true" />
      <div>
        <p className="text-sm font-medium text-foreground">
          {check.label}
          <span className="sr-only"> — {check.status}</span>
        </p>
        {check.description ? (
          <p className="text-sm text-muted-foreground">{check.description}</p>
        ) : null}
      </div>
    </li>
  );
}

export function VerificationCard({
  verification,
  className,
}: {
  verification: Verification;
  className?: string;
}) {
  return (
    <section
      className={cn("rounded-2xl border border-border bg-surface p-5", className)}
      aria-labelledby="verification-heading"
    >
      <div className="flex items-center gap-2.5">
        <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
        <h2 id="verification-heading" className="text-base font-semibold">
          {verification.verified ? "Camp Match Verified" : "Verification in progress"}
        </h2>
      </div>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {verification.verified
          ? "A Camp Match Scout visited this property and confirmed the details below."
          : "Some checks are still being completed. Take extra care before paying."}
      </p>
      <ul className="mt-4 space-y-3">
        {verification.checks.map((check) => (
          <CheckRow key={check.id} check={check} />
        ))}
      </ul>
    </section>
  );
}
