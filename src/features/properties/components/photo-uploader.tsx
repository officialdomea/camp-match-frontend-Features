import { ImagePlus, Loader2, Trash2, UploadCloud } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ManagedProperty } from "@/types/property";
import { validateImageFiles } from "@/lib/media";
import { SafeImage } from "@/components/common/safe-image";

export function PhotoUploader({
  property,
  onUpload,
  onRemove,
  onPrimaryChange,
  onReorder,
}: {
  property: ManagedProperty;
  onUpload: (files: File[]) => Promise<void> | void;
  onRemove: (photoId: string) => Promise<void> | void;
  onPrimaryChange: (photoId: string) => Promise<void> | void;
  onReorder: (photoIds: string[]) => Promise<void> | void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string[]>(property.photos.map((photo) => photo.id));

  useEffect(() => {
    setPending(property.photos.map((photo) => photo.id));
  }, [property.photos]);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const selected = Array.from(files);
    const validationError = validateImageFiles(selected, Math.max(1, 12 - property.photos.length));
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setUploading(true);
    try {
      await onUpload(selected);
      setPending(property.photos.map((photo) => photo.id));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We couldn't upload those photos.");
    } finally {
      setUploading(false);
    }
  };

  const move = (from: number, to: number) => {
    const next = [...pending];
    const [moved] = next.splice(from, 1);
    if (!moved) return;
    next.splice(to, 0, moved);
    setPending(next);
    void onReorder(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">Photos</h3>
          <p className="text-sm text-muted-foreground">Add, reorder and choose the hero image.</p>
        </div>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <UploadCloud className="size-4" aria-hidden="true" />
          )}
          {uploading ? "Uploading…" : "Upload photos"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(event) => void handleFiles(event.target.files)}
        />
      </div>

      {property.photos.length === 0 ? (
        <Card className="flex min-h-48 flex-col items-center justify-center border-dashed p-8 text-center">
          <ImagePlus className="size-10 text-muted-foreground" aria-hidden="true" />
          <p className="mt-3 text-base font-medium">No photos yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload a few clear images before submitting for review.
          </p>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {pending.map((photoId, index) => {
            const photo = property.photos.find((item) => item.id === photoId);
            if (!photo) return null;
            return (
              <Card key={photo.id} className="overflow-hidden">
                <div className="relative">
                  <SafeImage
                    src={photo.url}
                    alt={photo.alt}
                    className="h-36 w-full object-cover"
                    fallbackLabel="Image unavailable"
                  />
                  {photo.isPrimary ? (
                    <span className="absolute left-2 top-2 rounded-full bg-foreground px-2 py-1 text-[10px] font-medium text-background">
                      Primary
                    </span>
                  ) : null}
                </div>
                <div className="space-y-3 p-3">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void onPrimaryChange(photo.id)}
                    >
                      Set primary
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void onRemove(photo.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={index === 0}
                      onClick={() => move(index, index - 1)}
                    >
                      Move left
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={index === pending.length - 1}
                      onClick={() => move(index, index + 1)}
                    >
                      Move right
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
