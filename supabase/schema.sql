-- CoachOS — schéma complet (tables + RLS + compte de démo + bucket Storage)
-- Généré à partir de supabase/migrations/000{1,2,3}_*.sql — colle ce fichier
-- en une seule fois dans l'éditeur SQL de Supabase (voir docs/DEPLOIEMENT.md).

-- CoachOS — schéma initial (cahier des charges §7 Modèle de données conceptuel)
-- Un coach = un compte Supabase Auth (coaches.id = auth.users.id).
-- Un client = un compte Supabase Auth optionnel (clients.auth_user_id -> auth.users.id),
-- rattaché à un coach unique. Isolation stricte des données par coach_id / client_id (RLS).

-- ==========================================================================
-- TABLES
-- ==========================================================================

create table public.coaches (
  id uuid primary key references auth.users (id) on delete cascade,
  nom text not null,
  email text not null,
  telephone text,
  bio text,
  photo_url text,
  created_at timestamptz not null default now()
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.coaches (id) on delete cascade,
  auth_user_id uuid unique references auth.users (id) on delete set null,
  nom text not null,
  email text not null,
  telephone text,
  programme text,
  statut text not null default 'actif' check (statut in ('actif', 'en_pause', 'archivé')),
  progression_globale numeric not null default 0,
  notes_internes text,
  taille_cm numeric,
  poids_depart numeric,
  poids_actuel numeric,
  poids_objectif numeric,
  created_at timestamptz not null default now()
);
create index clients_coach_id_idx on public.clients (coach_id);

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  titre text not null,
  progression numeric not null default 0 check (progression between 0 and 100),
  created_at timestamptz not null default now()
);
create index goals_client_id_idx on public.goals (client_id);

create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.coaches (id) on delete cascade,
  nom text not null,
  groupe_musculaire text not null,
  consignes text,
  media_url text,
  media_type text check (media_type in ('photo', 'vidéo')),
  created_at timestamptz not null default now()
);
create index exercises_coach_id_idx on public.exercises (coach_id);

create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  nom text not null,
  jour text,
  semaine_cycle text not null,
  commentaire text,
  statut_realisation text not null default 'à_faire' check (statut_realisation in ('fait', 'à_faire')),
  created_at timestamptz not null default now()
);
create index workouts_client_id_idx on public.workouts (client_id);

create table public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts (id) on delete cascade,
  exercise_id uuid references public.exercises (id) on delete set null,
  nom_libre text,
  series_repetitions text,
  ordre integer not null default 0,
  check (exercise_id is not null or nom_libre is not null)
);
create index workout_exercises_workout_id_idx on public.workout_exercises (workout_id);

create table public.measurement_fields (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.coaches (id) on delete cascade,
  cle text not null,
  libelle text not null,
  unite text not null,
  unique (coach_id, cle)
);
create index measurement_fields_coach_id_idx on public.measurement_fields (coach_id);

create table public.measurements (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  date date not null,
  valeurs jsonb not null default '{}'::jsonb
);
create index measurements_client_id_idx on public.measurements (client_id);

create table public.client_photos (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  nom_fichier text not null,
  url text not null,
  date timestamptz not null default now(),
  auteur text not null check (auteur in ('coach', 'client'))
);
create index client_photos_client_id_idx on public.client_photos (client_id);

create table public.health_questions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  libelle text not null,
  type text not null check (type in ('texte_court', 'texte_long', 'choix')),
  options text[],
  valeur text,
  ordre integer not null default 0
);
create index health_questions_client_id_idx on public.health_questions (client_id);

