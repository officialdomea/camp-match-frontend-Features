import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { getNavItems } from "./nav-items";

export function SidebarNav() {
  const { user } = useAuth();
  const navItems = getNavItems(user?.role);

  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 border-r border-border bg-sidebar px-3 py-6 lg:block">
      <nav aria-label="Primary">
        <ul className="space-y-1">
          {navItems.map(({ label, to, icon: Icon }) => (
            <li key={to}>
              <Link
                to={to}
                activeOptions={{ exact: to === "/" }}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
                activeProps={{
                  className: "bg-sidebar-accent text-sidebar-accent-foreground",
                  "aria-current": "page",
                }}
              >
                <Icon className="size-4.5" aria-hidden="true" />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-8 rounded-2xl bg-primary-soft p-4">
        <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
        <p className="mt-2 text-sm font-semibold text-foreground">Every listing is checked</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Camp Match Scouts visit properties in person before they go live.
        </p>
      </div>
    </aside>
  );
}
