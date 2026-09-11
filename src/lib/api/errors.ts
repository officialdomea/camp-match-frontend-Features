import { ApiError } from "./client";

/**
 * Normalized error layer: raw API/network failures are mapped to a small set of
 * UI-friendly errors. Components never read raw backend messages.
 */
export type AppErrorCode =
  | "VALIDATION_ERROR"
  | "AUTHENTICATION_ERROR"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "SERVER_ERROR"
  | "NETWORK_ERROR"
  | "UNKNOWN";

export type AppError = {
  code: AppErrorCode;
  title: string;
  message: string;
  /** Field-level messages, keyed by form field name. */
  fieldErrors?: Record<string, string>;
  retryable: boolean;
};

const copy: Record<AppErrorCode, { title: string; message: string; retryable: boolean }> = {
  VALIDATION_ERROR: {
    title: "Check your details",
    message: "Some information doesn't look right. Please review and try again.",
    retryable: false,
  },
  AUTHENTICATION_ERROR: {
    title: "We couldn't sign you in",
    message: "Those details don't match an account. Check them and try again.",
    retryable: false,
  },
  FORBIDDEN: {
    title: "You don't have access",
    message: "This action isn't available on your account right now.",
    retryable: false,
  },
  NOT_FOUND: {
    title: "Not found",
    message: "We couldn't find what you were looking for.",
    retryable: false,
  },
  CONFLICT: {
    title: "That already exists",
    message: "An account with these details already exists. Try signing in instead.",
    retryable: false,
  },
  RATE_LIMITED: {
    title: "Too many attempts",
    message: "Please wait a moment before trying again.",
    retryable: true,
  },
  SERVER_ERROR: {
    title: "Something went wrong",
    message: "Camp Match had a problem completing that. Please try again shortly.",
    retryable: true,
  },
  NETWORK_ERROR: {
    title: "We couldn't connect to Camp Match",
    message: "Check your connection and try again.",
    retryable: true,
  },
  UNKNOWN: {
    title: "Something went wrong",
    message: "Please try again.",
    retryable: true,
  },
};

export function createAppError(
  code: AppErrorCode,
  overrides: Partial<Omit<AppError, "code">> = {},
): AppError {
  return { code, ...copy[code], ...overrides };
}

function codeFromStatus(status: number): AppErrorCode {
  if (status === 400 || status === 422) return "VALIDATION_ERROR";
  if (status === 401) return "AUTHENTICATION_ERROR";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  if (status === 409) return "CONFLICT";
  if (status === 429) return "RATE_LIMITED";
  if (status >= 500) return "SERVER_ERROR";
  return "UNKNOWN";
}

export function isAppError(value: unknown): value is AppError {
  return (
    typeof value === "object" &&
    value !== null &&
    "code" in value &&
    "title" in value &&
    "message" in value
  );
}

/** API error → UI-friendly error. Raw backend text is never surfaced. */
export function normalizeError(error: unknown): AppError {
  if (isAppError(error)) return error;

  if (error instanceof ApiError) {
    const details = error.details as { fieldErrors?: Record<string, string> } | undefined;
    return createAppError(
      codeFromStatus(error.status),
      details?.fieldErrors ? { fieldErrors: details.fieldErrors } : {},
    );
  }

  if (error instanceof TypeError) return createAppError("NETWORK_ERROR");

  return createAppError("UNKNOWN");
}
