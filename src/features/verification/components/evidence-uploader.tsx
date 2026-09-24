import { FileUp, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { validateVerificationFile } from "@/lib/media";
import { verificationService } from "../services/verification.service";
import type { VerificationEvidence, VerificationEvidenceInput } from "@/types/verification";

export function EvidenceUploader({
  kind,
  documentType,
}: Pick<VerificationEvidenceInput, "kind" | "documentType">) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [evidence, setEvidence] = useState<VerificationEvidence[]>([]);

  useEffect(() => {
    let active = true;
    void verificationService.getEvidence().then((items) => {
      if (active)
        setEvidence(
          items.filter((item) => item.kind === kind && item.documentType === documentType),
        );
    });
    return () => {
      active = false;
    };
  }, [documentType, kind]);

  const choose = async (file: File | undefined) => {
    const error = validateVerificationFile(file);
    if (error || !file) {
      setStatus(error ?? "Choose a verification file.");
      return;
    }
    try {
      setStatus(null);
      setUploading(true);
      const uploaded = await verificationService.uploadEvidence({ kind, documentType, file });
      setEvidence((current) => [...current, uploaded]);
      setStatus("Evidence uploaded for private review.");
    } catch (caught) {
      setStatus(caught instanceof Error ? caught.message : "We couldn't upload the evidence.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = async (evidenceId: string) => {
    await verificationService.removeEvidence(evidenceId);
    setEvidence((current) => current.filter((item) => item.id !== evidenceId));
  };

  return (
    <div className="space-y-2 rounded-xl border border-dashed border-border p-4">
      <Button
        type="button"
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? (
          <Loader2 className="mr-2 size-4 animate-spin" />
        ) : (
          <FileUp className="mr-2 size-4" />
        )}
        {uploading ? "Uploading…" : "Upload private evidence"}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,image/jpeg,image/png"
        className="hidden"
        onChange={(event) => void choose(event.target.files?.[0])}
      />
      <p className="text-xs text-muted-foreground">
        PDF, JPG, or PNG up to 15 MB. Evidence is private and only available to authorized
        verification workflows.
      </p>
      {evidence.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 p-2 text-xs"
        >
          <span className="min-w-0 truncate">
            {item.fileName} · {item.status}
          </span>
          <Button type="button" variant="ghost" size="sm" onClick={() => void remove(item.id)}>
            Remove
          </Button>
        </div>
      ))}
      {status ? (
        <p className="text-sm text-muted-foreground" role="status">
          {status}
        </p>
      ) : null}
    </div>
  );
}
