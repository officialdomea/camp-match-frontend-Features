import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { ErrorState, LoadingState } from "@/components/common/states";
import { VerificationStatus } from "@/features/onboarding/components/verification-status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useScoutBookingActivity } from "@/features/bookings/hooks/use-bookings";
import { useManagedProperties } from "@/features/properties/hooks/use-properties";
import { ProfileSection } from "@/features/profile/components/profile-section";
import type { AuthUser } from "@/types/auth";
import type { ProfileUpdateInput } from "@/types/profile";
import { TrustIndicator } from "@/features/verification/components/trust-indicator";

const experienceOptions = ["new", "experienced", "veteran"] as const;

export function ScoutProfile({
  user,
  saving,
  error,
  onSave,
}: {
  user: AuthUser;
  saving: boolean;
  error: string | null;
  onSave: (input: Extract<ProfileUpdateInput, { role: "scout" }>) => Promise<void>;
}) {
  const profile = user.scoutProfile;
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [contactPhone, setContactPhone] = useState(profile?.contactPhone ?? user.phone);
  const [city, setCity] = useState(profile?.city ?? "");
  const [coverageAreas, setCoverageAreas] = useState(profile?.coverageAreas ?? "");
  const [experience, setExperience] = useState(profile?.experience ?? "new");
  const properties = useManagedProperties();
  const bookings = useScoutBookingActivity(user.id);
  const assignedProperties = (properties.data ?? []).filter((property) =>
    property.scouts.some(
      (assignment) => assignment.scoutId === user.id && assignment.status === "active",
    ),
  );
  const activity = assignedProperties
    .flatMap((property) =>
      property.activity.map((event) => ({ ...event, propertyTitle: property.title })),
    )
    .sort((left, right) => Date.parse(right.occurredAt) - Date.parse(left.occurredAt));

  const save = async () => {
    try {
      await onSave({
        role: "scout",
        scoutProfile: { displayName, contactPhone, city, coverageAreas, experience },
      });
      setEditing(false);
    } catch {
      return;
    }
  };

  return (
    <div className="space-y-5">
      <ProfileSection
        title="Scout contact and coverage"
        action={
          profile ? (
            <Button variant="outline" size="sm" onClick={() => setEditing((value) => !value)}>
              {editing ? "Cancel edit" : "Edit profile"}
            </Button>
          ) : null
        }
      >
        {profile ? (
          editing ? (
            <form
              className="grid gap-4 sm:grid-cols-2"
              onSubmit={(event) => {
                event.preventDefault();
                void save();
              }}
            >
              <Field label="Public display name">
                <Input
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  required
                />
              </Field>
              <Field label="Contact phone">
                <Input
                  value={contactPhone}
                  onChange={(event) => setContactPhone(event.target.value)}
                  type="tel"
                  required
                />
              </Field>
              <Field label="City">
                <Input value={city} onChange={(event) => setCity(event.target.value)} required />
              </Field>
              <Field label="Coverage areas">
                <Input
                  value={coverageAreas}
                  onChange={(event) => setCoverageAreas(event.target.value)}
                  placeholder="Separate areas with commas"
                  required
                />
              </Field>
              <Field label="Scouting experience">
                <Select value={experience} onValueChange={setExperience}>
                  <SelectTrigger aria-label="Scouting experience">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option === "new"
                          ? "New to scouting"
                          : option === "experienced"
                            ? "1–3 years"
                            : "3+ years"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <div className="sm:col-span-2 flex flex-wrap items-center gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving…" : "Save profile"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDisplayName(profile.displayName);
                    setContactPhone(profile.contactPhone);
                    setCity(profile.city);
                    setCoverageAreas(profile.coverageAreas);
                    setExperience(profile.experience);
                    setEditing(false);
                  }}
                  disabled={saving}
                >
                  Cancel
                </Button>
                {error ? (
                  <p className="text-sm text-destructive" role="alert">
                    {error}
                  </p>
                ) : null}
              </div>
            </form>
          ) : (
            <dl className="grid gap-4 sm:grid-cols-2">
              <Info label="Account holder" value={user.fullName} />
              <Info label="Public display name" value={profile.displayName || "Not provided"} />
              <Info label="Contact phone" value={profile.contactPhone || "Not provided"} />
              <Info label="City" value={profile.city || "Not provided"} />
              <Info label="Coverage areas" value={profile.coverageAreas || "Not provided"} />
              <Info label="Experience" value={profile.experience || "Not provided"} />
            </dl>
          )
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Complete Scout onboarding to add your coverage and experience.
            </p>
            <Button asChild>
              <Link to="/onboarding/scout">Complete Scout setup</Link>
            </Button>
          </div>
        )}
      </ProfileSection>

      <ProfileSection
        title="Scout verification"
        action={
          <Button asChild variant="outline" size="sm">
            <Link to="/verification/$role" params={{ role: "scout" }}>
              Verification details
            </Link>
          </Button>
        }
      >
        <TrustIndicator status={user.identityVerification} subject="identity" className="mb-3" />
        <VerificationStatus status={user.identityVerification} />
        <p className="mt-3 text-sm text-muted-foreground">
          Identity document details are private and are not displayed in this profile.
        </p>
      </ProfileSection>

      <ProfileSection
        title="Authorized properties"
        action={
          <Button asChild variant="outline" size="sm">
            <Link to="/scout/properties">Managed properties</Link>
          </Button>
        }
      >
        {properties.isPending ? (
          <LoadingState label="Loading assigned properties" />
        ) : properties.isError ? (
          <ErrorState
            title="We couldn't load assigned properties"
            onRetry={() => void properties.refetch()}
          />
        ) : assignedProperties.length ? (
          <div className="space-y-3">
            {assignedProperties.map((property) => (
              <div
                key={property.id}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="text-sm font-medium">{property.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {property.location.area}, {property.location.city}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <TrustIndicator
                      status={property.verification.overall}
                      subject="property"
                      className="rounded-full border-0 bg-muted px-2 py-1"
                    />
                    <span className="text-xs capitalize text-muted-foreground">
                      {property.verification.overall.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">
                  {property.status.replaceAll("_", " ")}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No assigned properties. Properties authorized for you will appear here.
          </p>
        )}
      </ProfileSection>

      <ProfileSection
        title="Scout activity"
        action={
          <Button asChild variant="outline" size="sm">
            <Link to="/scout/activity">View activity</Link>
          </Button>
        }
      >
        {properties.isPending ? (
          <LoadingState label="Loading scout activity" />
        ) : activity.length ? (
          <div className="space-y-3">
            {activity.slice(0, 5).map((event) => (
              <div
                key={`${event.id}-${event.propertyTitle}`}
                className="border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <p className="text-sm font-medium">{event.title}</p>
                <p className="text-xs text-muted-foreground">
                  {event.propertyTitle}
                  {event.description ? ` · ${event.description}` : ""}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No activity yet.</p>
        )}
      </ProfileSection>

      <ProfileSection
        title="Booking activity"
        action={
          <Button asChild variant="outline" size="sm">
            <Link to="/scout/bookings">View bookings</Link>
          </Button>
        }
      >
        {bookings.isPending ? (
          <LoadingState label="Loading booking activity" />
        ) : bookings.isError ? (
          <ErrorState title="We couldn't load booking activity" />
        ) : bookings.data?.length ? (
          <div className="space-y-3">
            {bookings.data.map((booking) => (
              <div
                key={booking.id}
                className="flex flex-wrap justify-between gap-2 border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <span className="text-sm font-medium">{booking.propertyTitle}</span>
                <span className="text-sm text-muted-foreground">{booking.status}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No booking activity yet.</p>
        )}
      </ProfileSection>

      <ProfileSection title="Communication and account settings">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">{user.email}</p>
            <p className="text-xs text-muted-foreground">
              {user.emailVerified ? "Email verified" : "Email not verified"}
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/messages">Open messages</Link>
          </Button>
        </div>
      </ProfileSection>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium">{value}</dd>
    </div>
  );
}
