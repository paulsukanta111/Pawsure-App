-- Pawsure P0 core schema (PRD section 12.2), Supabase / Postgres.
-- Tenant boundary is the household. Helpers and friends are identified by phone
-- (they never need an app account); owners sign in with phone OTP (Supabase Auth).
-- Every table has row-level security. Service-role code (edge functions handling
-- WhatsApp/IVR webhooks and timers) bypasses RLS and enforces its own checks.


-- ---------------------------------------------------------------------------
-- Enums

create type care_role as enum ('owner', 'co_owner', 'helper', 'backup', 'friend');
create type helper_mode as enum ('tracked', 'trusted');
create type checkin_method as enum ('whatsapp_photo', 'whatsapp_voice', 'missed_call_code');
create type app_language as enum ('en', 'hi', 'mr');
create type consent_status as enum ('pending', 'given', 'declined', 'withdrawn');
create type task_type as enum ('feeding', 'water', 'walk', 'toilet_pad', 'medicine', 'other');
create type task_status as enum ('planned', 'reassigned', 'cancelled', 'done_with_evidence', 'done_reported', 'partly_done', 'skipped_with_reason', 'missed');
create type task_confidence as enum ('pending', 'confirmed', 'likely', 'not_confirmed', 'missed', 'matched');
create type visit_status as enum ('confirmed', 'likely', 'not_confirmed', 'not_shown');
create type signal_type as enum ('whatsapp_photo', 'in_app_photo', 'voice_note', 'ivr_code', 'arrival_call', 'exit_call', 'gate_entry');
create type day_outcome as enum ('covered', 'not_covered', 'unknown', 'excluded');
create type severity as enum ('S1', 'S2', 'S3');
create type search_state as enum ('draft', 'ready_for_search', 'awaiting_owner_approval', 'sent', 'provisional_hold', 'confirmed', 'completed', 'expired', 'cancelled', 'no_show');
create type ledger_state as enum ('earned', 'held', 'released', 'reversed', 'redeemed', 'expired');
create type rights_type as enum ('access', 'correct', 'erase', 'withdraw', 'grievance');

-- ---------------------------------------------------------------------------
-- People and households

-- Anyone Pawsure talks to. Owners link to auth.users; helpers/friends may never sign in.
create table people (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users (id) on delete set null,
  phone_e164 text not null unique,
  display_name text not null,
  preferred_language app_language not null default 'en',
  created_at timestamptz not null default now()
);

create table households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  -- Coarse anchor only (9.3): society and tower, never a flat number in discovery.
  society text,
  tower text,
  anchor_lat numeric(8, 5),
  anchor_lng numeric(8, 5),
  has_gate_app boolean not null default false,
  pilot_cohort text,
  created_at timestamptz not null default now()
);

-- Care circle (PS-005, PS-020 to PS-022, PS-029). One helper person can belong to many households.
create table care_circle_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  person_id uuid not null references people (id) on delete cascade,
  role care_role not null,
  helper_mode helper_mode,
  checkin_method checkin_method,
  consent consent_status not null default 'pending',
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  unique (household_id, person_id, role)
);

