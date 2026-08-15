"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/shared/PageShell";
import { useToast } from "@/components/shared/ToastProvider";
import { goalsSeed, photosSeed, measurementHistory, profile as demoProfile, calcWeightProgress, type ClientGoal, type ClientPhoto } from "@/lib/mock/client-data";
import { useCurrentClient } from "@/lib/hooks/useCurrentClient";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured, STORAGE_BUCKET } from "@/lib/supabase/storage";

const monthsFR = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

interface MeasureRow {
  date: string;
  values: Record<string, string>;
}

export default function ClientObjectifsPage() {
  const showToast = useToast();
  const { client, loading: clientLoading } = useCurrentClient();

  const [goals, setGoals] = useState<ClientGoal[]>(isSupabaseConfigured ? [] : goalsSeed);
  const [photos, setPhotos] = useState<ClientPhoto[]>(isSupabaseConfigured ? [] : photosSeed);
  const [measureRows, setMeasureRows] = useState<MeasureRow[]>([]);
  const [measureFields, setMeasureFields] = useState<{ key: string; label: string; unit: string }[]>([]);
  const [loadingData, setLoadingData] = useState(isSupabaseConfigured);
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured || !client) return;
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const [goalsRes, photosRes, measuresRes, fieldsRes] = await Promise.all([
        supabase.from("goals").select("*").eq("client_id", client.id).order("created_at"),
        supabase.from("client_photos").select("*").eq("client_id", client.id).order("date", { ascending: false }),
        supabase.from("measurements").select("*").eq("client_id", client.id).order("date", { ascending: false }),
        supabase.from("measurement_fields").select("*").eq("coach_id", client.coachId),
      ]);
      if (cancelled) return;

      setGoals((goalsRes.data ?? []).map((g) => ({ id: g.id, title: g.titre, progress: g.progression })));
      setPhotos((photosRes.data ?? []).map((p) => ({ id: p.id, name: p.nom_fichier, date: p.date })));

      const fieldsCatalog = (fieldsRes.data ?? []).map((f) => ({ key: f.cle, label: f.libelle, unit: f.unite }));
      const activeFields = fieldsCatalog.filter((f) => client.measurementFields.includes(f.key));
      setMeasureFields(activeFields);
      setMeasureRows(
        (measuresRes.data ?? []).map((m) => {
          const valeurs = m.valeurs as Record<string, string | number>;
          const values: Record<string, string> = {};
          for (const f of activeFields) {
            values[f.key] = valeurs[f.key] !== undefined ? `${valeurs[f.key]} ${f.unit}` : "—";
          }
          return { date: m.date, values };
        }),
      );
      setLoadingData(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [client]);

  const p = isSupabaseConfigured ? client?.physique ?? { height: null, startWeight: null, currentWeight: null, targetWeight: null } : demoProfile.physique;
  const progressPct = calcWeightProgress(p.startWeight ?? 0, p.currentWeight ?? 0, p.targetWeight ?? 0);
  const initials = isSupabaseConfigured ? client?.initials ?? "" : demoProfile.initials;
  const loading = clientLoading || loadingData;

  async function addPhotos() {
    if (!files || files.length === 0) {
      showToast("Sélectionne au moins une photo");
      return;
    }
    const today = new Date();
    const dateLabel = `${today.getDate()} ${monthsFR[today.getMonth()]}`;

    if (!isSupabaseConfigured) {
      const newPhotos = Array.from(files).map((f) => ({ id: crypto.randomUUID(), name: f.name, date: dateLabel }));
      setPhotos((prev) => [...prev, ...newPhotos]);
      setFiles(null);
      showToast("Photo(s) envoyée(s) à ton coach");
      return;
    }

    if (!client) return;
    setUploading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setUploading(false);
      return;
    }

    const newPhotos: ClientPhoto[] = [];
    for (const file of Array.from(files)) {
      const path = `client-photos/${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file);
      if (uploadError) continue;
      const { data: publicUrl } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
      const { data, error } = await supabase
        .from("client_photos")
        .insert({ client_id: client.id, nom_fichier: file.name, url: publicUrl.publicUrl, auteur: "client" })
        .select()
        .single();
      if (!error && data) newPhotos.push({ id: data.id, name: data.nom_fichier, date: dateLabel });
    }
    setUploading(false);

    if (newPhotos.length === 0) {
      showToast("Échec de l'envoi des photos.");
      return;
    }
    setPhotos((prev) => [...prev, ...newPhotos]);
    setFiles(null);
    showToast("Photo(s) envoyée(s) à ton coach");
  }

  return (
    <PageShell title="Objectifs & mensurations" subtitle="Suis ta progression dans le temps" avatarInitials={initials}>
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-header">
          <h3>Ma situation physique</h3>
        </div>
        <div className="card-body">
          <div className="macro-grid">
            <div className="macro-box">
              <div className="val">{p.height ?? "—"}</div>
              <label>Taille (cm)</label>
            </div>
            <div className="macro-box">
              <div className="val">{p.startWeight ?? "—"}</div>
              <label>Poids de départ (kg)</label>
            </div>
            <div className="macro-box">
              <div className="val">{p.currentWeight ?? "—"}</div>
              <label>Poids actuel (kg)</label>
            </div>
            <div className="macro-box">
              <div className="val">{p.targetWeight ?? "—"}</div>
              <label>Poids objectif (kg)</label>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "var(--text-muted)", marginBottom: 6 }}>
            <span>Progression vers l&apos;objectif</span>
            <span>{progressPct}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-header">
          <h3>Mes objectifs</h3>
        </div>
        <div className="card-body">
          {!loading && goals.length === 0 && (
            <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Aucun objectif défini pour le moment.</div>
          )}
          {goals.map((g) => (
            <div className="goal-card" key={g.id}>
              <div className="goal-card-top">
                <div style={{ fontWeight: 600, fontSize: 13.5 }}>{g.title}</div>
                <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{g.progress}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${g.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-header">
          <h3>Historique des mesures</h3>
        </div>
        <div className="card-body">
          <table className="measure-table">
            <thead>
              <tr>
                <th>Date</th>
                {isSupabaseConfigured
                  ? measureFields.map((f) => <th key={f.key}>{f.label}</th>)
                  : (
                    <>
                      <th>Poids</th>
                      <th>Tour de taille</th>
                      <th>Poitrine</th>
                      <th>Bras</th>
                      <th>Cuisse</th>
                    </>
                  )}
              </tr>
            </thead>
            <tbody>
              {isSupabaseConfigured
                ? measureRows.map((m) => (
                    <tr key={m.date}>
                      <td>{m.date}</td>
                      {measureFields.map((f) => (
                        <td key={f.key}>{m.values[f.key]}</td>
                      ))}
                    </tr>
                  ))
                : measurementHistory.map((m) => (
                    <tr key={m.date}>
                      <td>{m.date}</td>
                      <td>{m.weight}</td>
                      <td>{m.waist}</td>
                      <td>{m.chest}</td>
                      <td>{m.arm}</td>
                      <td>{m.thigh}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 12 }}>
            Ces mesures sont renseignées par ton coach lors de vos bilans.
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Mes photos de suivi</h3>
        </div>
        <div className="card-body">
          <div className="photo-grid">
            {photos.length === 0 && (
              <div style={{ color: "var(--text-muted)", fontSize: 12.5, padding: "6px 0 16px" }}>Aucune photo pour le moment.</div>
            )}
            {photos.map((p2) => (
              <div className="photo-chip" key={p2.id}>
                <svg className="icon" viewBox="0 0 24 24" style={{ width: 20, height: 20, margin: "4px auto 8px", display: "block", color: "var(--text-muted)" }}>
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <circle cx="9" cy="10" r="1.5" />
                  <path d="M21 16l-5-5-4 4-3-3-5 5" />
                </svg>
                <div style={{ fontSize: 10.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p2.name}</div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>{p2.date}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              type="file"
              accept="image/*"
              multiple
              style={{ flex: 1, minWidth: 200, background: "var(--bg-surface-2)", border: "1px solid var(--border-subtle)", borderRadius: 10, padding: "9px 12px", color: "var(--text-primary)", fontSize: 12.5 }}
              onChange={(e) => setFiles(e.target.files)}
            />
            <button className="btn btn-primary btn-sm" type="button" onClick={addPhotos} disabled={uploading}>
              {uploading ? "Envoi…" : "Ajouter une photo"}
            </button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
