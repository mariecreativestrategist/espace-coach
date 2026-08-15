-- CoachOS — client de démonstration, rattaché au coach de démo
-- (voir 0002_seed_demo_coach.sql). Permet de tester l'espace client
-- immédiatement après l'installation :
--   email    : client@exemple.com
--   password : changeme123

do $$
declare
  demo_coach_id uuid := '00000000-0000-0000-0000-000000000001';
  demo_client_auth_id uuid := '00000000-0000-0000-0000-000000000002';
  demo_client_id uuid;
  demo_workout_id uuid;
begin
  if not exists (select 1 from auth.users where id = demo_client_auth_id) then
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000', demo_client_auth_id, 'authenticated', 'authenticated',
      'client@exemple.com', crypt('changeme123', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
      '', '', '', ''
    );

    insert into auth.identities (
      id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(), demo_client_auth_id, demo_client_auth_id::text,
      format('{"sub":"%s","email":"%s"}', demo_client_auth_id, 'client@exemple.com')::jsonb,
      'email', now(), now(), now()
    );
  end if;

  select id into demo_client_id from public.clients where auth_user_id = demo_client_auth_id;

  if demo_client_id is null then
    insert into public.clients (
      coach_id, auth_user_id, nom, email, telephone, programme, statut, progression_globale,
      notes_internes, taille_cm, poids_depart, poids_actuel, poids_objectif, mensuration_champs_actifs
    ) values (
      demo_coach_id, demo_client_auth_id, 'Client de démonstration', 'client@exemple.com', '',
      'Prise de masse', 'actif', 72, 'Compte de démonstration — à personnaliser ou supprimer.',
      165, 58, 61, 64, array['weight', 'waist', 'chest', 'arm', 'thigh']
    )
    returning id into demo_client_id;

    insert into public.goals (client_id, titre, progression) values
      (demo_client_id, 'Atteindre 65kg au squat 5x5', 80),
      (demo_client_id, 'Perdre 3kg de masse grasse', 45);

    insert into public.workouts (client_id, nom, jour, semaine_cycle, commentaire, statut_realisation)
    values (demo_client_id, 'Séance Jambes', 'Lundi', 'Semaine 1', '', 'fait')
    returning id into demo_workout_id;

    insert into public.workout_exercises (workout_id, nom_libre, series_repetitions, ordre) values
      (demo_workout_id, 'Squat', '5x5 60kg', 0),
      (demo_workout_id, 'Leg press', '4x10', 1),
      (demo_workout_id, 'Fentes marchées', '3x12', 2);

    insert into public.measurements (client_id, date, valeurs) values
      (demo_client_id, current_date - interval '30 days', '{"weight": 58, "waist": 68, "chest": 88, "arm": 26, "thigh": 52}'::jsonb),
      (demo_client_id, current_date, '{"weight": 61, "waist": 67, "chest": 90, "arm": 27, "thigh": 53}'::jsonb);

    insert into public.health_questions (client_id, libelle, type, options, valeur, ordre) values
      (demo_client_id, 'Aval médical pour le sport', 'choix', array['Oui', 'Non', 'Non renseigné'], 'Oui', 0),
      (demo_client_id, 'Fumeur', 'choix', array['Oui', 'Non', 'Non renseigné'], 'Non', 1),
      (demo_client_id, 'Blessures actuelles ou passées', 'texte_long', null, '', 2);

    insert into public.conversations (client_id, coach_id) values (demo_client_id, demo_coach_id);
  end if;
end $$;
