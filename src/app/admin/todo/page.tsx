"use client";

import { useState } from "react";
import { PageShell } from "@/components/shared/PageShell";
import { Modal } from "@/components/shared/Modal";
import { useToast } from "@/components/shared/ToastProvider";
import { tasksSeed, formatDateShort, type TaskPriority } from "@/lib/mock/admin-data";

type Filter = "all" | "pending" | "done";

export default function AdminTodoPage() {
  const showToast = useToast();
  const [tasks, setTasks] = useState(tasksSeed);
  const [nextId, setNextId] = useState(7);
  const [filter, setFilter] = useState<Filter>("all");
  const [modalOpen, setModalOpen] = useState(false);

  const [text, setText] = useState("");
  const [due, setDue] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("normal");

  const pending = tasks.filter((t) => !t.done).length;
  const urgent = tasks.filter((t) => t.priority === "urgent" && !t.done).length;
  const done = tasks.filter((t) => t.done).length;

  const filtered = filter === "pending" ? tasks.filter((t) => !t.done) : filter === "done" ? tasks.filter((t) => t.done) : tasks;

  function toggleTask(id: number) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function deleteTask(id: number) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    showToast("Tâche supprimée");
  }

  function openModal() {
    setText("");
    setDue("");
    setPriority("normal");
    setModalOpen(true);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    setTasks((prev) => [...prev, { id: nextId, text: trimmed, done: false, priority, due: formatDateShort(due) }]);
    setNextId((n) => n + 1);
    setModalOpen(false);
    showToast("Tâche ajoutée");
  }

  return (
    <PageShell title="To-do list" subtitle="Vos tâches et rappels à ne pas oublier" search="Rechercher un client, une facture…" avatarInitials="MG">
      <div className="row-3" style={{ marginBottom: 20 }}>
        <div className="kpi-card">
          <div className="kpi-label">Tâches restantes</div>
          <div className="kpi-value">{pending}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Urgentes</div>
          <div className="kpi-value" style={{ color: "var(--danger)" }}>{urgent}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Terminées</div>
          <div className="kpi-value" style={{ color: "var(--accent-green)" }}>{done}</div>
        </div>
      </div>

      <div className="toolbar">
        <div className={`filter-pill${filter === "all" ? " active" : ""}`} onClick={() => setFilter("all")}>
          Toutes ({tasks.length})
        </div>
        <div className={`filter-pill${filter === "pending" ? " active" : ""}`} onClick={() => setFilter("pending")}>
          À faire ({tasks.length - done})
        </div>
        <div className={`filter-pill${filter === "done" ? " active" : ""}`} onClick={() => setFilter("done")}>
          Terminées ({done})
        </div>
        <button className="btn btn-primary" type="button" style={{ marginLeft: "auto" }} onClick={openModal}>
          <svg className="icon" viewBox="0 0 24 24" style={{ width: 15, height: 15, stroke: "#07130d" }}>
            <path d="M12 5v14M5 12h14" />
          </svg>
          Nouvelle tâche
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          {filtered.length === 0 && (
            <div style={{ color: "var(--text-muted)", fontSize: 13, padding: "30px 0", textAlign: "center" }}>
              Aucune tâche dans cette catégorie.
            </div>
          )}
          {filtered.map((t) => (
            <div className="list-item" key={t.id}>
              <div className={`task-check${t.done ? " done" : ""}`} style={{ cursor: "pointer" }} onClick={() => toggleTask(t.id)}>
                {t.done && (
                  <svg viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div>
                <div className={`task-text${t.done ? " done" : ""}`} style={{ fontSize: 13.5 }}>{t.text}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Échéance : {t.due}</div>
              </div>
              <div className="list-right" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {t.priority === "urgent" && !t.done && <span className="badge badge-danger">Urgent</span>}
                <button className="icon-action danger" type="button" onClick={() => deleteTask(t.id)}>
                  <svg className="icon" viewBox="0 0 24 24" style={{ width: 14, height: 14 }}>
                    <path d="M4 6h16M9 6V4h6v2M6 6l1 14h10l1-14" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nouvelle tâche" small>
        <form onSubmit={submit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Tâche</label>
              <input
                type="text"
                placeholder="Ex : Relancer Marc pour le paiement"
                required
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Échéance</label>
                <input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Priorité</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
                  <option value="normal">Normale</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary">
              Ajouter la tâche
            </button>
          </div>
        </form>
      </Modal>
    </PageShell>
  );
}
