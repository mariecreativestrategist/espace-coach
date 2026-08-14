"use client";

import { useState } from "react";
import { useToast } from "@/components/shared/ToastProvider";
import { calcBMI, calcWeightProgress, type Client } from "@/lib/mock/admin-data";

export function ApercuTab({
  client,
  onUpdate,
}: {
  client: Client;
  onUpdate: (updater: (c: Client) => Client) => void;
}) {
  const showToast = useToast();
  const p = client.physique;
  const [height, setHeight] = useState(p.height?.toString() ?? "");
  const [startWeight, setStartWeight] = useState(p.startWeight?.toString() ?? "");
  const [currentWeight, setCurrentWeight] = useState(p.currentWeight?.toString() ?? "");
  const [targetWeight, setTargetWeight] = useState(p.targetWeight?.toString() ?? "");
  const [notes, setNotes] = useState(client.notes ?? "");

  const currentBMI = calcBMI(parseFloat(currentWeight) || null, parseFloat(height) || null);
  const targetBMI = calcBMI(parseFloat(targetWeight) || null, parseFloat(height) || null);
  const progressPct = calcWeightProgress(parseFloat(startWeight) || null, parseFloat(currentWeight) || null, parseFloat(targetWeight) || null);

  function savePhysique() {
    onUpdate((c) => ({
      ...c,
      physique: {
        height: parseFloat(height) || null,
        startWeight: parseFloat(startWeight) || null,
        currentWeight: parseFloat(currentWeight) || null,
        targetWeight: parseFloat(targetWeight) || null,
      },
    }));
    showToast("Suivi physique mis à jour");
  }

  function saveNotes() {
    onUpdate((c) => ({ ...c, notes }));
    showToast("Notes mises à jour");
  }

  return (
    <>
      <div className="row-3" style={{ marginBottom: 18 }}>
        <div className="kpi-card">
          <div className="kpi-label">Progression globale</div>
          <div className="kpi-value">{client.progress}%</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Séances réalisées</div>
          <div className="kpi-value">{client.sessions}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Dernière séance</div>
          <div className="kpi-value" style={{ fontSize: 17 }}>{client.lastSession}</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-header">
          <h3>Situation physique &amp; objectif</h3>
        </div>
        <div className="card-body">
          <div className="macro-grid">
            <div className="macro-box">
              <input type="number" value={height} placeholder="—" onChange={(e) => setHeight(e.target.value)} />
              <label>Taille (cm)</label>
            </div>
            <div className="macro-box">
              <input type="number" value={startWeight} placeholder="—" onChange={(e) => setStartWeight(e.target.value)} />
              <label>Poids de départ (kg)</label>
            </div>
            <div className="macro-box">
              <input type="number" value={currentWeight} placeholder="—" onChange={(e) => setCurrentWeight(e.target.value)} />
              <label>Poids actuel (kg)</label>
            </div>
            <div className="macro-box">
              <input type="number" value={targetWeight} placeholder="—" onChange={(e) => setTargetWeight(e.target.value)} />
              <label>Poids objectif (kg)</label>
            </div>
          </div>
          <div className="row-3" style={{ marginBottom: 14 }}>
            <div className="kpi-card">
              <div className="kpi-label">IMC actuel</div>
              <div className="kpi-value" style={{ fontSize: 20 }}>{currentBMI ? currentBMI.toFixed(1) : "—"}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">IMC objectif</div>
              <div className="kpi-value" style={{ fontSize: 20 }}>{targetBMI ? targetBMI.toFixed(1) : "—"}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Progression vers l&apos;objectif</div>
              <div className="kpi-value" style={{ fontSize: 20 }}>{progressPct}%</div>
            </div>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <button className="btn btn-primary btn-sm" type="button" onClick={savePhysique}>
              Enregistrer
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Notes internes</h3>
        </div>
        <div className="card-body">
          <textarea className="detail-notes-box" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
            <button className="btn btn-primary btn-sm" type="button" onClick={saveNotes}>
              Enregistrer les notes
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
