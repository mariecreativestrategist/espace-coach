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
