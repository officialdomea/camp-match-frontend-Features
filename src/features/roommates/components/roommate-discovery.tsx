import { EmptyState, LoadingState } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MatchCandidate, MatchRequest, MatchStatus } from "@/types/roommate";
import { Search, Sparkles } from "lucide-react";
import { RoommateCard } from "./roommate-card";

export function RoommateDiscovery({
  candidates,
  isLoading,
  isError,
  onRetry,
  requestStates,
  onRequest,
}: {
  candidates: MatchCandidate[];
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
  requestStates: Record<string, MatchStatus>;
  onRequest: (candidate: MatchCandidate) => void;
}) {
  if (isLoading) return <LoadingState label="Finding compatible roommates" />;

  if (isError) {
    return (
      <Card>
        <CardContent className="p-6">
          <EmptyState
            title="We couldn't load roommate candidates"
            description="Please try again so we can refresh your matches."
            icon={<Sparkles className="size-5" />}
            action={<Button onClick={onRetry}>Try again</Button>}
          />
        </CardContent>
      </Card>
    );
  }

  if (!candidates.length) {
    return (
      <EmptyState
        title="No compatible roommates yet"
        description="Your preferences are in place, but there aren’t strong matches right now. Try broadening the area or budget range."
        icon={<Search className="size-5" />}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {candidates.map((candidate) => {
        const requestStatus = requestStates[candidate.studentId];

        return (
          <RoommateCard
            key={candidate.studentId}
            candidate={candidate}
            requestStatus={requestStatus}
            onRequest={() => onRequest(candidate)}
          />
        );
      })}
    </div>
  );
}

export function MatchRequestsPanel({
  requests,
  currentUserId,
  isLoading,
  onAccept,
  onDecline,
  onCancel,
}: {
  requests: MatchRequest[];
  currentUserId: string;
  isLoading: boolean;
  onAccept: (request: MatchRequest) => void;
  onDecline: (request: MatchRequest) => void;
  onCancel: (request: MatchRequest) => void;
}) {
  if (isLoading) return <LoadingState label="Loading requests" />;

  if (!requests.length) {
    return (
      <EmptyState
        title="No roommate requests yet"
        description="Your sent and incoming requests will appear here."
        icon={<Sparkles className="size-5" />}
      />
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((request) => (
        <Card key={request.id}>
          <CardHeader>
            <CardTitle>
              {request.status === "pending"
                ? "Pending request"
                : request.status === "accepted"
                  ? "Accepted request"
                  : request.status}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Requester: {request.requesterId} · Recipient: {request.recipientId}
            </p>
            {request.status === "accepted" ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {request.requesterId === currentUserId && request.requesterAccepted
                    ? "You accepted this request. Waiting for the other participant."
                    : request.recipientId === currentUserId && request.recipientAccepted
                      ? "You accepted this request. Waiting for the other participant."
                      : "Accepted by the other participant. Confirm the match to continue."}
                </p>
                {(request.requesterId === currentUserId && !request.requesterAccepted) ||
                (request.recipientId === currentUserId && !request.recipientAccepted) ? (
                  <Button variant="default" size="sm" onClick={() => onAccept(request)}>
                    Accept match
                  </Button>
                ) : null}
              </div>
            ) : request.status === "pending" ? (
              <div className="flex gap-2">
                <Button variant="default" size="sm" onClick={() => onAccept(request)}>
                  Accept
                </Button>
                <Button variant="outline" size="sm" onClick={() => onDecline(request)}>
                  Decline
                </Button>
                <Button variant="secondary" size="sm" onClick={() => onCancel(request)}>
                  Cancel
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
