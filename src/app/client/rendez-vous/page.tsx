"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/shared/PageShell";
import { Modal } from "@/components/shared/Modal";
import { useToast } from "@/components/shared/ToastProvider";
import { upcomingAppointments as demoUpcoming, appointmentHistory as demoHistory, profile as demoProfile } from "@/lib/mock/client-data";
import { useCurrentClient } from "@/lib/hooks/useCurrentClient";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/storage";

const dayNamesLong = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const moisFR = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

function typeLabel(t: "coaching" | "découverte" | "bilan"): string {
  return t === "coaching" ? "Séance coaching" : t === "découverte" ? "RDV découverte" : "Bilan mensuel";
}
function formatApptDate(iso: string, heure: string, mode?: "visio" | "présentiel"): string {
  const d = new Date(iso + "T00:00:00");
  const base = `${dayNamesLong[d.getDay()]} ${d.getDate()} ${moisFR[d.getMonth()]} · ${heure.slice(0, 5)}`;
  return mode ? `${base} · ${mode === "visio" ? "Visio" : "Présentiel"}` : base;
}

interface ApptRow {
  title: string;
  label: string;
  status?: string;
  badge?: string;
}

export default function ClientRendezVousPage() {
  const showToast = useToast();
  const { client, loading: clientLoading } = useCurrentClient();
  const [upcoming, setUpcoming] = useState<ApptRow[]>(isSupabaseConfigured ? [] : demoUpcoming);
  const [history, setHistory] = useState<ApptRow[]>(isSupabaseConfigured ? [] : demoHistory);
  const [loadingData, setLoadingData] = useState(isSupabaseConfigured);
  const [modalOpen, setModalOpen] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured || !client) return;
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const today = new Date().toISOString().split("T")[0]!;
      // On récupère tous les RDV du client et on les répartit nous-mêmes par
      // date (plutôt que deux requêtes filtrées par statut) : un RDV encore
      // "prévue" mais dont la date est déjà passée doit quand même apparaître
      // quelque part, sinon il disparaît silencieusement de l'espace client.
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("client_id", client.id)
        .order("date", { ascending: true })
        .order("heure", { ascending: true });
      if (cancelled) return;
      if (error || !data) {
        setLoadingData(false);
        return;
      }

      setUpcoming(
        data
          .filter((a) => a.date >= today && a.statut === "prévue")
          .map((a) => ({ title: typeLabel(a.type), label: formatApptDate(a.date, a.heure, a.mode) })),
      );
      setHistory(
        data
          .filter((a) => a.date < today || a.statut !== "prévue")
          .sort((a, b) => (a.date === b.date ? b.heure.localeCompare(a.heure) : b.date.localeCompare(a.date)))
          .slice(0, 6)
          .map((a) => ({
            title: typeLabel(a.type),
            label: formatApptDate(a.date, a.heure),
            status: a.statut === "réalisée" ? "Réalisée" : a.statut === "manquée" ? "Manquée" : "En attente de confirmation",
            badge: a.statut === "réalisée" ? "badge-green" : a.statut === "manquée" ? "badge-danger" : "badge-muted",
          })),
      );
      setLoadingData(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [client]);

  function openModal() {
    setDate("");
    setTime("");
    setMessage("");
    setModalOpen(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    if (!isSupabaseConfigured) {
      setModalOpen(false);
      showToast("Demande envoyée à ton coach !");
      return;
    }

    if (!client) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("appointments").insert({
      client_id: client.id,
      coach_id: client.coachId,
      date,
      heure: time,
      type: "coaching",
      mode: "visio",
      statut: "prévue",
      notes: message.trim() || null,
    });
    setSaving(false);
    if (error) {
      showToast("Impossible d'envoyer la demande.");
      return;
    }
    setUpcoming((prev) => [...prev, { title: typeLabel("coaching"), label: formatApptDate(date, time, "visio") }]);
    setModalOpen(false);
    showToast("Demande envoyée à ton coach !");
  }

  const initials = isSupabaseConfigured ? client?.initials ?? "" : demoProfile.initials;
  const loading = clientLoading || loadingData;

  return (
    <PageShell title="Mes rendez-vous" subtitle="Tes séances passées et à venir" avatarInitials={initials}>
      <div className="row-2">
        <div className="card">
          <div className="card-header">
            <div>
              <h3>Prochains rendez-vous</h3>
            </div>
            <button className="btn btn-primary btn-sm" type="button" style={{ marginLeft: "auto" }} onClick={openModal}>
              Demander un RDV
            </button>
          </div>
          <div className="card-body">
            {loading && <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Chargement…</div>}
            {!loading && upcoming.length === 0 && (
              <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Aucun rendez-vous prévu pour le moment.</div>
            )}
            {upcoming.map((a, i) => (
              <div className="list-item" key={i}>
                <div className="avatar-sm">🏋️</div>
                <div>
                  <div className="list-title">{a.title}</div>
                  <div className="list-sub">{a.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h3>Historique récent</h3>
          </div>
          <div className="card-body">
            {!loading && history.length === 0 && (
              <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Aucun historique pour le moment.</div>
            )}
            {history.map((a, i) => (
              <div className="list-item" key={i}>
                <div>
                  <div className="list-title">{a.title}</div>
                  <div className="list-sub">{a.label}</div>
                </div>
                <div className="list-right">
                  <span className={`badge ${a.badge}`}>{a.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Demander un rendez-vous">
        <form onSubmit={submit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group">
                <label>Date souhaitée</label>
                <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Heure souhaitée</label>
                <input type="time" required value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>Message pour ton coach</label>
              <textarea
                placeholder="Précise le motif ou une contrainte d'horaire…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Envoi…" : "Envoyer la demande"}
            </button>
          </div>
        </form>
      </Modal>
    </PageShell>
  );
}
