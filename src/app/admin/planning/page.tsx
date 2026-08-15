"use client";

import { Fragment, useEffect, useState } from "react";
import { PageShell } from "@/components/shared/PageShell";
import { Modal } from "@/components/shared/Modal";
import { useToast } from "@/components/shared/ToastProvider";
import {
  appointmentsSeed,
  clientsSeed,
  days,
  dayNums,
  slots,
  type Appointment,
  type AppointmentStatus,
  type AppointmentType,
} from "@/lib/mock/admin-data";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/storage";

const dayNamesLong = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const slotDefaults = ["09:00", "11:00", "14:00", "17:00"];
const moisFR = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

function mondayOf(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}
function isoDate(d: Date): string {
  return d.toISOString().split("T")[0]!;
}
function slotIndexForHour(hour: number): number {
  return hour < 10 ? 0 : hour < 13 ? 1 : hour < 16 ? 2 : 3;
}

function apptStatusFromDb(s: "prévue" | "réalisée" | "manquée"): AppointmentStatus {
  return s === "réalisée" ? "realisee" : s === "manquée" ? "manquee" : "prevue";
}
function apptStatusToDb(s: AppointmentStatus): "prévue" | "réalisée" | "manquée" {
  return s === "realisee" ? "réalisée" : s === "manquee" ? "manquée" : "prévue";
}
function apptTypeToClass(t: "coaching" | "découverte" | "bilan"): AppointmentType {
  return t === "découverte" ? "rdv" : t === "bilan" ? "bilan" : "";
}

