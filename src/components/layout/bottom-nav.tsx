import { Link } from "@tanstack/react-router";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { getNavItems } from "./nav-items";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const { user } = useAuth();
  const navItems = getNavItems(user?.role);

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] shadow-nav backdrop-blur-md lg:hidden"
    >
      <ul className="grid grid-cols-6">
        {navItems
          .filter((item) => item.mobile)
          .map(({ label, to, icon: Icon }) => (
            <li key={to} className="min-w-0">
              <Link
                to={to}
                activeOptions={{ exact: to === "/" }}
                className="flex w-full min-w-0 flex-col items-center gap-0.5 py-2 text-center text-[9px] leading-3 font-medium text-muted-foreground transition-colors min-[360px]:text-[10px]"
                activeProps={{ className: "text-primary", "aria-current": "page" }}
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        "flex h-6 w-10 items-center justify-center rounded-full transition-colors",
                        isActive && "bg-primary-soft",
                      )}
                    >
                      <Icon className="size-4.5" aria-hidden="true" />
                    </span>
                    <span className="whitespace-nowrap">{label}</span>
                  </>
                )}
              </Link>
            </li>
          ))}
      </ul>
    </nav>
  );
}
