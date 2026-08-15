# CoachOS

Plateforme de gestion pour coachs sportifs indépendants : un **espace admin** pour le coach (clients, planning, exercices, facturation…) et un **espace client** pour chaque personne coachée, connectés à la même base de données.

- **Frontend** : Next.js (App Router) · TypeScript · Tailwind CSS v4
- **Backend** : Supabase (Postgres, Auth, Storage)
- **Emails** : Resend
- **Déploiement** : Vercel

> 🚀 **Tu veux juste mettre le site en ligne, sans coder ?** Suis [docs/DEPLOIEMENT.md](docs/DEPLOIEMENT.md) — tout se fait depuis le navigateur, aucun terminal requis.
>
> 🎨 **Tu veux rebrander le design ou adapter la navigation ?** Voir [docs/CUSTOMIZATION.md](docs/CUSTOMIZATION.md).

Le reste de ce README s'adresse à celles et ceux qui veulent faire tourner le projet en local pour développer dessus.

---

## 1. Prérequis

- [Node.js](https://nodejs.org/) 20 ou plus récent
- Un compte [Supabase](https://supabase.com/) (gratuit) pour la base de données et l'authentification
- Un compte [Resend](https://resend.com/) (gratuit, optionnel) pour les notifications par email

## 2. Installation

```bash
git clone <url-du-repo>
cd <dossier-du-projet>
npm install
```

## 3. Configurer Supabase

1. Crée un nouveau projet sur [supabase.com](https://supabase.com/dashboard).
2. Dans **Project Settings → Data API**, récupère :
   - `Project URL`
   - la clé `anon public`
   - la clé `service_role` (secrète — ne jamais l'exposer côté client)
3. Duplique le fichier d'exemple des variables d'environnement :

   ```bash
   cp .env.local.example .env.local
   ```

4. Remplis `.env.local` :

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
   SUPABASE_SERVICE_ROLE_KEY=xxxxx

   RESEND_API_KEY=xxxxx
   RESEND_FROM_EMAIL=CoachOS <onboarding@resend.dev>
   COACH_NOTIFICATION_EMAIL=ton-email@exemple.com
   ```

5. Applique le schéma de base de données : colle le contenu de [`supabase/schema.sql`](supabase/schema.sql) dans l'éditeur SQL du dashboard Supabase (**SQL Editor → New query**), puis exécute-le (**Run**).

   Si tu utilises la [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started), tu peux aussi appliquer les migrations une par une depuis `supabase/migrations/` :

   ```bash
   supabase link --project-ref <ton-project-ref>
   supabase db push
   ```

Ce script crée les 16 tables du modèle de données avec la Row Level Security (chaque coach ne voit que ses propres clients, chaque client ne voit que ses propres données), un bucket de stockage (`coachos-uploads`) avec ses policies, et un **compte coach de démonstration** :

- Email : `admin@exemple.com`
- Mot de passe : `changeme123` *(à changer immédiatement depuis Réglages une fois connecté)*

## 4. Lancer le projet en local

```bash
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000) et clique **Se connecter** (identifiants ci-dessus).

Si `.env.local` n'est pas encore configuré, l'app tourne automatiquement en **mode démo** : pas de connexion requise, accès direct à `/admin/dashboard` et `/client/dashboard` avec des données d'exemple (voir `src/lib/mock/`) — pratique pour explorer le design sans compte Supabase.

## 5. Ce qui est réellement branché à Supabase aujourd'hui

| Fonctionnalité | État |
|---|---|
| Connexion / déconnexion, changement de mot de passe | ✅ réel |
| Bibliothèque d'Exercices (lecture, ajout, upload photo/vidéo) | ✅ réel |
| To-do list (lecture, ajout, coché, suppression) | ✅ réel |
| Notification email quand un client écrit un message | ✅ réel (via Resend) |
| Dashboard, Clients, Planning, Administratif, espace Client | 🚧 données de démonstration (`src/lib/mock/`) |

Voir [docs/CUSTOMIZATION.md](docs/CUSTOMIZATION.md#4-remplacer-les-données-de-démonstration-par-de-vraies-données) pour brancher le reste des pages sur Supabase, module par module.

## 6. Structure du projet

```
src/
  app/
    admin/          → les 8 pages de l'espace coach (Dashboard, Clients, Planning…)
    client/          → les 8 pages de l'espace client (Tableau de bord, Programme…)
    login/           → page de connexion
    api/              → routes serveur (ex: notification email)
    globals.css      → design system partagé (couleurs, composants)
  components/shared/  → Sidebar, Topbar, Modal, Toast… composants réutilisés partout
  config/              → définition des menus de navigation admin / client
  lib/
    mock/              → données de démonstration (à remplacer par Supabase)
    supabase/          → clients Supabase (browser / server / middleware) + types
  styles/client.css     → particularités visuelles de l'espace client
  proxy.ts               → middleware : protège /admin et /client, gère les redirections
supabase/
  schema.sql              → script unique (tables + RLS + démo + storage) pour un déploiement rapide
  migrations/              → le même schéma, découpé fichier par fichier pour la Supabase CLI
```

## 7. Déploiement (Vercel)

Voir le guide pas-à-pas [docs/DEPLOIEMENT.md](docs/DEPLOIEMENT.md). En résumé :

1. Pousse le projet sur GitHub.
2. Importe le repo sur [vercel.com/new](https://vercel.com/new).
3. Renseigne les mêmes variables d'environnement que dans `.env.local`.
4. Déploie.

## 8. Prochaines étapes

1. Finir de connecter les pages restantes à Supabase (voir tableau §5)
2. Upload réel pour les photos de suivi client et les PDF de plan alimentaire
3. Deuxième parcours de connexion pour les clients (aujourd'hui seul le compte coach est seedé)

## 9. Licence

Ce projet est distribué sous licence propriétaire — voir [`LICENSE`](LICENSE). Le dépôt est visible publiquement mais son usage est soumis à autorisation ; contacte marie.creativestrategist@gmail.com pour toute demande.

---

Cahier des charges complet dans [`docs/CAHIER-DES-CHARGES.md`](docs/CAHIER-DES-CHARGES.md).
