import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 text-center">
      <div>
        <div className="font-display text-3xl font-bold" style={{ letterSpacing: "-0.02em" }}>
          CoachOS
        </div>
        <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
          L&apos;authentification n&apos;est pas encore branchée — accès direct temporaire aux
          deux espaces.
        </p>
      </div>
      <div className="flex gap-4">
        <Link href="/admin/dashboard" className="btn btn-primary">
          Espace Admin
        </Link>
        <Link href="/client/dashboard" className="btn btn-ghost">
          Espace Client
        </Link>
      </div>
    </div>
  );
}
