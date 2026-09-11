import { useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { AuthLayout } from "@/features/auth/components/auth-layout";
import { FormField } from "@/components/forms/form-field";
import { PasswordField } from "@/components/forms/password-field";
import { ErrorBanner } from "@/components/forms/error-banner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { authService } from "@/features/auth/services/auth.service";
import { nextPathForUser } from "@/features/auth/lib/routing";
import { normalizeError, type AppError } from "@/lib/api/errors";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Camp Match" },
      {
        name: "description",
        content:
          "Sign in to Camp Match to continue finding verified student housing near your campus.",
      },
      { property: "og:title", content: "Sign in — Camp Match" },
      {
        property: "og:description",
        content: "Sign in to your Camp Match account.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<AppError | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fieldErrors = error?.fieldErrors ?? {};

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const session = await authService.login({ identifier, password });
      setUser(session.user);
      navigate({ to: nextPathForUser(session.user) });
    } catch (caught) {
      setError(normalizeError(caught));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to pick up where you left off."
      footer={
        <p className="text-muted-foreground">
          New to Camp Match?{" "}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <ErrorBanner error={error} />

        <FormField
          label="Email or phone number"
          name="identifier"
          autoComplete="username"
          inputMode="email"
          required
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          error={fieldErrors["identifier"]}
        />

        <PasswordField
          label="Password"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={fieldErrors["password"]}
        />

        <Button
          type="submit"
          size="lg"
          className="h-12 w-full rounded-xl"
          disabled={submitting || !identifier || !password}
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
