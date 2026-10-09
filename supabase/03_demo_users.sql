-- ============================================================
-- BOLT demo accounts (run AFTER 01_schema.sql and 02_seed.sql)
-- Creates three confirmed auth users so no email verification is needed.
--   student@bolt.school / Bolt2036!   (Maya Khalil)
--   teacher@bolt.school / Bolt2036!   (Rania Haddad)
--   parent@bolt.school  / Bolt2036!   (Samir Khalil, parent of Maya)
-- If this block errors on your Supabase version, simply turn OFF
-- Authentication → Providers → Email → "Confirm email" and click a demo
-- account in the app: BOLT will create the user on first login.
-- ============================================================
create extension if not exists pgcrypto;

do $$
declare
  acct record;
  uid uuid;
begin
  for acct in
    select * from (values
      ('student@bolt.school', 'Maya Khalil', 'student'),
      ('teacher@bolt.school', 'Rania Haddad', 'teacher'),
      ('parent@bolt.school',  'Samir Khalil', 'parent')
    ) as t(email, full_name, role)
  loop
    if not exists (select 1 from auth.users where email = acct.email) then
      uid := gen_random_uuid();
      insert into auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
        confirmation_token, recovery_token, email_change_token_new, email_change, is_sso_user
      ) values (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', acct.email,
        crypt('Bolt2036!', gen_salt('bf')), now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('full_name', acct.full_name, 'role', acct.role),
        now(), now(), '', '', '', '', false
      );
      insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
      values (gen_random_uuid(), uid, uid::text,
        jsonb_build_object('sub', uid::text, 'email', acct.email, 'email_verified', true),
        'email', now(), now(), now());
    end if;
  end loop;
end $$;

-- make sure the seeded profiles point at the auth users (the trigger also does this)
update public.profiles p set auth_id = u.id from auth.users u where lower(u.email) = p.email and p.auth_id is null;
