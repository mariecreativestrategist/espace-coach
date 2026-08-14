# CoachOS

Plateforme de gestion pour coachs sportifs indépendants : un **espace admin** pour le coach (clients, planning, exercices, facturation…) et un **espace client** pour chaque personne coachée, connectés à la même base de données.

- **Frontend** : Next.js (App Router) · TypeScript · Tailwind CSS v4
- **Backend** : Supabase (Postgres, Auth, Storage)
- **Déploiement** : Vercel

> Pour rebrander le design, adapter la navigation ou brancher tes propres données, voir [docs/CUSTOMIZATION.md](docs/CUSTOMIZATION.md).

---

## 1. Prérequis

- [Node.js](https://nodejs.org/) 20 ou plus récent
- Un compte [Supabase](https://supabase.com/) (gratuit) pour la base de données et l'authentification
- (Optionnel, pour la facturation par email) un compte [Resend](https://resend.com/)

## 2. Installation

```bash
git clone <url-du-repo>
cd <dossier-du-projet>
npm install
```

## 3. Configurer Supabase

1. Crée un nouveau projet sur [supabase.com](https://supabase.com/dashboard).
2. Dans **Project Settings → API**, récupère :
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
   ```

5. Applique le schéma de base de données. Le plus simple est de coller le contenu de [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) dans l'éditeur SQL du dashboard Supabase (**SQL Editor → New query**), puis de l'exécuter.

   Si tu utilises la [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started), tu peux aussi faire :

   ```bash
   supabase link --project-ref <ton-project-ref>
   supabase db push
   ```

Ce script crée les 16 tables du modèle de données (coachs, clients, séances, exercices, RDV, messages, factures…) avec la Row Level Security déjà configurée : chaque coach ne voit que ses propres clients, et chaque client ne voit que ses propres données.

## 4. Lancer le projet en local

```bash
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000). Tant que l'authentification n'est pas mise en place côté compte, la page d'accueil propose un accès direct aux deux espaces :

- **Espace Admin** → `/admin/dashboard`
- **Espace Client** → `/client/dashboard`

Ces deux espaces fonctionnent aujourd'hui sur des **données de démonstration** (voir `src/lib/mock/`), ce qui permet de voir tout le design et toutes les interactions sans avoir de compte Supabase configuré. Pour les brancher sur de vraies données, voir la section correspondante dans [docs/CUSTOMIZATION.md](docs/CUSTOMIZATION.md).

## 5. Structure du projet

```
src/
  app/
    admin/          → les 8 pages de l'espace coach (Dashboard, Clients, Planning…)
    client/          → les 8 pages de l'espace client (Tableau de bord, Programme…)
    globals.css      → design system partagé (couleurs, composants)
  components/shared/  → Sidebar, Topbar, Modal, Toast… composants réutilisés partout
  config/              → définition des menus de navigation admin / client
  lib/
    mock/              → données de démonstration (à remplacer par Supabase)
    supabase/          → clients Supabase (browser / server / middleware) + types
  styles/client.css     → particularités visuelles de l'espace client
supabase/migrations/    → schéma SQL (tables + RLS) à appliquer sur ton projet Supabase
```

## 6. Déploiement (Vercel)

1. Pousse le projet sur GitHub.
2. Importe le repo sur [vercel.com/new](https://vercel.com/new).
3. Renseigne les mêmes variables d'environnement que dans `.env.local` (Project Settings → Environment Variables).
4. Déploie.

## 7. Prochaines étapes

Ce socle couvre le design complet des deux espaces avec des données de démonstration. Les étapes suivantes pour un projet en production :

1. Authentification réelle (Supabase Auth, deux parcours coach / client)
2. Remplacer les données de `src/lib/mock/` par de vraies requêtes Supabase
3. Upload de fichiers (photos, PDF, médias d'exercices) via Supabase Storage
4. Emails transactionnels (Resend) pour les notifications importantes

## 8. Licence

Ce projet est distribué sous licence propriétaire — voir [`LICENSE`](LICENSE). Le dépôt est visible publiquement mais son usage est soumis à autorisation ; contacte marie.creativestrategist@gmail.com pour toute demande.

---

Cahier des charges complet dans [`docs/CAHIER-DES-CHARGES.md`](docs/CAHIER-DES-CHARGES.md).
