import type { ReactNode } from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { ToastProvider } from "@/components/shared/ToastProvider";
import { adminNavSections } from "@/config/admin-nav";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <div className="app">
        <Sidebar
          brandName="CoachOS"
          brandSub="Espace Admin"
          sections={adminNavSections}
          footer={
            <div className="coach-chip">
              <div className="avatar-ring">
                <div className="avatar-fallback">MG</div>
              </div>
              <div>
                <div className="coach-chip-name">Mon compte</div>
                <div className="coach-chip-role">Coach</div>
              </div>
            </div>
          }
        />
        <div className="main">{children}</div>
      </div>
    </ToastProvider>
  );
}
