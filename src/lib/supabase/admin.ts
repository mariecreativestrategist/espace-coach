import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Client Supabase "admin", à n'utiliser que côté serveur (Server Actions,
 * Route Handlers) — jamais dans un composant client, jamais exposé au
 * navigateur. Utilise la clé service_role qui contourne la Row Level
 * Security : nécessaire pour des opérations que le rôle "authenticated"
 * ne peut pas faire lui-même, comme créer le compte de connexion d'un
 * nouveau client.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