export default function AdminPlanningPage() {
  const showToast = useToast();
  const [coachId, setCoachId] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [appointments, setAppointments] = useState<Appointment[]>(isSupabaseConfigured ? [] : appointmentsSeed);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [nextId, setNextId] = useState(11);
  const [realClients, setRealClients] = useState<{ id: string; name: string }[]>([]);

  const monday = addDays(mondayOf(new Date()), weekOffset * 7);
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const today = new Date();
  const todayIndex = weekDates.findIndex((d) => isoDate(d) === isoDate(today));
  const weekLabel = `${weekDates[0]!.getDate()} – ${weekDates[6]!.getDate()} ${moisFR[weekDates[6]!.getMonth()]} ${weekDates[6]!.getFullYear()}`;
  const displayDayNums = isSupabaseConfigured ? weekDates.map((d) => d.getDate()) : dayNums;

  const [rdvOpen, setRdvOpen] = useState(false);
  const [rdvDay, setRdvDay] = useState(0);
  const [rdvTime, setRdvTime] = useState("09:00");
  const [rdvName, setRdvName] = useState("");
  const [rdvType, setRdvType] = useState<"coaching" | "decouverte" | "bilan">("coaching");
  const [rdvMode, setRdvMode] = useState<"Visio" | "Présentiel">("Visio");
  const [rdvDuration, setRdvDuration] = useState("45 min");
  const [rdvNotes, setRdvNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const [attendanceId, setAttendanceId] = useState<number | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      setCoachId(user.id);

      const [apptRes, clientsRes] = await Promise.all([
        supabase
          .from("appointments")
          .select("*")
          .eq("coach_id", user.id)
          .gte("date", isoDate(weekDates[0]!))
          .lte("date", isoDate(weekDates[6]!)),
        supabase.from("clients").select("id, nom").eq("coach_id", user.id),
      ]);
      if (cancelled) return;

      const clientNameById = new Map((clientsRes.data ?? []).map((c) => [c.id, c.nom]));
      setRealClients((clientsRes.data ?? []).map((c) => ({ id: c.id, name: c.nom })));

      if (apptRes.error) {
        showToast("Impossible de charger le planning.");
      } else if (apptRes.data) {
        setAppointments(
          apptRes.data.map((row) => {
            const rowDate = new Date(row.date + "T00:00:00");
            const dayIdx = weekDates.findIndex((d) => isoDate(d) === row.date);
            const hour = parseInt(row.heure.split(":")[0]!, 10);
            const clientName = clientNameById.get(row.client_id) ?? "Client";
            const cls = apptTypeToClass(row.type);
            const text =
              row.type === "coaching" ? `${clientName} — Coaching` : row.type === "découverte" ? `RDV découverte — ${clientName}` : `Bilan — ${clientName}`;
            return {
              id: row.id as unknown as number,
              day: dayIdx >= 0 ? dayIdx : rowDate.getDay(),
              slot: slotIndexForHour(hour),
              time: row.heure.slice(0, 5),
              text,
              type: cls,
              status: apptStatusFromDb(row.statut),
            };
          }),
        );
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekOffset]);

  const done = appointments.filter((a) => a.status === "realisee").length;
  const missed = appointments.filter((a) => a.status === "manquee").length;
  const upcoming = appointments.filter((a) => a.status === "prevue").length;

  function openRdvModal(day: number, slotIdx: number) {
    setRdvDay(day);
    setRdvTime(slotDefaults[slotIdx]!);
    setRdvName("");
    setRdvType("coaching");
    setRdvMode("Visio");
    setRdvDuration("45 min");
    setRdvNotes("");
    setRdvOpen(true);
  }

  async function submitRdv(e: React.FormEvent) {
    e.preventDefault();
    const name = rdvName.trim();
    if (!name) return;
    const hour = parseInt(rdvTime.split(":")[0]!, 10);
    const slotIdx = slotIndexForHour(hour);
    let text: string;
    let cls: AppointmentType;
    if (rdvType === "coaching") { text = `${name} — Coaching`; cls = ""; }
    else if (rdvType === "decouverte") { text = `RDV découverte — ${name}`; cls = "rdv"; }
    else { text = `Bilan — ${name}`; cls = "bilan"; }

    if (!isSupabaseConfigured) {
      const newAppt: Appointment = { id: nextId, day: rdvDay, slot: slotIdx, time: rdvTime, text, type: cls, status: "prevue" };
      setAppointments((prev) => [...prev, newAppt]);
      setNextId((n) => n + 1);
      setRdvOpen(false);
      showToast("Rendez-vous ajouté au planning");
      return;
    }

    const client = realClients.find((c) => c.name.toLowerCase() === name.toLowerCase());
    if (!client || !coachId) {
      showToast("Client introuvable — choisis un nom dans la liste suggérée.");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const dbType = rdvType === "decouverte" ? "découverte" : rdvType === "bilan" ? "bilan" : "coaching";
    const dbMode = rdvMode === "Visio" ? "visio" : "présentiel";
    const durationMin = parseInt(rdvDuration, 10) || 45;
    const { data, error } = await supabase
      .from("appointments")
      .insert({
        client_id: client.id,
        coach_id: coachId,
        date: isoDate(weekDates[rdvDay]!),
        heure: rdvTime,
        duree_min: durationMin,
        type: dbType,
        mode: dbMode,
        notes: rdvNotes.trim() || null,
      })
      .select()
      .single();
    setSaving(false);
    if (error || !data) {
      showToast("Impossible d'ajouter le rendez-vous.");
      return;
    }
    setAppointments((prev) => [...prev, { id: data.id as unknown as number, day: rdvDay, slot: slotIdx, time: rdvTime, text, type: cls, status: "prevue" }]);
    setRdvOpen(false);
    showToast("Rendez-vous ajouté au planning");
  }

  async function setStatus(status: AppointmentStatus) {
    if (attendanceId === null) return;
    if (isSupabaseConfigured) {
      const supabase = createClient();
      const { error } = await supabase.from("appointments").update({ statut: apptStatusToDb(status) }).eq("id", attendanceId as unknown as string);
      if (error) {
        showToast("Impossible de mettre à jour le statut.");
        return;
      }
    }
    setAppointments((prev) => prev.map((a) => (a.id === attendanceId ? { ...a, status } : a)));
    setAttendanceId(null);
    showToast(status === "realisee" ? "Séance marquée réalisée" : status === "manquee" ? "Séance marquée manquée" : "Statut réinitialisé");
  }

  const activeAppt = appointments.find((a) => a.id === attendanceId) ?? null;

  return (
    <PageShell title="Planning" subtitle="Vos rendez-vous et séances de coaching" search="Rechercher un client, une facture…" avatarInitials="MG">
      <div className="row-3" style={{ marginBottom: 18 }}>
        <div className="kpi-card">
          <div className="kpi-label">Réalisées cette semaine</div>
          <div className="kpi-value" style={{ color: "var(--accent-green)" }}>{done}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Manquées cette semaine</div>
          <div className="kpi-value" style={{ color: "var(--danger)" }}>{missed}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">À venir</div>
          <div className="kpi-value">{upcoming}</div>
        </div>
      </div>

      <div className="planning-toolbar">
        <button className="btn btn-primary" type="button" onClick={() => openRdvModal(0, 0)}>
          <svg className="icon" viewBox="0 0 24 24" style={{ width: 15, height: 15, stroke: "#07130d" }}>
            <path d="M12 5v14M5 12h14" />
          </svg>
          Ajouter un rendez-vous
        </button>
        <span className="badge badge-green" style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span className="legend-dot" style={{ background: "var(--accent-green)", width: 6, height: 6 }} />
          Séance coaching
        </span>
        <span className="badge badge-muted" style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span className="legend-dot" style={{ background: "var(--accent-lime)", width: 6, height: 6 }} />
          RDV découverte
        </span>
        <span className="badge badge-muted" style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span className="legend-dot" style={{ background: "var(--accent-teal)", width: 6, height: 6 }} />
          Bilan
        </span>

        <div className="week-nav">
          <button className="icon-btn" type="button" onClick={() => setWeekOffset((w) => w - 1)} disabled={!isSupabaseConfigured}>
            <svg className="icon" viewBox="0 0 24 24" style={{ width: 15, height: 15 }}>
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <span style={{ fontSize: 13, fontWeight: 600, padding: "0 8px" }}>
            {isSupabaseConfigured ? weekLabel : "4 – 10 août 2026"}
          </span>
          <button className="icon-btn" type="button" onClick={() => setWeekOffset((w) => w + 1)} disabled={!isSupabaseConfigured}>
            <svg className="icon" viewBox="0 0 24 24" style={{ width: 15, height: 15 }}>
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      <div className="cal-grid">
        <div className="cal-head" style={{ borderLeft: "none" }} />
        {days.map((d, i) => (
          <div className={`cal-head${i === (isSupabaseConfigured ? todayIndex : 5) ? " today" : ""}`} key={d}>
            {d}
            <span>{displayDayNums[i]}</span>
          </div>
        ))}
        {loading && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px 20px", color: "var(--text-muted)", fontSize: 13.5 }}>
            Chargement…
          </div>
        )}
        {!loading &&
          slots.map((s, slotIdx) => (
            <Fragment key={s}>
              <div className="cal-time">{s}</div>
              {days.map((d, dayIdx) => {
                const items = appointments.filter((a) => a.day === dayIdx && a.slot === slotIdx);
                return (
                  <div className="cal-cell" key={`${dayIdx}-${slotIdx}`} onClick={() => openRdvModal(dayIdx, slotIdx)}>
                    {items.map((a) => {
                      const statusClass = a.status === "realisee" ? " is-done" : a.status === "manquee" ? " is-missed" : "";
                      return (
                        <div
                          className={`cal-block ${a.type}${statusClass}`}
                          key={a.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setAttendanceId(a.id);
                          }}
                        >
                          <div className="t">{a.time}</div>
                          {a.text}
                          {a.status === "realisee" ? " ✓" : ""}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </Fragment>
          ))}
      </div>
      <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 12 }}>
        Astuce : cliquez sur un créneau libre pour ajouter un rendez-vous, ou sur un rendez-vous existant pour le
        marquer réalisé / manqué.
      </div>

      <Modal open={rdvOpen} onClose={() => setRdvOpen(false)} title="Ajouter un rendez-vous">
        <form onSubmit={submitRdv}>
          <div className="modal-body">
            <div className="form-group">
              <label>Nom du client</label>
              <input
                type="text"
                list="clientNamesList"
                placeholder="Ex : Lisa Carion"
                required
                value={rdvName}
                onChange={(e) => setRdvName(e.target.value)}
              />
              <datalist id="clientNamesList">
                {(isSupabaseConfigured ? realClients : clientsSeed.map((c) => ({ id: c.id, name: c.name }))).map((c) => (
                  <option value={c.name} key={c.id} />
                ))}
              </datalist>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Type de rendez-vous</label>
                <select value={rdvType} onChange={(e) => setRdvType(e.target.value as typeof rdvType)}>
                  <option value="coaching">Séance coaching</option>
                  <option value="decouverte">RDV découverte</option>
                  <option value="bilan">Bilan</option>
                </select>
              </div>
              <div className="form-group">
                <label>Mode</label>
                <select value={rdvMode} onChange={(e) => setRdvMode(e.target.value as typeof rdvMode)}>
                  <option>Visio</option>
                  <option>Présentiel</option>
                </select>
              </div>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Jour</label>
                <select value={rdvDay} onChange={(e) => setRdvDay(Number(e.target.value))}>
                  {days.map((d, i) => (
                    <option value={i} key={d}>
                      {d} {displayDayNums[i]} {isSupabaseConfigured ? moisFR[weekDates[i]!.getMonth()] : "août"}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Heure</label>
                <input type="time" required value={rdvTime} onChange={(e) => setRdvTime(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>Durée</label>
              <select value={rdvDuration} onChange={(e) => setRdvDuration(e.target.value)}>
                <option>30 min</option>
                <option>45 min</option>
                <option>60 min</option>
                <option>90 min</option>
              </select>
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea
                placeholder="Objectif de la séance, lieu précis…"
                value={rdvNotes}
                onChange={(e) => setRdvNotes(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={() => setRdvOpen(false)}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Ajout…" : "Ajouter le rendez-vous"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={activeAppt !== null} onClose={() => setAttendanceId(null)} title="Statut du rendez-vous" small>
        <div className="modal-body">
          <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.5 }}>
            {activeAppt ? `${activeAppt.text} — ${dayNamesLong[activeAppt.day]} ${activeAppt.time}` : ""}
          </p>
        </div>
        <div className="modal-footer" style={{ flexWrap: "wrap" }}>
          <button className="btn btn-ghost btn-sm" type="button" onClick={() => setStatus("manquee")}>
            Marquer manquée
          </button>
          <button className="btn btn-ghost btn-sm" type="button" onClick={() => setStatus("prevue")}>
            Remettre à prévue
          </button>
          <button className="btn btn-primary btn-sm" type="button" onClick={() => setStatus("realisee")}>
            Marquer réalisée
          </button>
        </div>
      </Modal>
    </PageShell>
  );
}
