"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/shared/PageShell";
import { ExerciseLine } from "@/app/client/components/ExerciseLine";
import { goalsSeed, workoutsSeed, profile as demoProfile, calcWeightProgress, type ClientGoal, type ClientWorkout } from "@/lib/mock/client-data";
import { useCurrentClient } from "@/lib/hooks/useCurrentClient";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/storage";

export default function ClientDashboardPage() {
  const router = useRouter();
  const { client, loading: clientLoading } = useCurrentClient();

  const [goals, setGoals] = useState<ClientGoal[]>(isSupabaseConfigured ? [] : goalsSeed);
  const [workouts, setWorkouts] = useState<ClientWorkout[]>(isSupabaseConfigured ? [] : workoutsSeed);
  const [seancesCeMois, setSeancesCeMois] = useState(4);
  const [nextApptLabel, setNextApptLabel] = useState("Lun. 09:00");
  const [lastMessage, setLastMessage] = useState<string | null>(
    "Parfait, on monte à 65kg la semaine prochaine. Je t'envoie le nouveau plan.",
  );
  const [loadingData, setLoadingData] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured || !client) return;
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]!;
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0]!;
      const today = now.toISOString().split("T")[0]!;

      const [goalsRes, workoutsRes, apptCountRes, nextApptRes, convRes] = await Promise.all([
        supabase.from("goals").select("*").eq("client_id", client.id).order("created_at"),
        supabase.from("workouts").select("*").eq("client_id", client.id).order("created_at"),
        supabase
          .from("appointments")
          .select("id")
          .eq("client_id", client.id)
          .eq("statut", "réalisée")
          .gte("date", monthStart)
          .lte("date", monthEnd),
        supabase.from("appointments").select("date, heure").eq("client_id", client.id).eq("statut", "prévue").gte("date", today).order("date").order("heure").limit(1),
        supabase.from("conversations").select("id").eq("client_id", client.id).maybeSingle(),
      ]);
      if (cancelled) return;

      setGoals((goalsRes.data ?? []).map((g) => ({ id: g.id, title: g.titre, progress: g.progression })));
      setSeancesCeMois((apptCountRes.data ?? []).length);

      const workoutRows = workoutsRes.data ?? [];
      const workoutIds = workoutRows.map((w) => w.id);
      const weRes = workoutIds.length
        ? await supabase.from("workout_exercises").select("*").in("workout_id", workoutIds).order("ordre")
        : { data: [] as { workout_id: string; exercise_id: string | null; nom_libre: string | null; series_repetitions: string | null }[] };
      const weRows = weRes.data ?? [];
      const exerciseIds = [...new Set(weRows.map((w) => w.exercise_id).filter((v): v is string => Boolean(v)))];
      const exRes = exerciseIds.length ? await supabase.from("exercises").select("id, nom").in("id", exerciseIds) : { data: [] };
      const exerciseNameById = new Map((exRes.data ?? []).map((e) => [e.id, e.nom]));
      if (cancelled) return;

      setWorkouts(
        workoutRows.map((w) => ({
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

      if (nextApptRes.data && nextApptRes.data[0]) {
        const d = new Date(nextApptRes.data[0].date + "T00:00:00");
        const dayShort = ["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."][d.getDay()];
        setNextApptLabel(`${dayShort} ${nextApptRes.data[0].heure.slice(0, 5)}`);
      } else {
        setNextApptLabel("Aucun RDV prévu");
      }

      if (convRes.data) {
        const { data: msgRows } = await supabase
          .from("messages")
          .select("contenu")
          .eq("conversation_id", convRes.data.id)
          .eq("auteur", "coach")
          .order("horodatage", { ascending: false })
          .limit(1);
        setLastMessage(msgRows && msgRows[0] ? msgRows[0].contenu : null);
      } else {
        setLastMessage(null);
      }

      setLoadingData(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [client]);

  const name = isSupabaseConfigured ? client?.name ?? "" : demoProfile.name;
  const initials = isSupabaseConfigured ? client?.initials ?? "" : demoProfile.initials;
  const coachInitials = isSupabaseConfigured ? client?.coachInitials ?? "" : demoProfile.coachInitials;
  const coachName = isSupabaseConfigured ? client?.coachName ?? "" : demoProfile.coachName;
  const p = isSupabaseConfigured ? client?.physique ?? { height: null, startWeight: null, currentWeight: null, targetWeight: null } : demoProfile.physique;
  const progressPct = calcWeightProgress(p.startWeight ?? 0, p.currentWeight ?? 0, p.targetWeight ?? 0);
  const nextWorkout = workouts.find((w) => !w.done) ?? workouts[workouts.length - 1];
  const loading = clientLoading || loadingData;

  return (
    <PageShell
      title={name ? `Salut ${name.split(" ")[0]} 👋` : "Salut 👋"}
      subtitle="Prête pour ta prochaine séance ?"
      avatarInitials={initials}
    >
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-top" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div className="kpi-label">Séances réalisées ce mois</div>
              <div className="kpi-value">{loading ? "…" : seancesCeMois}</div>
            </div>
            <div className="kpi-icon">
              <svg className="icon" viewBox="0 0 24 24" style={{ width: 16, height: 16 }}>
                <rect x="3" y="4.5" width="18" height="16" rx="2.5" />
                <path d="M3 9.5h18" />
              </svg>
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-top" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div className="kpi-label">Progression objectif poids</div>
              <div className="kpi-value">{progressPct}%</div>
            </div>
            <div className="kpi-icon">
              <svg className="icon" viewBox="0 0 24 24" style={{ width: 16, height: 16 }}>
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-top" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div className="kpi-label">Prochaine séance</div>
              <div className="kpi-value" style={{ fontSize: 18 }}>{loading ? "…" : nextApptLabel}</div>
            </div>
            <div className="kpi-icon">
              <svg className="icon" viewBox="0 0 24 24" style={{ width: 16, height: 16 }}>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 3" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="row-2">
        <div className="card">
          <div className="card-header">
            <h3>Objectifs en cours</h3>
          </div>
          <div className="card-body">
            {goals.length === 0 && !loading && (
              <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Aucun objectif défini pour le moment.</div>
            )}
            {goals.slice(0, 2).map((g) => (
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

        <div className="card">
          <div className="card-header">
            <h3>Prochaine séance</h3>
          </div>
          <div className="card-body">
            {nextWorkout ? (
              <>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>{nextWorkout.name}</div>
                <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 3 }}>
                  {nextWorkout.day} · {nextWorkout.week}
                </div>
                <div style={{ fontSize: 12.5, color: "var(--text-secondary)", marginTop: 14, lineHeight: 1.9 }}>
                  {nextWorkout.exercises.map((ex, i) => (
                    <ExerciseLine ex={ex} key={i} />
                  ))}
                </div>
                {nextWorkout.comment && (
                  <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 10, fontStyle: "italic" }}>{nextWorkout.comment}</div>
                )}
              </>
            ) : (
              <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Aucune séance programmée pour le moment.</div>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Dernier message de ton coach</h3>
        </div>
        <div className="card-body">
          {lastMessage ? (
            <div className="list-item" style={{ borderBottom: "none", paddingBottom: 0 }}>
              <div className="avatar-sm">{coachInitials}</div>
              <div>
                <div className="list-title">{coachName}</div>
                <div className="list-sub">{lastMessage}</div>
              </div>
              <div className="list-right">
                <button className="btn btn-ghost btn-sm" type="button" onClick={() => router.push("/client/messagerie")}>
                  Répondre
                </button>
              </div>
            </div>
          ) : (
            <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Aucun message pour le moment.</div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
