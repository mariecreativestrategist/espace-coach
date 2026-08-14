"use client";

import { useState } from "react";
import { Modal } from "@/components/shared/Modal";
import { useToast } from "@/components/shared/ToastProvider";
import type { Client } from "@/lib/mock/admin-data";

export function ObjectifsTab({
  client,
  onUpdate,
  nextGoalId,
  onGoalIdUsed,
}: {
  client: Client;
  onUpdate: (updater: (c: Client) => Client) => void;
  nextGoalId: number;
  onGoalIdUsed: () => void;
}) {
  const showToast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [progress, setProgress] = useState("0");

  function openModal() {
    setTitle("");
    setProgress("0");
    setModalOpen(true);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    const id = nextGoalId;
    onUpdate((c) => ({ ...c, goals: [...c.goals, { id, title: trimmed, progress: parseInt(progress, 10) || 0 }] }));
    onGoalIdUsed();
    setModalOpen(false);
    showToast("Objectif ajouté");
  }

  function deleteGoal(goalId: number) {
    onUpdate((c) => ({ ...c, goals: c.goals.filter((g) => g.id !== goalId) }));
    showToast("Objectif supprimé");
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3>Objectifs</h3>
        <button className="btn btn-primary btn-sm" type="button" style={{ marginLeft: "auto" }} onClick={openModal}>
          + Ajouter un objectif
        </button>
      </div>
      <div className="card-body">
        {client.goals.length === 0 && (
          <div style={{ color: "var(--text-muted)", fontSize: 13, padding: "24px 0", textAlign: "center" }}>
            Aucun objectif défini pour le moment.
          </div>
        )}
        {client.goals.map((g) => (
          <div className="goal-card" key={g.id}>
            <div className="goal-card-top">
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>{g.title}</div>
              <button className="icon-action danger" type="button" onClick={() => deleteGoal(g.id)}>
                <svg className="icon" viewBox="0 0 24 24" style={{ width: 14, height: 14 }}>
                  <path d="M4 6h16M9 6V4h6v2M6 6l1 14h10l1-14" />
                </svg>
              </button>
            </div>
            <div className="progress-track" style={{ marginTop: 10 }}>
              <div className="progress-fill" style={{ width: `${g.progress}%` }} />
            </div>
            <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 6 }}>{g.progress}% atteint</div>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Ajouter un objectif" small>
        <form onSubmit={submit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Objectif</label>
              <input
                type="text"
                placeholder="Ex : Perdre 3kg de masse grasse"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Progression actuelle (%)</label>
              <input type="number" min={0} max={100} value={progress} onChange={(e) => setProgress(e.target.value)} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary">
              Ajouter l&apos;objectif
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
