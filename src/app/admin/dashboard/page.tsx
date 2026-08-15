"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/shared/PageShell";
import { initials, formatEuro } from "@/lib/mock/admin-data";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/storage";

const demoUpcomingAppointments = [
  { time: "09:00", initials: "LC", name: "Lisa Carion", type: "Séance coaching · Visio" },
  { time: "11:30", initials: "TM", name: "Tom Mercier", type: "Bilan mensuel" },
  { time: "14:00", initials: "SB", name: "Sarah Ben", type: "Séance coaching · Présentiel" },
  { time: "17:15", initials: "JD", name: "Julie Dorval", type: "Premier RDV découverte" },
];

const demoRecentMessages = [
  { initials: "LC", name: "Lisa Carion", preview: "Merci coach, je valide le plan 💪", unread: true },
  { initials: "TM", name: "Tom Mercier", preview: "Je peux décaler à 12h ?", unread: true },
  { initials: "SB", name: "Sarah Ben", preview: "Séance envoyée, à demain !", unread: false },
];

const demoPendingPayments = [
  { name: "Julie Dorval", label: "Abonnement mensuel", amount: "89€", badge: "badge-warning", status: "En attente" },
  { name: "Marc Ferreira", label: "Pack 10 séances", amount: "450€", badge: "badge-danger", status: "En retard" },
  { name: "Emma Roy", label: "Abonnement mensuel", amount: "89€", badge: "badge-warning", status: "En attente" },
];

const monthLabels = ["Sept", "Oct", "Nov", "Déc", "Jan", "Fév", "Mars", "Avr", "Mai", "Juin", "Juil", "Août"];
const moisCourts = ["Jan", "Fév", "Mars", "Avr", "Mai", "Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc"];

interface DashTask {
  id: string | number;
  text: string;
  done: boolean;
}

const demoTasks: DashTask[] = [
  { id: 1, text: "Programme de Lisa mis à jour", done: true },
  { id: 2, text: "Relancer Marc pour le paiement", done: false },
  { id: 3, text: "Préparer le bilan de Tom", done: false },
  { id: 4, text: "Valider le nouveau créneau de Julie", done: false },
];

