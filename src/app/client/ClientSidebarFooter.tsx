"use client";

import { ChangePasswordButton } from "@/components/shared/ChangePasswordButton";
import { LogoutButton } from "@/components/shared/LogoutButton";
import { useCurrentClient } from "@/lib/hooks/useCurrentClient";
import { profile as demoProfile } from "@/lib/mock/client-data";
import { isSupabaseConfigured } from "@/lib/supabase/storage";

export function ClientSidebarFooter() {
  const { client } = useCurrentClient();

  const name = isSupabaseConfigured ? client?.name ?? "…" : demoProfile.name;
  const initials = isSupabaseConfigured ? client?.initials ?? "" : demoProfile.initials;
  const program = isSupabaseConfigured ? client?.program ?? "" : demoProfile.program;
  const coachName = isSupabaseConfigured ? client?.coachName ?? "…" : demoProfile.coachName;
  const coachInitials = isSupabaseConfigured ? client?.coachInitials ?? "" : demoProfile.coachInitials;

  return (
    <>
      <div className="coach-chip">
        <div className="avatar-ring">
          <div className="avatar-fallback">{initials}</div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="coach-chip-name">{name}</div>
          <div className="coach-chip-role">{program}</div>
        </div>
        <ChangePasswordButton />
        <LogoutButton />
      </div>
      <div className="coach-mini">
        <div className="avatar-sm">{coachInitials}</div>
        Coach : {coachName}
      </div>
    </>
  );
}
