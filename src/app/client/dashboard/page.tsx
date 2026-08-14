"use client";

import { useRouter } from "next/navigation";
import { PageShell } from "@/components/shared/PageShell";
import { ExerciseLine } from "@/app/client/components/ExerciseLine";
import { goalsSeed, workoutsSeed, profile, calcWeightProgress } from "@/lib/mock/client-data";

export default function ClientDashboardPage() {
  const router = useRouter();
  const p = profile.physique;
  const progressPct = calcWeightProgress(p.startWeight, p.currentWeight, p.targetWeight);
  const nextWorkout = workoutsSeed.find((w) => !w.done) ?? workoutsSeed[workoutsSeed.length - 1];

  return (
    <PageShell title={`Salut ${profile.name.split(" ")[0]} 👋`} subtitle="Prête pour ta prochaine séance ?" avatarInitials={profile.initials}>
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-top" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div className="kpi-label">Séances ce mois</div>
              <div className="kpi-value">4</div>
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
              <div className="kpi-value" style={{ fontSize: 18 }}>Lun. 09:00</div>
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
            {goalsSeed.slice(0, 2).map((g) => (
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
          <div className="list-item" style={{ borderBottom: "none", paddingBottom: 0 }}>
            <div className="avatar-sm">{profile.coachInitials}</div>
            <div>
              <div className="list-title">{profile.coachName}</div>
              <div className="list-sub">Parfait, on monte à 65kg la semaine prochaine. Je t&apos;envoie le nouveau plan.</div>
            </div>
            <div className="list-right">
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => router.push("/client/messagerie")}>
                Répondre
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
