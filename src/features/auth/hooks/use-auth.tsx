import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from "react";
import { setAuthTokenProvider, setUnauthorizedHandler } from "@/lib/api/client";
import { authService } from "../services/auth.service";
import type { AuthState, AuthUser } from "@/types/auth";

export const authKeys = {
  currentUser: ["auth", "current-user"] as const,
};

type AuthContextValue = {
  state: AuthState;
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** Writes a fresh user into the auth cache after a service call. */
  setUser: (user: AuthUser | null) => void;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    setAuthTokenProvider(() => authService.getAccessToken());
    setUnauthorizedHandler(async () => {
      try {
        const refreshed = await authService.refreshSession();
        queryClient.setQueryData(authKeys.currentUser, refreshed.user);
      } catch {
        await authService.clearSession();
        queryClient.setQueryData(authKeys.currentUser, null);
      }
    });
  }, [queryClient]);

  const query = useQuery({
    queryKey: authKeys.currentUser,
    queryFn: () => authService.getCurrentUser(),
    staleTime: 30_000,
    retry: false,
  });

  const setUser = useCallback(
    (user: AuthUser | null) => {
      queryClient.setQueryData(authKeys.currentUser, user);
    },
    [queryClient],
  );

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: authKeys.currentUser });
  }, [queryClient]);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    await queryClient.cancelQueries();
  }, [queryClient, setUser]);

  const state = useMemo<AuthState>(() => {
    if (query.isPending) return { status: "checking" };
    if (query.isError) return { status: "unauthenticated" };
    const user = query.data ?? null;
    return user ? { status: "authenticated", user } : { status: "unauthenticated" };
  }, [query.data, query.isError, query.isPending]);

  const value = useMemo<AuthContextValue>(
    () => ({
      state,
      user: state.status === "authenticated" ? state.user : null,
      isAuthenticated: state.status === "authenticated",
      setUser,
      refresh,
      logout,
    }),
    [state, setUser, refresh, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
