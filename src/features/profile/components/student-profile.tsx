import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { accommodationOptions } from "@/components/listings/accommodation-labels";
import { ErrorState, LoadingState } from "@/components/common/states";
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
import { useStudentBookings } from "@/features/bookings/hooks/use-bookings";
import { useUniversities } from "@/features/listings/hooks/use-listings";
import { ProfileSection } from "@/features/profile/components/profile-section";
import { useSavedListings } from "@/features/saved/hooks/use-saved-listings";
import { findUniversityById } from "@/data/mock/universities";
import { VerificationStatus } from "@/features/onboarding/components/verification-status";
import type { AuthUser, StudentProfile as StudentProfileData } from "@/types/auth";
import type { ProfileUpdateInput } from "@/types/profile";
import { TrustIndicator } from "@/features/verification/components/trust-indicator";

export function StudentProfile({
  user,
  saving,
  error,
  onSave,
}: {
  user: AuthUser;
  saving: boolean;
  error: string | null;
  onSave: (input: Extract<ProfileUpdateInput, { role: "student" }>) => Promise<void>;
}) {
  const profile = user.studentProfile;
  const { savedIds } = useSavedListings();
  const bookings = useStudentBookings(user.id);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(user.fullName);
  const [phone, setPhone] = useState(user.phone);
  const [draft, setDraft] = useState<StudentProfileData | null>(profile ?? null);
  const universities = useUniversities();
  const university = profile ? findUniversityById(profile.universityId) : undefined;

  const save = async () => {
    if (!draft) return;
    try {
      await onSave({ role: "student", fullName, phone, studentProfile: draft });
      setEditing(false);
    } catch {
      return;
    }
  };
  <TrustIndicator status={user.identityVerification} subject="identity" className="mb-3" />;

  return (
    <div className="space-y-5">
      <ProfileSection
        title="Student and academic details"
        action={
          profile ? (
            <Button variant="outline" size="sm" onClick={() => setEditing((value) => !value)}>
              {editing ? "Cancel edit" : "Edit profile"}
            </Button>
          ) : null
        }
      >
        {profile && draft ? (
          editing ? (
            <form
              className="grid gap-4 sm:grid-cols-2"
              onSubmit={(event) => {
                event.preventDefault();
                void save();
              }}
            >
              <Field label="Name">
                <Input
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  required
                />
              </Field>
              <Field label="Phone">
                <Input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  type="tel"
                />
              </Field>
              <Field label="University">
                <Select
                  value={draft.universityId}
                  onValueChange={(universityId) => setDraft({ ...draft, universityId })}
                >
                  <SelectTrigger aria-label="University">
                    <SelectValue placeholder="Select university" />
                  </SelectTrigger>
                  <SelectContent>
                    {(universities.data ?? []).map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Department">
                <Input
                  value={draft.department ?? ""}
                  onChange={(event) => setDraft({ ...draft, department: event.target.value })}
                  placeholder="Your department"
                />
              </Field>
              <Field label="Level">
                <Input
                  value={draft.academicLevel ?? ""}
                  onChange={(event) => setDraft({ ...draft, academicLevel: event.target.value })}
                  placeholder="Your current level"
                />
              </Field>
              <Field label="State">
                <Input value={findUniversityById(draft.universityId)?.state ?? ""} readOnly />
              </Field>
              <Field label="Preferred area">
                <Input
                  value={draft.preferredArea}
                  onChange={(event) => setDraft({ ...draft, preferredArea: event.target.value })}
                />
              </Field>
              <Field label="Living preference">
                <Select
                  value={draft.livingPreference}
                  onValueChange={(livingPreference) =>
                    setDraft({
                      ...draft,
                      livingPreference: livingPreference as StudentProfileData["livingPreference"],
                    })
                  }
                >
                  <SelectTrigger aria-label="Living preference">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="find-roommate">Find a roommate</SelectItem>
                    <SelectItem value="live-alone">Live alone</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Minimum budget">
                <Input
                  type="number"
                  min={1}
                  value={draft.budgetMin}
                  onChange={(event) =>
                    setDraft({ ...draft, budgetMin: Number(event.target.value) })
                  }
                  required
                />
              </Field>
              <Field label="Maximum budget">
                <Input
                  type="number"
                  min={1}
                  value={draft.budgetMax}
                  onChange={(event) =>
                    setDraft({ ...draft, budgetMax: Number(event.target.value) })
                  }
                  required
                />
              </Field>
              <div className="sm:col-span-2 space-y-2">
                <p className="text-sm font-medium">Accommodation preferences</p>
                <div className="flex flex-wrap gap-2">
                  {accommodationOptions.map((option) => {
                    const selected = draft.accommodationTypes.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={selected}
                        onClick={() =>
                          setDraft({
                            ...draft,
                            accommodationTypes: selected
                              ? draft.accommodationTypes.filter((value) => value !== option.value)
                              : [...draft.accommodationTypes, option.value],
                          })
                        }
                        className={
                          selected
                            ? "rounded-full border border-primary bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                            : "rounded-full border border-border px-3 py-1.5 text-xs font-medium"
                        }
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Detailed roommate lifestyle preferences can be changed in roommate discovery.
                </p>
              </div>
              <div className="sm:col-span-2 flex flex-wrap gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving…" : "Save profile"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFullName(user.fullName);
                    setPhone(user.phone);
                    setDraft(profile);
                    setEditing(false);
                  }}
                  disabled={saving}
                >
                  Cancel
                </Button>
                {error ? (
                  <p className="self-center text-sm text-destructive" role="alert">
                    {error}
                  </p>
                ) : null}
              </div>
            </form>
          ) : (
            <dl className="grid gap-4 sm:grid-cols-2">
              <Info label="Name" value={user.fullName} />
              <Info label="Phone" value={user.phone || "Not provided"} />
              <Info label="University" value={university?.name ?? "University not set"} />
              <Info label="State" value={university?.state ?? profile.state ?? "Not set"} />
              <Info label="Department" value={profile.department || "Not provided"} />
              <Info label="Level" value={profile.academicLevel || "Not provided"} />
            </dl>
          )
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Complete student onboarding to add your university and housing preferences.
            </p>
            <Button asChild>
              <Link to="/onboarding/student">Complete student setup</Link>
            </Button>
          </div>
        )}
      </ProfileSection>

      <ProfileSection
        title="Identity verification"
        action={
          <Button asChild variant="outline" size="sm">
            <Link to="/verification/$role" params={{ role: "student" }}>
              Verification details
            </Link>
          </Button>
        }
      >
        <VerificationStatus status={user.identityVerification} />
        <p className="mt-3 text-sm text-muted-foreground">
          Identity document details are private and are never shown in public listings or profiles.
        </p>
      </ProfileSection>

      <ProfileSection
        title="Roommate preferences"
        action={
          <Button asChild variant="outline" size="sm">
            <Link to="/roommates">Manage preferences</Link>
          </Button>
        }
      >
        {profile ? (
          <p className="text-sm text-muted-foreground">
            {profile.livingPreference === "find-roommate"
              ? "Open to finding a roommate"
              : "Prefers to live alone"}
            {profile.preferredArea ? ` · ${profile.preferredArea}` : ""}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">Preferences appear after student setup.</p>
        )}
      </ProfileSection>

      <ProfileSection
        title="Saved homes"
        action={
          <Button asChild variant="outline" size="sm">
            <Link to="/saved">View saved homes</Link>
          </Button>
        }
      >
        {savedIds.length ? (
          <p className="text-sm">
            {savedIds.length} saved {savedIds.length === 1 ? "home" : "homes"}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            No saved homes yet. Homes you save while browsing will appear here.
          </p>
        )}
      </ProfileSection>

      <ProfileSection
        title="Bookings"
        action={
          <Button asChild variant="outline" size="sm">
            <Link to="/bookings">View bookings</Link>
          </Button>
        }
      >
        {bookings.isPending ? (
          <LoadingState label="Loading your bookings" />
        ) : bookings.isError ? (
          <ErrorState title="We couldn't load your bookings" />
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
          <p className="text-sm text-muted-foreground">
            No bookings yet. Your property booking requests will appear here.
          </p>
        )}
      </ProfileSection>

      <AccountSection email={user.email} emailVerified={user.emailVerified} />
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

function AccountSection({ email, emailVerified }: { email: string; emailVerified: boolean }) {
  return (
    <ProfileSection title="Account settings">
      <dl className="grid gap-4 sm:grid-cols-2">
        <Info label="Email" value={email} />
        <Info label="Email status" value={emailVerified ? "Verified" : "Not verified"} />
      </dl>
    </ProfileSection>
  );
}
