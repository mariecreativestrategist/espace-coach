"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/shared/PageShell";
import { useToast } from "@/components/shared/ToastProvider";
import { ExerciseLine } from "@/app/client/components/ExerciseLine";
import { workoutsSeed, profile as demoProfile, type ClientWorkout } from "@/lib/mock/client-data";
import { useCurrentClient } from "@/lib/hooks/useCurrentClient";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/storage";

export default function ClientProgrammePage() {
  const showToast = useToast();
  const { client, loading: clientLoading } = useCurrentClient();
  const [workouts, setWorkouts] = useState<ClientWorkout[]>(isSupabaseConfigured ? [] : workoutsSeed);
  const [loadingData, setLoadingData] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured || !client) return;
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const { data: workoutRows } = await supabase.from("workouts").select("*").eq("client_id", client.id).order("created_at");
      const rows = workoutRows ?? [];
      const workoutIds = rows.map((w) => w.id);
      const weRes = workoutIds.length
        ? await supabase.from("workout_exercises").select("*").in("workout_id", workoutIds).order("ordre")
        : { data: [] as { workout_id: string; exercise_id: string | null; nom_libre: string | null; series_repetitions: string | null }[] };
      const weRows = weRes.data ?? [];
      const exerciseIds = [...new Set(weRows.map((w) => w.exercise_id).filter((v): v is string => Boolean(v)))];
      const exRes = exerciseIds.length ? await supabase.from("exercises").select("id, nom").in("id", exerciseIds) : { data: [] };
      const exerciseNameById = new Map((exRes.data ?? []).map((e) => [e.id, e.nom]));
      if (cancelled) return;

      setWorkouts(
        rows.map((w) => ({
          id: w.id,
          name: w.nom,
          day: w.jour ?? "",
          week: w.semaine_cycle,
          done: w.statut_realisation === "fait",
          comment: w.commentaire ?? "",
          exercises: weRows
            .filter((we) => we.workout_id === w.id)
            .map((we) => ({ name: we.exercise_id ? exerciseNameById.get(we.exercise_id) ?? "" : we.nom_libre ?? "", sets: we.series_repetitions ?? "" })),
        })),
      );
      setLoadingData(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [client]);

  async function toggleDone(id: string) {
    const current = workouts.find((w) => w.id === id);
    if (!current) return;
    const nowDone = !current.done;
    if (isSupabaseConfigured) {
      const supabase = createClient();
      const { error } = await supabase.from("workouts").update({ statut_realisation: nowDone ? "fait" : "à_faire" }).eq("id", id);
      if (error) {
        showToast("Impossible de mettre à jour la séance.");
        return;
      }
    }
    setWorkouts((prev) => prev.map((w) => (w.id === id ? { ...w, done: nowDone } : w)));
    showToast(nowDone ? "Séance marquée comme réalisée 💪" : "Séance remise à faire");
  }

  const weekOrder: string[] = [];
  workouts.forEach((w) => {
    if (!weekOrder.includes(w.week)) weekOrder.push(w.week);
  });
  const loading = clientLoading || loadingData;
  const initials = isSupabaseConfigured ? client?.initials ?? "" : demoProfile.initials;

  return (
    <PageShell title="Mon programme" subtitle="Tes séances organisées par semaine" avatarInitials={initials}>
      <div className="card">
        <div className="card-header">
          <div>
            <h3>Programme d&apos;entraînement</h3>
            <div className="sub">Coche une séance une fois réalisée</div>
          </div>
        </div>
        <div className="card-body">
          {loading && <div style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>Chargement…</div>}
          {!loading && workouts.length === 0 && (
            <div style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>
              Aucune séance programmée pour le moment.
            </div>
          )}
          {weekOrder.map((week) => (
            <div key={week}>
              <div className="week-group-title">{week}</div>
              {workouts
                .filter((w) => w.week === week)
                .map((w) => (
                  <div className="session-card" key={w.id}>
                    <div className="goal-card-top">
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13.5 }}>{w.name}</div>
                        <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>{w.day}</div>
                      </div>
                      <div className={`task-check${w.done ? " done" : ""}`} onClick={() => toggleDone(w.id)}>
                        {w.done && (
                          <svg viewBox="0 0 24 24">
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div style={{ fontSize: 12.5, color: "var(--text-secondary)", marginTop: 10, lineHeight: 1.9 }}>
                      {w.exercises.map((ex, i) => (
                        <ExerciseLine ex={ex} key={i} />
                      ))}
                    </div>
                    {w.comment && (
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8, fontStyle: "italic" }}>{w.comment}</div>
                    )}
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
