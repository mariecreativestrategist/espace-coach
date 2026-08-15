# Personnaliser le site — guide complet

Ce guide explique comment adapter le site à ton identité (nom, logo, couleurs) et changer ton mot de passe. Tout se fait **depuis le navigateur, sur GitHub** — pas besoin d'installer quoi que ce soit sur ton ordinateur ni de savoir coder.

Le principe est toujours le même :

1. Tu ouvres le fichier concerné sur GitHub.
2. Tu cliques sur l'icône crayon (✏️) en haut à droite du fichier, pour l'éditer directement dans le navigateur.
3. Tu modifies la valeur.
4. Tu cliques sur **"Commit changes..."** (en bas de page) pour enregistrer.
5. Si le site est connecté à Vercel, il se **remet à jour tout seul** 1 à 2 minutes après.

> Tu veux d'abord mettre le site en ligne ? Suis [docs/DEPLOIEMENT.md](DEPLOIEMENT.md).

---

## 1. Changer le mot de passe du compte coach

Ça, ça ne se passe **pas sur GitHub** mais directement sur le site :

1. Connecte-toi à ton espace admin.
2. Va dans **Réglages** (menu de gauche, tout en bas).
3. Dans la carte **"Sécurité"**, renseigne ton mot de passe actuel puis le nouveau.
4. Clique sur **"Changer le mot de passe"**.

C'est valable aussi pour les comptes clients : chacun peut changer son mot de passe depuis son propre espace (en bas du menu de gauche, bouton "Changer le mot de passe").

## 2. Changer le nom du site

