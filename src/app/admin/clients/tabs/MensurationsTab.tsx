"use client";

import { useState } from "react";
import { Modal } from "@/components/shared/Modal";
import { useToast } from "@/components/shared/ToastProvider";
import { formatDateShort, type Client, type MeasurementField } from "@/lib/mock/admin-data";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured, STORAGE_BUCKET } from "@/lib/supabase/storage";

export function MensurationsTab({
  client,
  onUpdate,
  measurementCatalog,
  onAddCustomField,
}: {
  client: Client;
  onUpdate: (updater: (c: Client) => Client) => void;
  measurementCatalog: MeasurementField[];
  onAddCustomField: (field: MeasurementField) => void;
}) {
  const showToast = useToast();
  const fields = client.measurementFields.map((key) => measurementCatalog.find((f) => f.key === key)).filter(Boolean) as MeasurementField[];

  const [measureOpen, setMeasureOpen] = useState(false);
  const [measureDate, setMeasureDate] = useState("");
  const [measureValues, setMeasureValues] = useState<Record<string, string>>({});
  const [savingMeasure, setSavingMeasure] = useState(false);

  const [fieldsOpen, setFieldsOpen] = useState(false);
  const [checkedKeys, setCheckedKeys] = useState<string[]>(client.measurementFields);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldUnit, setNewFieldUnit] = useState("");

  const [photoFiles, setPhotoFiles] = useState<FileList | null>(null);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  function openMeasureModal() {
    setMeasureDate(new Date().toISOString().split("T")[0]!);
    setMeasureValues({});
    setMeasureOpen(true);
  }

  async function submitMeasure(e: React.FormEvent) {
    e.preventDefault();
    const values: Record<string, string> = {};
    for (const f of fields) {
      const v = measureValues[f.key];
      if (v !== undefined && v !== "") values[f.key] = v;
    }

    if (!isSupabaseConfigured) {
      onUpdate((c) => ({ ...c, measurements: [{ id: crypto.randomUUID(), date: formatDateShort(measureDate), values }, ...c.measurements] }));
      setMeasureOpen(false);
      showToast("Mesure ajoutée");
      return;
    }

    setSavingMeasure(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("measurements")
      .insert({ client_id: client.id, date: measureDate, valeurs: values })
      .select()
      .single();
    setSavingMeasure(false);
    if (error || !data) {
      showToast("Impossible d'ajouter la mesure.");
      return;
    }
    onUpdate((c) => ({ ...c, measurements: [{ id: data.id, date: formatDateShort(data.date), values: data.valeurs as Record<string, number | string> }, ...c.measurements] }));
    setMeasureOpen(false);
    showToast("Mesure ajoutée");
  }

  async function deleteMeasurement(id: string) {
    if (isSupabaseConfigured) {
      const supabase = createClient();
      const { error } = await supabase.from("measurements").delete().eq("id", id);
      if (error) {
        showToast("Impossible de supprimer la mesure.");
        return;
      }
    }
    onUpdate((c) => ({ ...c, measurements: c.measurements.filter((m) => m.id !== id) }));
    showToast("Mesure supprimée");
  }

  function openFieldsModal() {
    setCheckedKeys(client.measurementFields);
    setFieldsOpen(true);
  }

  function toggleKey(key: string) {
    setCheckedKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  async function addCustomField() {
    const name = newFieldName.trim();
    if (!name) return;
    const unit = newFieldUnit.trim() || "—";

    if (!isSupabaseConfigured) {
      const key = `custom_${Date.now()}`;
      onAddCustomField({ key, label: name, unit });
      setCheckedKeys((prev) => [...prev, key]);
      setNewFieldName("");
      setNewFieldUnit("");
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const key = `custom_${Date.now()}`;
    const { error } = await supabase.from("measurement_fields").insert({ coach_id: user.id, cle: key, libelle: name, unite: unit });
    if (error) {
      showToast("Impossible d'ajouter ce champ.");
      return;
    }
    onAddCustomField({ key, label: name, unit });
    setCheckedKeys((prev) => [...prev, key]);
    setNewFieldName("");
    setNewFieldUnit("");
  }

  async function saveFieldsSelection() {
    if (isSupabaseConfigured) {
      const supabase = createClient();
      const { error } = await supabase.from("clients").update({ mensuration_champs_actifs: checkedKeys }).eq("id", client.id);
      if (error) {
        showToast("Impossible d'enregistrer la sélection.");
        return;
      }
    }
    onUpdate((c) => ({ ...c, measurementFields: checkedKeys }));
    setFieldsOpen(false);
    showToast("Champs de mensuration mis à jour");
  }

  async function addPhotos() {
    if (!photoFiles || photoFiles.length === 0) {
      showToast("Sélectionnez au moins une photo");
      return;
    }
    const dateLabel = formatDateShort(new Date().toISOString().split("T")[0]!);

    if (!isSupabaseConfigured) {
      const newPhotos = Array.from(photoFiles).map((f) => ({ id: crypto.randomUUID(), name: f.name, date: dateLabel }));
      onUpdate((c) => ({ ...c, photos: [...c.photos, ...newPhotos] }));
      setPhotoFiles(null);
      showToast("Photo(s) ajoutée(s)");
      return;
    }

    setUploadingPhotos(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setUploadingPhotos(false);
      return;
    }

    const newPhotos: { id: string; name: string; date: string }[] = [];
    for (const file of Array.from(photoFiles)) {
      const path = `client-photos/${user.id}/${client.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file);
      if (uploadError) continue;
      const { data: publicUrl } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
      const { data, error } = await supabase
        .from("client_photos")
        .insert({ client_id: client.id, nom_fichier: file.name, url: publicUrl.publicUrl, auteur: "coach" })
        .select()
        .single();
      if (!error && data) newPhotos.push({ id: data.id, name: data.nom_fichier, date: dateLabel });
    }
    setUploadingPhotos(false);

    if (newPhotos.length === 0) {
      showToast("Échec de l'envoi des photos.");
      return;
    }
    onUpdate((c) => ({ ...c, photos: [...c.photos, ...newPhotos] }));
    setPhotoFiles(null);
    showToast("Photo(s) ajoutée(s)");
  }

  async function deletePhoto(id: string) {
    if (isSupabaseConfigured) {
      const supabase = createClient();
      const { error } = await supabase.from("client_photos").delete().eq("id", id);
      if (error) {
        showToast("Impossible de supprimer la photo.");
        return;
      }
    }
    onUpdate((c) => ({ ...c, photos: c.photos.filter((p) => p.id !== id) }));
    showToast("Photo supprimée");
  }

  return (
    <>
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-header">
          <h3>Mesures corporelles</h3>
          <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
            <button className="btn btn-ghost btn-sm" type="button" onClick={openFieldsModal}>
              Personnaliser les champs
            </button>
            <button className="btn btn-primary btn-sm" type="button" onClick={openMeasureModal}>
              + Ajouter une mesure
            </button>
          </div>
        </div>
        <div className="card-body">
          <table className="measure-table">
            <thead>
              <tr>
                <th>Date</th>
                {fields.map((f) => (
                  <th key={f.key}>{f.label}</th>
                ))}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {client.measurements.length === 0 && (
                <tr>
                  <td colSpan={fields.length + 2} style={{ textAlign: "center", color: "var(--text-muted)", padding: "24px 0" }}>
                    Aucune mesure enregistrée.
                  </td>
                </tr>
              )}
              {client.measurements.map((m) => (
                <tr key={m.id}>
                  <td>{m.date}</td>
                  {fields.map((f) => (
                    <td key={f.key}>{m.values[f.key] !== undefined && m.values[f.key] !== "" ? `${m.values[f.key]} ${f.unit}` : "—"}</td>
                  ))}
                  <td>
                    <button className="icon-action danger" type="button" onClick={() => deleteMeasurement(m.id)}>
                      <svg className="icon" viewBox="0 0 24 24" style={{ width: 13, height: 13 }}>
                        <path d="M4 6h16M9 6V4h6v2M6 6l1 14h10l1-14" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Photos de suivi</h3>
        </div>
        <div className="card-body">
          <div className="photo-grid">
            {client.photos.length === 0 && (
              <div style={{ color: "var(--text-muted)", fontSize: 12.5, padding: "6px 0 16px" }}>
                Aucune photo de suivi pour le moment.
              </div>
            )}
            {client.photos.map((p) => (
              <div className="photo-chip" key={p.id}>
                <button className="icon-action danger" type="button" onClick={() => deletePhoto(p.id)}>
                  <svg className="icon" viewBox="0 0 24 24" style={{ width: 12, height: 12 }}>
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
                <svg className="icon" viewBox="0 0 24 24" style={{ width: 20, height: 20, margin: "4px auto 8px", display: "block", color: "var(--text-muted)" }}>
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <circle cx="9" cy="10" r="1.5" />
                  <path d="M21 16l-5-5-4 4-3-3-5 5" />
                </svg>
                <div style={{ fontSize: 10.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>{p.date}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              type="file"
              accept="image/*"
              multiple
              style={{ flex: 1, minWidth: 200, background: "var(--bg-surface-2)", border: "1px solid var(--border-subtle)", borderRadius: 10, padding: "9px 12px", color: "var(--text-primary)", fontSize: 12.5 }}
              onChange={(e) => setPhotoFiles(e.target.files)}
            />
            <button className="btn btn-primary btn-sm" type="button" onClick={addPhotos} disabled={uploadingPhotos}>
              {uploadingPhotos ? "Envoi…" : "Ajouter des photos"}
            </button>
          </div>
        </div>
      </div>

      <Modal open={measureOpen} onClose={() => setMeasureOpen(false)} title="Ajouter une mesure">
        <form onSubmit={submitMeasure}>
          <div className="modal-body">
            <div className="form-group">
              <label>Date</label>
              <input type="date" required value={measureDate} onChange={(e) => setMeasureDate(e.target.value)} />
            </div>
            <div className="form-grid">
              {fields.length === 0 && (
                <div className="form-group full" style={{ color: "var(--text-muted)", fontSize: 12.5 }}>
                  Aucun champ actif — cliquez sur &quot;Personnaliser les champs&quot; pour en choisir.
                </div>
              )}
              {fields.map((f) => (
                <div className="form-group" key={f.key}>
                  <label>
                    {f.label} ({f.unit})
                  </label>
                  <input
                    type="number"
                    step={0.1}
                    value={measureValues[f.key] ?? ""}
                    onChange={(e) => setMeasureValues((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={() => setMeasureOpen(false)}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={savingMeasure}>
              {savingMeasure ? "Ajout…" : "Ajouter la mesure"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={fieldsOpen} onClose={() => setFieldsOpen(false)} title="Personnaliser les mensurations" small>
        <div className="modal-body">
          <label style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600 }}>Champs à afficher pour ce client</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8, maxHeight: 220, overflowY: "auto" }}>
            {measurementCatalog.map((f) => (
              <label className="exercise-check" style={{ width: "100%", justifyContent: "flex-start", boxSizing: "border-box" }} key={f.key}>
                <input type="checkbox" checked={checkedKeys.includes(f.key)} onChange={() => toggleKey(f.key)} /> {f.label} ({f.unit})
              </label>
            ))}
          </div>
          <div style={{ marginTop: 18, borderTop: "1px solid var(--border-subtle)", paddingTop: 16 }}>
            <label style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600 }}>Ajouter un champ personnalisé</label>
            <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
              <input
                type="text"
                placeholder="Nom (ex : Tour de mollet)"
                style={{ flex: 1, minWidth: 140, background: "var(--bg-surface-2)", border: "1px solid var(--border-subtle)", borderRadius: 10, padding: "9px 10px", color: "var(--text-primary)", fontSize: 12.5 }}
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Unité"
                style={{ width: 80, background: "var(--bg-surface-2)", border: "1px solid var(--border-subtle)", borderRadius: 10, padding: "9px 10px", color: "var(--text-primary)", fontSize: 12.5 }}
                value={newFieldUnit}
                onChange={(e) => setNewFieldUnit(e.target.value)}
              />
              <button type="button" className="btn btn-ghost btn-sm" onClick={addCustomField}>
                Ajouter
              </button>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" type="button" onClick={() => setFieldsOpen(false)}>
            Annuler
          </button>
          <button className="btn btn-primary" type="button" onClick={saveFieldsSelection}>
            Enregistrer
          </button>
        </div>
      </Modal>
    </>
  );
}
