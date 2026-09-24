import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import "./google-auth-button.css";

export function GoogleAuthButton({
  onClick,
  loading = false,
}: {
  onClick: () => void;
  loading?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className="h-12 w-full rounded-xl bg-surface"
      disabled={loading}
      onClick={onClick}
    >
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Connecting to Google…
        </>
      ) : (
        <>
          <span className="camp-match-google-logo" aria-hidden="true">
            G
          </span>
          Continue with Google
        </>
      )}
    </Button>
  );
}