create table public.nutrition_files (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  nom_fichier text not null,
  url text not null,
  date_maj timestamptz not null default now()
);
create index nutrition_files_client_id_idx on public.nutrition_files (client_id);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  coach_id uuid not null references public.coaches (id) on delete cascade,
  date date not null,
  heure time not null,
  duree_min integer not null default 60,
  type text not null check (type in ('coaching', 'découverte', 'bilan')),
  mode text not null check (mode in ('visio', 'présentiel')),
  statut text not null default 'prévue' check (statut in ('prévue', 'réalisée', 'manquée')),
  notes text
);
create index appointments_client_id_idx on public.appointments (client_id);
create index appointments_coach_id_idx on public.appointments (coach_id);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null unique references public.clients (id) on delete cascade,
  coach_id uuid not null references public.coaches (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  auteur text not null check (auteur in ('coach', 'client')),
  contenu text not null,
  horodatage timestamptz not null default now(),
  lu boolean not null default false
);
create index messages_conversation_id_idx on public.messages (conversation_id);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  coach_id uuid not null references public.coaches (id) on delete cascade,
  numero text not null,
  prestation text not null,
  montant numeric not null,
  date date not null,
  statut text not null default 'en_attente' check (statut in ('payée', 'en_attente', 'en_retard')),
  justificatif_url text,
  justificatif_type text check (justificatif_type in ('fichier', 'lien')),
  unique (coach_id, numero)
);
create index invoices_client_id_idx on public.invoices (client_id);
create index invoices_coach_id_idx on public.invoices (coach_id);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.coaches (id) on delete cascade,
  texte text not null,
  echeance date,
  priorite text not null default 'normale' check (priorite in ('normale', 'urgente')),
  fait boolean not null default false,
  created_at timestamptz not null default now()
);
create index tasks_coach_id_idx on public.tasks (coach_id);

-- ==========================================================================
-- HELPERS — utilisés par les policies RLS ci-dessous
-- ==========================================================================

create function public.current_client_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.clients where auth_user_id = auth.uid();
$$;

create function public.is_coach_of_client(target_client_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.clients
    where id = target_client_id and coach_id = auth.uid()
  );
$$;

-- ==========================================================================
-- ROW LEVEL SECURITY
-- ==========================================================================

alter table public.coaches enable row level security;
alter table public.clients enable row level security;
alter table public.goals enable row level security;
alter table public.exercises enable row level security;
alter table public.workouts enable row level security;
alter table public.workout_exercises enable row level security;
alter table public.measurement_fields enable row level security;
alter table public.measurements enable row level security;
alter table public.client_photos enable row level security;
alter table public.health_questions enable row level security;
alter table public.nutrition_files enable row level security;
alter table public.appointments enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.invoices enable row level security;
alter table public.tasks enable row level security;

-- coaches : chaque coach ne voit / modifie que sa propre fiche
create policy "coach read own profile" on public.coaches
  for select using (id = auth.uid());
create policy "coach update own profile" on public.coaches
  for update using (id = auth.uid());
create policy "coach insert own profile" on public.coaches
  for insert with check (id = auth.uid());

-- clients : CRUD complet pour le coach propriétaire, lecture seule pour le client concerné
create policy "coach manage own clients" on public.clients
  for all using (coach_id = auth.uid()) with check (coach_id = auth.uid());
create policy "client read own record" on public.clients
  for select using (auth_user_id = auth.uid());

-- goals : coach CRUD, client lecture seule
create policy "coach manage goals" on public.goals
  for all using (public.is_coach_of_client(client_id)) with check (public.is_coach_of_client(client_id));
create policy "client read own goals" on public.goals
  for select using (client_id = public.current_client_id());

-- exercises (bibliothèque du coach) : coach CRUD, client lecture seule sur la bibliothèque de son coach
create policy "coach manage exercises" on public.exercises
  for all using (coach_id = auth.uid()) with check (coach_id = auth.uid());
create policy "client read coach exercises" on public.exercises
  for select using (
    coach_id = (select coach_id from public.clients where id = public.current_client_id())
  );

-- workouts : coach CRUD, client lecture + statut_realisation via trigger dédié
create policy "coach manage workouts" on public.workouts
  for all using (public.is_coach_of_client(client_id)) with check (public.is_coach_of_client(client_id));
create policy "client read own workouts" on public.workouts
  for select using (client_id = public.current_client_id());
create policy "client mark own workout done" on public.workouts
  for update using (client_id = public.current_client_id())
  with check (client_id = public.current_client_id());

