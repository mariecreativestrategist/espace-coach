/**
 * Bucket Supabase Storage unique utilisé par toute l'application (médias
 * d'exercices, photos de suivi, PDF de plan alimentaire, justificatifs de
 * facture…), séparés par dossier. À créer manuellement dans le dashboard
 * Supabase — voir docs/DEPLOIEMENT.md.
 */
export const STORAGE_BUCKET = "coachos-uploads";

export const isSupabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
