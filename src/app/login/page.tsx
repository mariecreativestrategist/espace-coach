"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BrandMark } from "@/components/shared/BrandMark";
import { SITE_NAME } from "@/lib/config";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError || !data.user) {
      setError("Email ou mot de passe incorrect.");
      setLoading(false);
      return;
    }

    const { data: coach } = await supabase.from("coaches").select("id").eq("id", data.user.id).maybeSingle();
    if (coach) {
      router.push("/admin/dashboard");
      router.refresh();
      return;
    }

    const { data: client } = await supabase.from("clients").select("id").eq("auth_user_id", data.user.id).maybeSingle();
    if (client) {
      router.push("/client/dashboard");
      router.refresh();
      return;
    }

    setError("Ce compte n'est associé à aucun espace coach ou client.");
    await supabase.auth.signOut();
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="card" style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ padding: "32px 28px 8px", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <BrandMark />
          </div>
          <div className="font-display" style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em" }}>
            {SITE_NAME}
          </div>
          <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 4 }}>Connexion à ton espace</div>
        </div>

        <form onSubmit={handleSubmit} className="card-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              required
              autoFocus
              placeholder="toi@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <div style={{ fontSize: 12.5, color: "var(--danger)", background: "rgba(255,122,122,.1)", border: "1px solid rgba(255,122,122,.25)", borderRadius: 10, padding: "10px 12px" }}>
              {error}
            </div>
          )}
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ justifyContent: "center" }}>
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