function buildChartPaths(values: number[]) {
  const max = Math.max(1, ...values);
  const stepX = values.length > 1 ? 560 / (values.length - 1) : 560;
  const points = values.map((v, i) => [i * stepX, 190 - (v / max) * 150] as const);
  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const last = points[points.length - 1]!;
  const area = `${line} L${last[0].toFixed(1)},200 L0,200 Z`;
  return { line, area };
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(isSupabaseConfigured);

  const [clientsActifs, setClientsActifs] = useState(32);
  const [seancesSemaine, setSeancesSemaine] = useState(18);
  const [caDuMois, setCaDuMois] = useState("4 280€");
  const [retention, setRetention] = useState(91);
  const [monthlyValues, setMonthlyValues] = useState<number[]>([2, 3, 1, 4, 2, 5, 3, 4, 2, 6, 3, 4]);
  const [months, setMonths] = useState<string[]>(monthLabels);

  const [upcomingAppointments, setUpcomingAppointments] = useState(demoUpcomingAppointments);
  const [recentMessages, setRecentMessages] = useState(demoRecentMessages);
  const [pendingPayments, setPendingPayments] = useState(demoPendingPayments);
  const [tasks, setTasks] = useState<DashTask[]>(demoTasks);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      const now = new Date();
      const monday = new Date(now);
      const day = monday.getDay();
      monday.setDate(monday.getDate() + (day === 0 ? -6 : 1 - day));
      monday.setHours(0, 0, 0, 0);
      const sunday = new Date(monday);
      sunday.setDate(sunday.getDate() + 6);
      const iso = (d: Date) => d.toISOString().split("T")[0]!;
      const monthStart = iso(new Date(now.getFullYear(), now.getMonth(), 1));
      const monthEnd = iso(new Date(now.getFullYear(), now.getMonth() + 1, 0));

      const [clientsRes, apptWeekRes, apptTodayRes, invoicesRes, tasksRes, convRes] = await Promise.all([
        supabase.from("clients").select("id, nom, statut, created_at").eq("coach_id", user.id),
        supabase.from("appointments").select("id").eq("coach_id", user.id).eq("type", "coaching").gte("date", iso(monday)).lte("date", iso(sunday)),
        supabase.from("appointments").select("*").eq("coach_id", user.id).eq("date", iso(now)).order("heure"),
        supabase.from("invoices").select("montant, date, statut, client_id").eq("coach_id", user.id),
        supabase.from("tasks").select("*").eq("coach_id", user.id).order("created_at", { ascending: true }).limit(6),
        supabase.from("conversations").select("id, client_id").eq("coach_id", user.id),
      ]);
      if (cancelled) return;

      const clients = clientsRes.data ?? [];
      const clientNameById = new Map(clients.map((c) => [c.id, c.nom]));
      const total = clients.length;
      const actifs = clients.filter((c) => c.statut === "actif").length;
      setClientsActifs(actifs);
      setRetention(total ? Math.round((actifs / total) * 100) : 0);
      setSeancesSemaine((apptWeekRes.data ?? []).length);

      setUpcomingAppointments(
        (apptTodayRes.data ?? []).map((a) => ({
          time: a.heure.slice(0, 5),
          initials: initials(clientNameById.get(a.client_id) ?? "Client"),
          name: clientNameById.get(a.client_id) ?? "Client",
          type: `${a.type === "coaching" ? "Séance coaching" : a.type === "découverte" ? "RDV découverte" : "Bilan"} · ${a.mode === "visio" ? "Visio" : "Présentiel"}`,
        })),
      );

      const invoices = invoicesRes.data ?? [];
      const monthTotal = invoices.filter((i) => i.date >= monthStart && i.date <= monthEnd).reduce((s, i) => s + i.montant, 0);
      setCaDuMois(formatEuro(monthTotal));
      setPendingPayments(
        invoices
          .filter((i) => i.statut !== "payée")
          .slice(0, 5)
          .map((i) => ({
            name: clientNameById.get(i.client_id) ?? "Client",
            label: i.statut === "en_retard" ? "Facture en retard" : "Facture en attente",
            amount: formatEuro(i.montant),
            badge: i.statut === "en_retard" ? "badge-danger" : "badge-warning",
            status: i.statut === "en_retard" ? "En retard" : "En attente",
          })),
      );

      if (tasksRes.data) {
        setTasks(tasksRes.data.map((t) => ({ id: t.id, text: t.texte, done: t.fait })));
      }

      const convIds = (convRes.data ?? []).map((c) => c.id);
      if (convIds.length) {
        const { data: msgRows } = await supabase
          .from("messages")
          .select("*")
          .in("conversation_id", convIds)
          .order("horodatage", { ascending: false })
          .limit(3);
        const convClientById = new Map((convRes.data ?? []).map((c) => [c.id, c.client_id]));
        setRecentMessages(
          (msgRows ?? []).map((m) => {
            const clientId = convClientById.get(m.conversation_id);
            const clientName = clientNameById.get(clientId ?? "") ?? "Client";
            return { initials: initials(clientName), name: clientName, preview: m.contenu, unread: m.auteur === "client" && !m.lu };
          }),
        );
      } else {
        setRecentMessages([]);
      }

      const monthBuckets: number[] = [];
      const labels: string[] = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        labels.push(moisCourts[d.getMonth()]!);
        const count = clients.filter((c) => {
          const cd = new Date(c.created_at);
          return cd.getFullYear() === d.getFullYear() && cd.getMonth() === d.getMonth();
        }).length;
        monthBuckets.push(count);
      }
      setMonths(labels);
      setMonthlyValues(monthBuckets);

      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function toggleTask(id: string | number) {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;
    const nowDone = !target.done;
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: nowDone } : t)));
    if (isSupabaseConfigured) {
      const supabase = createClient();
      await supabase.from("tasks").update({ fait: nowDone }).eq("id", id as unknown as string);
    }
  }

  const { line, area } = buildChartPaths(monthlyValues);

  return (
    <PageShell title="Dashboard" subtitle="Vue d'ensemble de votre activité" search="Rechercher un client, une facture…" avatarInitials="MG">
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-top">
            <div>
              <div className="kpi-label">Clients actifs</div>
              <div className="kpi-value">{loading ? "…" : clientsActifs}</div>
            </div>
            <div className="kpi-icon">
              <svg className="icon" viewBox="0 0 24 24" style={{ width: 16, height: 16 }}>
                <circle cx="9" cy="8" r="3.2" />
                <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <div>
              <div className="kpi-label">Séances coaching cette semaine</div>
              <div className="kpi-value">{loading ? "…" : seancesSemaine}</div>
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
          <div className="kpi-top">
            <div>
              <div className="kpi-label">CA du mois</div>
              <div className="kpi-value">{loading ? "…" : caDuMois}</div>
            </div>
            <div className="kpi-icon">
              <svg className="icon" viewBox="0 0 24 24" style={{ width: 16, height: 16 }}>
                <path d="M12 2v20M17 6.5c0-2-2.2-3-5-3s-5 1.2-5 3 2.2 3 5 3 5 1 5 3-2.2 3-5 3-5-1-5-3" />
              </svg>
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <div>
              <div className="kpi-label">Rétention</div>
              <div className="kpi-value">{loading ? "…" : `${retention}%`}</div>
            </div>
            <div className="kpi-icon">
              <svg className="icon" viewBox="0 0 24 24" style={{ width: 16, height: 16 }}>
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
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
              <path d={area} fill="url(#areaGrad)" />
              <path d={line} fill="none" stroke="url(#lineGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 10.5, color: "var(--text-muted)", fontFamily: "var(--font-jetbrains-mono)" }}>
              {months.map((m, i) => (
                <span key={`${m}-${i}`}>{m}</span>
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
              {upcomingAppointments.length === 0 && !loading && (
                <div style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", padding: "12px 0" }}>Aucun RDV aujourd&apos;hui.</div>
              )}
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
            {recentMessages.length === 0 && !loading && (
              <div style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", padding: "12px 0" }}>Aucun message pour le moment.</div>
            )}
            {recentMessages.map((m, i) => (
              <div className="list-item" key={`${m.name}-${i}`}>
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
            {pendingPayments.length === 0 && !loading && (
              <div style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", padding: "12px 0" }}>Rien en attente. 🎉</div>
            )}
            {pendingPayments.map((p, i) => (
              <div className="list-item" key={`${p.name}-${i}`}>
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
            {tasks.length === 0 && !loading && (
              <div style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", padding: "12px 0" }}>Aucune tâche.</div>
            )}
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
