"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/shared/PageShell";
import { Modal } from "@/components/shared/Modal";
import { useToast } from "@/components/shared/ToastProvider";
import {
  clientsSeed,
  measurementCatalogSeed,
  defaultHealthQuestions,
  initials,
  statusBadgeClass,
  type Client,
  type ClientStatut,
  type MeasurementField,
} from "@/lib/mock/admin-data";
import { ClientDetail } from "./ClientDetail";

type Filter = "all" | ClientStatut;

interface Counters {
  goal: number;
  workout: number;
  measure: number;
  photo: number;
  question: number;
}

export default function AdminClientsPage() {
  const router = useRouter();
  const showToast = useToast();

  const [clients, setClients] = useState(clientsSeed);
  const [nextClientId, setNextClientId] = useState(7);
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [measurementCatalog, setMeasurementCatalog] = useState(measurementCatalogSeed);
  const [counters, setCounters] = useState<Counters>({ goal: 8, workout: 7, measure: 6, photo: 3, question: 100 });

  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formProgram, setFormProgram] = useState("");
  const [formStatus, setFormStatus] = useState<ClientStatut>("Actif");
  const [formNotes, setFormNotes] = useState("");

  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  function bumpCounter(key: keyof Counters) {
    setCounters((prev) => ({ ...prev, [key]: prev[key] + 1 }));
  }

  function addCustomField(field: MeasurementField) {
    setMeasurementCatalog((prev) => [...prev, field]);
  }

  function updateClient(id: number, updater: (c: Client) => Client) {
    setClients((prev) => prev.map((c) => (c.id === id ? updater(c) : c)));
  }

  const total = clients.length;
  const actifs = clients.filter((c) => c.status === "Actif").length;
  const pause = clients.filter((c) => c.status === "En pause").length;
  const archives = clients.filter((c) => c.status === "Archivé").length;
  const filtered = clients.filter((c) => filter === "all" || c.status === filter);

  function openAddModal() {
    setEditingId(null);
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormProgram("");
    setFormStatus("Actif");
    setFormNotes("");
    setClientModalOpen(true);
  }

  function openEditModal(id: number) {
    const c = clients.find((x) => x.id === id);
    if (!c) return;
    setEditingId(id);
    setFormName(c.name);
    setFormEmail(c.email);
    setFormPhone(c.phone);
    setFormProgram(c.program);
    setFormStatus(c.status);
    setFormNotes(c.notes);
    setClientModalOpen(true);
  }

  function submitClientForm(e: React.FormEvent) {
    e.preventDefault();
    const name = formName.trim();
    const email = formEmail.trim();
    if (!name || !email) return;
    if (editingId) {
      updateClient(editingId, (c) => ({ ...c, name, email, phone: formPhone.trim(), program: formProgram, status: formStatus, notes: formNotes.trim(), initials: initials(name) }));
      showToast("Client mis à jour");
    } else {
      const newClient: Client = {
        id: nextClientId,
        initials: initials(name),
        name,
        email,
        phone: formPhone.trim(),
        program: formProgram,
        status: formStatus,
        notes: formNotes.trim(),
        progress: 0,
        lastSession: "—",
        sessions: 0,
        goals: [],
        workouts: [],
        physique: { height: null, startWeight: null, currentWeight: null, targetWeight: null },
        nutritionFile: null,
        measurementFields: ["weight", "waist", "chest", "arm", "thigh"],
        measurements: [],
        photos: [],
        healthQuestions: defaultHealthQuestions(),
      };
      setClients((prev) => [...prev, newClient]);
      setNextClientId((n) => n + 1);
      showToast("Client ajouté");
    }
    setClientModalOpen(false);
  }

  function archiveClient(id: number) {
    const c = clients.find((x) => x.id === id);
    if (!c) return;
    const newStatus: ClientStatut = c.status === "Archivé" ? "Actif" : "Archivé";
    updateClient(id, (x) => ({ ...x, status: newStatus }));
    showToast(newStatus === "Archivé" ? "Client archivé" : "Client réactivé");
  }

  function confirmDelete() {
    if (pendingDeleteId === null) return;
    setClients((prev) => prev.filter((c) => c.id !== pendingDeleteId));
    setPendingDeleteId(null);
    showToast("Client supprimé");
  }

  const deleteTarget = clients.find((c) => c.id === pendingDeleteId) ?? null;
  const selectedClient = clients.find((c) => c.id === selectedId) ?? null;

  if (selectedClient) {
    return (
      <PageShell title={selectedClient.name} subtitle="Fiche client" search="Rechercher un client, une facture…" avatarInitials="MG">
        <ClientDetail
          client={selectedClient}
          onUpdate={(updater) => updateClient(selectedClient.id, updater)}
          onBack={() => setSelectedId(null)}
          onEdit={() => openEditModal(selectedClient.id)}
          onMessage={() => router.push("/admin/messagerie")}
          measurementCatalog={measurementCatalog}
          onAddCustomField={addCustomField}
          counters={counters}
          bumpCounter={bumpCounter}
        />
        {renderClientModal()}
      </PageShell>
    );
  }

  function renderClientModal() {
    return (
      <Modal open={clientModalOpen} onClose={() => setClientModalOpen(false)} title={editingId ? "Modifier le client" : "Nouveau client"}>
        <form onSubmit={submitClientForm}>
          <div className="modal-body">
            <div className="form-group">
              <label>Nom complet</label>
              <input type="text" placeholder="Ex : Nina Roussel" required value={formName} onChange={(e) => setFormName(e.target.value)} />
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Email</label>
                <input type="email" placeholder="nina@email.com" required value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Téléphone</label>
                <input type="tel" placeholder="06 12 34 56 78" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} />
              </div>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Programme</label>
                <input
                  type="text"
                  placeholder="Ex : Prise de masse, prépa marathon…"
                  value={formProgram}
                  onChange={(e) => setFormProgram(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Statut</label>
                <select value={formStatus} onChange={(e) => setFormStatus(e.target.value as ClientStatut)}>
                  <option>Actif</option>
                  <option>En pause</option>
                  <option>Archivé</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Notes internes</label>
              <textarea placeholder="Objectifs, contraintes, historique…" value={formNotes} onChange={(e) => setFormNotes(e.target.value)} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={() => setClientModalOpen(false)}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary">
              {editingId ? "Enregistrer les modifications" : "Ajouter le client"}
            </button>
          </div>
        </form>
      </Modal>
    );
  }

  return (
    <PageShell title="Clients" subtitle="Gérer, ajouter et suivre vos clients" search="Rechercher un client, une facture…" avatarInitials="MG">
      <div className="toolbar">
        <div className={`filter-pill${filter === "all" ? " active" : ""}`} onClick={() => setFilter("all")}>
          Tous ({total})
        </div>
        <div className={`filter-pill${filter === "Actif" ? " active" : ""}`} onClick={() => setFilter("Actif")}>
          Actifs ({actifs})
        </div>
        <div className={`filter-pill${filter === "En pause" ? " active" : ""}`} onClick={() => setFilter("En pause")}>
          En pause ({pause})
        </div>
        <div className={`filter-pill${filter === "Archivé" ? " active" : ""}`} onClick={() => setFilter("Archivé")}>
          Archivés ({archives})
        </div>
        <button className="btn btn-primary" type="button" style={{ marginLeft: "auto" }} onClick={openAddModal}>
          <svg className="icon" viewBox="0 0 24 24" style={{ width: 15, height: 15, stroke: "#07130d" }}>
            <path d="M12 5v14M5 12h14" />
          </svg>
          Nouveau client
        </button>
      </div>

      <div className="client-grid">
        {filtered.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "50px 20px", color: "var(--text-muted)", fontSize: 13.5 }}>
            Aucun client dans cette catégorie.
          </div>
        )}
        {filtered.map((c) => (
          <div className={`client-card${c.status === "Archivé" ? " is-archived" : ""}`} key={c.id}>
            <div className="client-top" style={{ cursor: "pointer" }} onClick={() => setSelectedId(c.id)}>
              <div className="avatar-md">{c.initials}</div>
              <div>
                <div className="client-name">{c.name}</div>
                <div className="client-program">{c.program}</div>
              </div>
              <span className={`badge ${statusBadgeClass(c.status)}`} style={{ marginLeft: "auto" }}>
                {c.status}
              </span>
            </div>
            <div className="client-progress">
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "var(--text-muted)" }}>
                <span>Progression</span>
                <span>{c.progress}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${c.progress}%` }} />
              </div>
            </div>
            <div className="client-meta">
              <span>Dernière séance : {c.lastSession}</span>
              <span>{c.sessions} séances</span>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              type="button"
              style={{ width: "100%", marginTop: 12, justifyContent: "center" }}
              onClick={() => setSelectedId(c.id)}
            >
              Voir la fiche complète →
            </button>
            <div className="client-actions">
              <button className="icon-action" type="button" title="Message" onClick={() => router.push("/admin/messagerie")}>
                <svg className="icon" viewBox="0 0 24 24" style={{ width: 15, height: 15 }}>
                  <path d="M4 5h16v11H8l-4 4V5z" />
                </svg>
              </button>
              <button className="icon-action" type="button" title="Modifier" onClick={() => openEditModal(c.id)}>
                <svg className="icon" viewBox="0 0 24 24" style={{ width: 15, height: 15 }}>
                  <path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" />
                </svg>
              </button>
              <button
                className="icon-action"
                type="button"
                title={c.status === "Archivé" ? "Réactiver" : "Archiver"}
                onClick={() => archiveClient(c.id)}
              >
                <svg className="icon" viewBox="0 0 24 24" style={{ width: 15, height: 15 }}>
                  <path d="M21 8H3l1-4h16z" strokeLinejoin="round" />
                  <path d="M5 8v11a1 1 0 001 1h12a1 1 0 001-1V8" />
                  <path d="M10 12h4" />
                </svg>
              </button>
              <button className="icon-action danger" type="button" title="Supprimer" onClick={() => setPendingDeleteId(c.id)}>
                <svg className="icon" viewBox="0 0 24 24" style={{ width: 15, height: 15 }}>
                  <path d="M4 6h16M9 6V4h6v2M6 6l1 14h10l1-14" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {renderClientModal()}

      <Modal open={deleteTarget !== null} onClose={() => setPendingDeleteId(null)} title="Supprimer le client" small>
        <div className="modal-body">
          <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.5 }}>
            {deleteTarget ? `Supprimer définitivement ${deleteTarget.name} ? Cette action est irréversible et effacera son historique.` : ""}
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" type="button" onClick={() => setPendingDeleteId(null)}>
            Annuler
          </button>
          <button className="btn btn-danger" type="button" onClick={confirmDelete}>
            Supprimer définitivement
          </button>
        </div>
      </Modal>
    </PageShell>
  );
}