-- workout_exercises : suit les droits de la séance parente
create policy "coach manage workout exercises" on public.workout_exercises
  for all using (
    exists (select 1 from public.workouts w where w.id = workout_id and public.is_coach_of_client(w.client_id))
  ) with check (
    exists (select 1 from public.workouts w where w.id = workout_id and public.is_coach_of_client(w.client_id))
  );
create policy "client read own workout exercises" on public.workout_exercises
  for select using (
    exists (select 1 from public.workouts w where w.id = workout_id and w.client_id = public.current_client_id())
  );

-- measurement_fields : catalogue propre au coach, lecture seule pour le client
create policy "coach manage measurement fields" on public.measurement_fields
  for all using (coach_id = auth.uid()) with check (coach_id = auth.uid());
create policy "client read coach measurement fields" on public.measurement_fields
  for select using (
    coach_id = (select coach_id from public.clients where id = public.current_client_id())
  );

-- measurements : coach CRUD, client lecture seule (§6.3)
create policy "coach manage measurements" on public.measurements
  for all using (public.is_coach_of_client(client_id)) with check (public.is_coach_of_client(client_id));
create policy "client read own measurements" on public.measurements
  for select using (client_id = public.current_client_id());

-- client_photos : coach et client peuvent tous deux consulter/ajouter ; seul le coach supprime
create policy "coach manage client photos" on public.client_photos
  for all using (public.is_coach_of_client(client_id)) with check (public.is_coach_of_client(client_id));
create policy "client read own photos" on public.client_photos
  for select using (client_id = public.current_client_id());
create policy "client add own photos" on public.client_photos
  for insert with check (client_id = public.current_client_id() and auteur = 'client');

-- health_questions : structure définie par le coach uniquement, client répond via trigger dédié
create policy "coach manage health questions" on public.health_questions
  for all using (public.is_coach_of_client(client_id)) with check (public.is_coach_of_client(client_id));
create policy "client read own health questions" on public.health_questions
  for select using (client_id = public.current_client_id());
create policy "client answer own health questions" on public.health_questions
  for update using (client_id = public.current_client_id())
  with check (client_id = public.current_client_id());

-- nutrition_files : coach CRUD, client lecture seule
create policy "coach manage nutrition files" on public.nutrition_files
  for all using (public.is_coach_of_client(client_id)) with check (public.is_coach_of_client(client_id));
create policy "client read own nutrition file" on public.nutrition_files
  for select using (client_id = public.current_client_id());

-- appointments : coach CRUD complet, client lecture + création de demandes
create policy "coach manage appointments" on public.appointments
  for all using (coach_id = auth.uid()) with check (coach_id = auth.uid());
create policy "client read own appointments" on public.appointments
  for select using (client_id = public.current_client_id());
create policy "client request appointment" on public.appointments
  for insert with check (client_id = public.current_client_id() and statut = 'prévue');

-- conversations : un client = une conversation avec son coach
create policy "coach manage conversations" on public.conversations
  for all using (coach_id = auth.uid()) with check (coach_id = auth.uid());
create policy "client read own conversation" on public.conversations
  for select using (client_id = public.current_client_id());

-- messages : accessibles aux deux parties de la conversation
create policy "coach manage messages" on public.messages
  for all using (
    exists (select 1 from public.conversations c where c.id = conversation_id and c.coach_id = auth.uid())
  ) with check (
    exists (select 1 from public.conversations c where c.id = conversation_id and c.coach_id = auth.uid())
  );
create policy "client read own messages" on public.messages
  for select using (
    exists (select 1 from public.conversations c where c.id = conversation_id and c.client_id = public.current_client_id())
  );
create policy "client send own messages" on public.messages
  for insert with check (
    auteur = 'client'
    and exists (select 1 from public.conversations c where c.id = conversation_id and c.client_id = public.current_client_id())
  );

-- invoices : coach CRUD, client lecture seule (§6.8 — facturation déclarative)
create policy "coach manage invoices" on public.invoices
  for all using (coach_id = auth.uid()) with check (coach_id = auth.uid());
create policy "client read own invoices" on public.invoices
  for select using (client_id = public.current_client_id());

