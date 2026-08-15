"use client";

import { useState } from "react";
import { useToast } from "@/components/shared/ToastProvider";
import type { Client } from "@/lib/mock/admin-data";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured, STORAGE_BUCKET } from "@/lib/supabase/storage";

export function AlimentationTab({
  client,
  onUpdate,
}: {
  client: Client;
  onUpdate: (updater: (c: Client) => Client) => void;
}) {
  const showToast = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!file) {
      showToast("Sélectionnez un fichier PDF");
      return;
    }

    if (!isSupabaseConfigured) {
      onUpdate((c) => ({ ...c, nutritionFile: { name: file.name } }));
      setFile(null);
      showToast("Plan alimentaire importé");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      return;
    }

    const path = `nutrition-files/${user.id}/${client.id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file);
    if (uploadError) {
      setSaving(false);
      showToast("Échec de l'envoi du fichier.");
      return;
    }
    const { data: publicUrl } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);

    await supabase.from("nutrition_files").delete().eq("client_id", client.id);
    const { error: insertError } = await supabase
      .from("nutrition_files")
      .insert({ client_id: client.id, nom_fichier: file.name, url: publicUrl.publicUrl });
    setSaving(false);
    if (insertError) {
      showToast("Impossible d'enregistrer le fichier.");
      return;
    }

    onUpdate((c) => ({ ...c, nutritionFile: { name: file.name, url: publicUrl.publicUrl } }));
    setFile(null);
    showToast("Plan alimentaire importé");
  }

  async function remove() {
    if (isSupabaseConfigured) {
      const supabase = createClient();
      const { error } = await supabase.from("nutrition_files").delete().eq("client_id", client.id);
      if (error) {
        showToast("Impossible de supprimer le fichier.");
        return;
      }
    }
    onUpdate((c) => ({ ...c, nutritionFile: null }));
    showToast("Plan alimentaire supprimé");
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3>Plan alimentaire</h3>
      </div>
      <div className="card-body">
        {client.nutritionFile ? (
          <div style={{ display: "flex", alignItems: "center", gap: 14, background: "var(--bg-surface-2)", border: "1px solid var(--border-subtle)", borderRadius: 12, padding: "16px 18px", flexWrap: "wrap" }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--grad-soft)", border: "1px solid rgba(var(--accent-green-rgb), .25)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-green)", flexShrink: 0 }}>
              <svg className="icon" viewBox="0 0 24 24" style={{ width: 18, height: 18 }}>
                <path d="M6 2h9l3 3v17H6z" strokeLinejoin="round" />
                <path d="M9.5 12h5M9.5 15.5h5M9.5 8.5h2" />
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {client.nutritionFile.name}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>Fichier PDF importé</div>
            </div>
            {client.nutritionFile.url ? (
              <a className="btn btn-ghost btn-sm" href={client.nutritionFile.url} target="_blank" rel="noreferrer">
                Consulter
              </a>
            ) : (
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => showToast(`Ouverture de ${client.nutritionFile!.name}`)}>
                Consulter
              </button>
            )}
            <button className="icon-action danger" type="button" onClick={remove}>
              <svg className="icon" viewBox="0 0 24 24" style={{ width: 14, height: 14 }}>
                <path d="M4 6h16M9 6V4h6v2M6 6l1 14h10l1-14" />
              </svg>
            </button>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "36px 20px", color: "var(--text-muted)" }}>
            <svg className="icon" viewBox="0 0 24 24" style={{ width: 32, height: 32, margin: "0 auto 12px", display: "block" }}>
              <path d="M6 2h9l3 3v17H6z" strokeLinejoin="round" />
              <path d="M9.5 12h5M9.5 15.5h5M9.5 8.5h2" />
            </svg>
            <div style={{ fontSize: 13 }}>Aucun plan alimentaire importé pour le moment.</div>
          </div>
        )}
        <div style={{ marginTop: client.nutritionFile ? 18 : 8 }}>
          {client.nutritionFile && (
            <label style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600 }}>Remplacer le fichier</label>
          )}
          <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
            <input
              type="file"
              accept="application/pdf"
              style={{ flex: 1, minWidth: 200, background: "var(--bg-surface-2)", border: "1px solid var(--border-subtle)", borderRadius: 10, padding: "9px 12px", color: "var(--text-primary)", fontSize: 12.5 }}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <button className="btn btn-primary btn-sm" type="button" onClick={save} disabled={saving}>
              {saving ? "Envoi…" : client.nutritionFile ? "Importer" : "Importer le fichier"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
