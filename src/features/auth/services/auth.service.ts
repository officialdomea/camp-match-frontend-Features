import { env } from "@/lib/env";
import { apiAuthProvider } from "./auth.api-provider";
import { mockAuthProvider } from "./auth.mock-provider";
import type { AuthProvider } from "./auth.provider";

const provider: AuthProvider = env.useMockData ? mockAuthProvider : apiAuthProvider;

export const authService: AuthProvider = {
  getCurrentUser: () => provider.getCurrentUser(),
  getSession: () => provider.getSession(),
  getAccessToken: () => provider.getAccessToken(),
  refreshSession: () => provider.refreshSession(),
  clearSession: () => provider.clearSession(),
  signInWithGoogle: () => provider.signInWithGoogle(),
  login: (payload) => provider.login(payload),
  register: (payload) => provider.register(payload),
  verifyAccount: (payload) => provider.verifyAccount(payload),
  resendVerificationCode: () => provider.resendVerificationCode(),
  selectRole: (role) => provider.selectRole(role),
  completeOnboarding: (payload) => provider.completeOnboarding(payload),
  updateProfilePhoto: (file) => provider.updateProfilePhoto(file),
  logout: () => provider.logout(),
};
