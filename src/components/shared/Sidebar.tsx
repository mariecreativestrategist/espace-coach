"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  badgeCount?: number;
}

export interface NavSection {
  label?: string;
  items: NavItem[];
}

export function Sidebar({
  brandName,
  brandSub,
  sections,
  footer,
}: {
  brandName: string;
  brandSub: string;
  sections: NavSection[];
  footer: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <div className="brand-name">{brandName}</div>
          <div className="brand-sub">{brandSub}</div>
        </div>
      </div>

      {sections.map((section, i) => (
        <div key={section.label ?? i}>
          {section.label && <div className="nav-section-label">{section.label}</div>}
          <nav className="nav">
            {section.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item${active ? " active" : ""}`}
                >
                  {item.icon}
                  {item.label}
                  {typeof item.badgeCount === "number" && (
                    <span className="badge-count">{item.badgeCount}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      ))}

      <div className="sidebar-footer">{footer}</div>
    </aside>
  );
}
