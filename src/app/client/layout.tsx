import type { ReactNode } from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { ToastProvider } from "@/components/shared/ToastProvider";
import { clientNavSections } from "@/config/client-nav";
import { ClientSidebarFooter } from "./ClientSidebarFooter";
import "@/styles/client.css";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <div className="app client-shell">
        <Sidebar
          brandName="CoachOS"
          brandSub="Espace Client"
          sections={clientNavSections}
          footer={<ClientSidebarFooter />}
        />
        <div className="main">{children}</div>
      </div>
    </ToastProvider>
  );
}
