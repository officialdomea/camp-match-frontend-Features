import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { env } from "@/lib/env";
import "./google-auth-button.css";

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleButtonOptions = {
  theme: "outline";
  size: "large";
  text: "continue_with";
  shape: "pill";
  width: number;
};

type GoogleIdentityServices = {
  initialize: (options: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select: false;
  }) => void;
  renderButton: (container: HTMLElement, options: GoogleButtonOptions) => void;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleIdentityServices;
      };
    };
  }
}

let googleScriptPromise: Promise<void> | null = null;

function loadGoogleIdentityServices() {
  if (window.google?.accounts.id) return Promise.resolve();
  if (googleScriptPromise) return googleScriptPromise;

  googleScriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts.id) {
        resolve();
      } else {
        googleScriptPromise = null;
        reject(new Error("Google Identity Services did not initialize."));
      }
    };
    script.onerror = () => {
      googleScriptPromise = null;
      reject(new Error("Google Identity Services could not be loaded."));
    };
    document.head.appendChild(script);
  });

  return googleScriptPromise;
}

export function GoogleAuthButton({
  onCredential,
  loading = false,
}: {
  onCredential: (credential: string) => void;
  loading?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onCredentialRef = useRef(onCredential);
  const [initializing, setInitializing] = useState(!env.useMockData && Boolean(env.googleClientId));
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  onCredentialRef.current = onCredential;

  useEffect(() => {
    if (env.useMockData || !env.googleClientId) return;

    let active = true;
    let renderedWidth = 0;
    let resizeObserver: ResizeObserver | null = null;

    const renderGoogleButton = () => {
      const googleId = window.google?.accounts.id;
      const container = containerRef.current;
      if (!active || !googleId || !container) return;

      const width = Math.min(400, Math.max(200, Math.floor(container.clientWidth)));
      if (width === renderedWidth) return;
      renderedWidth = width;
      container.replaceChildren();
      googleId.renderButton(container, {
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "pill",
        width,
      });
    };

    void loadGoogleIdentityServices()
      .then(() => {
        if (!active) return;
        const googleId = window.google?.accounts.id;
        if (!googleId) throw new Error("Google Identity Services is unavailable.");

        googleId.initialize({
          client_id: env.googleClientId,
          auto_select: false,
          callback: (response) => {
            if (!response.credential) {
              setInitializationError(
                "Google did not return a sign-in credential. Please try again.",
              );
              return;
            }
            onCredentialRef.current(response.credential);
          },
        });

        renderGoogleButton();
        if (typeof ResizeObserver !== "undefined" && containerRef.current) {
          resizeObserver = new ResizeObserver(renderGoogleButton);
          resizeObserver.observe(containerRef.current);
        } else {
          window.addEventListener("resize", renderGoogleButton);
        }
        setInitializing(false);
      })
      .catch(() => {
        if (!active) return;
        setInitializationError(
          "Google sign-in could not be loaded. Check your connection and try again.",
        );
        setInitializing(false);
      });

    return () => {
      active = false;
      resizeObserver?.disconnect();
      window.removeEventListener("resize", renderGoogleButton);
    };
  }, [attempt]);

  if (env.useMockData) {
    return (
      <p className="text-center text-sm text-muted-foreground" role="note">
        Google sign-in is unavailable in demo mode.
      </p>
    );
  }

  if (!env.googleClientId) {
    return (
      <p className="text-center text-sm text-destructive" role="alert">
        Google sign-in is not configured for this environment.
      </p>
    );
  }

  return (
    <div className="w-full" aria-busy={loading || initializing}>
      <div
        ref={containerRef}
        className={`camp-match-google-button min-h-10 w-full${loading ? " hidden" : ""}`}
      />
      {initializing ? (
        <p
          className="flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground"
          role="status"
        >
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Loading Google sign-in…
        </p>
      ) : null}
      {loading ? (
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-12 w-full rounded-xl"
          disabled
        >
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Signing in with Google…
        </Button>
      ) : null}
      {initializationError ? (
        <div className="mt-2 text-center">
          <p className="text-sm text-destructive" role="alert">
            {initializationError}
          </p>
          <button
            type="button"
            className="mt-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
            onClick={() => {
              setInitializationError(null);
              setInitializing(true);
              setAttempt((current) => current + 1);
            }}
          >
            Try loading Google sign-in again
          </button>
        </div>
      ) : null}
    </div>
  );
}
