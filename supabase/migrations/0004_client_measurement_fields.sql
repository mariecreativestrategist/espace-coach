-- CoachOS — champ manquant sur clients (cahier des charges §7 :
-- « mensuration_champs_actifs (liste de clés référencées dans MeasurementField) »)

alter table public.clients
  add column if not exists mensuration_champs_actifs text[] not null
    default array['weight', 'waist', 'chest', 'arm', 'thigh'];
