"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ClientStatut as DbClientStatut } from "@/lib/supabase/database.types";

const defaultHealthQuestionsDb = [
  { libelle: "Aval médical pour le sport", type: "choix" as const, options: ["Oui", "Non", "Non renseigné"], valeur: "Non renseigné" },
  { libelle: "Fumeur", type: "choix" as const, options: ["Oui", "Non", "Non renseigné"], valeur: "Non renseigné" },
  { libelle: "Niveau d'activité avant le coaching", type: "choix" as const, options: ["Sédentaire", "Modéré", "Actif", "Non renseigné"], valeur: "Non renseigné" },
  { libelle: "Antécédents médicaux", type: "texte_long" as const, valeur: "" },
  { libelle: "Blessures actuelles ou passées", type: "texte_long" as const, valeur: "" },
  { libelle: "Traitement médical en cours", type: "texte_long" as const, valeur: "" },
  { libelle: "Contre-indications à l'effort", type: "texte_long" as const, valeur: "" },
];

const defaultMeasurementFields = [
  { cle: "weight", libelle: "Poids", unite: "kg" },
  { cle: "waist", libelle: "Tour de taille", unite: "cm" },
  { cle: "chest", libelle: "Tour de poitrine", unite: "cm" },
  { cle: "arm", libelle: "Tour de bras", unite: "cm" },
  { cle: "thigh", libelle: "Tour de cuisse", unite: "cm" },
];

/**
 * Crée un client ET son compte de connexion (Supabase Auth) en une seule
 * opération. Le mot de passe temporaire est renvoyé une seule fois — c'est
 * au coach de le transmettre à son client (pas encore de flux d'invitation
 * par email, voir docs/DEVELOPMENT.md).
 */
export async function createClientAccount(input: {
  name: string;
  email: string;
  phone: string;
  program: string;
  status: DbClientStatut;
  notes: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const admin = createAdminClient();
  const tempPassword = crypto.randomUUID().slice(0, 12);

  const { data: authUser, error: authError } = await admin.auth.admin.createUser({
    email: input.email,
    password: tempPassword,
    email_confirm: true,
  });
  if (authError || !authUser.user) {
    return { error: authError?.message ?? "Impossible de créer le compte de connexion." };
  }

  const { data: clientRow, error: insertError } = await supabase
    .from("clients")
    .insert({
      coach_id: user.id,
      auth_user_id: authUser.user.id,
      nom: input.name,
      email: input.email,
      telephone: input.phone,
      programme: input.program,
      statut: input.status,
      notes_internes: input.notes,
      mensuration_champs_actifs: defaultMeasurementFields.map((f) => f.cle),
    })
    .select()
    .single();

  if (insertError || !clientRow) {
    await admin.auth.admin.deleteUser(authUser.user.id);
    return { error: insertError?.message ?? "Impossible de créer la fiche client." };
  }

  await supabase
    .from("health_questions")
    .insert(defaultHealthQuestionsDb.map((q, i) => ({ ...q, client_id: clientRow.id, ordre: i })));

  await supabase
    .from("measurement_fields")
    .upsert(
      defaultMeasurementFields.map((f) => ({ ...f, coach_id: user.id })),
      { onConflict: "coach_id,cle", ignoreDuplicates: true },
    );

  await supabase.from("conversations").insert({ client_id: clientRow.id, coach_id: user.id });

  return { client: clientRow, tempPassword };
}

/**
 * Supprime un client et, si un compte de connexion lui était associé,
 * le compte Supabase Auth correspondant (pour ne pas laisser un login
 * orphelin après la suppression de la fiche).
 */
export async function deleteClientAccount(clientId: string) {
  const supabase = await createClient();
  const { data: client } = await supabase.from("clients").select("auth_user_id").eq("id", clientId).single();

  const { error } = await supabase.from("clients").delete().eq("id", clientId);
  if (error) return { error: error.message };

  if (client?.auth_user_id) {
    const admin = createAdminClient();
    await admin.auth.admin.deleteUser(client.auth_user_id);
  }

  return { success: true };
}
