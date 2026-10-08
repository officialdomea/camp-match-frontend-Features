import { useRef, useState } from "react";
import { Flag, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/features/auth/hooks/use-auth";
import {
  canContinueReport,
  REPORT_SUBMITTED_CONFIRMATION,
} from "@/features/reporting/domain/reporting";
import { reportingService } from "@/features/reporting/services/reporting.service";
import {
  REPORT_REASONS,
  type ReportReason,
  type ReportSubmissionInput,
  type ReportTargetType,
} from "@/types/reporting";
import { normalizeError } from "@/lib/api/errors";

type ReportDialogProps = {
  targetType: ReportTargetType;
  targetId: string;
  targetLabel: string;
  className?: string;
};

export function ReportDialog({ targetType, targetId, targetLabel, className }: ReportDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"details" | "review" | "success">("details");
  const [reason, setReason] = useState<ReportReason | "">("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submittingRef = useRef(false);

  if (!user || (targetType === "user" && targetId === user.id)) return null;

  const openDialog = () => {
    setStep("details");
    setReason("");
    setDescription("");
    setError(null);
    setOpen(true);
  };

  const submit = async () => {
    if (!reason || !canContinueReport(reason, submittingRef.current)) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    setError(null);
    try {
      const input: ReportSubmissionInput = {
        targetType,
        targetId,
        reason,
        description: description.trim() || undefined,
      };
      const report = await reportingService.submitReport(input);
      if (report.status !== "submitted") {
        throw new Error("The report could not be submitted.");
      }
      setStep("success");
    } catch (caught) {
      setError(normalizeError(caught).message);
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button type="button" variant="outline" size="sm" className={className} onClick={openDialog}>
        <Flag className="mr-2 size-4" aria-hidden="true" />
        Report
      </Button>
      <Dialog open={open} onOpenChange={(nextOpen) => !isSubmitting && setOpen(nextOpen)}>
        <DialogContent className="sm:max-w-md" aria-busy={isSubmitting}>
          {step === "details" ? (
            <>
              <DialogHeader>
                <DialogTitle>Report {targetLabel}</DialogTitle>
                <DialogDescription>
                  Choose the reason that best describes your concern. Your report is private.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="report-reason">
                    Reason <span aria-hidden="true">*</span>
                  </label>
                  <Select
                    value={reason}
                    onValueChange={(value) => setReason(value as ReportReason)}
                  >
                    <SelectTrigger
                      id="report-reason"
                      aria-label="Report reason"
                      aria-required="true"
                    >
                      <SelectValue placeholder="Select a reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {REPORT_REASONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="report-description">
                    Details <span className="font-normal text-muted-foreground">(optional)</span>
                  </label>
                  <Textarea
                    id="report-description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    maxLength={1000}
                    placeholder="Share any context that may help us understand your report."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  onClick={() => setStep("review")}
                  disabled={!canContinueReport(reason, isSubmitting)}
                >
                  Review report
                </Button>
              </DialogFooter>
            </>
          ) : step === "review" ? (
            <>
              <DialogHeader>
                <DialogTitle>Review report</DialogTitle>
                <DialogDescription>Check these details before submitting.</DialogDescription>
              </DialogHeader>
              <dl className="space-y-3 rounded-md border border-border p-4 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">About</dt>
                  <dd className="font-medium">{targetLabel}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Reason</dt>
                  <dd className="font-medium">
                    {REPORT_REASONS.find((option) => option.value === reason)?.label}
                  </dd>
                </div>
                {description.trim() ? (
                  <div>
                    <dt className="text-xs text-muted-foreground">Details</dt>
                    <dd className="whitespace-pre-wrap">{description.trim()}</dd>
                  </div>
                ) : null}
              </dl>
              {error ? (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              ) : null}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("details")}
                  disabled={isSubmitting}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={() => void submit()}
                  disabled={!canContinueReport(reason, isSubmitting)}
                >
                  {isSubmitting ? (
                    <LoaderCircle className="mr-2 size-4 animate-spin" aria-hidden="true" />
                  ) : null}
                  {isSubmitting ? "Submitting" : "Submit report"}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Report submitted</DialogTitle>
                <DialogDescription>{REPORT_SUBMITTED_CONFIRMATION}</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button type="button" onClick={() => setOpen(false)}>
                  Done
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