Le nom affiché partout (barre latérale, page de connexion, titre de l'onglet du navigateur, emails) vient d'un seul fichier :

1. Sur GitHub, ouvre [`src/lib/config.ts`](../src/lib/config.ts).
2. Clique sur l'icône crayon pour éditer.
3. Change les valeurs entre guillemets :

```ts
export const SITE_NAME = "CoachOS";
export const SITE_TAGLINE = "Plateforme de gestion pour coachs sportifs.";
```

Par exemple, pour un site qui s'appellerait "ProCoach" :

```ts
export const SITE_NAME = "ProCoach";
export const SITE_TAGLINE = "Ton coaching, simplifié.";
```

⚠️ Garde bien les guillemets `"` et le point-virgule `;` à la fin de chaque ligne — ne change que le texte entre les guillemets.

4. Clique sur **"Commit changes..."**.

## 3. Changer le logo

Par défaut, le site affiche un petit logo en forme d'éclair généré automatiquement. Pour mettre ton propre logo (image) :

1. Prépare ton image (idéalement un PNG ou SVG avec fond transparent, pas trop large — l'équivalent d'un carré ou d'un rectangle court).
2. Sur GitHub, ouvre le dossier [`public/`](../public/).
3. Clique sur **"Add file"** → **"Upload files"**, dépose ton image, puis **"Commit changes..."**.
4. Note bien le nom exact du fichier que tu viens d'ajouter (ex. `logo.png`).
5. Ouvre à nouveau [`src/lib/config.ts`](../src/lib/config.ts) et édite (icône crayon) :

```ts
export const LOGO_IMAGE_PATH: string | null = null;
```

en :

```ts
export const LOGO_IMAGE_PATH: string | null = "/logo.png";
```

(remplace `"logo.png"` par le nom exact de ton fichier, avec un `/` devant).

6. Clique sur **"Commit changes..."**.

Ton logo apparaît désormais dans la barre latérale et sur la page de connexion. Vérifie qu'il reste lisible aussi bien sur fond sombre (barre latérale) que sur fond clair (page de connexion) — un logo avec fond transparent fonctionne dans les deux cas.

Pour revenir au logo par défaut, remets `LOGO_IMAGE_PATH` à `null`.

## 4. Changer les couleurs

Toutes les couleurs du site sont regroupées dans un seul fichier : [`src/app/globals.css`](../src/app/globals.css), tout en haut, dans le bloc `:root { ... }`.

1. Sur GitHub, ouvre [`src/app/globals.css`](../src/app/globals.css) et clique sur l'icône crayon.
2. Repère le bloc `:root` en haut du fichier — chaque ligne est une couleur.
3. Change la valeur hexadécimale (le code du type `#3ddc84`) de la couleur que tu veux modifier. Un outil comme [htmlcolorcodes.com](https://htmlcolorcodes.com/) te permet de choisir une couleur et de récupérer son code hexadécimal.

| Variable | Ce qu'elle colore | Couleur actuelle |
|---|---|---|
| `--bg-void` | Fond général du site | `#07100c` (vert très sombre) |
| `--bg-surface` | Fond des cartes / blocs | `#0f1913` |
| `--accent-green` | Couleur signature (boutons, logo, liens actifs) | `#3ddc84` |
| `--accent-lime` | Accent secondaire (dégradés, surlignages) | `#c3ff5c` |
| `--accent-teal` | Accent tertiaire (badges, graphiques) | `#1fd6c0` |
| `--danger` | Messages d'erreur, badges "en retard" | `#ff7a7a` |
| `--warning` | Badges "en attente" | `#f5c451` |
| `--text-primary` | Texte principal | `#eef3ee` |
| `--text-secondary` | Texte secondaire | `#a3b4a8` |
| `--text-muted` | Texte discret (légendes, placeholders) | `#647568` |

⚠️ Juste en dessous de ces couleurs, il y a des variables `-rgb` (par exemple `--accent-green-rgb: 61, 220, 132;`) : ce sont **les mêmes couleurs**, écrites sous forme de triplet de nombres au lieu d'un code hexadécimal. Elles servent à afficher des versions transparentes (halos, badges). **Si tu changes une couleur, mets aussi à jour son triplet `-rgb` juste en dessous avec les nombres correspondants**, sinon certains éléments garderont l'ancienne couleur en transparence.

Pour convertir un code hexadécimal en triplet R, G, B : sur [htmlcolorcodes.com](https://htmlcolorcodes.com/), colle ton code hexadécimal, la valeur "RGB" correspondante s'affiche automatiquement (ex. `rgb(61, 220, 132)` → tu ne gardes que `61, 220, 132`).

4. Clique sur **"Commit changes..."**.

## Récapitulatif

| Je veux changer... | Où aller |
|---|---|
| Mon mot de passe | Site → Réglages → Sécurité |
| Le nom du site | GitHub → `src/lib/config.ts` → `SITE_NAME` |
| La phrase sous le nom | GitHub → `src/lib/config.ts` → `SITE_TAGLINE` |
| Le logo | GitHub → `public/` (upload) puis `src/lib/config.ts` → `LOGO_IMAGE_PATH` |
| Les couleurs | GitHub → `src/app/globals.css` → bloc `:root` |

## Dépannage

**Je ne vois pas l'icône crayon sur GitHub.** Il faut que tu aies un accès en écriture au dépôt (propriétaire ou collaborateur invité). Si le dépôt ne t'appartient pas, fais-en d'abord une copie ("Fork") ou demande à en devenir collaborateur.

**J'ai fait "Commit changes..." mais rien ne change sur le site.** Attends 1 à 2 minutes (le temps que Vercel reconstruise le site), puis vérifie l'onglet **"Deployments"** de ton projet sur [vercel.com](https://vercel.com/) : le déploiement le plus récent doit être marqué "Ready". Fais ensuite un rechargement forcé de la page (Ctrl+Maj+R sur Windows, Cmd+Maj+R sur Mac).

**Je me suis trompé·e, je veux annuler.** Sur GitHub, ouvre le fichier concerné puis l'onglet **"History"** (ou le bouton "Blame") pour retrouver la version précédente et copier son contenu — ou repars simplement du guide ci-dessus pour remettre l'ancienne valeur.

---

Envie d'aller plus loin techniquement (ajouter une page, modifier la navigation, brancher tes propres données) ? C'est couvert dans [docs/DEVELOPMENT.md](DEVELOPMENT.md), destiné à celles et ceux qui développent sur le projet.
