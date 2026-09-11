import { env } from "@/lib/env";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = {
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  signal?: AbortSignal;
  headers?: Record<string, string>;
};

let authTokenProvider: () => string | null = () => null;
let unauthorizedHandler: (() => Promise<void>) | null = null;

/** Wired up by the auth feature so the API client stays independent of UI pages. */
export function setAuthTokenProvider(provider: () => string | null) {
  authTokenProvider = provider;
}

export function setUnauthorizedHandler(handler: () => Promise<void>) {
  unauthorizedHandler = handler;
}

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const base = env.apiBaseUrl.replace(/\/$/, "");
  const url = `${base}/${path.replace(/^\//, "")}`;
  if (!query) return url;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

async function request<T>(
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE",
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const token = authTokenProvider();
  const response = await fetch(buildUrl(path, options.query), {
    method,
    signal: options.signal ?? null,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  });

  if (!response.ok) {
    if (response.status === 401 && unauthorizedHandler) {
      await unauthorizedHandler();
    }

    let details: unknown;
    try {
      details = await response.json();
    } catch {
      details = undefined;
    }
    throw new ApiError(`Request failed with status ${response.status}`, response.status, details);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>("GET", path, options),
  post: <T>(path: string, options?: RequestOptions) => request<T>("POST", path, options),
  patch: <T>(path: string, options?: RequestOptions) => request<T>("PATCH", path, options),
  delete: <T>(path: string, options?: RequestOptions) => request<T>("DELETE", path, options),
};
