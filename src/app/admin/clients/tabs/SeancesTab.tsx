"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/shared/Modal";
import { useToast } from "@/components/shared/ToastProvider";
import { exercisesSeed, type Client, type WorkoutExercise } from "@/lib/mock/admin-data";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/storage";

const dayOptions = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

interface WorkoutRow {
  rowId: number;
  exerciseValue: string;
  other: string;
  sets: string;
}

export function SeancesTab({
  client,
  onUpdate,
}: {
  client: Client;
  onUpdate: (updater: (c: Client) => Client) => void;
}) {
  const showToast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [day, setDay] = useState(dayOptions[0]!);
  const [week, setWeek] = useState("Semaine 1");
  const [comment, setComment] = useState("");
  const [rows, setRows] = useState<WorkoutRow[]>([]);
  const [rowCounter, setRowCounter] = useState(0);
  const [saving, setSaving] = useState(false);

  const [libraryExercises, setLibraryExercises] = useState<{ id: string; name: string }[]>(
    isSupabaseConfigured ? [] : exercisesSeed.map((e) => ({ id: e.name, name: e.name })),
  );

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("exercises").select("id, nom").eq("coach_id", user.id).order("nom");
      if (data) setLibraryExercises(data.map((e) => ({ id: e.id, name: e.nom })));
    })();
  }, []);

  function openModal() {
    setName("");
    setDay(dayOptions[0]!);
    setWeek("Semaine 1");
    setComment("");
    setRows([{ rowId: 0, exerciseValue: "", other: "", sets: "" }]);
    setRowCounter(1);
    setModalOpen(true);
  }

  function addRow() {
    setRows((prev) => [...prev, { rowId: rowCounter, exerciseValue: "", other: "", sets: "" }]);
    setRowCounter((n) => n + 1);
  }

  function removeRow(rowId: number) {
    setRows((prev) => prev.filter((r) => r.rowId !== rowId));
  }

  function updateRow(rowId: number, patch: Partial<WorkoutRow>) {
    setRows((prev) => prev.map((r) => (r.rowId === rowId ? { ...r, ...patch } : r)));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    const weekValue = week.trim() || "Semaine 1";

    if (!isSupabaseConfigured) {
      const exercisesList: WorkoutExercise[] = [];
      for (const row of rows) {
        const exName = row.exerciseValue === "__other__" ? row.other.trim() : row.exerciseValue;
        if (exName) exercisesList.push({ name: exName, sets: row.sets.trim() });
      }
      onUpdate((c) => ({
        ...c,
        workouts: [...c.workouts, { id: crypto.randomUUID(), name: trimmedName, day, week: weekValue, exercises: exercisesList, comment: comment.trim() }],
      }));
      setModalOpen(false);
      showToast("Séance ajoutée");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { data: workoutRow, error: workoutError } = await supabase
      .from("workouts")
      .insert({ client_id: client.id, nom: trimmedName, jour: day, semaine_cycle: weekValue, commentaire: comment.trim() })
      .select()
      .single();
    if (workoutError || !workoutRow) {
      setSaving(false);
      showToast("Impossible d'ajouter la séance.");
      return;
    }

    const exercisesList: WorkoutExercise[] = [];
    const exerciseRows: { workout_id: string; exercise_id: string | null; nom_libre: string | null; series_repetitions: string; ordre: number }[] = [];
    rows.forEach((row, i) => {
      if (row.exerciseValue === "__other__") {
        const trimmed = row.other.trim();
        if (!trimmed) return;
        exerciseRows.push({ workout_id: workoutRow.id, exercise_id: null, nom_libre: trimmed, series_repetitions: row.sets.trim(), ordre: i });
        exercisesList.push({ name: trimmed, sets: row.sets.trim() });
      } else if (row.exerciseValue) {
        const found = libraryExercises.find((e) => e.id === row.exerciseValue);
        if (!found) return;
        exerciseRows.push({ workout_id: workoutRow.id, exercise_id: row.exerciseValue, nom_libre: null, series_repetitions: row.sets.trim(), ordre: i });
        exercisesList.push({ name: found.name, sets: row.sets.trim() });
      }
    });
    if (exerciseRows.length) await supabase.from("workout_exercises").insert(exerciseRows);

    setSaving(false);
    onUpdate((c) => ({
      ...c,
      workouts: [...c.workouts, { id: workoutRow.id, name: workoutRow.nom, day: workoutRow.jour ?? "", week: workoutRow.semaine_cycle, exercises: exercisesList, comment: workoutRow.commentaire ?? "" }],
    }));
    setModalOpen(false);
    showToast("Séance ajoutée");
  }

  async function deleteWorkout(workoutId: string) {
    if (isSupabaseConfigured) {
      const supabase = createClient();
      const { error } = await supabase.from("workouts").delete().eq("id", workoutId);
      if (error) {
        showToast("Impossible de supprimer la séance.");
        return;
      }
    }
    onUpdate((c) => ({ ...c, workouts: c.workouts.filter((w) => w.id !== workoutId) }));
    showToast("Séance supprimée");
  }

  const weekOrder: string[] = [];
  client.workouts.forEach((w) => {
    if (!weekOrder.includes(w.week)) weekOrder.push(w.week);
  });

  return (
    <div className="card">
      <div className="card-header">
        <h3>Programme d&apos;entraînement</h3>
        <button className="btn btn-primary btn-sm" type="button" style={{ marginLeft: "auto" }} onClick={openModal}>
          + Ajouter une séance
        </button>
      </div>
      <div className="card-body">
        {client.workouts.length === 0 && (
          <div style={{ color: "var(--text-muted)", fontSize: 13, padding: "24px 0", textAlign: "center" }}>
            Aucune séance programmée pour le moment.
          </div>
        )}
        {weekOrder.map((week) => (
          <div key={week}>
            <div className="week-group-title">{week || "Sans cycle"}</div>
            {client.workouts
              .filter((w) => w.week === week)
              .map((w) => (
                <div className="session-card" key={w.id}>
                  <div className="goal-card-top">
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13.5 }}>{w.name}</div>
                      <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>{w.day}</div>
                    </div>
                    <button className="icon-action danger" type="button" onClick={() => deleteWorkout(w.id)}>
                      <svg className="icon" viewBox="0 0 24 24" style={{ width: 14, height: 14 }}>
                        <path d="M4 6h16M9 6V4h6v2M6 6l1 14h10l1-14" />
                      </svg>
                    </button>
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--text-secondary)", marginTop: 10, lineHeight: 1.7 }}>
                    {w.exercises.length ? (
                      w.exercises.map((ex, i) => (
                        <div key={i}>
                          • {ex.name}
                          {ex.sets ? ` — ${ex.sets}` : ""}
                        </div>
                      ))
                    ) : (
                      <div style={{ color: "var(--text-muted)" }}>Aucun exercice renseigné.</div>
                    )}
                  </div>
                  {w.comment && (
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8, fontStyle: "italic" }}>{w.comment}</div>
                  )}
                </div>
              ))}
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Ajouter une séance">
        <form onSubmit={submit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group">
                <label>Nom de la séance</label>
                <input type="text" placeholder="Ex : Séance Jambes" required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Jour</label>
                <select value={day} onChange={(e) => setDay(e.target.value)}>
                  {dayOptions.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Semaine / Cycle</label>
              <input type="text" value={week} placeholder="Ex : Semaine 1" onChange={(e) => setWeek(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Exercices de la séance</label>
              <div>
                {rows.map((row) => (
                  <div className="workout-row" key={row.rowId}>
                    <select
                      className="wrow-select"
                      value={row.exerciseValue}
                      onChange={(e) => updateRow(row.rowId, { exerciseValue: e.target.value })}
                    >
                      <option value="">— Choisir un exercice —</option>
                      {libraryExercises.map((ex) => (
                        <option value={ex.id} key={ex.id}>
                          {ex.name}
                        </option>
                      ))}
                      <option value="__other__">Autre…</option>
                    </select>
                    {row.exerciseValue === "__other__" && (
                      <input
                        type="text"
                        className="wrow-other"
                        placeholder="Nom de l'exercice"
                        value={row.other}
                        onChange={(e) => updateRow(row.rowId, { other: e.target.value })}
                      />
                    )}
                    <input
                      type="text"
                      className="wrow-sets"
                      placeholder="Séries x reps"
                      value={row.sets}
                      onChange={(e) => updateRow(row.rowId, { sets: e.target.value })}
                    />
                    <button type="button" className="icon-action danger" onClick={() => removeRow(row.rowId)}>
                      <svg className="icon" viewBox="0 0 24 24" style={{ width: 13, height: 13 }}>
                        <path d="M4 6h16M9 6V4h6v2M6 6l1 14h10l1-14" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 2, alignSelf: "flex-start" }} onClick={addRow}>
                <svg className="icon" viewBox="0 0 24 24" style={{ width: 13, height: 13 }}>
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Ajouter un exercice
              </button>
            </div>
            <div className="form-group">
              <label>Commentaire</label>
              <textarea
                placeholder="Consignes générales, ressenti, points d'attention…"
                style={{ minHeight: 70 }}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Ajout…" : "Ajouter la séance"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
