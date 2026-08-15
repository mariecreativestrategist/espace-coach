import type { ReactNode } from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { ToastProvider } from "@/components/shared/ToastProvider";
import { LogoutButton } from "@/components/shared/LogoutButton";
import { adminNavSections } from "@/config/admin-nav";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <div className="app">
        <Sidebar
          brandSub="Espace Admin"
          sections={adminNavSections}
          footer={
            <div className="coach-chip">
              <div className="avatar-ring">
                <div className="avatar-fallback">MG</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="coach-chip-name">Mon compte</div>
                <div className="coach-chip-role">Coach</div>
              </div>
              <LogoutButton />
            </div>
          }
        />
        <div className="main">{children}</div>
      </div>
    </ToastProvider>
  );
}
