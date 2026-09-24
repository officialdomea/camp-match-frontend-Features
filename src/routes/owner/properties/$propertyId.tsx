import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  CalendarRange,
  Camera,
  CheckCircle2,
  FileText,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { SafeImage } from "@/components/common/safe-image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ErrorState, LoadingState } from "@/components/common/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProperty } from "@/features/properties/hooks/use-properties";
import { formatNaira } from "@/lib/format";

export const Route = createFileRoute("/owner/properties/$propertyId")({
  component: OwnerPropertyDetailPage,
});

function OwnerPropertyDetailPage() {
  const { propertyId } = Route.useParams();
  const { data, isPending, isError, refetch } = useProperty(propertyId);

  if (isPending)
    return (
      <AppShell>
        <LoadingState label="Loading property details" />
      </AppShell>
    );
  if (isError || !data)
    return (
      <AppShell>
        <div className="p-4 sm:p-6">
          <ErrorState title="We couldn't load this property" onRetry={() => void refetch()} />
        </div>
      </AppShell>
    );

  return (
    <AppShell>
      <div className="space-y-6 px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Property details
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">{data.title}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link to="/owner/properties/$propertyId/edit" params={{ propertyId: data.id }}>
                Edit property
              </Link>
            </Button>
            <Button asChild>
              <Link
                to="/owner/properties/$propertyId/availability"
                params={{ propertyId: data.id }}
              >
                Availability
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge className="mt-2">{data.status}</Badge>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Verification</p>
              <p className="mt-2 font-semibold">{data.verification.overall}</p>
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
            <TabsTrigger value="verification">Verification</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Property overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{data.description}</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-border p-4">
                    <p className="text-xs uppercase text-muted-foreground">Location</p>
                    <p className="mt-2 flex items-center gap-2">
                      <MapPin className="size-4" /> {data.location.area}, {data.location.city}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border p-4">
                    <p className="text-xs uppercase text-muted-foreground">Owner</p>
                    <p className="mt-2 flex items-center gap-2">
                      <Avatar className="size-7">
                        <AvatarImage
                          src={data.owner.profileImageUrl}
                          alt={`${data.owner.name} profile photo`}
                        />
                        <AvatarFallback>{data.owner.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <Users className="size-4" /> {data.owner.name}
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
                  <SafeImage
                    src={photo.url}
                    alt={photo.alt}
                    className="h-40 w-full object-cover"
                    fallbackLabel="Image unavailable"
                  />
                  <CardContent className="p-3 flex items-center justify-between">
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
                <Button asChild variant="outline">
                  <Link
                    to="/owner/properties/$propertyId/availability"
                    params={{ propertyId: data.id }}
                  >
                    Update availability
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verification" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Verification checklist</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.verification.steps.map((step) => (
                  <div
                    key={step.id}
                    className="flex items-center justify-between rounded-xl border border-border p-3"
                  >
                    <div>
                      <p className="font-medium">{step.label}</p>
                      {step.note ? (
                        <p className="text-sm text-muted-foreground">{step.note}</p>
                      ) : null}
                    </div>
                    <Badge variant={step.status === "verified" ? "default" : "secondary"}>
                      {step.status}
                    </Badge>
                  </div>
                ))}
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
                      <Activity className="size-4" />
                    </div>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      {item.description ? (
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      ) : null}
                      <p className="text-xs text-muted-foreground">
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
