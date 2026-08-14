"use client";

import { useState } from "react";
import { Modal } from "@/components/shared/Modal";
import { useToast } from "@/components/shared/ToastProvider";
import type { Client, HealthQuestionType } from "@/lib/mock/admin-data";

export function SanteTab({
  client,
  onUpdate,
  nextQuestionId,
  onQuestionIdUsed,
}: {
  client: Client;
  onUpdate: (updater: (c: Client) => Client) => void;
  nextQuestionId: number;
  onQuestionIdUsed: () => void;
}) {
  const showToast = useToast();
  const [values, setValues] = useState<Record<number, string>>(
    Object.fromEntries(client.healthQuestions.map((q) => [q.id, q.value])),
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [type, setType] = useState<HealthQuestionType>("text");

  function setValue(id: number, value: string) {
    setValues((prev) => ({ ...prev, [id]: value }));
  }

  function saveHealth() {
    onUpdate((c) => ({ ...c, healthQuestions: c.healthQuestions.map((q) => ({ ...q, value: values[q.id] ?? q.value })) }));
    showToast("Questionnaire enregistré");
  }

  function openModal() {
    setLabel("");
    setType("text");
    setModalOpen(true);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = label.trim();
    if (!trimmed) return;
    const id = nextQuestionId;
    const options = type === "select" ? ["Oui", "Non", "Non renseigné"] : undefined;
    const value = type === "select" ? "Non renseigné" : "";
    onUpdate((c) => ({ ...c, healthQuestions: [...c.healthQuestions, { id, label: trimmed, type, options, value }] }));
    onQuestionIdUsed();
    setValues((prev) => ({ ...prev, [id]: value }));
    setModalOpen(false);
    showToast("Question ajoutée au questionnaire");
  }

  function deleteQuestion(id: number) {
    onUpdate((c) => ({ ...c, healthQuestions: c.healthQuestions.filter((q) => q.id !== id) }));
    showToast("Question supprimée");
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3>Questionnaire santé (PAR-Q)</h3>
        <button className="btn btn-ghost btn-sm" type="button" style={{ marginLeft: "auto" }} onClick={openModal}>
          + Ajouter une question
        </button>
      </div>
      <div className="card-body">
        <div className="form-grid">
          {client.healthQuestions.length === 0 && (
            <div style={{ color: "var(--text-muted)", fontSize: 13, padding: "16px 0" }}>Aucune question définie pour le moment.</div>
          )}
          {client.healthQuestions.map((q) => (
            <div className="form-group full" key={q.id}>
              <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{q.label}</span>
                <button type="button" className="icon-action danger" style={{ width: 24, height: 24 }} onClick={() => deleteQuestion(q.id)}>
                  <svg className="icon" viewBox="0 0 24 24" style={{ width: 12, height: 12 }}>
                    <path d="M4 6h16M9 6V4h6v2M6 6l1 14h10l1-14" />
                  </svg>
                </button>
              </label>
              {q.type === "select" ? (
                <select value={values[q.id] ?? ""} onChange={(e) => setValue(q.id, e.target.value)}>
                  {(q.options ?? []).map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              ) : q.type === "textarea" ? (
                <textarea value={values[q.id] ?? ""} onChange={(e) => setValue(q.id, e.target.value)} />
              ) : (
                <input type="text" value={values[q.id] ?? ""} onChange={(e) => setValue(q.id, e.target.value)} />
              )}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
          <button className="btn btn-primary btn-sm" type="button" onClick={saveHealth}>
            Enregistrer le questionnaire
          </button>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Ajouter une question" small>
        <form onSubmit={submit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Intitulé de la question</label>
              <input
                type="text"
                placeholder="Ex : Pratique une activité à risque ?"
                required
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Type de réponse</label>
              <select value={type} onChange={(e) => setType(e.target.value as HealthQuestionType)}>
                <option value="text">Texte court</option>
                <option value="textarea">Texte long</option>
                <option value="select">Choix (Oui / Non / Non renseigné)</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary">
              Ajouter la question
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
