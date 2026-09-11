import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { OnboardingProgress } from "./onboarding-progress";

export function OnboardingLayout({
  eyebrow,
  title,
  description,
  steps,
  currentStep,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  description?: string | undefined;
  steps: string[];
  currentStep: number;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-surface/90 px-4 py-4 backdrop-blur-md sm:px-6">
        <div className="mx-auto flex w-full max-w-2xl items-center gap-3">
          <Link to="/" className="flex items-center gap-2" aria-label="Camp Match home">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
              CM
            </span>
          </Link>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {eyebrow}
          </p>
        </div>
      </header>

      <main
        id="main"
        tabIndex={-1}
        className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-10"
      >
        <OnboardingProgress steps={steps} current={currentStep} />

        <div className="mt-8">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
          {description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}
        </div>

        <div className="mt-6 flex-1">{children}</div>

        {footer ? (
          <div className="sticky bottom-0 -mx-4 mt-8 border-t border-border bg-background/95 px-4 py-4 backdrop-blur-md sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
            {footer}
          </div>
        ) : null}
      </main>
    </div>
  );
}
