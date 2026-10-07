import type { ReactNode } from "react";
import { ProfilePhoto } from "@/components/common/profile-photo";
import type { AuthUser } from "@/types/auth";

export function ProfileShell({
  user,
  displayName,
  roleLabel,
  onUserChange,
  children,
}: {
  user: AuthUser;
  displayName: string;
  roleLabel: string;
  onUserChange: (user: AuthUser) => void;
  children: ReactNode;
}) {
  return (
    <div className="space-y-6 px-4 py-6 sm:px-6">
      <header>
        <h1 className="mb-4 text-2xl font-bold tracking-tight sm:text-3xl">{roleLabel} profile</h1>
        <div className="flex items-center gap-4">
          <ProfilePhoto user={user} editable onUserChange={onUserChange} />
          <div>
            <p className="text-base font-semibold">{displayName}</p>
            <p className="text-sm text-muted-foreground">{roleLabel}</p>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