-- Exact address and access notes live apart from the household row so they can be
-- disclosed only to an accepted, authorised person (14.2).
create table household_access_details (
  household_id uuid primary key references households (id) on delete cascade,
  flat_address text,
  access_instructions text,
  spare_key_note text,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Pets, health, emergency (PS-003, PS-004, PS-035, PS-040, PS-046)

create table pets (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  name text not null,
  species text not null default 'dog',
  breed text,
  age_years numeric(4, 1),
  photo_path text,
  food_notes text,
  allergies text,
  medicines text,
  fears_habits text,
  vet_name text,
  vet_phone text,
  nearest_24x7_clinic text,
  emergency_notes text,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table health_events (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references pets (id) on delete cascade,
  event_type text not null check (event_type in ('vaccine', 'deworming', 'medication', 'vet_follow_up', 'check_up')),
  last_given_on date,
  due_on date not null,
  source text not null default 'owner' check (source in ('owner', 'vet_instruction')),
  reminder_state text not null default 'scheduled' check (reminder_state in ('scheduled', 'acknowledged', 'snoozed', 'done')),
  notes text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Routine and daily tasks (PS-010 to PS-012, PS-121, PS-122)

create table care_plans (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references pets (id) on delete cascade,
  task_type task_type not null,
  title text not null,
  instructions text,
  due_time time not null,                 -- IST wall clock
  recurrence text not null default 'daily', -- RRULE-style string; 'once' for one-offs
  starts_on date not null default current_date,
  ends_on date,
  expected_minutes int,
  escalation_profile jsonb not null default '{}'::jsonb, -- per-task overrides of PS-101
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table care_tasks (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references care_plans (id) on delete set null,
  pet_id uuid not null references pets (id) on delete cascade,
  household_id uuid not null references households (id) on delete cascade,
  task_type task_type not null,
  due_at timestamptz not null,
  assigned_person_id uuid references people (id),
  status task_status not null default 'planned',
  confidence task_confidence not null default 'pending',
  visit_status visit_status not null default 'not_shown',
  mismatch boolean not null default false,
  late boolean not null default false,
  reason_codes text[] not null default '{}',
  rule_version text,
  escalation_resolved_at timestamptz,
  created_at timestamptz not null default now(),
  unique (plan_id, due_at)
);
create index care_tasks_household_due on care_tasks (household_id, due_at);

-- Append-only status history (PS-121: changes never overwrite history).
create table care_task_status_changes (
  id bigint generated always as identity primary key,
  task_id uuid not null references care_tasks (id) on delete cascade,
  from_status task_status,
  to_status task_status not null,
  changed_by uuid references people (id),
  reason text,
  reassigned_to uuid references people (id),
  at timestamptz not null default now()
);

create table checkin_signals (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references care_tasks (id) on delete set null,
  household_id uuid not null references households (id) on delete cascade,
  person_id uuid references people (id),
  signal_type signal_type not null,
  occurred_at timestamptz not null,
  received_at timestamptz not null default now(),
  code text,
  image_hash text,
  media_path text,                -- private bucket, signed URLs only; 90-day retention (14.7)
  names_task boolean,
  after_task_prompt boolean,
  from_registered_number boolean,
  provider_message_id text,       -- idempotency for webhooks
  created_at timestamptz not null default now(),
  unique (provider_message_id)
);
create index checkin_signals_task on checkin_signals (task_id);
create index checkin_signals_hash on checkin_signals (household_id, image_hash);

create table return_checks (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references care_tasks (id) on delete cascade,
  answered_by uuid not null references people (id),
  answer text not null check (answer in ('done', 'not_done')),
  details jsonb not null default '{}'::jsonb, -- food bowl, water, toilet pad, pet state
  duration_seconds int,
  created_at timestamptz not null default now()
);

create table code_cards (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  month text not null check (month ~ '^\d{4}-\d{2}$'),
  codes jsonb not null,
  issued_at timestamptz not null default now(),
  revoked_at timestamptz,
  revoke_reason text
);

-- North Star (PS-111).
create table care_days (
  household_id uuid not null references households (id) on delete cascade,
  pet_id uuid not null references pets (id) on delete cascade,
  day date not null,
  outcome day_outcome not null,
  verified boolean not null default false,
  reason_codes text[] not null default '{}',
  rule_version text not null,
  owner_marked_covered boolean,
  corrected_by uuid references people (id),
  computed_at timestamptz not null default now(),
  primary key (pet_id, day)
);

-- ---------------------------------------------------------------------------
-- Alerts, incidents, look-in links (PS-031, PS-032, PS-036, PS-039, PS-101, PS-102, PS-124)

create table incidents (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  pet_id uuid references pets (id) on delete set null,
  task_id uuid references care_tasks (id) on delete set null,
  reported_by uuid references people (id),
  category text not null,
  severity severity not null,
  notes text,
  voice_note_path text,
  acknowledged_by uuid references people (id),
  acknowledged_at timestamptz,
  resolved_at timestamptz,
  resolution_note text,
  created_at timestamptz not null default now()
);

create table look_in_links (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,   -- store only a hash of the URL token
  task_id uuid not null references care_tasks (id) on delete cascade,
  recipient_person_id uuid not null references people (id),
  scope text not null default 'missed_task',
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz
);
create table look_in_link_opens (
  id bigint generated always as identity primary key,
  link_id uuid not null references look_in_links (id) on delete cascade,
  opened_at timestamptz not null default now(),
  user_agent text
);

-- ---------------------------------------------------------------------------
-- Friend Finder (PS-050 to PS-069, PS-123)

create table friend_profiles (
  person_id uuid primary key references people (id) on delete cascade,
  discovery_opt_in boolean not null default false,   -- never on by default (9.5)
  nearby_opt_in boolean not null default false,
  paused_until timestamptz,
  paused_all boolean not null default false,
  availability jsonb not null default '[]'::jsonb,   -- weekly windows
  capabilities text[] not null default '{}',          -- feeding_water, short_walk, medicine, large_anxious_dog
  key_status text not null default 'no_key',
  max_open_requests int not null default 2,
  share_history boolean not null default false,
  availability_updated_at timestamptz not null default now()
);

create table friend_links (
  household_id uuid not null references households (id) on delete cascade,
  friend_person_id uuid not null references people (id) on delete cascade,
  blocked boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (household_id, friend_person_id)
);

create table friend_searches (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  pet_id uuid not null references pets (id) on delete cascade,
  created_by uuid not null references people (id),
  raw_request text,
  parsed_request jsonb,             -- AI output, owner-confirmed
  parse_source text check (parse_source in ('llm', 'manual_form')),
  owner_corrected_fields text[] not null default '{}', -- AI correction rate (16.3)
  task_start timestamptz not null,
  state search_state not null default 'draft',
  machine_state jsonb not null,     -- full reducer state from @pawsure/domain
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table friend_search_recipients (
  search_id uuid not null references friend_searches (id) on delete cascade,
  friend_person_id uuid not null references people (id),
  state text not null,
  rank int,
  rank_reasons text[] not null default '{}',
  responded_at timestamptz,
  primary key (search_id, friend_person_id)
);

-- ---------------------------------------------------------------------------
-- Rewards (PS-028, PS-042 to PS-044, PS-126)

create table reward_ledger (
  id uuid primary key default gen_random_uuid(),
  helper_person_id uuid not null references people (id),
  household_id uuid not null references households (id) on delete cascade,
  task_id uuid references care_tasks (id) on delete set null,
  points int not null check (points > 0),
  state ledger_state not null,
  reason text not null,
  hold_until timestamptz,
  created_at timestamptz not null default now(),
  unique (helper_person_id, task_id)
);

-- ---------------------------------------------------------------------------
-- Consent, rights, audit, flags, idempotency (PS-002, PS-021, PS-071, PS-072, PS-119)

create table consent_records (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references people (id) on delete cascade,
  household_id uuid references households (id) on delete cascade,
  purpose text not null,           -- terms_privacy, helper_checkins, friend_discovery, nearby_discovery, live_location
  scope jsonb not null default '{}'::jsonb,
  consent_text_version text not null,
  language app_language not null,
  status consent_status not null,
  channel text not null,           -- app, whatsapp
  at timestamptz not null default now()
);

create table rights_requests (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references people (id),
  type rights_type not null,
  channel text not null,
  details text,
  received_at timestamptz not null default now(),
  due_at timestamptz not null default now() + interval '7 days', -- pilot target; DPDP outer limit 90 days
  closed_at timestamptz,
  outcome text
);

create table audit_log (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  actor_person_id uuid,
  actor_kind text not null,        -- person, system, ops
  action text not null,
  subject_table text,
  subject_id text,
  household_id uuid,
  details jsonb not null default '{}'::jsonb
);

create table feature_flags (
  key text not null,
  cohort text not null default '*',
  household_id uuid references households (id) on delete cascade,
  enabled boolean not null,
  updated_at timestamptz not null default now(),
  updated_by uuid
);
create unique index feature_flags_scope on feature_flags (key, cohort, coalesce(household_id, '00000000-0000-0000-0000-000000000000'::uuid));

-- Durable timer jobs (escalation ladder, Friend Finder ticks, severity calls).
create table scheduled_jobs (
  job_key text primary key,        -- idempotency: e.g. "<task_id>:ladder:2"
  kind text not null,
  run_at timestamptz not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'scheduled' check (status in ('scheduled', 'running', 'done', 'skipped', 'failed')),
  attempts int not null default 0,
  last_error text,
  created_at timestamptz not null default now()
);
create index scheduled_jobs_due on scheduled_jobs (run_at) where status = 'scheduled';

create table processed_webhooks (
  provider text not null,
  message_id text not null,
  received_at timestamptz not null default now(),
  primary key (provider, message_id)
);

-- Default pilot switches (6.0).
insert into feature_flags (key, enabled) values
  ('helper_points', false),           -- switched ON per household for half the pilot homes
  ('helper_shareable_record', false),
  ('nearby_member_fallback', false),
  ('friend_thank_you_points', false),
  ('camera_look_in', false),
  ('steps_challenge', false);

-- ---------------------------------------------------------------------------
-- Audit is append-only.

create function forbid_change() returns trigger language plpgsql as $$
begin
  raise exception '% is append-only', tg_table_name;
end $$;
create trigger audit_log_append_only before update or delete on audit_log
  for each row execute function forbid_change();
create trigger task_status_changes_append_only before update or delete on care_task_status_changes
  for each row execute function forbid_change();

-- ---------------------------------------------------------------------------
-- Row-level security

create function current_person_id() returns uuid
  language sql stable security definer set search_path = public as $$
  select id from people where auth_user_id = auth.uid()
$$;

-- Owners and co-owners manage a household; revocation takes effect immediately.
create function is_household_admin(h uuid) returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from care_circle_members m
    where m.household_id = h and m.person_id = current_person_id()
      and m.role in ('owner', 'co_owner') and m.revoked_at is null
  )
$$;

alter table people enable row level security;
alter table households enable row level security;
alter table care_circle_members enable row level security;
alter table household_access_details enable row level security;
alter table pets enable row level security;
alter table health_events enable row level security;
alter table care_plans enable row level security;
alter table care_tasks enable row level security;
alter table care_task_status_changes enable row level security;
alter table checkin_signals enable row level security;
alter table return_checks enable row level security;
alter table code_cards enable row level security;
alter table care_days enable row level security;
alter table incidents enable row level security;
alter table look_in_links enable row level security;
alter table look_in_link_opens enable row level security;
alter table friend_profiles enable row level security;
alter table friend_links enable row level security;
alter table friend_searches enable row level security;
alter table friend_search_recipients enable row level security;
alter table reward_ledger enable row level security;
alter table consent_records enable row level security;
alter table rights_requests enable row level security;
alter table audit_log enable row level security;
alter table feature_flags enable row level security;
alter table scheduled_jobs enable row level security;
alter table processed_webhooks enable row level security;
-- No policies on audit_log, scheduled_jobs, processed_webhooks, look_in_links,
-- look_in_link_opens: service role only.

create policy people_self on people for all
  using (auth_user_id = auth.uid()) with check (auth_user_id = auth.uid());
create policy people_same_circle on people for select using (
  exists (select 1 from care_circle_members m where m.person_id = people.id and is_household_admin(m.household_id))
);

create policy households_read on households for select using (is_household_admin(id));
create policy households_update on households for update using (is_household_admin(id)) with check (is_household_admin(id));
-- Inserts go through create_household() so the owner membership is created atomically.

create function create_household(p_name text, p_society text default null, p_tower text default null)
  returns uuid language plpgsql security definer set search_path = public as $$
declare
  me uuid := current_person_id();
  h uuid;
begin
  if me is null then raise exception 'Sign in and complete your profile first'; end if;
  insert into households (name, society, tower) values (p_name, p_society, p_tower) returning id into h;
  insert into care_circle_members (household_id, person_id, role, consent) values (h, me, 'owner', 'given');
  insert into audit_log (actor_person_id, actor_kind, action, subject_table, subject_id, household_id)
    values (me, 'person', 'household_created', 'households', h::text, h);
  return h;
end $$;
revoke all on function create_household(text, text, text) from public;
grant execute on function create_household(text, text, text) to authenticated;
create policy circle_admin on care_circle_members for all
  using (is_household_admin(household_id)) with check (is_household_admin(household_id));
create policy access_details_admin on household_access_details for all
  using (is_household_admin(household_id)) with check (is_household_admin(household_id));

create policy pets_admin on pets for all
  using (is_household_admin(household_id)) with check (is_household_admin(household_id));
create policy health_admin on health_events for all
  using (exists (select 1 from pets p where p.id = pet_id and is_household_admin(p.household_id)))
  with check (exists (select 1 from pets p where p.id = pet_id and is_household_admin(p.household_id)));
create policy plans_admin on care_plans for all
  using (exists (select 1 from pets p where p.id = pet_id and is_household_admin(p.household_id)))
  with check (exists (select 1 from pets p where p.id = pet_id and is_household_admin(p.household_id)));

-- Owners read tasks/signals/days; the confidence engine (service role) writes them.
create policy tasks_read on care_tasks for select using (is_household_admin(household_id));
create policy task_changes_read on care_task_status_changes for select
  using (exists (select 1 from care_tasks t where t.id = task_id and is_household_admin(t.household_id)));
create policy signals_read on checkin_signals for select using (is_household_admin(household_id));
create policy days_read on care_days for select using (is_household_admin(household_id));
create policy return_checks_admin on return_checks for all
  using (exists (select 1 from care_tasks t where t.id = task_id and is_household_admin(t.household_id)))
  with check (answered_by = current_person_id()
    and exists (select 1 from care_tasks t where t.id = task_id and is_household_admin(t.household_id)));
create policy code_cards_read on code_cards for select using (is_household_admin(household_id));
create policy incidents_admin on incidents for select using (is_household_admin(household_id));

create policy friend_profile_self on friend_profiles for all
  using (person_id = current_person_id()) with check (person_id = current_person_id());
create policy friend_links_admin on friend_links for all
  using (is_household_admin(household_id)) with check (is_household_admin(household_id));
create policy searches_admin on friend_searches for select using (is_household_admin(household_id));
create policy recipients_admin on friend_search_recipients for select
  using (exists (select 1 from friend_searches s where s.id = search_id and is_household_admin(s.household_id)));

create policy ledger_helper on reward_ledger for select using (helper_person_id = current_person_id());
create policy ledger_owner_totals on reward_ledger for select using (is_household_admin(household_id));

create policy consent_self on consent_records for select using (person_id = current_person_id());
create policy rights_self on rights_requests for all
  using (person_id = current_person_id()) with check (person_id = current_person_id());

create policy flags_read on feature_flags for select using (auth.uid() is not null);
