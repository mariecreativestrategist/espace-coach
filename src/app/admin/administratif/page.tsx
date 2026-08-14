"use client";

import { useState } from "react";
import { PageShell } from "@/components/shared/PageShell";
import { Modal } from "@/components/shared/Modal";
import { useToast } from "@/components/shared/ToastProvider";
import {
  invoicesSeed,
  clientsSeed,
  formatDateFR,
  formatEuro,
  invStatusClass,
  invStatusLabel,
  type Invoice,
  type InvoiceStatus,
} from "@/lib/mock/admin-data";

const services = [
  "Abonnement mensuel",
  "Abonnement trimestriel",
  "Pack 10 séances",
  "Bilan + programme initial",
  "Séance à l'unité",
  "Personnalisé",
];

type AttachType = "none" | "file" | "link";

export default function AdminAdministratifPage() {
  const showToast = useToast();
  const [invoices, setInvoices] = useState(invoicesSeed);
  const [counter, setCounter] = useState(144);
  const [modalOpen, setModalOpen] = useState(false);

  const [client, setClient] = useState("");
  const [service, setService] = useState(services[0]!);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState<InvoiceStatus>("attente");
  const [attachType, setAttachType] = useState<AttachType>("none");
  const [attachFile, setAttachFile] = useState<File | null>(null);
  const [attachLink, setAttachLink] = useState("");

  const total = invoices.reduce((s, i) => s + i.amount, 0);
  const paid = invoices.filter((i) => i.status === "payee").reduce((s, i) => s + i.amount, 0);
  const pending = invoices.filter((i) => i.status === "attente").reduce((s, i) => s + i.amount, 0);
  const late = invoices.filter((i) => i.status === "retard").reduce((s, i) => s + i.amount, 0);

  function openModal() {
    setClient("");
    setService(services[0]!);
    setAmount("");
    setDate(new Date().toISOString().split("T")[0]!);
    setStatus("attente");
    setAttachType("none");
    setAttachFile(null);
    setAttachLink("");
    setModalOpen(true);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!client.trim() || !amount || !date) return;
    let attachment: Invoice["attachment"] = null;
    if (attachType === "file" && attachFile) attachment = { type: "file", label: attachFile.name };
    else if (attachType === "link" && attachLink.trim()) attachment = { type: "link", label: attachLink.trim() };
    const newInvoice: Invoice = {
      id: `0${counter + 1}`,
      client: client.trim(),
      service,
      date: formatDateFR(date),
      amount: parseFloat(amount),
      status,
      attachment,
    };
    setInvoices((prev) => [newInvoice, ...prev]);
    setCounter((c) => c + 1);
    setModalOpen(false);
    showToast("Facture créée");
  }

  return (
    <PageShell title="Administratif" subtitle="Factures, paiements et suivi comptable" search="Rechercher un client, une facture…" avatarInitials="MG">
      <div className="stat-strip">
        <div className="kpi-card">
          <div className="kpi-label">Facturé ce mois</div>
          <div className="kpi-value">{formatEuro(total)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Encaissé</div>
          <div className="kpi-value" style={{ color: "var(--accent-green)" }}>{formatEuro(paid)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">En attente</div>
          <div className="kpi-value" style={{ color: "var(--warning)" }}>{formatEuro(pending)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">En retard</div>
          <div className="kpi-value" style={{ color: "var(--danger)" }}>{formatEuro(late)}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h3>Factures</h3>
            <div className="sub">Historique des factures et paiements clients</div>
          </div>
          <button className="btn btn-primary btn-sm" type="button" style={{ marginLeft: "auto" }} onClick={openModal}>
            <svg className="icon" viewBox="0 0 24 24" style={{ width: 14, height: 14, stroke: "#07130d" }}>
              <path d="M12 5v14M5 12h14" />
            </svg>
            Créer une facture
          </button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Facture</th>
              <th>Client</th>
              <th>Prestation</th>
              <th>Date</th>
              <th>Montant</th>
              <th>Statut</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td className="invoice-id">#{inv.id}</td>
                <td>{inv.client}</td>
                <td>{inv.service}</td>
                <td>{inv.date}</td>
                <td className="amount">{inv.amount}€</td>
                <td>
                  <span className={`badge ${invStatusClass(inv.status)}`}>{invStatusLabel(inv.status)}</span>
                </td>
                <td style={{ display: "flex", gap: 6 }}>
                  {inv.attachment?.type === "link" && (
                    <button
                      className="icon-action"
                      type="button"
                      title={inv.attachment.label}
                      onClick={() => window.open(inv.attachment!.label, "_blank")}
                    >
                      <svg className="icon" viewBox="0 0 24 24" style={{ width: 14, height: 14 }}>
                        <path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1" />
                        <path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1" />
                      </svg>
                    </button>
                  )}
                  {inv.attachment?.type === "file" && (
                    <button
                      className="icon-action"
                      type="button"
                      title={inv.attachment.label}
                      onClick={() => showToast(`Fichier joint : ${inv.attachment!.label}`)}
                    >
                      <svg className="icon" viewBox="0 0 24 24" style={{ width: 14, height: 14 }}>
                        <path d="M21.4 11.1l-8.5 8.5a4.5 4.5 0 01-6.4-6.4l8.5-8.5a3 3 0 014.2 4.2L10.6 17.5a1.5 1.5 0 01-2.1-2.1l7.1-7.1" />
                      </svg>
                    </button>
                  )}
                  <button className="icon-action" type="button" onClick={() => showToast(`Téléchargement de la facture #${inv.id}`)}>
                    <svg className="icon" viewBox="0 0 24 24" style={{ width: 14, height: 14 }}>
                      <path d="M12 5v14M5 12l7 7 7-7" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Créer une facture">
        <form onSubmit={submit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Client</label>
              <input
                type="text"
                list="clientNamesListFacture"
                placeholder="Ex : Lisa Carion"
                required
                value={client}
                onChange={(e) => setClient(e.target.value)}
              />
              <datalist id="clientNamesListFacture">
                {clientsSeed.map((c) => (
                  <option value={c.name} key={c.id} />
                ))}
              </datalist>
            </div>
            <div className="form-group">
              <label>Prestation</label>
              <select value={service} onChange={(e) => setService(e.target.value)}>
                {services.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Montant (€)</label>
                <input type="number" min={0} step={0.01} placeholder="89" required value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>Statut</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as InvoiceStatus)}>
                <option value="attente">En attente</option>
                <option value="payee">Payée</option>
                <option value="retard">En retard</option>
              </select>
            </div>
            <div className="form-group">
              <label>Justificatif</label>
              <select value={attachType} onChange={(e) => setAttachType(e.target.value as AttachType)}>
                <option value="none">Aucun</option>
                <option value="file">Joindre un fichier</option>
                <option value="link">Ajouter un lien</option>
              </select>
            </div>
            {attachType === "file" && (
              <div className="form-group">
                <label>Fichier</label>
                <input type="file" onChange={(e) => setAttachFile(e.target.files?.[0] ?? null)} />
              </div>
            )}
            {attachType === "link" && (
              <div className="form-group">
                <label>Lien</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/…"
                  value={attachLink}
                  onChange={(e) => setAttachLink(e.target.value)}
                />
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary">
              Créer la facture
            </button>
          </div>
        </form>
      </Modal>
    </PageShell>
  );
}
