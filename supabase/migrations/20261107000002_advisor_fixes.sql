-- Fixes from the Supabase security and performance advisors after the P0 schema.

-- 1. RLS helper functions move out of the API-exposed schema. Policies reference
--    functions by OID, so they keep working; roles still need EXECUTE for policy
--    evaluation, but the functions are no longer callable via /rest/v1/rpc.
create schema if not exists private;
grant usage on schema private to anon, authenticated, service_role;

alter function public.current_person_id() set schema private;
alter function public.is_household_admin(uuid) set schema private;

create or replace function private.is_household_admin(h uuid) returns boolean
  language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.care_circle_members m
    where m.household_id = h and m.person_id = private.current_person_id()
      and m.role in ('owner', 'co_owner') and m.revoked_at is null
  )
$$;

create or replace function private.current_person_id() returns uuid
  language sql stable security definer set search_path = '' as $$
  select id from public.people where auth_user_id = (select auth.uid())
$$;

-- create_household stays an RPC for signed-in owners only.
create or replace function public.create_household(p_name text, p_society text default null, p_tower text default null)
  returns uuid language plpgsql security definer set search_path = '' as $$
declare
  me uuid := private.current_person_id();
  h uuid;
begin
  if me is null then raise exception 'Sign in and complete your profile first'; end if;
  insert into public.households (name, society, tower) values (p_name, p_society, p_tower) returning id into h;
  insert into public.care_circle_members (household_id, person_id, role, consent) values (h, me, 'owner', 'given');
  insert into public.audit_log (actor_person_id, actor_kind, action, subject_table, subject_id, household_id)
    values (me, 'person', 'household_created', 'households', h::text, h);
  return h;
end $$;
revoke all on function public.create_household(text, text, text) from public, anon;
grant execute on function public.create_household(text, text, text) to authenticated;

-- 2. Fixed search_path on the append-only trigger function.
alter function public.forbid_change() set search_path = '';

-- 3. Evaluate auth.uid() once per query, not per row.
drop policy people_self on public.people;
create policy people_self on public.people for all
  using (auth_user_id = (select auth.uid())) with check (auth_user_id = (select auth.uid()));
drop policy flags_read on public.feature_flags;
create policy flags_read on public.feature_flags for select using ((select auth.uid()) is not null);

-- 4. Primary key for feature_flags.
alter table public.feature_flags add column id bigint generated always as identity primary key;

-- 5. Indexes on the foreign keys used by RLS checks and daily queries.
create index on public.care_circle_members (person_id);
create index on public.pets (household_id);
create index on public.care_plans (pet_id);
create index on public.care_tasks (pet_id);
create index on public.care_task_status_changes (task_id);
create index on public.health_events (pet_id);
create index on public.return_checks (task_id);
create index on public.code_cards (household_id);
create index on public.care_days (household_id, day);
create index on public.incidents (household_id);
create index on public.look_in_links (task_id);
create index on public.friend_links (friend_person_id);
create index on public.friend_searches (household_id);
create index on public.friend_search_recipients (friend_person_id);
create index on public.reward_ledger (household_id);
create index on public.consent_records (person_id);
create index on public.rights_requests (person_id);
