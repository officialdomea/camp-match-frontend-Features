import { ImagePlus, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { authService } from "@/features/auth/services/auth.service";
import { validateImageFile } from "@/lib/media";
import type { AuthUser } from "@/types/auth";

function initials(name: string) {
  return (
    name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "CM"
  );
}

export function ProfilePhoto({
  user,
  editable = false,
  onUserChange,
}: {
  user: AuthUser;
  editable?: boolean;
  onUserChange?: (user: AuthUser) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const choose = async (file: File | undefined) => {
    if (!file) return;
    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    try {
      setError(null);
      setUploading(true);
      onUserChange?.(await authService.updateProfilePhoto(file));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We couldn't update the profile photo.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Avatar className="size-14">
        <AvatarImage src={user.profileImageUrl} alt={`${user.fullName} profile photo`} />
        <AvatarFallback className="bg-primary-soft text-primary">
          {initials(user.fullName)}
        </AvatarFallback>
      </Avatar>
      {editable ? (
        <div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-auto px-0 text-primary"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="mr-1 size-3 animate-spin" />
            ) : (
              <ImagePlus className="mr-1 size-3" />
            )}
            {uploading ? "Uploading…" : "Change photo"}
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(event) => void choose(event.target.files?.[0])}
          />
          {error ? (
            <p className="text-xs text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
