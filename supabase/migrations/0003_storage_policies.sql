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
