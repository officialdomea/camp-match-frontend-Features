import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, LogOut, Search, User } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/use-auth";

function initialsOf(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function AppHeader() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur-md">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2" aria-label="Camp Match home">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
            CM
          </span>
          <span className="hidden text-base font-semibold tracking-tight sm:block">Camp Match</span>
        </Link>

        <form
          role="search"
          className="ml-auto hidden max-w-md flex-1 md:block"
          onSubmit={(event) => {
            event.preventDefault();
            navigate({ to: "/discover", search: { q: query || undefined } });
          }}
        >
          <label htmlFor="global-search" className="sr-only">
            Search listings
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              id="global-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by university, area or property"
              className="h-10 w-full rounded-full border border-input bg-background pl-9 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          {isAuthenticated ? (
            <>
              <button
                type="button"
                aria-label="Notifications"
                className="relative flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Bell className="size-5" aria-hidden="true" />
                <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-accent" />
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label="Account menu"
                  className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <Avatar className="size-9">
                    <AvatarFallback className="bg-primary-soft text-sm text-primary">
                      {initialsOf(user?.fullName ?? "Camp Match")}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="truncate">
                    {user?.fullName}
                    <span className="block truncate text-xs font-normal text-muted-foreground">
                      {user?.email}
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">
                      <User className="size-4" aria-hidden="true" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={async () => {
                      await logout();
                      navigate({ to: "/login", replace: true });
                    }}
                  >
                    <LogOut className="size-4" aria-hidden="true" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button asChild size="sm" className="rounded-full">
              <Link to="/login">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
