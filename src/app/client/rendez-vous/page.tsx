"use client";

import { useState } from "react";
import { PageShell } from "@/components/shared/PageShell";
import { Modal } from "@/components/shared/Modal";
import { useToast } from "@/components/shared/ToastProvider";
import { upcomingAppointments, appointmentHistory, profile } from "@/lib/mock/client-data";

export default function ClientRendezVousPage() {
  const showToast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");

  function openModal() {
    setDate("");
    setTime("");
    setMessage("");
    setModalOpen(true);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setModalOpen(false);
    showToast("Demande envoyée à ton coach !");
  }

  return (
    <PageShell title="Mes rendez-vous" subtitle="Tes séances passées et à venir" avatarInitials={profile.initials}>
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
            {upcomingAppointments.map((a, i) => (
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
            {appointmentHistory.map((a, i) => (
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
            <button type="submit" className="btn btn-primary">
              Envoyer la demande
            </button>
          </div>
        </form>
      </Modal>
    </PageShell>
  );
}
