import { useRef } from "react";
import { cn } from "@/lib/utils";

const LENGTH = 6;

export function VerificationCodeInput({
  value,
  onChange,
  onComplete,
  disabled,
  invalid,
  label = "Verification code",
}: {
  value: string;
  onChange: (value: string) => void;
  onComplete?: ((code: string) => void) | undefined;
  disabled?: boolean | undefined;
  invalid?: boolean | undefined;
  label?: string;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const commit = (next: string) => {
    const clean = next.replace(/\D/g, "").slice(0, LENGTH);
    onChange(clean);
    if (clean.length === LENGTH) onComplete?.(clean);
    return clean;
  };

  return (
    <fieldset disabled={disabled} className="border-0 p-0">
      <legend className="sr-only">{label}</legend>
      <div className="flex justify-between gap-2" role="group" aria-label={label}>
        {Array.from({ length: LENGTH }).map((_, index) => (
          <input
            key={index}
            ref={(node) => {
              refs.current[index] = node;
            }}
            inputMode="numeric"
            autoComplete="one-time-code"
            aria-label={`Digit ${index + 1} of ${LENGTH}`}
            aria-invalid={invalid ? true : undefined}
            maxLength={1}
            value={value[index] ?? ""}
            onChange={(event) => {
              const digit = event.target.value.replace(/\D/g, "").slice(-1);
              const chars = value.padEnd(LENGTH, " ").split("");
              chars[index] = digit || " ";
              const next = commit(chars.join("").trimEnd().replace(/ /g, ""));
              if (digit && index < LENGTH - 1) refs.current[index + 1]?.focus();
              if (next.length === LENGTH) refs.current[LENGTH - 1]?.blur();
            }}
            onKeyDown={(event) => {
              if (event.key === "Backspace" && !value[index] && index > 0) {
                refs.current[index - 1]?.focus();
              }
              if (event.key === "ArrowLeft" && index > 0) refs.current[index - 1]?.focus();
              if (event.key === "ArrowRight" && index < LENGTH - 1)
                refs.current[index + 1]?.focus();
            }}
            onPaste={(event) => {
              event.preventDefault();
              const pasted = event.clipboardData.getData("text");
              const next = commit(pasted);
              refs.current[Math.min(next.length, LENGTH - 1)]?.focus();
            }}
            className={cn(
              "h-14 w-full min-w-0 rounded-xl border bg-surface text-center text-xl font-semibold tabular-nums outline-none transition-colors",
              "focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60",
              invalid ? "border-destructive" : "border-input",
            )}
          />
        ))}
      </div>
    </fieldset>
  );
}
