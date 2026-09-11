import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  CalendarRange,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useManagedProperty } from "@/features/properties/hooks/use-properties";
import { formatNaira } from "@/lib/format";
import { normalizeError } from "@/lib/api/errors";

export const Route = createFileRoute("/scout/properties/$propertyId")({
  component: ScoutPropertyDetailPage,
});

function ScoutPropertyDetailPage() {
  const { propertyId } = Route.useParams();
  const { data, isPending, isError, error, refetch } = useManagedProperty(propertyId);

  if (isPending) {
    return (
      <AppShell>
        <LoadingState label="Loading managed property" />
      </AppShell>
    );
  }

  if (isError || !data) {
    const appError = normalizeError(error ?? null);
    return (
      <AppShell>
        <div className="px-4 py-6 sm:px-6">
          {appError.code === "FORBIDDEN" ? (
            <ErrorState
              title="Access restricted"
              description="This property is not currently available to your House Scout account."
            />
          ) : appError.code === "NOT_FOUND" ? (
            <EmptyState
              title="Property not found"
              description="The property you’re looking for could not be found or is no longer managed by you."
            />
          ) : (
            <ErrorState title="We couldn't load this property" onRetry={() => void refetch()} />
          )}
        </div>
      </AppShell>
    );
  }

  const permissions = data.myRelationship.permissions;

  return (
    <AppShell>
      <div className="space-y-6 px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Managed property
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">{data.title}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {permissions.canEditProperty ? (
              <Button asChild variant="outline">
                <Link to="/scout/properties/$propertyId/edit" params={{ propertyId: data.id }}>
                  Edit property
                </Link>
              </Button>
            ) : null}
            {permissions.canUpdateAvailability ? (
              <Button asChild>
                <Link
                  to="/scout/properties/$propertyId/availability"
                  params={{ propertyId: data.id }}
                >
                  Update availability
                </Link>
              </Button>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge className="mt-2">{data.status}</Badge>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Owner</p>
              <p className="mt-2 font-semibold">{data.owner.name}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Your role</p>
              <p className="mt-2 inline-flex items-center gap-2 font-semibold">
                <ShieldCheck className="size-4" aria-hidden="true" />
                House Scout
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Price</p>
              <p className="mt-2 font-semibold">
                {formatNaira(data.pricing.rent)} / {data.pricing.period}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="overflow-x-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Property overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{data.description}</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-border p-4">
                    <p className="text-xs uppercase text-muted-foreground">Location</p>
                    <p className="mt-2 flex items-center gap-2">
                      <MapPin className="size-4" /> {data.location.area}, {data.location.city}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border p-4">
                    <p className="text-xs uppercase text-muted-foreground">Permissions</p>
                    <p className="mt-2 flex items-center gap-2">
                      <CheckCircle2 className="size-4" />{" "}
                      {permissions.canEditProperty ? "Can edit" : "No edit access"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="photos" className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {data.photos.map((photo) => (
                <Card key={photo.id} className="overflow-hidden">
                  <img src={photo.url} alt={photo.alt} className="h-40 w-full object-cover" />
                  <CardContent className="flex items-center justify-between p-3">
                    <span className="text-xs text-muted-foreground">{photo.reviewStatus}</span>
                    {photo.isPrimary ? <Badge variant="secondary">Primary</Badge> : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="availability" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Availability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">Status: {data.availability.status}</p>
                <p className="text-sm text-muted-foreground">
                  Available from: {data.availability.availableFrom}
                </p>
                <p className="text-sm text-muted-foreground">
                  Units available: {data.availability.unitsAvailable}
                </p>
                {permissions.canUpdateAvailability ? (
                  <Button asChild variant="outline">
                    <Link
                      to="/scout/properties/$propertyId/availability"
                      params={{ propertyId: data.id }}
                    >
                      Update availability
                    </Link>
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.activity.map((item) => (
                  <div key={item.id} className="flex gap-3 rounded-xl border border-border p-3">
                    <div className="mt-1 flex size-8 items-center justify-center rounded-full bg-primary-soft text-primary">
                      <Activity className="size-4" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      {item.description ? (
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      ) : null}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(item.occurredAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
