# Mettre le site en ligne — guide complet

Ce guide part du principe que tu n'as jamais programmé. Tout se passe dans le navigateur — aucun logiciel à installer, aucun terminal à ouvrir. Chaque étape explique quoi cliquer et à quoi doit ressembler le résultat. Ne saute pas d'étape, même si elle te semble évidente.

Compte environ 30-40 minutes la première fois.

## Avant de commencer : le vocabulaire de base

- **Variable d'environnement** : une information secrète ou de configuration (clé d'un service, adresse de la base de données...) que le site va lire au démarrage.
- **Déployer** : mettre le site en ligne, accessible par une adresse internet.
- **Dépôt (repository)** : l'endroit où le code du site est rangé sur GitHub — un peu comme un dossier partagé.
- **Bucket** : un espace de stockage de fichiers (photos, PDF, vidéos) dans Supabase.

Crée-toi un compte (gratuit) sur ces 3 sites — juste créer le compte pour l'instant, on configure chacun au fur et à mesure :

- [supabase.com](https://supabase.com)
- [resend.com](https://resend.com)
- [vercel.com](https://vercel.com) (tu peux "Sign up" directement avec ton compte GitHub, c'est plus simple)

---

## Étape 1 — Créer le projet Supabase (la base de données)

Supabase va stocker toutes les données du site (clients, séances, factures...) et les fichiers déposés (photos, PDF, vidéos).

1. Va sur [supabase.com](https://supabase.com/dashboard), connecte-toi.
2. Clique **New project**.
3. Remplis :
   - **Name** : le nom que tu veux (ex : `mon-espace-coach`)
   - **Database Password** : clique sur "Generate a password" pour en générer un fort, puis copie-le et colle-le dans un fichier texte que tu gardes de côté.
   - **Region** : la région la plus proche de tes clients (ex : *West EU (Paris)* pour la France).
4. Clique **Create new project** et attends environ 2 minutes.

## Étape 2 — Créer les tables et le compte de démo (copier-coller un script)

1. Dans Supabase, menu de gauche : **SQL Editor**.
2. Clique **New query**.
3. Ouvre ce lien dans un nouvel onglet : [`supabase/schema.sql`](../supabase/schema.sql).
4. Sur cette page GitHub, clique le bouton **Raw** (en haut à droite de l'aperçu du fichier) — le texte brut du script s'affiche. Sélectionne tout (Ctrl+A / Cmd+A) et copie (Ctrl+C / Cmd+C).
5. Reviens dans Supabase, colle le script dans la zone de requête (Ctrl+V / Cmd+V).
6. Clique **Run** (ou Ctrl+Entrée).

Un message de succès s'affiche en bas. Ce script, en un seul passage, a créé :

- les 16 tables de l'application, avec la sécurité (chaque coach ne voit que ses propres clients) ;
- un **bucket de stockage** pour les fichiers (photos, PDF, médias d'exercices) ;
- un **compte coach de démonstration**, utilisable immédiatement après le déploiement :
  - E-mail : `admin@exemple.com`
  - Mot de passe : `changeme123`

  (Tu changeras ce mot de passe juste après le premier déploiement — voir tout en bas de ce guide.)

> ⚠️ Si l'exécution du script échoue avec une erreur mentionnant `auth.users` ou `auth.identities` : ce sont les tables internes de Supabase qui peuvent varier légèrement selon les versions. Dans ce cas, crée le compte à la main depuis **Authentication → Users → Add user** (email `admin@exemple.com`, mot de passe `changeme123`), puis relance uniquement le script en collant-le une seconde fois — la partie "tables" ayant déjà été créée sera ignorée, seule la ligne manquante du profil coach sera ajoutée.

## Étape 3 — Récupérer les clés Supabase

1. Menu de gauche : **Project Settings → Data API**.
2. Section **Project URL** : copie l'adresse (elle ressemble à `https://xxxxx.supabase.co`) dans ton fichier texte.
3. Section **Project API keys** :
   - copie la clé **anon public** dans ton fichier texte ;
   - clique sur **reveal** à côté de **service_role**, puis copie-la aussi.

⚠️ La clé **service_role** est secrète — ne la partage jamais publiquement, ne la mets jamais dans du code visible par le navigateur.

## Étape 4 — Créer un compte Resend (pour les e-mails)

Resend permet d'envoyer un e-mail au coach quand un client écrit un message dans la messagerie.

1. Va sur [resend.com](https://resend.com), connecte-toi.
2. Menu de gauche : **API Keys → Create API Key**. Donne-lui un nom, clique **Add**.
3. Copie la clé affichée (une seule fois) dans ton fichier texte.

Sans étape supplémentaire, Resend n'autorise l'envoi qu'à l'adresse e-mail de ton propre compte Resend — c'est suffisant pour tester. Pour envoyer de vrais e-mails à tes clients plus tard, il faudra vérifier un nom de domaine (voir la section optionnelle tout en bas). Tu peux déployer sans faire cette étape maintenant, et t'en passer complètement si tu ne veux pas encore les notifications par e-mail.

## Étape 5 — Copier le projet dans ton propre GitHub

1. Ouvre le dépôt du projet sur GitHub.
2. En haut à droite, clique **Fork** → **Create fork**. Ça crée une copie indépendante du code dans ton propre compte GitHub — c'est cette copie que tu vas déployer et pouvoir modifier librement.

## Étape 6 — Déployer sur Vercel

1. Va sur [vercel.com/new](https://vercel.com/new), connecte-toi avec ton compte GitHub.
2. Clique **Import** à côté du dépôt que tu viens de forker (si tu ne le vois pas, clique "Adjust GitHub App Permissions" et autorise l'accès au dépôt).
3. Un formulaire **Environment Variables** apparaît. Ajoute chaque variable avec sa valeur récoltée plus haut :

   | Nom de la variable | Valeur à coller |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | l'adresse de l'étape 3 |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | la clé *anon public* de l'étape 3 |
   | `SUPABASE_SERVICE_ROLE_KEY` | la clé *service_role* de l'étape 3 |
   | `RESEND_API_KEY` | la clé de l'étape 4 (laisse vide si tu as sauté cette étape) |
   | `RESEND_FROM_EMAIL` | `CoachOS <onboarding@resend.dev>` (ou ton domaine vérifié, voir plus bas) |
   | `COACH_NOTIFICATION_EMAIL` | **ton propre email**, celui utilisé pour ton compte Resend — c'est là que tu recevras les notifications de test |

4. Clique **Deploy**. Une page avec un chargement animé apparaît — patiente 2-3 minutes.

## Étape 7 — Premiers tests

Le site est maintenant entièrement réel : ce que tu vas faire ci-dessous est vraiment sauvegardé dans ta base Supabase, pas juste affiché à l'écran.

1. Une fois le déploiement terminé, clique sur l'aperçu pour ouvrir le site.
2. Clique **Se connecter**, entre `admin@exemple.com` / `changeme123`.
3. Tu arrives sur le Dashboard de l'espace admin. Va dans **Réglages** (menu de gauche) et change immédiatement ce mot de passe.
4. Teste côté admin :
   - **Clients** → *Nouveau client* → un compte de connexion est créé automatiquement, avec un mot de passe temporaire affiché une seule fois (note-le, ou utilise plutôt le client de démo ci-dessous pour tester).
   - Ouvre la fiche d'un client → onglet **Exercices** ou **Séances** → ajoute un exercice avec une photo/vidéo de démonstration → le fichier doit s'ouvrir en cliquant sur "Voir la photo/vidéo".
   - **Planning** → ajoute un rendez-vous, marque-le "Réalisée".
   - **Administratif** → crée une facture.
5. Teste côté client, dans un onglet privé/navigation privée :
   - Connecte-toi avec le compte client de démo créé automatiquement par le script SQL : `client@exemple.com` / `changeme123`.
   - Va sur **Messagerie**, envoie un message → si Resend est configuré, un e-mail doit arriver à l'adresse mise dans `COACH_NOTIFICATION_EMAIL` en quelques secondes.
   - Va sur **Mon programme**, coche une séance comme réalisée → reviens sur l'espace admin (fiche du client de démo) et vérifie que le changement apparaît bien.

## Étape 8 (optionnel) — Ton propre nom de domaine

Si tu as un nom de domaine (acheté chez OVH, Namecheap...) :

1. Dans Vercel : **Project → Settings → Domains** → tape ton adresse souhaitée → **Add**.
2. Suis les instructions DNS affichées (à ajouter chez ton fournisseur de domaine).

## Étape 9 (optionnel) — Vérifier ton propre nom de domaine sur Resend

Pour envoyer de vrais e-mails à tes clients (pas juste à toi-même), il faut prouver à Resend que tu es bien propriétaire d'un nom de domaine (ex : `tonagence.com`). Ça se fait en ajoutant quelques lignes de configuration chez l'endroit où tu as acheté ce nom de domaine — pas besoin de compétences techniques, juste de copier-coller.

1. Sur resend.com, menu de gauche : **Domains → Add Domain**.
2. Tape ton nom de domaine (ex : `tonagence.com`, sans "www" ni "https://") → **Add**.
3. Resend affiche un tableau de plusieurs lignes (souvent 3 à 5), chacune avec un **Type** (TXT, MX, ou CNAME), un **Name/Host** et une **Value**. C'est ça qu'il faut recopier chez ton fournisseur de domaine.
4. Ouvre un nouvel onglet, connecte-toi au site où tu as acheté ton domaine, cherche une section appelée "DNS", "Zone DNS" ou "Gérer le domaine".
5. Pour chaque ligne affichée par Resend, crée un nouvel enregistrement DNS avec exactement le même Type, Name/Host et Value. Enregistre après chaque ligne.
6. Reviens sur Resend, clique **Verify**. Ça peut être immédiat ou prendre jusqu'à quelques heures selon le fournisseur — si ça échoue, attends un peu et réessaie.
7. Une fois vérifié (coche verte), retourne dans Vercel → **Environment Variables** et remplace la valeur de `RESEND_FROM_EMAIL` par une adresse sur ton propre domaine (ex : `CoachOS <bonjour@tonagence.com>` — l'adresse n'a pas besoin d'exister réellement comme boîte mail, c'est juste l'expéditeur affiché). Puis **Redeploy**.

💡 Chaque fournisseur de domaine a une interface différente pour les DNS — si tu ne trouves pas où ajouter ces enregistrements, cherche "gérer DNS [nom de ton fournisseur]".

---

## Personnaliser le site (nom, logo, couleurs)

Voir [`docs/CUSTOMIZATION.md`](CUSTOMIZATION.md) — tout se fait aussi depuis le navigateur, sans rien installer localement (ou directement depuis GitHub en éditant les fichiers en ligne).

## En cas de blocage

- **Le script SQL échoue** avec une erreur sur `auth.users` : voir l'encadré à la fin de l'étape 2.
- **Impossible de se connecter avec `admin@exemple.com` ou `client@exemple.com`** : vérifie dans Supabase (**Table Editor → coaches** ou **clients**) qu'une ligne existe bien pour ce compte, et dans **Authentication → Users** que l'utilisateur apparaît.
- **Le mot de passe temporaire d'un nouveau client ne fonctionne pas** : vérifie que `SUPABASE_SERVICE_ROLE_KEY` est bien renseignée dans Vercel — c'est cette clé qui permet au serveur de créer le compte de connexion du client au moment où le coach l'ajoute.
- **Les e-mails ne partent pas** : va sur resend.com → **Emails**, l'historique affiche l'erreur exacte (souvent : domaine non vérifié + tentative d'envoi à une adresse autre que celle de ton compte Resend). Vérifie aussi que `COACH_NOTIFICATION_EMAIL`, `RESEND_API_KEY` et `RESEND_FROM_EMAIL` sont bien renseignées dans Vercel, puis redéploie.
- **L'upload d'un fichier échoue** (photo, PDF, média d'exercice) : vérifie dans Supabase (**Storage**) que le bucket `coachos-uploads` existe bien et qu'il est marqué "Public".
- **Le site affiche la version "démo"** (accès direct sans connexion) même après déploiement : vérifie que les 3 variables `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` et `SUPABASE_SERVICE_ROLE_KEY` sont bien renseignées dans Vercel, puis redéploie — sans elles, l'application tourne volontairement en mode démo plutôt que de planter.
