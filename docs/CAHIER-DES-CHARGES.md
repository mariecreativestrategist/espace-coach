# Cahier des charges — CoachOS
### Plateforme de gestion pour coachs sportifs (espace admin + espace client)
**Version** : 1.0

---
## 1. Présentation du projet
CoachOS est une plateforme SaaS destinée aux coachs sportifs indépendants. Elle se compose de **deux espaces distincts mais interconnectés** :
- **L'espace Admin** : utilisé par le coach pour gérer ses clients, ses séances, son planning, sa bibliothèque d'exercices, sa facturation et ses tâches.
- **L'espace Client** : utilisé par chaque personne coachée pour suivre son programme, ses objectifs, échanger avec son coach et consulter ses documents.

Les deux espaces partagent la **même identité visuelle** et la **même structure de données** (ce que le coach configure côté admin doit se refléter côté client).

---
## 2. Utilisateurs et rôles
| Rôle | Description | Accès |
|---|---|---|
| **Coach (admin)** | Propriétaire du compte, gère l'ensemble de son activité | Espace admin complet |
| **Client** | Personne suivie par le coach | Espace client, limité à ses propres données |

Pas de rôle multi-coachs ou d'équipe dans cette version (voir périmètre exclu, section 9).

---
## 3. Stack technique recommandée
- **Frontend** : Next.js (App Router), TypeScript, Tailwind CSS
- **Backend / DB** : Supabase (Postgres, Auth, Storage pour les fichiers/photos/PDF/médias d'exercices)
- **Emails transactionnels** : Resend
- **Déploiement** : Vercel
- **Authentification** : Supabase Auth avec deux rôles (`coach`, `client`), séparation stricte des données par `coach_id` / `client_id` (Row Level Security)

Chaque client est rattaché à un coach unique. Un client ne doit jamais pouvoir accéder aux données d'un autre client.

---
## 4. Design system
### 4.1 Principe directeur
Design **sombre, moderne, dégradé noir → vert**, orienté performance/sport. Les deux espaces (admin et client) utilisent exactement la même charte.

### 4.2 Couleurs (variables CSS)
```css
--bg-void:        #07100c;   /* fond général */
--bg-void-2:      #0a1712;   /* fond sidebar */
--bg-surface:     #0f1913;   /* cartes */
--bg-surface-2:   #152019;   /* éléments imbriqués / inputs */
--bg-surface-3:   #1a2620;   /* éléments encore plus imbriqués */
--border-subtle:  #1e2a23;
--border-strong:  #2b3b31;
--text-primary:   #eef3ee;
--text-secondary: #a3b4a8;
--text-muted:     #647568;
--accent-green:   #3ddc84;   /* couleur signature */
--accent-lime:    #c3ff5c;   /* accent secondaire */
--accent-deep:    #0c3d26;
--accent-teal:    #1fd6c0;   /* accent tertiaire (ex : type "Bilan") */
--danger:         #ff7a7a;
--warning:        #f5c451;
--grad-signature: linear-gradient(135deg, #0c3d26 0%, #1c8f57 45%, #c3ff5c 100%);
```
Le dégradé signature (`--grad-signature`) est utilisé sur : le logo, les boutons primaires, les barres de progression, les avatars.

### 4.3 Typographie
- **Titres / valeurs chiffrées** : `Space Grotesk` (600–700)
- **Texte courant** : `Inter` (400–600)
- **Données chiffrées / horodatage / identifiants** : `JetBrains Mono`

### 4.4 Rayons et ombres
- Cartes : `border-radius: 22px`
- Éléments imbriqués : `16px` / `10px`
- Ombre de carte : `0 20px 40px -20px rgba(0,0,0,.6)`

### 4.5 Composants réutilisables
- **Sidebar** de navigation fixe (264px), item actif marqué par une barre verte dégradée à gauche
- **Topbar** sticky avec titre de page dynamique + notifications
- **Card** générique (header + body)
- **KPI card** (chiffre clé + icône + delta optionnel)
- **Badge** (variantes : green / warning / danger / muted)
- **Boutons** : primary (dégradé), ghost (contour), tailles sm/normal
- **Barre de progression** (`progress-track` / `progress-fill`)
- **Modale** générique (overlay + fermeture au clic extérieur + Échap)
- **Toast** de confirmation (bas droite, auto-disparition ~2,6s)
- **Liste à puces avec avatar** (`list-item`) pour messages, paiements, tâches
- **Chat** (bulles entrantes/sortantes, saisie + envoi)

---
## 5. Espace Admin — arborescence et fonctionnalités
Navigation latérale (dans l'ordre) :
1. **Dashboard**
2. **Clients**
3. **Messagerie**
4. **Planning**
5. **Exercices**
6. **To-do list**
7. **Administratif**
8. **Réglages**

### 5.1 Dashboard
- KPI : clients actifs, séances de la semaine, CA du mois, taux de rétention
- Graphique d'évolution du nombre de clients (12 derniers mois)
- Liste des prochains RDV du jour
- Aperçu des messages récents non lus
- Aperçu des paiements en attente / en retard
- Liste des tâches du jour (avec case à cocher)

### 5.2 Clients
- Grille de fiches clients : avatar, nom, programme (texte libre), statut (Actif / En pause / Archivé), barre de progression, dernière séance, nombre de séances
- Filtres par statut avec compteurs dynamiques
- Actions rapides par fiche : Message (renvoie vers Messagerie), Modifier, Archiver/Réactiver, Supprimer (avec confirmation)
- **Ajout / modification d'un client** via modale : nom complet, email, téléphone, **programme en texte libre**, statut, notes internes
- Clic sur une fiche → ouvre la **fiche client détaillée** (voir 5.2.1)

#### 5.2.1 Fiche client détaillée (onglets, dans cet ordre)
1. **Aperçu** — progression globale, séances réalisées, dernière séance, **situation physique & objectif** (taille, poids de départ/actuel/objectif — éditables), IMC actuel et IMC objectif calculés automatiquement (aucun commentaire/catégorie affiché sous l'IMC), barre de progression du poids, notes internes éditables
2. **Questionnaire santé** — **entièrement personnalisable par le coach** : liste de questions (texte court / texte long / choix Oui-Non-Non renseigné), ajout/suppression de questions propres à ce client, réponses éditables, bouton d'enregistrement
3. **Mensurations** — tableau d'historique de mesures dont **les colonnes sont personnalisables par le coach** (catalogue de champs : poids, tour de taille, poitrine, bras, cuisse, hanches, mollet, masse grasse, masse musculaire + possibilité d'ajouter un champ 100% personnalisé avec nom/unité), ajout d'une mesure daté, suppression ; galerie de photos de suivi (upload multiple, suppression)
4. **Objectifs** — liste d'objectifs libres avec barre de progression (%), ajout/suppression
5. **Plan alimentaire** — **uniquement un import de fichier PDF** (pas de formulaire de macros/repas) : nom du fichier affiché, bouton Consulter/Remplacer/Supprimer
6. **Séances** — programme d'entraînement **groupé par semaine/cycle** (ex. "Semaine 1", "Semaine 2"...). Construction d'une séance via modale :
   - Nom de la séance, jour, semaine/cycle
   - **Liste dynamique de lignes d'exercices** : chaque ligne = un menu déroulant (liste défilante alimentée par la bibliothèque d'exercices, avec une option **"Autre…"** qui fait apparaître un champ texte libre) + un champ **"Séries x répétitions"** + bouton de suppression de la ligne. Bouton "+ Ajouter un exercice" pour empiler des lignes.
   - Un champ **Commentaire** libre en bas de la séance
   - Affichage : chaque séance montre la liste de ses exercices (avec **icône photo/vidéo cliquable si l'exercice a un média associé dans la bibliothèque**) + le commentaire en italique

### 5.3 Messagerie
- Liste de conversations (une par client) avec aperçu du dernier message et badge non-lu
- Fenêtre de discussion : bulles entrantes/sortantes, envoi de message (démo côté front)

### 5.4 Planning
- Vue calendrier hebdomadaire (grille jours × créneaux horaires)
- Ajout de RDV via modale (client, type : séance coaching / RDV découverte / bilan, jour, heure, durée, mode, notes) — pré-remplissage possible en cliquant sur un créneau vide
- **Suivi de présence** : clic sur un RDV existant → modale pour le marquer **Réalisée / Manquée / Remise à prévue**. Rendu visuel différencié (coché vert / grisé-barré)
- Stats en tête de page : réalisées / manquées / à venir (calcul dynamique)

### 5.5 Exercices (bibliothèque)
- Grille de fiches exercices : nom, groupe musculaire, consignes
- Filtres par groupe musculaire avec compteurs
- Ajout d'un exercice via modale : nom, groupe musculaire, consignes, **photo ou vidéo de démonstration (optionnelle)**
- Si un média est présent, un bouton "Voir la photo/vidéo" apparaît sur la fiche
- Cette bibliothèque alimente le sélecteur d'exercices utilisé lors de la construction d'une séance (voir 5.2.1 point 6)

### 5.6 To-do list
- Liste de tâches avec échéance et priorité (normale/urgente)
- Filtres Toutes / À faire / Terminées
- Case à cocher pour marquer une tâche comme faite
- Stats : tâches restantes, urgentes, terminées

### 5.7 Administratif
- KPI : facturé ce mois, encaissé, en attente, en retard (recalculés dynamiquement)
- Tableau des factures : numéro, client, prestation, date, montant, statut (Payée/En attente/En retard)
- Création d'une facture via modale : client, prestation, montant, date, statut, et **justificatif optionnel** (choix entre joindre un fichier ou ajouter un lien)

### 5.8 Réglages
- **Profil coach** uniquement : photo, nom, email, téléphone, spécialité, bio publique
- **Sécurité** : changement de mot de passe, authentification à deux facteurs
- *(Pas de section Facturation/paiements ni Notifications dans les réglages — volontairement exclues)*

---
## 6. Espace Client — arborescence et fonctionnalités
Navigation latérale (dans l'ordre) :
1. **Tableau de bord**
2. **Mon programme**
3. **Objectifs & mensurations**
4. **Plan alimentaire**
5. **Questionnaire santé**
6. **Messagerie**
7. **Mes rendez-vous**
8. **Mes factures**

### 6.1 Tableau de bord
- Salutation personnalisée
- KPI : séances réalisées ce mois, progression vers l'objectif de poids (%), prochaine séance
- Aperçu des objectifs en cours (barres de progression)
- Carte "Prochaine séance" **dynamique** : reprend la première séance non cochée du programme, avec exercices + icônes média + commentaire du coach
- Dernier message du coach avec accès rapide à la messagerie

### 6.2 Mon programme
- Séances groupées par semaine/cycle (miroir exact de ce que le coach a construit côté admin)
- Chaque exercice affiche son **icône photo/vidéo si un média est associé** (clic → aperçu)
- Case à cocher par séance pour la marquer **"réalisée"** par le client lui-même

### 6.3 Objectifs & mensurations
- Situation physique en lecture seule (taille, poids départ/actuel/objectif, % de progression)
- Liste complète des objectifs (barres de progression, lecture seule)
- Historique des mesures **en lecture seule** (colonnes = celles définies par le coach pour ce client)
- Galerie de photos de suivi : le client peut **ajouter ses propres photos** (upload multiple)

### 6.4 Plan alimentaire
- Affichage du fichier PDF déposé par le coach + bouton de téléchargement

### 6.5 Questionnaire santé
- Reprend **exactement les questions définies par le coach** pour ce client (texte court / texte long / choix)
- Le client peut modifier ses réponses et les enregistrer
- Le client ne peut pas ajouter/supprimer de questions (prérogative du coach)

### 6.6 Messagerie
- Chat unique avec le coach (pas de liste de conversations, un seul interlocuteur)

### 6.7 Mes rendez-vous
- Liste des prochains rendez-vous
- Historique récent avec badge de statut (Réalisée / Manquée)
- Bouton "Demander un RDV" → modale (date, heure, message) → envoie une demande au coach

### 6.8 Mes factures
- Liste en lecture seule des factures du client avec statut et montant

---
## 7. Modèle de données conceptuel
```
Coach
 ├─ id, nom, email, téléphone, bio, photo
Client
 ├─ id, coach_id (FK), nom, email, téléphone, programme (texte libre),
 │   statut (actif|en_pause|archivé), progression_globale, notes_internes,
 │   taille_cm, poids_depart, poids_actuel, poids_objectif,
 │   mensuration_champs_actifs (liste de clés référencées dans MeasurementField)
Goal (Objectif)
 ├─ id, client_id (FK), titre, progression (%)
Exercise (bibliothèque, propre au coach)
 ├─ id, coach_id (FK), nom, groupe_musculaire, consignes,
 │   media_url, media_type (photo|vidéo, nullable)
Workout (Séance)
 ├─ id, client_id (FK), nom, jour, semaine_cycle, commentaire,
 │   statut_realisation (fait|à faire — coté client)
WorkoutExercise (ligne d'exercice dans une séance)
 ├─ id, workout_id (FK), exercise_id (FK, nullable si "Autre"),
 │   nom_libre (si Autre), series_repetitions (texte libre)
MeasurementField (catalogue de champs de mensuration, propre au coach)
 ├─ id, coach_id (FK), clé, libellé, unité
Measurement (mesure)
 ├─ id, client_id (FK), date, valeurs (JSON clé→valeur selon MeasurementField actifs)
ClientPhoto (photo de suivi)
 ├─ id, client_id (FK), nom_fichier, date, auteur (coach|client)
HealthQuestion (question du questionnaire santé, propre à un client)
 ├─ id, client_id (FK), libellé, type (texte_court|texte_long|choix),
 │   options (si type=choix), valeur
NutritionFile
 ├─ id, client_id (FK), nom_fichier, url, date_maj
Appointment (RDV)
 ├─ id, client_id (FK), coach_id (FK), date, heure, durée, type (coaching|découverte|bilan),
 │   mode (visio|présentiel), statut (prévue|réalisée|manquée), notes
Conversation / Message
 ├─ Conversation : id, client_id (FK), coach_id (FK)
 ├─ Message : id, conversation_id (FK), auteur (coach|client), contenu, horodatage, lu (bool)
Invoice (Facture)
 ├─ id, client_id (FK), coach_id (FK), numéro, prestation, montant, date,
 │   statut (payée|en_attente|en_retard), justificatif_url, justificatif_type (fichier|lien)
Task (tâche coach)
 ├─ id, coach_id (FK), texte, échéance, priorité (normale|urgente), fait (bool)
```

---
## 8. Règles de gestion clés
- **IMC** = poids (kg) / (taille (m))². Aucune catégorie/commentaire n'est affiché à côté de la valeur.
- **Progression de poids (%)** = `(poids_actuel − poids_départ) / (poids_objectif − poids_départ) × 100`, bornée entre 0 et 100. Fonctionne aussi bien pour un objectif de perte que de prise de poids.
- **Statuts de RDV** : `prévue` (défaut) → `réalisée` ou `manquée`, modifiable à tout moment par le coach depuis le planning.
- **Champs de mensuration** : chaque client a sa propre liste de champs actifs, choisis dans un catalogue commun au coach (extensible via champs personnalisés). Le tableau de mesures et le formulaire d'ajout s'adaptent automatiquement à cette sélection.
- **Questionnaire santé** : chaque client a sa propre liste de questions (pas de modèle unique figé) — le coach construit/édite librement le formulaire de chaque client ; le client ne peut qu'y répondre.
- **Séance / bibliothèque d'exercices** : une ligne d'exercice dans une séance référence soit un exercice de la bibliothèque (et hérite alors de son média), soit un nom libre saisi via "Autre" (pas de média associé).
- **Suppression de client/objectif/séance/etc.** : toujours demander confirmation avant suppression définitive.

---
## 9. Hors périmètre (explicitement exclu de cette version)
- Paiement en ligne / encaissement automatisé (Stripe ou équivalent) — la facturation reste déclarative
- Rappels automatiques par email/SMS (RDV à venir, facture en retard...)
- Gestion multi-coachs / équipe
- Avis clients / témoignages
- Intégration visio native pour les séances à distance

Ces points pourront faire l'objet d'un lot ultérieur.

---
## 10. État d'avancement

- ✅ Schéma Supabase (tables + RLS) — [`supabase/migrations/0001_init.sql`](../supabase/migrations/0001_init.sql)
- ✅ Design system partagé (admin + client)
- ✅ Espace Admin : 8 pages, pixel-perfect, données de démonstration
- ✅ Espace Client : 8 pages, pixel-perfect, données de démonstration
- ⬜ Authentification réelle (Supabase Auth, parcours coach / client)
- ⬜ Connexion des pages aux vraies données Supabase (actuellement `src/lib/mock/`)
- ⬜ Upload de fichiers réel (Supabase Storage : photos, PDF, médias d'exercices)
- ⬜ Emails transactionnels (Resend)
