-- Demo sign-in account (dev project only; never run against the pilot project).
-- One shared owner login with Neha's household, Bruno and his routine.
-- The app's demo sign-in uses these credentials after the on-screen demo code.
-- Idempotent: re-running leaves a single demo account.

do $$
declare
  uid uuid := 'd0000000-0000-4000-8000-000000000001';
  person uuid := 'd0000000-0000-4000-8000-000000000002';
  helper uuid := 'd0000000-0000-4000-8000-000000000003';
  hh uuid := 'd0000000-0000-4000-8000-000000000004';
  dog uuid := 'd0000000-0000-4000-8000-000000000005';
begin
  if not exists (select 1 from auth.users where id = uid) then
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
      'demo.owner@example.com', extensions.crypt('pawsure-demo-2026', extensions.gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"],"demo":true}', '{"display_name":"Neha"}', now(), now(),
      '', '', '', ''
    );
    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid, uid::text,
      jsonb_build_object('sub', uid::text, 'email', 'demo.owner@example.com', 'email_verified', true),
      'email', now(), now(), now());
  end if;

  insert into public.people (id, auth_user_id, phone_e164, display_name, preferred_language)
  values (person, uid, '+919800000001', 'Neha', 'en'), (helper, null, '+919800000003', 'Sunita', 'mr')
  on conflict (id) do nothing;

  insert into public.households (id, name, society, tower, pilot_cohort)
  values (hh, 'Neha''s home', 'Hiranandani Gardens', 'Tower B', 'demo')
  on conflict (id) do nothing;

  insert into public.care_circle_members (household_id, person_id, role, helper_mode, checkin_method, consent)
  values (hh, person, 'owner', null, null, 'given'),
         (hh, helper, 'helper', 'tracked', 'whatsapp_photo', 'given')
  on conflict (household_id, person_id, role) do nothing;

  insert into public.pets (id, household_id, name, species, breed, age_years, food_notes, allergies, medicines,
                           fears_habits, vet_name, vet_phone, nearest_24x7_clinic, emergency_notes)
  values (dog, hh, 'Bruno', 'dog', 'Indie', 4, '1 cup kibble at 1 pm, fresh water', 'Chicken',
          'Joint supplement, 1 tablet with lunch', 'Scared of fireworks; pulls on the leash near the gate',
          'Dr. Kulkarni, Powai Pet Clinic', '+919820000000', 'Mumbai Vet 24x7, Andheri East',
          'Backup: Amit (husband) +919820011111')
  on conflict (id) do nothing;

  if not exists (select 1 from public.care_plans where pet_id = dog) then
    insert into public.care_plans (pet_id, task_type, title, due_time, expected_minutes) values
      (dog, 'feeding', 'Lunch + water', '13:00', 10),
      (dog, 'medicine', 'Joint supplement', '13:00', 3),
      (dog, 'walk', 'Afternoon walk', '16:00', 20),
      (dog, 'toilet_pad', 'Change toilet pad', '18:30', 3);
    insert into public.health_events (pet_id, event_type, due_on, notes) values
      (dog, 'vaccine', current_date + 5, 'Rabies booster'),
      (dog, 'deworming', current_date, 'Quarterly tablet'),
      (dog, 'check_up', current_date + 38, 'Annual check-up');
  end if;
end $$;