-- tasks : usage interne au coach uniquement
create policy "coach manage tasks" on public.tasks
  for all using (coach_id = auth.uid()) with check (coach_id = auth.uid());

-- ==========================================================================
-- TRIGGERS — verrous métier explicites du cahier des charges (§8)
-- ==========================================================================

-- Le client ne peut modifier que sa réponse ("valeur"), jamais la structure
-- de la question (prérogative exclusive du coach, cf. §5.2.1 point 2 et §8).
create function public.guard_health_question_client_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and old.client_id = public.current_client_id() then
    if new.libelle is distinct from old.libelle
       or new.type is distinct from old.type
       or new.options is distinct from old.options
       or new.ordre is distinct from old.ordre
       or new.client_id is distinct from old.client_id then
      raise exception 'Le client ne peut modifier que sa réponse.';
    end if;
  end if;
  return new;
end;
$$;

create trigger guard_health_question_client_update
  before update on public.health_questions
  for each row execute function public.guard_health_question_client_update();

-- Le client ne peut que cocher/décocher sa séance comme réalisée, jamais en
-- modifier le contenu (programme construit exclusivement par le coach, §6.2).
create function public.guard_workout_client_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and old.client_id = public.current_client_id() then
    if new.nom is distinct from old.nom
       or new.jour is distinct from old.jour
       or new.semaine_cycle is distinct from old.semaine_cycle
       or new.commentaire is distinct from old.commentaire
       or new.client_id is distinct from old.client_id then
      raise exception 'Le client ne peut que marquer la séance comme réalisée.';
    end if;
  end if;
  return new;
end;
$$;

create trigger guard_workout_client_update
  before update on public.workouts
  for each row execute function public.guard_workout_client_update();

-- CoachOS — compte de démonstration
-- Crée un compte coach immédiatement utilisable après l'installation :
--   email    : admin@exemple.com
--   password : changeme123
-- À changer immédiatement depuis Réglages une fois connecté (voir README).
--
-- Insère directement dans auth.users / auth.identities : c'est la méthode
-- la plus simple pour un script SQL "copier-coller" sans terminal ni appel
-- API, mais ce n'est pas une API Supabase officiellement stable — si ces
-- lignes échouent sur une future version de Supabase, crée le compte à la
-- main depuis Authentication → Users → Add user, puis relance uniquement
-- le bloc `insert into public.coaches` ci-dessous avec le bon id.

do $$
declare
  demo_coach_id uuid := '00000000-0000-0000-0000-000000000001';
begin
  if not exists (select 1 from auth.users where id = demo_coach_id) then
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000', demo_coach_id, 'authenticated', 'authenticated',
      'admin@exemple.com', crypt('changeme123', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
      '', '', '', ''
    );

    insert into auth.identities (
      id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(), demo_coach_id, demo_coach_id::text,
      format('{"sub":"%s","email":"%s"}', demo_coach_id, 'admin@exemple.com')::jsonb,
      'email', now(), now(), now()
    );
  end if;

  insert into public.coaches (id, nom, email, bio)
  values (demo_coach_id, 'Coach de démonstration', 'admin@exemple.com', 'Compte de démonstration — à personnaliser depuis Réglages.')
  on conflict (id) do nothing;
end $$;

-- CoachOS — bucket Storage "coachos-uploads" + policies
--
-- Convention de chemin : <dossier>/<uid-du-propriétaire>/<fichier>
-- ex. exercises/<coach_id>/1699999999-squat.mp4
-- Marquer un bucket "Public" ne donne que la lecture anonyme via l'URL
-- publique ; l'upload (insert) doit rester protégé par ces policies.

insert into storage.buckets (id, name, public)
values ('coachos-uploads', 'coachos-uploads', true)
on conflict (id) do nothing;

create policy "Lecture publique du bucket coachos-uploads"
  on storage.objects for select
  to public
  using (bucket_id = 'coachos-uploads');

create policy "Upload dans son propre dossier"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'coachos-uploads'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

create policy "Modification de ses propres fichiers"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'coachos-uploads'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

create policy "Suppression de ses propres fichiers"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'coachos-uploads'
    and (storage.foldername(name))[2] = auth.uid()::text
  );
