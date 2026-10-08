import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { ErrorState, LoadingState } from "@/components/common/states";
import { VerificationStatus } from "@/features/onboarding/components/verification-status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOwnerBookingRequests } from "@/features/bookings/hooks/use-bookings";
import { canCreateProperty } from "@/features/properties/domain/property-creation-access";
import { useOwnerProperties } from "@/features/properties/hooks/use-properties";
import { ProfileSection } from "@/features/profile/components/profile-section";
import type { AuthUser } from "@/types/auth";
import type { ProfileUpdateInput } from "@/types/profile";
import { TrustIndicator } from "@/features/verification/components/trust-indicator";

export function OwnerProfile({
  user,
  saving,
  error,
  onSave,
}: {
  user: AuthUser;
  saving: boolean;
  error: string | null;
  onSave: (input: Extract<ProfileUpdateInput, { role: "owner" }>) => Promise<void>;
}) {
  const profile = user.ownerProfile;
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [contactPhone, setContactPhone] = useState(profile?.contactPhone ?? user.phone);
  const [city, setCity] = useState(profile?.city ?? "");
  const properties = useOwnerProperties();
  const bookings = useOwnerBookingRequests(user.id);
  const ownedProperties = (properties.data ?? []).filter(
    (property) => property.owner.id === user.id,
  );
  const ownerBookings = bookings.data ?? [];

  const save = async () => {
    try {
      await onSave({ role: "owner", ownerProfile: { displayName, contactPhone, city } });
      setEditing(false);
    } catch {
      return;
    }
  };

  return (
    <div className="space-y-5">
      <ProfileSection
        title="Owner contact profile"
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
            </dl>
          )
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Complete Owner onboarding to manage your professional contact information.
            </p>
            <Button asChild>
              <Link to="/onboarding/owner">Complete Owner setup</Link>
            </Button>
          </div>
        )}
      </ProfileSection>

      <ProfileSection
        title="Identity verification"
        action={
          <Button asChild variant="outline" size="sm">
            <Link to="/verification/$role" params={{ role: "owner" }}>
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
        title="Properties owned"
        action={
          canCreateProperty(user.identityVerification) ? (
            <Button asChild size="sm">
              <Link to="/owner/properties/new">Add property</Link>
            </Button>
          ) : null
        }
      >
        {properties.isPending ? (
          <LoadingState label="Loading your properties" />
        ) : properties.isError ? (
          <ErrorState
            title="We couldn't load your properties"
            onRetry={() => void properties.refetch()}
          />
        ) : ownedProperties.length ? (
          <div className="space-y-3">
            {ownedProperties.map((property) => (
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
                <Button asChild variant="outline" size="sm">
                  <Link to="/owner/properties/$propertyId" params={{ propertyId: property.id }}>
                    Manage
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {canCreateProperty(user.identityVerification)
                ? "No properties yet. Add your first property to start managing listings."
                : "No properties yet. Your properties will appear here after verification is approved."}
            </p>
            {canCreateProperty(user.identityVerification) ? (
              <Button asChild>
                <Link to="/owner/properties/new">Add property</Link>
              </Button>
            ) : null}
          </div>
        )}
      </ProfileSection>

      <ProfileSection
        title="Booking activity"
        action={
          <Button asChild variant="outline" size="sm">
            <Link to="/owner/bookings">View bookings</Link>
          </Button>
        }
      >
        {bookings.isPending ? (
          <LoadingState label="Loading booking activity" />
        ) : bookings.isError ? (
          <ErrorState title="We couldn't load booking activity" />
        ) : ownerBookings.length ? (
          <div className="space-y-3">
            {ownerBookings.map((booking) => (
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

      <ProfileSection title="Account settings">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Info label="Email" value={user.email} />
          <Info label="Email status" value={user.emailVerified ? "Verified" : "Not verified"} />
          <Info label="Payment settings" value="Not available yet" />
        </dl>
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
