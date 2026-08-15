/**
 * Types générés depuis le schéma Supabase (voir supabase/migrations).
 * À régénérer avec `supabase gen types typescript` une fois le projet
 * Supabase créé — ce fichier est écrit à la main en attendant pour que
 * le reste du code applicatif puisse déjà typer ses requêtes.
 */

export type ClientStatut = "actif" | "en_pause" | "archivé";
export type QuestionType = "texte_court" | "texte_long" | "choix";
export type ExerciseMediaType = "photo" | "vidéo";
export type AppointmentType = "coaching" | "découverte" | "bilan";
export type AppointmentMode = "visio" | "présentiel";
export type AppointmentStatut = "prévue" | "réalisée" | "manquée";
export type InvoiceStatut = "payée" | "en_attente" | "en_retard";
export type JustificatifType = "fichier" | "lien";
export type MessageAuteur = "coach" | "client";
export type TaskPriorite = "normale" | "urgente";

export interface Database {
  public: {
    Tables: {
      coaches: {
        Row: {
          id: string;
          nom: string;
          email: string;
          telephone: string | null;
          bio: string | null;
          photo_url: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["coaches"]["Row"]> & {
          id: string;
          nom: string;
          email: string;
        };
        Update: Partial<Database["public"]["Tables"]["coaches"]["Row"]>;
        Relationships: [];
      };
      clients: {
        Row: {
          id: string;
          coach_id: string;
          auth_user_id: string | null;
          nom: string;
          email: string;
          telephone: string | null;
          programme: string | null;
          statut: ClientStatut;
          progression_globale: number;
          notes_internes: string | null;
          taille_cm: number | null;
          poids_depart: number | null;
          poids_actuel: number | null;
          poids_objectif: number | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["clients"]["Row"]> & {
          id?: string;
          coach_id: string;
          nom: string;
          email: string;
        };
        Update: Partial<Database["public"]["Tables"]["clients"]["Row"]>;
        Relationships: [];
      };
      goals: {
        Row: {
          id: string;
          client_id: string;
          titre: string;
          progression: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["goals"]["Row"]> & {
          id?: string;
          client_id: string;
          titre: string;
        };
        Update: Partial<Database["public"]["Tables"]["goals"]["Row"]>;
        Relationships: [];
      };
      exercises: {
        Row: {
          id: string;
          coach_id: string;
          nom: string;
          groupe_musculaire: string;
          consignes: string | null;
          media_url: string | null;
          media_type: ExerciseMediaType | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["exercises"]["Row"]> & {
          id?: string;
          coach_id: string;
          nom: string;
          groupe_musculaire: string;
        };
        Update: Partial<Database["public"]["Tables"]["exercises"]["Row"]>;
        Relationships: [];
      };
      workouts: {
        Row: {
          id: string;
          client_id: string;
          nom: string;
          jour: string | null;
          semaine_cycle: string;
          commentaire: string | null;
          statut_realisation: "fait" | "à_faire";
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["workouts"]["Row"]> & {
          id?: string;
          client_id: string;
          nom: string;
          semaine_cycle: string;
        };
        Update: Partial<Database["public"]["Tables"]["workouts"]["Row"]>;
        Relationships: [];
      };
      workout_exercises: {
        Row: {
          id: string;
          workout_id: string;
          exercise_id: string | null;
          nom_libre: string | null;
          series_repetitions: string | null;
          ordre: number;
        };
        Insert: Partial<Database["public"]["Tables"]["workout_exercises"]["Row"]> & {
          id?: string;
          workout_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["workout_exercises"]["Row"]>;
        Relationships: [];
      };
      measurement_fields: {
        Row: {
          id: string;
          coach_id: string;
          cle: string;
          libelle: string;
          unite: string;
        };
        Insert: Partial<Database["public"]["Tables"]["measurement_fields"]["Row"]> & {
          id?: string;
          coach_id: string;
          cle: string;
          libelle: string;
          unite: string;
        };
        Update: Partial<Database["public"]["Tables"]["measurement_fields"]["Row"]>;
        Relationships: [];
      };
      measurements: {
        Row: {
          id: string;
          client_id: string;
          date: string;
          valeurs: Record<string, number | string>;
        };
        Insert: Partial<Database["public"]["Tables"]["measurements"]["Row"]> & {
          id?: string;
          client_id: string;
          date: string;
          valeurs: Record<string, number | string>;
        };
        Update: Partial<Database["public"]["Tables"]["measurements"]["Row"]>;
        Relationships: [];
      };
      client_photos: {
        Row: {
          id: string;
          client_id: string;
          nom_fichier: string;
          url: string;
          date: string;
          auteur: MessageAuteur;
        };
        Insert: Partial<Database["public"]["Tables"]["client_photos"]["Row"]> & {
          id?: string;
          client_id: string;
          nom_fichier: string;
          url: string;
          auteur: MessageAuteur;
        };
        Update: Partial<Database["public"]["Tables"]["client_photos"]["Row"]>;
        Relationships: [];
      };
      health_questions: {
        Row: {
          id: string;
          client_id: string;
          libelle: string;
          type: QuestionType;
          options: string[] | null;
          valeur: string | null;
          ordre: number;
        };
        Insert: Partial<Database["public"]["Tables"]["health_questions"]["Row"]> & {
          id?: string;
          client_id: string;
          libelle: string;
          type: QuestionType;
        };
        Update: Partial<Database["public"]["Tables"]["health_questions"]["Row"]>;
        Relationships: [];
      };
      nutrition_files: {
        Row: {
          id: string;
          client_id: string;
          nom_fichier: string;
          url: string;
          date_maj: string;
        };
        Insert: Partial<Database["public"]["Tables"]["nutrition_files"]["Row"]> & {
          id?: string;
          client_id: string;
          nom_fichier: string;
          url: string;
        };
        Update: Partial<Database["public"]["Tables"]["nutrition_files"]["Row"]>;
        Relationships: [];
      };
      appointments: {
        Row: {
          id: string;
          client_id: string;
          coach_id: string;
          date: string;
          heure: string;
          duree_min: number;
          type: AppointmentType;
          mode: AppointmentMode;
          statut: AppointmentStatut;
          notes: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["appointments"]["Row"]> & {
          id?: string;
          client_id: string;
          coach_id: string;
          date: string;
          heure: string;
          type: AppointmentType;
          mode: AppointmentMode;
        };
        Update: Partial<Database["public"]["Tables"]["appointments"]["Row"]>;
        Relationships: [];
      };
      conversations: {
        Row: {
          id: string;
          client_id: string;
          coach_id: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["conversations"]["Row"]> & {
          id?: string;
          client_id: string;
          coach_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["conversations"]["Row"]>;
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          auteur: MessageAuteur;
          contenu: string;
          horodatage: string;
          lu: boolean;
        };
        Insert: Partial<Database["public"]["Tables"]["messages"]["Row"]> & {
          id?: string;
          conversation_id: string;
          auteur: MessageAuteur;
          contenu: string;
        };
        Update: Partial<Database["public"]["Tables"]["messages"]["Row"]>;
        Relationships: [];
      };
      invoices: {
        Row: {
          id: string;
          client_id: string;
          coach_id: string;
          numero: string;
          prestation: string;
          montant: number;
          date: string;
          statut: InvoiceStatut;
          justificatif_url: string | null;
          justificatif_type: JustificatifType | null;
        };
        Insert: Partial<Database["public"]["Tables"]["invoices"]["Row"]> & {
          id?: string;
          client_id: string;
          coach_id: string;
          numero: string;
          prestation: string;
          montant: number;
          date: string;
        };
        Update: Partial<Database["public"]["Tables"]["invoices"]["Row"]>;
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          coach_id: string;
          texte: string;
          echeance: string | null;
          priorite: TaskPriorite;
          fait: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["tasks"]["Row"]> & {
          id?: string;
          coach_id: string;
          texte: string;
        };
        Update: Partial<Database["public"]["Tables"]["tasks"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
