"use client";

import { useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/shared/PageShell";
import { Modal } from "@/components/shared/Modal";
import { useToast } from "@/components/shared/ToastProvider";
import { exercisesSeed, type ExerciseItem, type ExerciseMedia } from "@/lib/mock/admin-data";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured, STORAGE_BUCKET } from "@/lib/supabase/storage";

const muscleGroups = ["Jambes", "Dos", "Pectoraux", "Épaules", "Bras", "Core", "Cardio", "Full Body"];

function mediaTypeToDb(type: "video" | "image"): "vidéo" | "photo" {
  return type === "video" ? "vidéo" : "photo";
}
function mediaTypeFromDb(type: string | null): "video" | "image" | null {
  if (type === "vidéo") return "video";
  if (type === "photo") return "image";
  return null;
}

export default function AdminExercicesPage() {
  const showToast = useToast();
  const [exercises, setExercises] = useState<ExerciseItem[]>(isSupabaseConfigured ? [] : exercisesSeed);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [coachId, setCoachId] = useState<string | null>(null);
  const [nextId, setNextId] = useState(11);
  const [filter, setFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [group, setGroup] = useState(muscleGroups[0]!);
  const [description, setDescription] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      setCoachId(user.id);
      const { data, error } = await supabase
        .from("exercises")
        .select("*")
        .eq("coach_id", user.id)
        .order("created_at", { ascending: true });
      if (cancelled) return;
      if (error) {
        showToast("Impossible de charger les exercices.");
      } else if (data) {
        setExercises(
          data.map((row) => ({
            id: row.id as unknown as number,
            name: row.nom,
            group: row.groupe_musculaire,
            description: row.consignes ?? "",
            media: row.media_url
              ? { type: mediaTypeFromDb(row.media_type) ?? "image", name: row.media_url }
              : null,
          })),
        );
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const groups = useMemo(() => [...new Set(exercises.map((e) => e.group))], [exercises]);
  const filtered = filter === "all" ? exercises : exercises.filter((e) => e.group === filter);

  function openModal() {
    setName("");
    setGroup(muscleGroups[0]!);
    setDescription("");
    setMediaFile(null);
    setModalOpen(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    if (!isSupabaseConfigured) {
      let media: ExerciseMedia = null;
      if (mediaFile) {
        media = { type: mediaFile.type.startsWith("video") ? "video" : "image", name: mediaFile.name };
      }
      setExercises((prev) => [...prev, { id: nextId, name: trimmed, group, description: description.trim(), media }]);
      setNextId((n) => n + 1);
      setModalOpen(false);
      showToast("Exercice ajouté à la bibliothèque");
      return;
    }

    if (!coachId) return;
    setSaving(true);
    const supabase = createClient();

    let mediaUrl: string | null = null;
    let mediaType: "vidéo" | "photo" | null = null;
    if (mediaFile) {
      const path = `exercises/${coachId}/${Date.now()}-${mediaFile.name}`;
      const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(path, mediaFile);
      if (uploadError) {
        showToast("Échec de l'upload du média.");
        setSaving(false);
        return;
      }
      const { data: publicUrl } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
      mediaUrl = publicUrl.publicUrl;
      mediaType = mediaTypeToDb(mediaFile.type.startsWith("video") ? "video" : "image");
    }

    const { data, error } = await supabase
      .from("exercises")
      .insert({
        coach_id: coachId,
        nom: trimmed,
        groupe_musculaire: group,
        consignes: description.trim(),
        media_url: mediaUrl,
        media_type: mediaType,
      })
      .select()
      .single();

    setSaving(false);
    if (error || !data) {
      showToast("Impossible d'ajouter l'exercice.");
      return;
    }

    setExercises((prev) => [
      ...prev,
      {
        id: data.id as unknown as number,
        name: data.nom,
        group: data.groupe_musculaire,
        description: data.consignes ?? "",
        media: data.media_url ? { type: mediaTypeFromDb(data.media_type) ?? "image", name: data.media_url } : null,
      },
    ]);
    setModalOpen(false);
    showToast("Exercice ajouté à la bibliothèque");
  }

  async function deleteExercise(id: number) {
    if (isSupabaseConfigured) {
      const supabase = createClient();
      const { error } = await supabase.from("exercises").delete().eq("id", id as unknown as string);
      if (error) {
        showToast("Impossible de supprimer l'exercice.");
        return;
      }
    }
    setExercises((prev) => prev.filter((e) => e.id !== id));
    showToast("Exercice supprimé");
  }

  function openMedia(ex: ExerciseItem) {
    if (isSupabaseConfigured && ex.media && /^https?:\/\//.test(ex.media.name)) {
      window.open(ex.media.name, "_blank");
    } else if (ex.media) {
      showToast(`Aperçu : ${ex.media.name}`);
    }
  }

  return (
    <PageShell title="Bibliothèque d'exercices" subtitle="Vos exercices réutilisables pour créer les séances" search="Rechercher un client, une facture…" avatarInitials="MG">
      <div className="toolbar">
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div className={`filter-pill${filter === "all" ? " active" : ""}`} onClick={() => setFilter("all")}>
            Tous ({exercises.length})
          </div>
          {groups.map((g) => (
            <div
              key={g}
              className={`filter-pill${filter === g ? " active" : ""}`}
              onClick={() => setFilter(g)}
            >
              {g} ({exercises.filter((e) => e.group === g).length})
            </div>
          ))}
        </div>
        <button className="btn btn-primary" type="button" style={{ marginLeft: "auto" }} onClick={openModal}>
          <svg className="icon" viewBox="0 0 24 24" style={{ width: 15, height: 15, stroke: "#07130d" }}>
            <path d="M12 5v14M5 12h14" />
          </svg>
          Ajouter un exercice
        </button>
      </div>

      <div className="exercise-grid">
        {loading && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "50px 20px", color: "var(--text-muted)", fontSize: 13.5 }}>
            Chargement…
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "50px 20px", color: "var(--text-muted)", fontSize: 13.5 }}>
            Aucun exercice dans cette catégorie.
          </div>
        )}
        {filtered.map((ex) => (
          <div className="exercise-card" key={ex.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>{ex.name}</div>
                <span className="badge badge-muted" style={{ marginTop: 8, display: "inline-block" }}>
                  {ex.group}
                </span>
              </div>
              <button className="icon-action danger" type="button" onClick={() => deleteExercise(ex.id)}>
                <svg className="icon" viewBox="0 0 24 24" style={{ width: 14, height: 14 }}>
                  <path d="M4 6h16M9 6V4h6v2M6 6l1 14h10l1-14" />
                </svg>
              </button>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 10, lineHeight: 1.5 }}>
              {ex.description || "Aucune consigne particulière."}
            </div>
            {ex.media ? (
              <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 10 }} onClick={() => openMedia(ex)}>
                <svg className="icon" viewBox="0 0 24 24" style={{ width: 13, height: 13 }}>
                  {ex.media.type === "video" ? (
                    <>
                      <path d="M4 4h13v16H4z" strokeLinejoin="round" />
                      <path d="M17 9l4-2v10l-4-2" />
                    </>
                  ) : (
                    <>
                      <rect x="3" y="4" width="18" height="16" rx="2" />
                      <circle cx="9" cy="10" r="1.5" />
                      <path d="M21 16l-5-5-4 4-3-3-5 5" />
                    </>
                  )}
                </svg>
                {ex.media.type === "video" ? "Voir la vidéo" : "Voir la photo"}
              </button>
            ) : (
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 10 }}>Aucun média</div>
            )}
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Ajouter un exercice">
        <form onSubmit={submit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Nom de l&apos;exercice</label>
              <input type="text" placeholder="Ex : Squat bulgare" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Groupe musculaire</label>
              <select value={group} onChange={(e) => setGroup(e.target.value)}>
                {muscleGroups.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Consignes</label>
              <textarea
                placeholder="Ex : Position, amplitude, points d'attention…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Photo ou vidéo de démonstration (optionnel)</label>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => setMediaFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Ajout…" : "Ajouter l'exercice"}
            </button>
          </div>
        </form>
      </Modal>
    </PageShell>
  );
}
