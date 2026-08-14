"use client";

import { useState } from "react";
import { PageShell } from "@/components/shared/PageShell";
import { useToast } from "@/components/shared/ToastProvider";
import { healthQuestionsSeed, profile } from "@/lib/mock/client-data";

export default function ClientQuestionnairePage() {
  const showToast = useToast();
  const [values, setValues] = useState<Record<number, string>>(
    Object.fromEntries(healthQuestionsSeed.map((q) => [q.id, q.value])),
  );

  function setValue(id: number, value: string) {
    setValues((prev) => ({ ...prev, [id]: value }));
  }

  function save() {
    showToast("Réponses enregistrées");
  }

  return (
    <PageShell title="Questionnaire santé" subtitle="À tenir à jour pour ton coach" avatarInitials={profile.initials}>
      <div className="card">
        <div className="card-header">
          <div>
            <h3>Questionnaire santé</h3>
            <div className="sub">Merci de garder ces informations à jour pour ton coach</div>
          </div>
        </div>
        <div className="card-body">
          <div className="form-grid">
            {healthQuestionsSeed.map((q) => (
              <div className="form-group full" key={q.id}>
                <label>{q.label}</label>
                {q.type === "select" ? (
                  <select value={values[q.id] ?? ""} onChange={(e) => setValue(q.id, e.target.value)}>
                    {(q.options ?? []).map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                ) : (
                  <textarea value={values[q.id] ?? ""} onChange={(e) => setValue(q.id, e.target.value)} />
                )}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
            <button className="btn btn-primary btn-sm" type="button" onClick={save}>
              Enregistrer mes réponses
            </button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
