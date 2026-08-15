"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/storage";

function toInitials(name: string): string {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("");
}

export interface CurrentClient {
  id: string;
  coachId: string;
  name: string;
  initials: string;
  email: string;
  program: string;
  coachName: string;
  coachInitials: string;
  physique: { height: number | null; startWeight: number | null; currentWeight: number | null; targetWeight: number | null };
  measurementFields: string[];
}

/**
 * Résout le client actuellement connecté (via son auth_user_id) et le nom
 * de son coach. Utilisé par toutes les pages de l'espace client pour
 * savoir "qui je suis" avant d'aller chercher ses données spécifiques.
 * Ne fait rien si Supabase n'est pas configuré (mode démo).
 */
export function useCurrentClient() {
  const [client, setClient] = useState<CurrentClient | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      const { data: row } = await supabase.from("clients").select("*").eq("auth_user_id", user.id).single();
      if (!row || cancelled) return;

      const { data: coach } = await supabase.from("coaches").select("nom").eq("id", row.coach_id).single();
      if (cancelled) return;

      setClient({
        id: row.id,
        coachId: row.coach_id,
        name: row.nom,
        initials: toInitials(row.nom),
        email: row.email,
        program: row.programme ?? "",
        coachName: coach?.nom ?? "Ton coach",
        coachInitials: toInitials(coach?.nom ?? "Coach"),
        physique: { height: row.taille_cm, startWeight: row.poids_depart, currentWeight: row.poids_actuel, targetWeight: row.poids_objectif },
        measurementFields: row.mensuration_champs_actifs,
      });
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { client, loading };
}
