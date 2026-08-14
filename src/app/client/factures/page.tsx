import { PageShell } from "@/components/shared/PageShell";
import { invoicesSeed, profile } from "@/lib/mock/client-data";

export default function ClientFacturesPage() {
  return (
    <PageShell title="Mes factures" subtitle="Historique de tes paiements" avatarInitials={profile.initials}>
      <div className="card">
        <div className="card-header">
          <h3>Factures</h3>
        </div>
        <div className="card-body">
          {invoicesSeed.map((inv) => (
            <div className="list-item" key={inv.id}>
              <div>
                <div className="list-title">
                  #{inv.id} — {inv.label}
                </div>
                <div className="list-sub">{inv.date}</div>
              </div>
              <div className="list-right" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span className="badge badge-green">Payée</span>
                <span className="mono" style={{ fontWeight: 600 }}>{inv.amount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
