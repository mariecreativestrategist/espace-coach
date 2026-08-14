"use client";

import { PageShell } from "@/components/shared/PageShell";
import { useToast } from "@/components/shared/ToastProvider";
import { nutritionFile, profile } from "@/lib/mock/client-data";

export default function ClientAlimentationPage() {
  const showToast = useToast();

  return (
    <PageShell title="Plan alimentaire" subtitle="Le plan mis en place par ton coach" avatarInitials={profile.initials}>
      <div className="card">
        <div className="card-header">
          <h3>Plan alimentaire</h3>
        </div>
        <div className="card-body">
          <div style={{ display: "flex", alignItems: "center", gap: 14, background: "var(--bg-surface-2)", border: "1px solid var(--border-subtle)", borderRadius: 12, padding: "16px 18px", flexWrap: "wrap" }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--grad-soft)", border: "1px solid rgba(61,220,132,.25)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-green)", flexShrink: 0 }}>
              <svg className="icon" viewBox="0 0 24 24" style={{ width: 18, height: 18 }}>
                <path d="M6 2h9l3 3v17H6z" strokeLinejoin="round" />
                <path d="M9.5 12h5M9.5 15.5h5M9.5 8.5h2" />
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>{nutritionFile.name}</div>
              <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>{nutritionFile.updatedLabel}</div>
            </div>
            <button className="btn btn-primary btn-sm" type="button" onClick={() => showToast("Téléchargement du plan alimentaire…")}>
              Télécharger
            </button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
