"use client";

import { useEffect, useState } from "react";
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
  clientStatusToDb,
  clientStatusFromDb,
  type Client,
  type ClientStatut,
  type MeasurementField,
} from "@/lib/mock/admin-data";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/storage";
import { createClientAccount, deleteClientAccount } from "./actions";
import { ClientDetail } from "./ClientDetail";

type Filter = "all" | ClientStatut;

function dbRowToClient(row: {
  id: string; nom: string; email: string; telephone: string | null; programme: string | null;
  statut: "actif" | "en_pause" | "archivé"; progression_globale: number; notes_internes: string | null;
  taille_cm: number | null; poids_depart: number | null; poids_actuel: number | null; poids_objectif: number | null;
  mensuration_champs_actifs: string[];
}): Client {
  return {
    id: row.id,
    initials: initials(row.nom),
    name: row.nom,
    email: row.email,
    phone: row.telephone ?? "",
    program: row.programme ?? "",
    status: clientStatusFromDb(row.statut),
    progress: row.progression_globale,
    lastSession: "—",
    sessions: 0,
    notes: row.notes_internes ?? "",
    goals: [],
    workouts: [],
    physique: { height: row.taille_cm, startWeight: row.poids_depart, currentWeight: row.poids_actuel, targetWeight: row.poids_objectif },
    nutritionFile: null,
    measurementFields: row.mensuration_champs_actifs,
    measurements: [],
    photos: [],
    healthQuestions: [],
  };
}

