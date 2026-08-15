# Personnaliser CoachOS

Ce guide part du principe que le projet tourne déjà en local (voir le [README](../README.md)). Toutes les manipulations ci-dessous se font dans le code, pas besoin d'outil externe.

---

## 1. Changer les couleurs / le branding

Tout le design system vit dans un seul fichier : [`src/app/globals.css`](../src/app/globals.css), en haut du fichier dans le bloc `:root`.

```css
:root {
  --bg-void: #07100c;        /* fond général */
  --bg-surface: #0f1913;     /* fond des cartes */
  --accent-green: #3ddc84;   /* couleur signature */
  --accent-lime: #c3ff5c;    /* accent secondaire */
  --grad-signature: linear-gradient(135deg, #0c3d26 0%, #1c8f57 45%, #c3ff5c 100%);
  /* … */
}
```

Change ces valeurs et **toute l'application se met à jour** (boutons, barres de progression, logo, badges) — ces variables sont utilisées partout, aucune couleur n'est codée en dur ailleurs dans les composants.

Le nom de l'app ("CoachOS") apparaît à trois endroits à changer manuellement :
- [`src/app/layout.tsx`](../src/app/layout.tsx) → `metadata.title`
- [`src/app/admin/layout.tsx`](../src/app/admin/layout.tsx) → prop `brandName` du `<Sidebar>`
- [`src/app/client/layout.tsx`](../src/app/client/layout.tsx) → idem

## 2. Changer les polices

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

## 3. Modifier la navigation (ajouter / retirer une section)

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

## 4. Remplacer les données de démonstration par de vraies données

Deux pages sont déjà entièrement branchées sur Supabase et servent de modèle concret à suivre : [`src/app/admin/exercices/page.tsx`](../src/app/admin/exercices/page.tsx) (avec upload de fichier vers Supabase Storage) et [`src/app/admin/todo/page.tsx`](../src/app/admin/todo/page.tsx) (CRUD simple). Les deux gardent un mode de repli sur les données de démo (`isSupabaseConfigured` depuis `src/lib/supabase/storage.ts`) quand aucun projet Supabase n'est configuré — reprends ce même pattern pour les autres pages.

Le reste des pages lit encore des données statiques depuis :
- [`src/lib/mock/admin-data.ts`](../src/lib/mock/admin-data.ts) (clients, RDV, factures)
- [`src/lib/mock/client-data.ts`](../src/lib/mock/client-data.ts) (point de vue d'un client connecté)

Pour brancher une page sur Supabase :

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

## 5. Authentification

Le schéma SQL prévoit déjà la structure (`coaches.id` = `auth.users.id`, `clients.auth_user_id` optionnel) et les policies RLS. Il reste à créer les pages de connexion :

1. Utilise [Supabase Auth](https://supabase.com/docs/guides/auth) (email/mot de passe ou magic link).
2. Crée `src/app/login/page.tsx` (ou deux pages séparées `coach/login` et `client/login`).
3. Après connexion, redirige vers `/admin/dashboard` ou `/client/dashboard` selon si l'utilisateur existe dans `coaches` ou `clients`.
4. Le fichier [`src/proxy.ts`](../src/proxy.ts) (middleware Next.js) rafraîchit déjà la session Supabase à chaque requête — tu peux y ajouter la logique de redirection si l'utilisateur n'est pas connecté et tente d'accéder à `/admin/*` ou `/client/*`.

## 6. Upload de fichiers (photos, PDF, médias d'exercices)

Utilise [Supabase Storage](https://supabase.com/docs/guides/storage). Crée un bucket (ex. `client-photos`, `nutrition-files`, `exercise-media`), puis dans le composant concerné :

```tsx
const { data, error } = await supabase.storage
  .from("client-photos")
  .upload(`${clientId}/${file.name}`, file);
```

Stocke ensuite l'URL publique (ou signée) retournée dans la colonne correspondante (`client_photos.url`, `nutrition_files.url`, `exercises.media_url`).

## 7. Déployer les changements

```bash
npm run build   # vérifie qu'il n'y a pas d'erreur avant de pousser
git add -A
git commit -m "..."
git push
```

Si le repo est connecté à Vercel, chaque push sur la branche principale déclenche un déploiement automatique.
