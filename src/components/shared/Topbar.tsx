import type { ReactNode } from "react";

export function Topbar({
  title,
  subtitle,
  search,
  avatarInitials,
  actions,
}: {
  title: string;
  subtitle?: string;
  search?: string;
  avatarInitials?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="topbar">
      <div>
        <div className="page-title">{title}</div>
        {subtitle && <div className="page-sub">{subtitle}</div>}
      </div>
      {search !== undefined && (
        <div className="search-bar">
          <svg className="icon" viewBox="0 0 24 24" style={{ width: 15, height: 15 }}>
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input placeholder={search} />
        </div>
      )}
      {actions}
      {avatarInitials && (
        <>
          <button className="icon-btn" type="button" style={search === undefined ? { marginLeft: "auto" } : undefined}>
            <span className="dot-badge" />
            <svg className="icon" viewBox="0 0 24 24">
              <path d="M6 8a6 6 0 1112 0c0 5 2 6 2 6H4s2-1 2-6z" />
              <path d="M9.5 20a2.5 2.5 0 005 0" />
            </svg>
          </button>
          <div className="avatar-ring" style={{ width: 38, height: 38 }}>
            <div className="avatar-fallback">{avatarInitials}</div>
          </div>
        </>
      )}
    </div>
  );
}
