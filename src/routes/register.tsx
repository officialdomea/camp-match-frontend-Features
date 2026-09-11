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
import { createAppError, normalizeError, type AppError } from "@/lib/api/errors";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create your account — Camp Match" },
      {
        name: "description",
        content: "Join Camp Match to browse verified student accommodation near Nigerian campuses.",
      },
      { property: "og:title", content: "Create your account — Camp Match" },
      {
        property: "og:description",
        content: "Join Camp Match and find verified student housing.",
      },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState<AppError | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fieldErrors = error?.fieldErrors ?? {};
  const set = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const localErrors: Record<string, string> = {};
    if (!form.fullName.trim()) localErrors["fullName"] = "Enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) localErrors["email"] = "Enter a valid email address.";
    if (form.phone.replace(/\D/g, "").length < 10)
      localErrors["phone"] = "Enter a valid Nigerian phone number.";
    if (form.password.length < 8) localErrors["password"] = "Use at least 8 characters.";

    if (Object.keys(localErrors).length > 0) {
      setError(createAppError("VALIDATION_ERROR", { fieldErrors: localErrors }));
      return;
    }

    setSubmitting(true);
    try {
      const session = await authService.register(form);
      setUser(session.user);
      navigate({ to: "/verify" });
    } catch (caught) {
      setError(normalizeError(caught));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="One account for students, property owners and house scouts."
      footer={
        <p className="text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <ErrorBanner error={error} />

        <FormField
          label="Full name"
          name="fullName"
          autoComplete="name"
          required
          value={form.fullName}
          onChange={set("fullName")}
          error={fieldErrors["fullName"]}
        />
        <FormField
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          value={form.email}
          onChange={set("email")}
          error={fieldErrors["email"]}
        />
        <FormField
          label="Phone number"
          name="phone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          placeholder="+234 800 000 0000"
          required
          value={form.phone}
          onChange={set("phone")}
          error={fieldErrors["phone"]}
        />
        <PasswordField
          label="Password"
          name="password"
          autoComplete="new-password"
          helperText="At least 8 characters."
          required
          value={form.password}
          onChange={set("password")}
          error={fieldErrors["password"]}
        />

        <Button type="submit" size="lg" className="h-12 w-full rounded-xl" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Creating account…
            </>
          ) : (
            "Create account"
          )}
        </Button>

        <p className="text-xs text-muted-foreground">
          By continuing you agree to Camp Match's terms and verification checks.
        </p>
      </form>
    </AuthLayout>
  );
}
