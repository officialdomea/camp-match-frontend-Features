import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function FieldShell({
  label,
  htmlFor,
  helperText,
  error,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  helperText?: string | undefined;
  error?: string | undefined;
  required?: boolean | undefined;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-foreground">
        {label}
        {required ? (
          <span className="ml-1 text-destructive" aria-hidden="true">
            *
          </span>
        ) : null}
        {required ? <span className="sr-only"> (required)</span> : null}
      </label>
      {children}
      {helperText && !error ? (
        <p id={`${htmlFor}-helper`} className="text-xs text-muted-foreground">
          {helperText}
        </p>
      ) : null}
      {error ? (
        <p
          id={`${htmlFor}-error`}
          className="flex items-start gap-1.5 text-xs font-medium text-destructive"
        >
          <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}

export const fieldInputClass =
  "h-12 w-full rounded-xl border border-input bg-surface px-4 text-base outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  helperText?: string | undefined;
  error?: string | undefined;
  /** Rendered inside the field box, right aligned (e.g. a visibility toggle). */
  trailing?: ReactNode;
};

export function FormField({
  label,
  helperText,
  error,
  trailing,
  className,
  id,
  required,
  ...props
}: FormFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const describedBy = error ? `${fieldId}-error` : helperText ? `${fieldId}-helper` : undefined;

  return (
    <FieldShell
      label={label}
      htmlFor={fieldId}
      helperText={helperText}
      error={error}
      required={required}
    >
      <div className="relative">
        <input
          id={fieldId}
          aria-invalid={error ? true : undefined}
          {...(describedBy ? { "aria-describedby": describedBy } : {})}
          {...(required ? { "aria-required": true } : {})}
          className={cn(
            fieldInputClass,
            trailing && "pr-12",
            error && "border-destructive focus:border-destructive focus:ring-destructive/20",
            className,
          )}
          {...props}
        />
        {trailing ? (
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2">{trailing}</div>
        ) : null}
      </div>
    </FieldShell>
  );
}
