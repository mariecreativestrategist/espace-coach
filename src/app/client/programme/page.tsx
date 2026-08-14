"use client";

import { useState } from "react";
import { PageShell } from "@/components/shared/PageShell";
import { useToast } from "@/components/shared/ToastProvider";
import { ExerciseLine } from "@/app/client/components/ExerciseLine";
import { workoutsSeed, profile } from "@/lib/mock/client-data";

export default function ClientProgrammePage() {
  const showToast = useToast();
  const [workouts, setWorkouts] = useState(workoutsSeed);

  function toggleDone(id: number) {
    const current = workouts.find((w) => w.id === id);
    if (!current) return;
    const nowDone = !current.done;
    setWorkouts((prev) => prev.map((w) => (w.id === id ? { ...w, done: nowDone } : w)));
    showToast(nowDone ? "Séance marquée comme réalisée 💪" : "Séance remise à faire");
  }

  const weekOrder: string[] = [];
  workouts.forEach((w) => {
    if (!weekOrder.includes(w.week)) weekOrder.push(w.week);
  });

  return (
    <PageShell title="Mon programme" subtitle="Tes séances organisées par semaine" avatarInitials={profile.initials}>
      <div className="card">
        <div className="card-header">
          <div>
            <h3>Programme d&apos;entraînement</h3>
            <div className="sub">Coche une séance une fois réalisée</div>
          </div>
        </div>
        <div className="card-body">
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
