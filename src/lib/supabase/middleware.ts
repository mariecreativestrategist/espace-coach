import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/supabase/database.types";

export type SessionRole = "coach" | "client" | null;

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // Projet Supabase pas encore configuré (voir .env.local.example) : on ne
    // bloque pas le rendu, il n'y a simplement pas d'auth à appliquer — le
    // site tourne en mode démo (accès direct depuis la page d'accueil).
    return { supabaseResponse, user: null, role: null as SessionRole, configured: false };
  }

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Rafraîchit la session si besoin — ne pas retirer, requis par @supabase/ssr.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: SessionRole = null;
  if (user) {
    const { data: coach } = await supabase.from("coaches").select("id").eq("id", user.id).maybeSingle();
    if (coach) {
      role = "coach";
    } else {
      const { data: client } = await supabase.from("clients").select("id").eq("auth_user_id", user.id).maybeSingle();
      if (client) role = "client";
    }
  }

  return { supabaseResponse, user, role, configured: true };
}
