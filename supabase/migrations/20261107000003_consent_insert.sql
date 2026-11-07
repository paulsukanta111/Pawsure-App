-- PS-002: owners record their own consent (terms/privacy version, language, timestamp)
-- from the app. Updates and deletes stay service-only, so the record is append-only for users.
create policy consent_insert_self on public.consent_records for insert to authenticated
  with check (person_id = private.current_person_id());
