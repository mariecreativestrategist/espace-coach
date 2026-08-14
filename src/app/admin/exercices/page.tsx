"use client";

import { useMemo, useState } from "react";
import { PageShell } from "@/components/shared/PageShell";
import { Modal } from "@/components/shared/Modal";
import { useToast } from "@/components/shared/ToastProvider";
import { exercisesSeed, type ExerciseItem, type ExerciseMedia } from "@/lib/mock/admin-data";

const muscleGroups = ["Jambes", "Dos", "Pectoraux", "Épaules", "Bras", "Core", "Cardio", "Full Body"];

export default function AdminExercicesPage() {
  const showToast = useToast();
  const [exercises, setExercises] = useState(exercisesSeed);
  const [nextId, setNextId] = useState(11);
  const [filter, setFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);

  const [name, setName] = useState("");
  const [group, setGroup] = useState(muscleGroups[0]!);
  const [description, setDescription] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);

  const groups = useMemo(() => [...new Set(exercises.map((e) => e.group))], [exercises]);
  const filtered = filter === "all" ? exercises : exercises.filter((e) => e.group === filter);

  function openModal() {
    setName("");
    setGroup(muscleGroups[0]!);
    setDescription("");
    setMediaFile(null);
    setModalOpen(true);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    let media: ExerciseMedia = null;
    if (mediaFile) {
      media = { type: mediaFile.type.startsWith("video") ? "video" : "image", name: mediaFile.name };
    }
    const item: ExerciseItem = { id: nextId, name: trimmed, group, description: description.trim(), media };
    setExercises((prev) => [...prev, item]);
    setNextId((n) => n + 1);
    setModalOpen(false);
    showToast("Exercice ajouté à la bibliothèque");
  }

  function deleteExercise(id: number) {
    setExercises((prev) => prev.filter((e) => e.id !== id));
    showToast("Exercice supprimé");
  }

  return (
    <PageShell title="Bibliothèque d'exercices" subtitle="Vos exercices réutilisables pour créer les séances" search="Rechercher un client, une facture…" avatarInitials="MG">
      <div className="toolbar">
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div className={`filter-pill${filter === "all" ? " active" : ""}`} onClick={() => setFilter("all")}>
            Tous ({exercises.length})
          </div>
          {groups.map((g) => (
            <div
              key={g}
              className={`filter-pill${filter === g ? " active" : ""}`}
              onClick={() => setFilter(g)}
            >
              {g} ({exercises.filter((e) => e.group === g).length})
            </div>
          ))}
        </div>
        <button className="btn btn-primary" type="button" style={{ marginLeft: "auto" }} onClick={openModal}>
          <svg className="icon" viewBox="0 0 24 24" style={{ width: 15, height: 15, stroke: "#07130d" }}>
            <path d="M12 5v14M5 12h14" />
          </svg>
          Ajouter un exercice
        </button>
      </div>

      <div className="exercise-grid">
        {filtered.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "50px 20px", color: "var(--text-muted)", fontSize: 13.5 }}>
            Aucun exercice dans cette catégorie.
          </div>
        )}
        {filtered.map((ex) => (
          <div className="exercise-card" key={ex.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>{ex.name}</div>
                <span className="badge badge-muted" style={{ marginTop: 8, display: "inline-block" }}>
                  {ex.group}
                </span>
              </div>
              <button className="icon-action danger" type="button" onClick={() => deleteExercise(ex.id)}>
                <svg className="icon" viewBox="0 0 24 24" style={{ width: 14, height: 14 }}>
                  <path d="M4 6h16M9 6V4h6v2M6 6l1 14h10l1-14" />
                </svg>
              </button>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 10, lineHeight: 1.5 }}>
              {ex.description || "Aucune consigne particulière."}
            </div>
            {ex.media ? (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ marginTop: 10 }}
                onClick={() => showToast(`Aperçu : ${ex.media!.name}`)}
              >
                <svg className="icon" viewBox="0 0 24 24" style={{ width: 13, height: 13 }}>
                  {ex.media.type === "video" ? (
                    <>
                      <path d="M4 4h13v16H4z" strokeLinejoin="round" />
                      <path d="M17 9l4-2v10l-4-2" />
                    </>
                  ) : (
                    <>
                      <rect x="3" y="4" width="18" height="16" rx="2" />
                      <circle cx="9" cy="10" r="1.5" />
                      <path d="M21 16l-5-5-4 4-3-3-5 5" />
                    </>
                  )}
                </svg>
                {ex.media.type === "video" ? "Voir la vidéo" : "Voir la photo"}
              </button>
            ) : (
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 10 }}>Aucun média</div>
            )}
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Ajouter un exercice">
        <form onSubmit={submit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Nom de l&apos;exercice</label>
              <input type="text" placeholder="Ex : Squat bulgare" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Groupe musculaire</label>
              <select value={group} onChange={(e) => setGroup(e.target.value)}>
                {muscleGroups.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Consignes</label>
              <textarea
                placeholder="Ex : Position, amplitude, points d'attention…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Photo ou vidéo de démonstration (optionnel)</label>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => setMediaFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary">
              Ajouter l&apos;exercice
            </button>
          </div>
        </form>
      </Modal>
    </PageShell>
  );
}
