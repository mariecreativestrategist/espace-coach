import type { ReactNode } from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { ToastProvider } from "@/components/shared/ToastProvider";
import { clientNavSections } from "@/config/client-nav";
import { profile } from "@/lib/mock/client-data";
import "@/styles/client.css";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <div className="app client-shell">
        <Sidebar
          brandName="CoachOS"
          brandSub="Espace Client"
          sections={clientNavSections}
          footer={
            <>
              <div className="coach-chip">
                <div className="avatar-ring">
                  <div className="avatar-fallback">{profile.initials}</div>
                </div>
                <div>
                  <div className="coach-chip-name">{profile.name}</div>
                  <div className="coach-chip-role">{profile.program}</div>
                </div>
              </div>
              <div className="coach-mini">
                <div className="avatar-sm">{profile.coachInitials}</div>
                Coach : {profile.coachName}
              </div>
            </>
          }
        />
        <div className="main">{children}</div>
      </div>
    </ToastProvider>
  );
}
