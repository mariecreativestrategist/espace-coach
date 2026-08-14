"use client";

import { useState } from "react";
import { PageShell } from "@/components/shared/PageShell";
import { useToast } from "@/components/shared/ToastProvider";
import { goalsSeed, photosSeed, measurementHistory, profile, calcWeightProgress } from "@/lib/mock/client-data";

const monthsFR = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

export default function ClientObjectifsPage() {
  const showToast = useToast();
  const p = profile.physique;
  const progressPct = calcWeightProgress(p.startWeight, p.currentWeight, p.targetWeight);
  const [photos, setPhotos] = useState(photosSeed);
  const [photoIdCounter, setPhotoIdCounter] = useState(2);
  const [files, setFiles] = useState<FileList | null>(null);

  function addPhotos() {
    if (!files || files.length === 0) {
      showToast("Sélectionne au moins une photo");
      return;
    }
    const today = new Date();
    const dateLabel = `${today.getDate()} ${monthsFR[today.getMonth()]}`;
    let id = photoIdCounter;
    const newPhotos = Array.from(files).map((f) => ({ id: ++id, name: f.name, date: dateLabel }));
    setPhotos((prev) => [...prev, ...newPhotos]);
    setPhotoIdCounter(id);
    setFiles(null);
    showToast("Photo(s) envoyée(s) à ton coach");
  }

  return (
    <PageShell title="Objectifs & mensurations" subtitle="Suis ta progression dans le temps" avatarInitials={profile.initials}>
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-header">
          <h3>Ma situation physique</h3>
        </div>
        <div className="card-body">
          <div className="macro-grid">
            <div className="macro-box">
              <div className="val">{p.height}</div>
              <label>Taille (cm)</label>
            </div>
            <div className="macro-box">
              <div className="val">{p.startWeight}</div>
              <label>Poids de départ (kg)</label>
            </div>
            <div className="macro-box">
              <div className="val">{p.currentWeight}</div>
              <label>Poids actuel (kg)</label>
            </div>
            <div className="macro-box">
              <div className="val">{p.targetWeight}</div>
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
          {goalsSeed.map((g) => (
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
                <th>Poids</th>
                <th>Tour de taille</th>
                <th>Poitrine</th>
                <th>Bras</th>
                <th>Cuisse</th>
              </tr>
            </thead>
            <tbody>
              {measurementHistory.map((m) => (
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
            <button className="btn btn-primary btn-sm" type="button" onClick={addPhotos}>
              Ajouter une photo
            </button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
