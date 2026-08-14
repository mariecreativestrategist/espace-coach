"use client";

import { useState } from "react";
import { PageShell } from "@/components/shared/PageShell";

const upcomingAppointments = [
  { time: "09:00", initials: "LC", name: "Lisa Carion", type: "Séance coaching · Visio" },
  { time: "11:30", initials: "TM", name: "Tom Mercier", type: "Bilan mensuel" },
  { time: "14:00", initials: "SB", name: "Sarah Ben", type: "Séance coaching · Présentiel" },
  { time: "17:15", initials: "JD", name: "Julie Dorval", type: "Premier RDV découverte" },
];

const recentMessages = [
  { initials: "LC", name: "Lisa Carion", preview: "Merci coach, je valide le plan 💪", unread: true },
  { initials: "TM", name: "Tom Mercier", preview: "Je peux décaler à 12h ?", unread: true },
  { initials: "SB", name: "Sarah Ben", preview: "Séance envoyée, à demain !", unread: false },
];

const pendingPayments = [
  { name: "Julie Dorval", label: "Abonnement mensuel", amount: "89€", badge: "badge-warning", status: "En attente" },
  { name: "Marc Ferreira", label: "Pack 10 séances", amount: "450€", badge: "badge-danger", status: "En retard" },
  { name: "Emma Roy", label: "Abonnement mensuel", amount: "89€", badge: "badge-warning", status: "En attente" },
];

const months = ["Sept", "Oct", "Nov", "Déc", "Jan", "Fév", "Mars", "Avr", "Mai", "Juin", "Juil", "Août"];

interface DashTask {
  id: number;
  text: string;
  done: boolean;
}

const initialDashTasks: DashTask[] = [
  { id: 1, text: "Programme de Lisa mis à jour", done: true },
  { id: 2, text: "Relancer Marc pour le paiement", done: false },
  { id: 3, text: "Préparer le bilan de Tom", done: false },
  { id: 4, text: "Valider le nouveau créneau de Julie", done: false },
];

