import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="px-4 pt-6 sm:px-6">
        <div className="mx-auto flex w-full max-w-lg items-center justify-between">
          <Link to="/" className="flex items-center gap-2" aria-label="Camp Match home">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
              CM
            </span>
            <span className="text-base font-semibold tracking-tight">Camp Match</span>
          </Link>
          <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
            <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
            Verified student housing
          </span>
        </div>
      </header>

      <main
        id="main"
        tabIndex={-1}
        className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-8 sm:px-6 sm:py-12"
      >
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
          {subtitle ? <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
        {children}
        {footer ? <div className="mt-8 text-sm">{footer}</div> : null}
      </main>
    </div>
  );
}
