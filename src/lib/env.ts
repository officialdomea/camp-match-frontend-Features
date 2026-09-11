/**
 * Public frontend configuration. Never place secrets here — Vite env vars
 * shipped with the `VITE_` prefix are visible to every visitor.
 */
export const env = {
  apiBaseUrl: import.meta.env["VITE_API_BASE_URL"] ?? "/api/v1",
  /** Flip to false once the FastAPI backend is reachable. */
  useMockData: (import.meta.env["VITE_USE_MOCK_DATA"] ?? "true").toString() !== "false",
} as const;