export default function AdminDashboardPage() {
  const [tasks, setTasks] = useState(initialDashTasks);

  function toggleTask(id: number) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  return (
    <PageShell title="Dashboard" subtitle="Vue d'ensemble de votre activité" search="Rechercher un client, une facture…" avatarInitials="MG">
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-top">
            <div>
              <div className="kpi-label">Clients actifs</div>
              <div className="kpi-value">32</div>
            </div>
            <div className="kpi-icon">
              <svg className="icon" viewBox="0 0 24 24" style={{ width: 16, height: 16 }}>
                <circle cx="9" cy="8" r="3.2" />
                <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
              </svg>
            </div>
          </div>
          <div className="kpi-delta up">
            <svg className="icon" viewBox="0 0 24 24" style={{ width: 13, height: 13 }}>
              <path d="M6 15l6-6 6 6" />
            </svg>
            +4 ce mois-ci
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <div>
              <div className="kpi-label">Séances cette semaine</div>
              <div className="kpi-value">18</div>
            </div>
            <div className="kpi-icon">
              <svg className="icon" viewBox="0 0 24 24" style={{ width: 16, height: 16 }}>
                <rect x="3" y="4.5" width="18" height="16" rx="2.5" />
                <path d="M3 9.5h18" />
              </svg>
            </div>
          </div>
          <div className="kpi-delta up">
            <svg className="icon" viewBox="0 0 24 24" style={{ width: 13, height: 13 }}>
              <path d="M6 15l6-6 6 6" />
            </svg>
            6 aujourd&apos;hui
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <div>
              <div className="kpi-label">CA du mois</div>
              <div className="kpi-value">4 280€</div>
            </div>
            <div className="kpi-icon">
              <svg className="icon" viewBox="0 0 24 24" style={{ width: 16, height: 16 }}>
                <path d="M12 2v20M17 6.5c0-2-2.2-3-5-3s-5 1.2-5 3 2.2 3 5 3 5 1 5 3-2.2 3-5 3-5-1-5-3" />
              </svg>
            </div>
          </div>
          <div className="kpi-delta up">
            <svg className="icon" viewBox="0 0 24 24" style={{ width: 13, height: 13 }}>
              <path d="M6 15l6-6 6 6" />
            </svg>
            +12% vs mois dernier
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <div>
              <div className="kpi-label">Rétention</div>
              <div className="kpi-value">91%</div>
            </div>
            <div className="kpi-icon">
              <svg className="icon" viewBox="0 0 24 24" style={{ width: 16, height: 16 }}>
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
          </div>
          <div className="kpi-delta down">
            <svg className="icon" viewBox="0 0 24 24" style={{ width: 13, height: 13 }}>
              <path d="M6 9l6 6 6-6" />
            </svg>
            -2% vs mois dernier
          </div>
        </div>
      </div>

      <div className="row-2">
        <div className="card">
          <div className="card-header">
            <div>
              <h3>Évolution des clients</h3>
              <div className="sub">12 derniers mois</div>
            </div>
            <div className="chart-legend">
              <span>
                <span className="legend-dot" style={{ background: "var(--accent-green)" }} />
                Nouveaux clients
              </span>
            </div>
          </div>
          <div className="card-body">
            <svg viewBox="0 0 560 200" width="100%" height="200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#0c3d26" />
                  <stop offset="100%" stopColor="#c3ff5c" />
                </linearGradient>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3ddc84" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#3ddc84" stopOpacity="0" />
                </linearGradient>
              </defs>
              <g stroke="#1e2a23" strokeWidth="1">
                <line x1="0" y1="40" x2="560" y2="40" />
                <line x1="0" y1="90" x2="560" y2="90" />
                <line x1="0" y1="140" x2="560" y2="140" />
                <line x1="0" y1="190" x2="560" y2="190" />
              </g>
              <path
                d="M0,170 L50,160 L100,150 L150,155 L200,130 L250,120 L300,110 L350,95 L400,85 L450,70 L500,50 L560,35 L560,200 L0,200 Z"
                fill="url(#areaGrad)"
              />
              <path
                d="M0,170 L50,160 L100,150 L150,155 L200,130 L250,120 L300,110 L350,95 L400,85 L450,70 L500,50 L560,35"
                fill="none"
                stroke="url(#lineGrad)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 10.5, color: "var(--text-muted)", fontFamily: "var(--font-jetbrains-mono)" }}>
              {months.map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h3>Prochains RDV</h3>
              <div className="sub">Aujourd&apos;hui</div>
            </div>
          </div>
          <div className="card-body">
            <div className="appt-list">
              {upcomingAppointments.map((a) => (
                <div className="appt-row" key={a.time + a.name}>
                  <div className="appt-time">{a.time}</div>
                  <div className="avatar-sm">{a.initials}</div>
                  <div>
                    <div className="appt-name">{a.name}</div>
                    <div className="appt-type">{a.type}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="row-3">
        <div className="card">
          <div className="card-header">
            <h3>Messages récents</h3>
          </div>
          <div className="card-body">
            {recentMessages.map((m) => (
              <div className="list-item" key={m.name}>
                <div className="avatar-sm">{m.initials}</div>
                <div>
                  <div className="list-title">{m.name}</div>
                  <div className="list-sub">{m.preview}</div>
                </div>
                {m.unread && (
                  <div className="list-right">
                    <span className="unread-dot" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Paiements en attente</h3>
          </div>
          <div className="card-body">
            {pendingPayments.map((p) => (
              <div className="list-item" key={p.name}>
                <div>
                  <div className="list-title">{p.name}</div>
                  <div className="list-sub">{p.label}</div>
                </div>
                <div className="list-right">
                  <div className="amount">{p.amount}</div>
                  <span className={`badge ${p.badge}`}>{p.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Tâches du jour</h3>
          </div>
          <div className="card-body">
            {tasks.map((t) => (
              <div className="list-item" key={t.id}>
                <div className={`task-check${t.done ? " done" : ""}`} style={{ cursor: "pointer" }} onClick={() => toggleTask(t.id)}>
                  {t.done && (
                    <svg viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className={t.done ? "task-text done" : undefined}>{t.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
