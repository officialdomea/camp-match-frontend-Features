import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { roommateService } from "@/features/roommates/services/roommate.service";
import {
  createDefaultRoommatePreferences,
  getRoommateEligibility,
  type ConfirmedMatch,
  type MatchCandidate,
  type MatchRequest,
  type MatchStatus,
  type RoommatePreferences,
} from "@/types/roommate";
import { Heart, Sparkles, UserX } from "lucide-react";
import { RoommatePreferencesForm } from "./roommate-preferences-form";
import { MatchRequestsPanel, RoommateDiscovery } from "./roommate-discovery";

const PREFERENCE_QUERY_KEY = ["roommates", "preferences"] as const;

export function RoommatePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const preferenceQuery = useQuery<RoommatePreferences | null>({
    queryKey: [...PREFERENCE_QUERY_KEY, user?.id],
    queryFn: () => roommateService.getPreferences(user?.id ?? user?.id ?? undefined),
    enabled: Boolean(user?.id),
    retry: false,
  });

  const eligibility = useQuery({
    queryKey: ["roommates", "eligibility", user?.id],
    queryFn: async () => {
      const prefs = await roommateService.getPreferences(user?.id);
      return getRoommateEligibility(prefs?.livingPreference ?? null);
    },
    enabled: Boolean(user?.id),
    retry: false,
  });

  const candidatesQuery = useQuery<MatchCandidate[]>({
    queryKey: ["roommates", "candidates", user?.id],
    queryFn: () => roommateService.getCandidates(user?.id),
    enabled: Boolean(user?.id) && eligibility.data?.status === "eligible",
    retry: false,
  });

  const requestsQuery = useQuery<MatchRequest[]>({
    queryKey: ["roommates", "requests", user?.id],
    queryFn: () => roommateService.getRequests(user?.id),
    enabled: Boolean(user?.id),
    retry: false,
  });

  const confirmedMatchesQuery = useQuery<ConfirmedMatch[]>({
    queryKey: ["roommates", "confirmed", user?.id],
    queryFn: () => roommateService.getConfirmedMatches(user?.id),
    enabled: Boolean(user?.id),
    retry: false,
  });

  const draft = useMemo<RoommatePreferences | null>(() => {
    if (!user?.id) return null;
    return preferenceQuery.data ?? createDefaultRoommatePreferences(user.id);
  }, [preferenceQuery.data, user?.id]);

  const [formValue, setFormValue] = useState<RoommatePreferences | null>(draft);

  const requestStates = useMemo<Record<string, MatchStatus>>(() => {
    const map: Record<string, MatchStatus> = {};

    for (const request of requestsQuery.data ?? []) {
      const otherUserId =
        request.requesterId === user?.id ? request.recipientId : request.requesterId;
      map[otherUserId] = request.status;
    }

    return map;
  }, [requestsQuery.data, user?.id]);

  const savePreferences = async () => {
    if (!formValue || !user?.id) return;
    try {
      setSaving(true);
      setError(null);
      const next = await roommateService.updatePreferences(formValue);
      queryClient.setQueryData([...PREFERENCE_QUERY_KEY, user.id], next);
      await queryClient.invalidateQueries({ queryKey: ["roommates", "preferences", user.id] });
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "We couldn't save your preferences.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleRequest = async (candidate: MatchCandidate) => {
    try {
      await roommateService.sendMatchRequest(candidate.studentId, user?.id ?? "");
      await queriesRefetch();
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "We couldn't send the request.";
      setError(message);
    }
  };

  const handleAccept = async (request: MatchRequest) => {
    await roommateService.acceptMatchRequest(request.id, user?.id ?? "");
    await queriesRefetch();
  };

  const handleDecline = async (request: MatchRequest) => {
    await roommateService.declineMatchRequest(request.id, user?.id ?? "");
    await queriesRefetch();
  };

  const queriesRefetch = async () => {
    await Promise.all([
      preferenceQuery.refetch(),
      candidatesQuery.refetch(),
      requestsQuery.refetch(),
      confirmedMatchesQuery.refetch(),
      eligibility.refetch(),
    ]);
  };

  if (!user) {
    return (
      <AppShell>
        <LoadingState label="Checking your account" />
      </AppShell>
    );
  }

  if (preferenceQuery.isPending || eligibility.isPending) {
    return (
      <AppShell>
        <LoadingState label="Loading roommate preferences" />
      </AppShell>
    );
  }

  if (preferenceQuery.isError || eligibility.isError) {
    return (
      <AppShell>
        <ErrorState
          title="We couldn't load your roommate profile"
          description="Please try again to refresh your settings."
          onRetry={() => void queriesRefetch()}
        />
      </AppShell>
    );
  }

  const liveAlone =
    (formValue ?? preferenceQuery.data ?? createDefaultRoommatePreferences(user.id))
      .livingPreference === "live-alone";
  const currentPreferences =
    formValue ?? preferenceQuery.data ?? createDefaultRoommatePreferences(user.id);

  return (
    <AppShell>
      <div className="space-y-6 px-4 py-6 sm:px-6">
        <header className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Roommates</p>
          <h1 className="text-3xl font-bold tracking-tight">Roommate matching</h1>
        </header>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {liveAlone ? (
                <UserX className="mt-0.5 size-5 text-muted-foreground" />
              ) : (
                <Heart className="mt-0.5 size-5 text-primary" />
              )}
              <div>
                <p className="font-semibold text-foreground">
                  {liveAlone ? "You are set to live alone" : "You are open to roommate matching"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {liveAlone
                    ? "Your profile will not be matched with roommates until you switch back to finding a roommate."
                    : "Camp Match will use your saved preferences to suggest compatible students."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <RoommatePreferencesForm
          value={currentPreferences}
          onChange={(next) => {
            setFormValue(next);
            setError(null);
          }}
          onSave={() => void savePreferences()}
          saving={saving}
          error={error}
        />

        <Card>
          <CardHeader>
            <CardTitle>Find your roommate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-5 text-sm text-muted-foreground">
              Discover students who match your roommate preferences.
            </p>
            {eligibility.data?.status === "eligible" ? (
              <RoommateDiscovery
                candidates={candidatesQuery.data ?? []}
                isLoading={candidatesQuery.isPending}
                isError={candidatesQuery.isError}
                onRetry={() => void candidatesQuery.refetch()}
                requestStates={requestStates}
                onRequest={handleRequest}
              />
            ) : (
              <EmptyState
                title={
                  eligibility.data?.status === "ineligible"
                    ? "Live-alone mode is active"
                    : "Profile not ready"
                }
                description="Complete your roommate profile and switch back to finding a roommate to unlock suggestions."
                icon={<Sparkles className="size-5" />}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <MatchRequestsPanel
              requests={requestsQuery.data ?? []}
              currentUserId={user.id}
              isLoading={requestsQuery.isPending}
              onAccept={handleAccept}
              onDecline={handleDecline}
              onCancel={async (request) => {
                await roommateService.cancelMatchRequest(request.id, user.id);
                await queriesRefetch();
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Confirmed roommates</CardTitle>
          </CardHeader>
          <CardContent>
            {confirmedMatchesQuery.isPending ? (
              <LoadingState label="Loading confirmed matches" />
            ) : confirmedMatchesQuery.isError ? (
              <ErrorState
                title="We couldn't load confirmed roommates"
                description="Try refreshing the roommate list to see your confirmed matches."
                onRetry={() => void confirmedMatchesQuery.refetch()}
              />
            ) : !confirmedMatchesQuery.data?.length ? (
              <EmptyState
                title="No confirmed roommates yet"
                description="Mutual matches will appear here once both students accept the request."
                icon={<Heart className="size-5" />}
              />
            ) : (
              <div className="space-y-3">
                {confirmedMatchesQuery.data.map((match) => {
                  const roommateId = match.participantIds.find((id) => id !== user.id) ?? "unknown";

                  return (
                    <Card key={match.id}>
                      <CardContent className="space-y-2 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold">Confirmed roommate</p>
                            <p className="text-sm text-muted-foreground">{roommateId}</p>
                          </div>
                          <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold uppercase text-emerald-900">
                            matched
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Matched on {new Date(match.matchedAt).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
