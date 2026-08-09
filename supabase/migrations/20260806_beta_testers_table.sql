-- Table: beta_testers
-- Signups from the landing page ("Únete a la beta") — collected before granting
-- access to TestFlight / Google Play internal testing.

create table if not exists beta_testers (
  id          uuid primary key default gen_random_uuid(),
  first_name  text not null,
  last_name   text not null,
  email       text not null unique,
  platform    text,  -- 'ios' | 'android' | null
  locale      text,  -- 'es' | 'en' | 'fr'
  how_heard   text,  -- 'instagram' | 'tiktok' | 'google' | 'friend' | 'other' | null
  created_at  timestamptz default now()
);

alter table beta_testers add column if not exists how_heard text;

-- Enable RLS
alter table beta_testers enable row level security;

-- Public (anon) can submit a signup, but cannot read, update or delete —
-- protects emails from being scraped through the public anon key.
drop policy if exists "beta_testers_insert_public" on beta_testers;
create policy "beta_testers_insert_public" on beta_testers
  for insert
  to anon
  with check (true);

-- ── Alerta por email a blummapp@gmail.com en cada inscripción ────────────────
-- Llama a la Edge Function notify-beta-signup vía pg_net (extensión ya
-- habilitada en este proyecto).
--
-- IMPORTANTE: __BETA_NOTIFY_SECRET__ es un placeholder — NO se ha commiteado
-- el secreto real. Antes de aplicar esta migración en otro entorno, sustituir
-- por el valor real (mismo que el secret BETA_NOTIFY_SECRET de la función),
-- p.ej.: sed "s/__BETA_NOTIFY_SECRET__/$SECRET/" archivo.sql | supabase db query --linked -f -
-- Solo puede leer el secreto un rol con privilegios para inspeccionar
-- pg_proc de funciones SECURITY DEFINER (no expuesto a anon/authenticated
-- vía la API, pero visible por catálogo a roles con acceso a pg_proc).

create or replace function notify_beta_signup() returns trigger as $$
begin
  perform net.http_post(
    url := 'https://lpcvkzmfemxziuhdmzpx.supabase.co/functions/v1/notify-beta-signup',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'X-Notify-Secret', '__BETA_NOTIFY_SECRET__'
    ),
    body := jsonb_build_object(
      'first_name', new.first_name,
      'last_name', new.last_name,
      'email', new.email,
      'platform', new.platform,
      'locale', new.locale,
      'how_heard', new.how_heard,
      'created_at', new.created_at
    )
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public, net;

revoke all on function notify_beta_signup() from public, anon, authenticated;

drop trigger if exists beta_testers_notify on beta_testers;
create trigger beta_testers_notify
  after insert on beta_testers
  for each row execute function notify_beta_signup();
