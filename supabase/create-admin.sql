-- ════════════════════════════════════════════════════════════════════════
--  ADMIN LOGIN  —  password only:  admin@123
--  Run in Supabase → SQL Editor. Creates the admin account (or resets its
--  password) and gives it admin access. Safe to run as often as you like.
--
--  The login page only asks for the password. Behind the scenes Supabase
--  needs an email, so the account uses the fixed address below. It must
--  match NEXT_PUBLIC_ADMIN_EMAIL in your environment (default snooz@gmail.com).
--  To change the password later: edit v_password below and run this again,
--  or use Admin → Settings → Change password.
-- ════════════════════════════════════════════════════════════════════════
do $$
declare
  v_email    text := 'snooz@gmail.com';
  v_password text := 'admin@123';
  v_uid      uuid;
begin
  perform set_config('search_path', 'public, extensions, auth', true);
  select id into v_uid from auth.users where lower(email) = lower(v_email) limit 1;

  if v_uid is null then
    v_uid := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000', v_uid, 'authenticated', 'authenticated', v_email,
      crypt(v_password, gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now(),
      '', '', '', ''
    );
    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (
      gen_random_uuid(), v_uid, v_uid::text,
      jsonb_build_object('sub', v_uid::text, 'email', v_email, 'email_verified', true),
      'email', now(), now(), now()
    );
  else
    update auth.users
       set encrypted_password = crypt(v_password, gen_salt('bf')),
           email_confirmed_at = coalesce(email_confirmed_at, now()),
           banned_until = null,
           updated_at = now()
     where id = v_uid;
  end if;

  insert into public.admin_users (user_id, email) values (v_uid, v_email)
  on conflict (user_id) do nothing;
end $$;
