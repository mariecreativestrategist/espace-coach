"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/shared/PageShell";
import { useToast } from "@/components/shared/ToastProvider";
import { healthQuestionsSeed, profile as demoProfile, type ClientHealthQuestion } from "@/lib/mock/client-data";
import { useCurrentClient } from "@/lib/hooks/useCurrentClient";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/storage";

export default function ClientQuestionnairePage() {
  const showToast = useToast();
  const { client, loading: clientLoading } = useCurrentClient();
  const [questions, setQuestions] = useState<ClientHealthQuestion[]>(isSupabaseConfigured ? [] : healthQuestionsSeed);
  const [values, setValues] = useState<Record<string, string>>(
    isSupabaseConfigured ? {} : Object.fromEntries(healthQuestionsSeed.map((q) => [q.id, q.value])),
  );
  const [loadingData, setLoadingData] = useState(isSupabaseConfigured);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured || !client) return;
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from("health_questions").select("*").eq("client_id", client.id).order("ordre");
      if (cancelled) return;
      const qs: ClientHealthQuestion[] = (data ?? []).map((q) => ({
        id: q.id,
        label: q.libelle,
        type: q.type === "choix" ? "select" : "textarea",
        options: q.options ?? undefined,
        value: q.valeur ?? "",
      }));
      setQuestions(qs);
      setValues(Object.fromEntries(qs.map((q) => [q.id, q.value])));
      setLoadingData(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [client]);

  function setValue(id: string, value: string) {
    setValues((prev) => ({ ...prev, [id]: value }));
  }

  async function save() {
    if (isSupabaseConfigured) {
      setSaving(true);
      const supabase = createClient();
      const results = await Promise.all(
        questions.map((q) => supabase.from("health_questions").update({ valeur: values[q.id] ?? q.value }).eq("id", q.id)),
      );
      setSaving(false);
      if (results.some((r) => r.error)) {
        showToast("Impossible d'enregistrer tes réponses.");
        return;
      }
    }
    showToast("Réponses enregistrées");
  }

  const initials = isSupabaseConfigured ? client?.initials ?? "" : demoProfile.initials;
  const loading = clientLoading || loadingData;

  return (
    <PageShell title="Questionnaire santé" subtitle="À tenir à jour pour ton coach" avatarInitials={initials}>
      <div className="card">
        <div className="card-header">
          <div>
            <h3>Questionnaire santé</h3>
            <div className="sub">Merci de garder ces informations à jour pour ton coach</div>
          </div>
        </div>
        <div className="card-body">
          {loading && <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Chargement…</div>}
          {!loading && questions.length === 0 && (
            <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Ton coach n&apos;a pas encore défini de questionnaire.</div>
          )}
          <div className="form-grid">
            {questions.map((q) => (
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
          {questions.length > 0 && (
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
              <button className="btn btn-primary btn-sm" type="button" onClick={save} disabled={saving}>
                {saving ? "Enregistrement…" : "Enregistrer mes réponses"}
              </button>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
