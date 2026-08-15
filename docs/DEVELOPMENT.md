# Développer sur CoachOS

Ce guide s'adresse à celles et ceux qui veulent aller au-delà de la personnalisation simple (nom, logo, couleurs — voir [docs/CUSTOMIZATION.md](CUSTOMIZATION.md)) : ajouter une page, modifier la navigation, brancher de nouvelles données sur Supabase. Ça suppose de savoir coder et de faire tourner le projet en local (voir le [README](../README.md)).

---

## 1. Changer les polices

Les 3 polices (Space Grotesk, Inter, JetBrains Mono) sont chargées dans [`src/app/layout.tsx`](../src/app/layout.tsx) via `next/font/google`. Pour en changer une, remplace l'import et le nom de la police Google Fonts :

```ts
import { Poppins } from "next/font/google"; // au lieu de Space_Grotesk

const spaceGrotesk = Poppins({
  variable: "--font-space-grotesk", // garde ce nom de variable CSS
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
```

Le nom de la variable CSS (`--font-space-grotesk`) doit rester identique : c'est lui qui est référencé dans `globals.css`.

## 2. Modifier la navigation (ajouter / retirer une section)

Les menus latéraux sont définis dans deux fichiers de config, indépendants du reste du code :

- [`src/config/admin-nav.tsx`](../src/config/admin-nav.tsx) — espace admin
- [`src/config/client-nav.tsx`](../src/config/client-nav.tsx) — espace client

Chaque entrée a la forme :

```tsx
{
  href: "/admin/exercices",
  label: "Exercices",
  icon: (<svg className="icon" viewBox="0 0 24 24">...</svg>),
  badgeCount: 10, // optionnel, affiche un badge chiffré
}
```

Pour ajouter une page :
1. Crée le dossier de route, ex. `src/app/admin/ma-section/page.tsx`.
2. Ajoute l'entrée correspondante dans `admin-nav.tsx`.
3. Utilise le composant `PageShell` pour hériter automatiquement du topbar (titre, recherche, avatar) :

```tsx
import { PageShell } from "@/components/shared/PageShell";

export default function MaSectionPage() {
  return (
    <PageShell title="Ma section" subtitle="Description courte" avatarInitials="MG">
      <div className="card">
        <div className="card-body">Contenu de la page…</div>
      </div>
    </PageShell>
  );
}
```

## 3. Le pattern "réel avec repli démo" — pour ajouter tes propres pages

Toutes les pages existantes sont déjà branchées sur Supabase pour de vrai. Chacune garde malgré tout un mode de repli sur des données d'exemple (`src/lib/mock/admin-data.ts` et `client-data.ts`) quand Supabase n'est pas configuré, contrôlé par la constante `isSupabaseConfigured` de [`src/lib/supabase/storage.ts`](../src/lib/supabase/storage.ts) — ça permet d'explorer le design sans compte Supabase, et ça évite qu'une page plante bêtement si une variable d'environnement manque.

Si tu ajoutes une nouvelle page qui a besoin de ses propres données, reprends ce même pattern. Bons exemples à copier : [`src/app/admin/exercices/page.tsx`](../src/app/admin/exercices/page.tsx) (CRUD + upload de fichier vers Storage) et [`src/app/admin/todo/page.tsx`](../src/app/admin/todo/page.tsx) (CRUD simple) côté admin ; [`src/app/client/objectifs/page.tsx`](../src/app/client/objectifs/page.tsx) côté client (passe par le hook [`useCurrentClient`](../src/lib/hooks/useCurrentClient.ts) pour savoir quel client est connecté).

Pour brancher une nouvelle page sur Supabase :

1. Transforme le composant de page en **Server Component async** (ou garde-le client et fais un `fetch` dans un `useEffect` / [`@tanstack/react-query`](https://tanstack.com/query) si tu as besoin d'interactivité immédiate).
2. Remplace l'import du mock par une requête via le client Supabase serveur :

```tsx
// avant
import { clientsSeed } from "@/lib/mock/admin-data";

// après
import { createClient } from "@/lib/supabase/server";

export default async function AdminClientsPage() {
  const supabase = await createClient();
  const { data: clients } = await supabase.from("clients").select("*").order("name");
  // ...
}
```

Les noms de tables et de colonnes du schéma Supabase (voir [`supabase/migrations/0001_init.sql`](../supabase/migrations/0001_init.sql)) suivent volontairement la même structure que les types dans `src/lib/mock/admin-data.ts`, pour que la bascule soit la plus directe possible.

Les actions qui modifient des données (ajouter un client, cocher une tâche, envoyer un message…) sont aujourd'hui de simples `useState` locaux. Il faudra les convertir en [Server Actions](https://nextjs.org/docs/app/getting-started/updating-data) Next.js qui appellent Supabase, par exemple :

```tsx
"use server";
import { createClient } from "@/lib/supabase/server";

export async function toggleTask(taskId: string, done: boolean) {
  const supabase = await createClient();
  await supabase.from("tasks").update({ fait: done }).eq("id", taskId);
}
```

## 4. Authentification

Le schéma SQL prévoit déjà la structure (`coaches.id` = `auth.users.id`, `clients.auth_user_id` optionnel) et les policies RLS, et [`src/app/login/page.tsx`](../src/app/login/page.tsx) + [`src/proxy.ts`](../src/proxy.ts) gèrent déjà la connexion et la protection des routes `/admin/*` et `/client/*`. Pour l'étendre (magic link, OAuth, etc.), voir la doc [Supabase Auth](https://supabase.com/docs/guides/auth).

## 5. Upload de fichiers (photos, PDF, médias d'exercices)

Utilise [Supabase Storage](https://supabase.com/docs/guides/storage). Crée un bucket (ex. `client-photos`, `nutrition-files`, `exercise-media`), puis dans le composant concerné :

```tsx
const { data, error } = await supabase.storage
  .from("client-photos")
  .upload(`${clientId}/${file.name}`, file);
```

Stocke ensuite l'URL publique (ou signée) retournée dans la colonne correspondante (`client_photos.url`, `nutrition_files.url`, `exercises.media_url`).

## 6. Déployer les changements

```bash
npm run build   # vérifie qu'il n'y a pas d'erreur avant de pousser
git add -A
git commit -m "..."
git push
```

Si le repo est connecté à Vercel, chaque push sur la branche principale déclenche un déploiement automatique.
