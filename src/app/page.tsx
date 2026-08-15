import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 text-center">
      <div>
        <div className="font-display text-3xl font-bold" style={{ letterSpacing: "-0.02em" }}>
          CoachOS
        </div>
        <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
          Plateforme de gestion pour coachs sportifs.
        </p>
      </div>
      <div className="flex flex-col items-center gap-4">
        <Link href="/login" className="btn btn-primary">
          Se connecter
        </Link>
        <p className="text-xs" style={{ color: "var(--text-muted)", maxWidth: 320 }}>
          Projet Supabase pas encore configuré ? Tu peux explorer le design directement, sans
          compte :{" "}
          <Link href="/admin/dashboard" style={{ color: "var(--accent-green)" }}>
            espace admin
          </Link>{" "}
          ·{" "}
          <Link href="/client/dashboard" style={{ color: "var(--accent-green)" }}>
            espace client
          </Link>
        </p>
      </div>
    </div>
  );
}
