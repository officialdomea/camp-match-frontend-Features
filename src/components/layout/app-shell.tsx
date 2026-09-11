import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { AppHeader } from "./app-header";
import { SidebarNav } from "./sidebar-nav";
import { BottomNav } from "./bottom-nav";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { isRoleRouteAllowed, nextPathForUser } from "@/features/auth/lib/routing";

/**
 * Client-side UX guard only — the backend stays authoritative. Unauthenticated
 * visitors are sent to sign-in; half-onboarded users resume their funnel.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { state } = useAuth();

  useEffect(() => {
    if (state.status === "unauthenticated") {
      navigate({ to: "/login", replace: true });
      return;
    }

    if (state.status === "authenticated") {
      const next = nextPathForUser(state.user);
      const pathname = window.location.pathname;
      const inFunnel =
        !state.user.emailVerified || !state.user.role || !state.user.onboardingComplete;

      if (inFunnel && next !== "/" && next !== pathname) {
        navigate({ to: next, replace: true });
        return;
      }

      if (!isRoleRouteAllowed(pathname, state.user.role)) {
        navigate({ to: next, replace: true });
      }
    }
  }, [state, navigate]);

  if (state.status !== "authenticated") {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-background"
        role="status"
        aria-live="polite"
      >
        <Loader2 className="size-6 animate-spin text-primary" aria-hidden="true" />
        <span className="sr-only">Loading your account</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="mx-auto flex w-full max-w-[1600px]">
        <SidebarNav />
        <main id="main" className="min-w-0 flex-1 pb-24 lg:pb-12" tabIndex={-1}>
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
