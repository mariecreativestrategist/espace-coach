"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/shared/PageShell";
import { invoicesSeed as demoInvoices, profile as demoProfile } from "@/lib/mock/client-data";
import { useCurrentClient } from "@/lib/hooks/useCurrentClient";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/storage";
import { formatDateFR, invStatusClass, invStatusLabel, type InvoiceStatus } from "@/lib/mock/admin-data";

interface InvoiceRow {
  id: string;
  label: string;
  date: string;
  amount: string;
  status: InvoiceStatus;
}

function statusFromDb(s: "payée" | "en_attente" | "en_retard"): InvoiceStatus {
  return s === "payée" ? "payee" : s === "en_retard" ? "retard" : "attente";
}

export default function ClientFacturesPage() {
  const { client, loading: clientLoading } = useCurrentClient();
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loadingData, setLoadingData] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured || !client) return;
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from("invoices").select("*").eq("client_id", client.id).order("date", { ascending: false });
      if (cancelled) return;
      setInvoices(
        (data ?? []).map((inv) => ({
          id: inv.numero,
          label: inv.prestation,
          date: formatDateFR(inv.date),
          amount: `${inv.montant}€`,
          status: statusFromDb(inv.statut),
        })),
      );
      setLoadingData(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [client]);

  const initials = isSupabaseConfigured ? client?.initials ?? "" : demoProfile.initials;
  const loading = clientLoading || loadingData;
  const displayInvoices: InvoiceRow[] = isSupabaseConfigured
    ? invoices
    : demoInvoices.map((inv) => ({ id: inv.id, label: inv.label, date: inv.date, amount: inv.amount, status: "payee" }));

  return (
    <PageShell title="Mes factures" subtitle="Historique de tes paiements" avatarInitials={initials}>
      <div className="card">
        <div className="card-header">
          <h3>Factures</h3>
        </div>
        <div className="card-body">
          {loading && <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Chargement…</div>}
          {!loading && displayInvoices.length === 0 && (
            <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Aucune facture pour le moment.</div>
          )}
          {displayInvoices.map((inv) => (
            <div className="list-item" key={inv.id}>
              <div>
                <div className="list-title">
                  #{inv.id} — {inv.label}
                </div>
                <div className="list-sub">{inv.date}</div>
              </div>
              <div className="list-right" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span className={`badge ${invStatusClass(inv.status)}`}>{invStatusLabel(inv.status)}</span>
                <span className="mono" style={{ fontWeight: 600 }}>{inv.amount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
