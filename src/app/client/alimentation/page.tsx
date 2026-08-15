"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/shared/PageShell";
import { useToast } from "@/components/shared/ToastProvider";
import { nutritionFile as demoNutritionFile, profile as demoProfile } from "@/lib/mock/client-data";
import { useCurrentClient } from "@/lib/hooks/useCurrentClient";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/storage";

export default function ClientAlimentationPage() {
  const showToast = useToast();
  const { client, loading: clientLoading } = useCurrentClient();
  const [file, setFile] = useState<{ name: string; updatedLabel: string; url: string } | null>(null);
  const [loadingData, setLoadingData] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured || !client) return;
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from("nutrition_files").select("*").eq("client_id", client.id).maybeSingle();
      if (cancelled) return;
      if (data) {
        const d = new Date(data.date_maj);
        setFile({ name: data.nom_fichier, url: data.url, updatedLabel: `Mis à jour le ${d.toLocaleDateString("fr-FR")}` });
      }
      setLoadingData(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [client]);

  const initials = isSupabaseConfigured ? client?.initials ?? "" : demoProfile.initials;
  const loading = clientLoading || loadingData;
  const displayFile = isSupabaseConfigured ? file : demoNutritionFile;

  return (
    <PageShell title="Plan alimentaire" subtitle="Le plan mis en place par ton coach" avatarInitials={initials}>
      <div className="card">
        <div className="card-header">
          <h3>Plan alimentaire</h3>
        </div>
        <div className="card-body">
          {loading && <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Chargement…</div>}
          {!loading && displayFile && (
            <div style={{ display: "flex", alignItems: "center", gap: 14, background: "var(--bg-surface-2)", border: "1px solid var(--border-subtle)", borderRadius: 12, padding: "16px 18px", flexWrap: "wrap" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--grad-soft)", border: "1px solid rgba(61,220,132,.25)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-green)", flexShrink: 0 }}>
                <svg className="icon" viewBox="0 0 24 24" style={{ width: 18, height: 18 }}>
                  <path d="M6 2h9l3 3v17H6z" strokeLinejoin="round" />
                  <path d="M9.5 12h5M9.5 15.5h5M9.5 8.5h2" />
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>{displayFile.name}</div>
                <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>{displayFile.updatedLabel}</div>
              </div>
              {isSupabaseConfigured && file ? (
                <a className="btn btn-primary btn-sm" href={file.url} target="_blank" rel="noreferrer">
                  Télécharger
                </a>
              ) : (
                <button className="btn btn-primary btn-sm" type="button" onClick={() => showToast("Téléchargement du plan alimentaire…")}>
                  Télécharger
                </button>
              )}
            </div>
          )}
          {!loading && !displayFile && (
            <div style={{ textAlign: "center", padding: "36px 20px", color: "var(--text-muted)" }}>
              <div style={{ fontSize: 13 }}>Aucun plan alimentaire déposé par ton coach pour le moment.</div>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