export default function AdminClientsPage() {
  const router = useRouter();
  const showToast = useToast();

  const [clients, setClients] = useState<Client[]>(isSupabaseConfigured ? [] : clientsSeed);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [coachId, setCoachId] = useState<string | null>(null);
  const [nextClientId, setNextClientId] = useState(7);
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailLoadedFor, setDetailLoadedFor] = useState<string | null>(null);

  const [measurementCatalog, setMeasurementCatalog] = useState(measurementCatalogSeed);

  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formProgram, setFormProgram] = useState("");
  const [formStatus, setFormStatus] = useState<ClientStatut>("Actif");
  const [formNotes, setFormNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [tempPasswordInfo, setTempPasswordInfo] = useState<{ email: string; password: string } | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    (async () => {
      const supabase = createSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      setCoachId(user.id);

      const [clientsRes, fieldsRes] = await Promise.all([
        supabase.from("clients").select("*").eq("coach_id", user.id).order("created_at", { ascending: true }),
        supabase.from("measurement_fields").select("*").eq("coach_id", user.id),
      ]);
      if (cancelled) return;

      if (clientsRes.error) {
        showToast("Impossible de charger les clients.");
      } else if (clientsRes.data) {
        setClients(clientsRes.data.map(dbRowToClient));
      }
      if (fieldsRes.data && fieldsRes.data.length) {
        setMeasurementCatalog(fieldsRes.data.map((f) => ({ key: f.cle, label: f.libelle, unit: f.unite })));
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addCustomField(field: MeasurementField) {
    setMeasurementCatalog((prev) => [...prev, field]);
  }

  function updateClient(id: string, updater: (c: Client) => Client) {
    setClients((prev) => prev.map((c) => (c.id === id ? updater(c) : c)));
  }

  async function loadClientDetail(id: string) {
    if (!isSupabaseConfigured || detailLoadedFor === id) return;
    const supabase = createSupabaseClient();

    const [goalsRes, workoutsRes, measurementsRes, photosRes, healthRes, nutritionRes] = await Promise.all([
      supabase.from("goals").select("*").eq("client_id", id).order("created_at"),
      supabase.from("workouts").select("*").eq("client_id", id).order("created_at"),
      supabase.from("measurements").select("*").eq("client_id", id).order("date", { ascending: false }),
      supabase.from("client_photos").select("*").eq("client_id", id).order("date", { ascending: false }),
      supabase.from("health_questions").select("*").eq("client_id", id).order("ordre"),
      supabase.from("nutrition_files").select("*").eq("client_id", id).maybeSingle(),
    ]);

    const workoutRows = workoutsRes.data ?? [];
    const workoutIds = workoutRows.map((w) => w.id);
    const weRes = workoutIds.length
      ? await supabase.from("workout_exercises").select("*").in("workout_id", workoutIds).order("ordre")
      : { data: [] as { workout_id: string; exercise_id: string | null; nom_libre: string | null; series_repetitions: string | null }[] };
    const weRows = weRes.data ?? [];
    const exerciseIds = [...new Set(weRows.map((w) => w.exercise_id).filter((v): v is string => Boolean(v)))];
    const exRes = exerciseIds.length ? await supabase.from("exercises").select("id, nom").in("id", exerciseIds) : { data: [] };
    const exerciseNameById = new Map((exRes.data ?? []).map((e) => [e.id, e.nom]));

    updateClient(id, (c) => ({
      ...c,
      goals: (goalsRes.data ?? []).map((g) => ({ id: g.id, title: g.titre, progress: g.progression })),
      workouts: workoutRows.map((w) => ({
        id: w.id,
        name: w.nom,
        day: w.jour ?? "",
        week: w.semaine_cycle,
        comment: w.commentaire ?? "",
        exercises: weRows
          .filter((we) => we.workout_id === w.id)
          .map((we) => ({
            name: we.exercise_id ? exerciseNameById.get(we.exercise_id) ?? "" : we.nom_libre ?? "",
            sets: we.series_repetitions ?? "",
          })),
      })),
      measurements: (measurementsRes.data ?? []).map((m) => ({ id: m.id, date: m.date, values: m.valeurs as Record<string, number | string> })),
      photos: (photosRes.data ?? []).map((p) => ({ id: p.id, name: p.nom_fichier, date: p.date })),
      healthQuestions: (healthRes.data ?? []).map((q) => ({
        id: q.id,
        label: q.libelle,
        type: q.type === "choix" ? "select" : q.type === "texte_long" ? "textarea" : "text",
        options: q.options ?? undefined,
        value: q.valeur ?? "",
      })),
      nutritionFile: nutritionRes.data ? { name: nutritionRes.data.nom_fichier, url: nutritionRes.data.url } : null,
    }));
    setDetailLoadedFor(id);
  }

  function openClient(id: string) {
    setSelectedId(id);
    loadClientDetail(id);
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

  function openEditModal(id: string) {
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

  async function submitClientForm(e: React.FormEvent) {
    e.preventDefault();
    const name = formName.trim();
    const email = formEmail.trim();
    if (!name || !email) return;

    if (!isSupabaseConfigured) {
      if (editingId) {
        updateClient(editingId, (c) => ({ ...c, name, email, phone: formPhone.trim(), program: formProgram, status: formStatus, notes: formNotes.trim(), initials: initials(name) }));
        showToast("Client mis à jour");
      } else {
        const newClient: Client = {
          id: String(nextClientId),
          initials: initials(name),
          name, email, phone: formPhone.trim(), program: formProgram, status: formStatus, notes: formNotes.trim(),
          progress: 0, lastSession: "—", sessions: 0,
          goals: [], workouts: [],
          physique: { height: null, startWeight: null, currentWeight: null, targetWeight: null },
          nutritionFile: null,
          measurementFields: ["weight", "waist", "chest", "arm", "thigh"],
          measurements: [], photos: [],
          healthQuestions: defaultHealthQuestions(),
        };
        setClients((prev) => [...prev, newClient]);
        setNextClientId((n) => n + 1);
        showToast("Client ajouté");
      }
      setClientModalOpen(false);
      return;
    }

    setSaving(true);
    if (editingId) {
      const supabase = createSupabaseClient();
      const { data, error } = await supabase
        .from("clients")
        .update({
          nom: name, email, telephone: formPhone.trim(), programme: formProgram,
          statut: clientStatusToDb(formStatus), notes_internes: formNotes.trim(),
        })
        .eq("id", editingId)
        .select()
        .single();
      setSaving(false);
      if (error || !data) {
        showToast("Impossible de mettre à jour le client.");
        return;
      }
      updateClient(editingId, (c) => ({ ...c, name, email, phone: formPhone.trim(), program: formProgram, status: formStatus, notes: formNotes.trim(), initials: initials(name) }));
      showToast("Client mis à jour");
      setClientModalOpen(false);
      return;
    }

    const result = await createClientAccount({
      name, email, phone: formPhone.trim(), program: formProgram, status: clientStatusToDb(formStatus), notes: formNotes.trim(),
    });
    setSaving(false);
    if (result.error || !result.client) {
      showToast(result.error ?? "Impossible de créer le client.");
      return;
    }
    setClients((prev) => [...prev, dbRowToClient(result.client)]);
    setClientModalOpen(false);
    if (result.tempPassword) {
      setTempPasswordInfo({ email, password: result.tempPassword });
    }
    showToast("Client ajouté");
  }

  async function archiveClient(id: string) {
    const c = clients.find((x) => x.id === id);
    if (!c) return;
    const newStatus: ClientStatut = c.status === "Archivé" ? "Actif" : "Archivé";

    if (isSupabaseConfigured) {
      const supabase = createSupabaseClient();
      const { error } = await supabase.from("clients").update({ statut: clientStatusToDb(newStatus) }).eq("id", id);
      if (error) {
        showToast("Impossible de mettre à jour le statut.");
        return;
      }
    }
    updateClient(id, (x) => ({ ...x, status: newStatus }));
    showToast(newStatus === "Archivé" ? "Client archivé" : "Client réactivé");
  }

  async function confirmDelete() {
    if (pendingDeleteId === null) return;
    if (isSupabaseConfigured) {
      const result = await deleteClientAccount(pendingDeleteId);
      if (result.error) {
        showToast("Impossible de supprimer le client.");
        return;
      }
    }
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
            {!editingId && isSupabaseConfigured && (
              <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
                Un compte de connexion sera créé automatiquement pour ce client, avec un mot de passe temporaire à lui transmettre.
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={() => setClientModalOpen(false)}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Enregistrement…" : editingId ? "Enregistrer les modifications" : "Ajouter le client"}
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
        {loading && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "50px 20px", color: "var(--text-muted)", fontSize: 13.5 }}>
            Chargement…
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "50px 20px", color: "var(--text-muted)", fontSize: 13.5 }}>
            Aucun client dans cette catégorie.
          </div>
        )}
        {filtered.map((c) => (
          <div className={`client-card${c.status === "Archivé" ? " is-archived" : ""}`} key={c.id}>
            <div className="client-top" style={{ cursor: "pointer" }} onClick={() => openClient(c.id)}>
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
              onClick={() => openClient(c.id)}
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

      <Modal open={tempPasswordInfo !== null} onClose={() => setTempPasswordInfo(null)} title="Compte client créé" small>
        <div className="modal-body">
          <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.5 }}>
            Transmets ces identifiants à ton client — ce mot de passe ne sera plus jamais affiché. Il pourra le changer depuis son espace.
          </p>
          <div style={{ background: "var(--bg-surface-2)", border: "1px solid var(--border-subtle)", borderRadius: 10, padding: "12px 14px", fontFamily: "var(--font-jetbrains-mono)", fontSize: 13 }}>
            <div>Email : {tempPasswordInfo?.email}</div>
            <div style={{ marginTop: 4 }}>Mot de passe : {tempPasswordInfo?.password}</div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-primary" type="button" onClick={() => setTempPasswordInfo(null)}>
            J&apos;ai noté les identifiants
          </button>
        </div>
      </Modal>
    </PageShell>
  );
}
