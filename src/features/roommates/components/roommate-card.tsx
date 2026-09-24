import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MapPin, MessageCircle, Sparkles, UserRound } from "lucide-react";
import type { MatchCandidate, MatchRequest, MatchStatus } from "@/types/roommate";

function statusBadge(status: MatchStatus) {
  const map: Record<MatchStatus, string> = {
    none: "bg-muted text-muted-foreground",
    pending: "bg-amber-100 text-amber-900",
    accepted: "bg-emerald-100 text-emerald-900",
    declined: "bg-red-100 text-red-900",
    cancelled: "bg-slate-100 text-slate-700",
    matched: "bg-blue-100 text-blue-900",
  };

  return map[status];
}

export function CompatibilityBadge({ score }: { score: number }) {
  return (
    <Badge
      className={
        score >= 80
          ? "bg-emerald-100 text-emerald-800"
          : score >= 60
            ? "bg-amber-100 text-amber-800"
            : "bg-slate-100 text-slate-700"
      }
    >
      {score}% match
    </Badge>
  );
}

export function RoommateCard({
  candidate,
  requestStatus,
  onRequest,
}: {
  candidate: MatchCandidate;
  requestStatus?: MatchStatus | undefined;
  onRequest?: () => void;
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const initials = candidate.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <CardContent className="p-0">
          <button
            type="button"
            className="block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
            onClick={() => setProfileOpen(true)}
            aria-label={`View ${candidate.name}'s roommate profile`}
          >
            <Avatar className="h-56 w-full rounded-none rounded-t-lg bg-muted sm:h-64">
              <AvatarImage
                src={candidate.profileImage}
                alt={`${candidate.name} profile photo`}
                className="object-cover"
              />
              <AvatarFallback className="rounded-none bg-primary/10 text-2xl font-semibold text-primary">
                {initials || <UserRound className="size-8" />}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">{candidate.name}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="size-3.5 shrink-0" />
                    <span className="truncate">{candidate.preferredArea || "Area not set"}</span>
                  </p>
                </div>
                <CompatibilityBadge score={candidate.compatibility.score} />
              </div>
              <p className="text-xs text-muted-foreground">Tap to view roommate preferences</p>
            </div>
          </button>

          {requestStatus ? (
            <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-3">
              <span
                className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${statusBadge(requestStatus)}`}
              >
                {requestStatus === "accepted"
                  ? "Accepted"
                  : requestStatus === "matched"
                    ? "Confirmed"
                    : requestStatus}
              </span>
              {requestStatus === "pending" ? (
                <span className="text-xs text-muted-foreground">Request pending</span>
              ) : null}
              {requestStatus === "accepted" ? (
                <span className="text-xs text-muted-foreground">Awaiting mutual match</span>
              ) : null}
              {requestStatus === "declined" ? (
                <span className="text-xs text-muted-foreground">Open profile to try again</span>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <div className="flex items-start gap-4 pr-6 text-left">
              <Avatar className="size-20 shrink-0 rounded-xl">
                <AvatarImage
                  src={candidate.profileImage}
                  alt={`${candidate.name} profile photo`}
                  className="object-cover"
                />
                <AvatarFallback className="rounded-xl bg-primary/10 text-xl font-semibold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 space-y-2">
                <DialogTitle className="truncate">{candidate.name}</DialogTitle>
                <DialogDescription className="flex items-center gap-1.5">
                  <MapPin className="size-3.5" /> {candidate.preferredArea || "Area not set"} ·{" "}
                  {candidate.universityId}
                </DialogDescription>
                <CompatibilityBadge score={candidate.compatibility.score} />
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-5">
            <section className="rounded-lg bg-muted/40 p-4">
              <h3 className="font-semibold">Why you match</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {candidate.compatibility.summary}
              </p>
            </section>

            <dl className="grid gap-4 sm:grid-cols-2">
              <ProfileDetail
                label="Budget"
                value={`₦${candidate.budgetMin.toLocaleString()} - ₦${candidate.budgetMax.toLocaleString()}`}
              />
              <ProfileDetail
                label="Accommodation"
                value={candidate.accommodationTypes.join(", ")}
              />
              <ProfileDetail label="Study style" value={candidate.studyHabits} />
              <ProfileDetail label="Sleep schedule" value={candidate.sleepSchedule} />
              <ProfileDetail label="Noise preference" value={candidate.noisePreference} />
              <ProfileDetail label="Social style" value={candidate.socialPreference} />
            </dl>

            <div className="flex flex-wrap gap-2">
              {candidate.lifestylePreferences.map((item) => (
                <Badge key={item} variant="secondary">
                  {item}
                </Badge>
              ))}
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
              {requestStatus === "accepted" ? (
                <Button variant="outline" disabled>
                  Awaiting mutual confirmation
                </Button>
              ) : null}
              {requestStatus === "declined" || requestStatus === "cancelled" ? (
                <Button variant="outline" onClick={onRequest}>
                  Request again
                </Button>
              ) : null}
              {requestStatus === "matched" ? (
                <Button variant="outline" disabled>
                  <MessageCircle className="mr-2 size-4" />
                  Confirmed roommate
                </Button>
              ) : null}
              {!requestStatus ? (
                <Button onClick={onRequest}>
                  <Sparkles className="mr-2 size-4" />
                  Request match
                </Button>
              ) : null}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ProfileDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium capitalize text-foreground">
        {value || "Not specified"}
      </dd>
    </div>
  );
}

export function MatchRequestCard({
  request,
  onAccept,
  onDecline,
  onCancel,
}: {
  request: MatchRequest;
  onAccept?: () => void;
  onDecline?: () => void;
  onCancel?: () => void;
}) {
  const isIncoming = request.recipientId !== "current-user";

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold">{isIncoming ? "Incoming request" : "Outgoing request"}</p>
            <p className="text-sm text-muted-foreground">Status: {request.status}</p>
          </div>
          <span
            className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${statusBadge(request.status)}`}
          >
            {request.status}
          </span>
        </div>

        {request.status === "pending" && isIncoming ? (
          <div className="mt-4 flex gap-2">
            <Button variant="default" size="sm" onClick={onAccept}>
              Accept
            </Button>
            <Button variant="outline" size="sm" onClick={onDecline}>
              Decline
            </Button>
          </div>
        ) : null}

        {request.status === "pending" && !isIncoming && onCancel ? (
          <div className="mt-4 flex gap-2">
            <Button variant="outline" size="sm" onClick={onCancel}>
              Cancel request
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
