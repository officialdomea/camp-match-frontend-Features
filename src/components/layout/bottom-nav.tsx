import { Link } from "@tanstack/react-router";
import { navItems } from "./nav-items";
import { cn } from "@/lib/utils";

export function BottomNav() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] shadow-nav backdrop-blur-md lg:hidden"
    >
      <ul className="grid grid-cols-5">
        {navItems
          .filter((item) => item.mobile)
          .map(({ label, to, icon: Icon }) => (
            <li key={to}>
              <Link
                to={to}
                activeOptions={{ exact: to === "/" }}
                className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-muted-foreground transition-colors"
                activeProps={{ className: "text-primary", "aria-current": "page" }}
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        "flex h-7 w-12 items-center justify-center rounded-full transition-colors",
                        isActive && "bg-primary-soft",
                      )}
                    >
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    {label}
                  </>
                )}
              </Link>
            </li>
          ))}
      </ul>
    </nav>
  );
}
