import { ImageOff } from "lucide-react";
import { useState, type ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SafeImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src?: string | null | undefined;
  fallbackLabel?: string;
};

export function SafeImage({
  src,
  alt,
  fallbackLabel = "Image unavailable",
  className,
  ...props
}: SafeImageProps) {
  const [failed, setFailed] = useState(!src);

  if (failed || !src) {
    return (
      <div
        className={cn("flex items-center justify-center bg-muted text-muted-foreground", className)}
        role="img"
        aria-label={alt ?? fallbackLabel}
      >
        <span className="flex items-center gap-2 text-xs">
          <ImageOff className="size-4" aria-hidden="true" />
          {fallbackLabel}
        </span>
      </div>
    );
  }

  return (
    <img {...props} src={src} alt={alt} className={className} onError={() => setFailed(true)} />
  );
}
