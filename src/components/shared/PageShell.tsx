import type { ReactNode } from "react";
import { Topbar } from "@/components/shared/Topbar";

export function PageShell({
  title,
  subtitle,
  search,
  avatarInitials,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  search?: string;
  avatarInitials?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <Topbar title={title} subtitle={subtitle} search={search} avatarInitials={avatarInitials} actions={actions} />
      <div className="content">
        <div className="panel">{children}</div>
      </div>
    </>
  );
}
