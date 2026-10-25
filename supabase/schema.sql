-- ════════════════════════════════════════════════════════════════════════
--  SNOOZ — Supabase schema, Row Level Security, storage and seed data
--  Run this whole file once in Supabase → SQL Editor → New query → Run.
--  It is safe to re-run: tables use IF NOT EXISTS and seeds use ON CONFLICT.
-- ════════════════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ─── Helpers ────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ─── Admin users ────────────────────────────────────────────────────────
-- Only users listed here can use the admin panel. Create the user in
-- Authentication → Users, then:  insert into admin_users (user_id, email)
-- select id, email from auth.users where email = 'you@example.com';
create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;
grant execute on function public.is_admin() to anon, authenticated;

-- ─── Leads ──────────────────────────────────────────────────────────────
create table if not exists public.leads (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  full_name   text not null check (char_length(full_name) between 2 and 120),
  phone       text not null check (char_length(phone) between 7 and 20),
  email       text check (email is null or char_length(email) <= 160),
  check_in    date,
  check_out   date,
  guests      int check (guests is null or guests between 1 and 50),
  preference  text check (preference is null or char_length(preference) <= 80),
  message     text check (message is null or char_length(message) <= 2000),
  status      text not null default 'new' check (status in ('new','contacted','interested','booked','closed')),
  source      text,
  page        text,
  utm         jsonb,
  ip_hash     text,
  user_agent  text
);
create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_status_idx on public.leads (status);
create index if not exists leads_ip_recent_idx on public.leads (ip_hash, created_at desc);
drop trigger if exists leads_updated_at on public.leads;
create trigger leads_updated_at before update on public.leads
  for each row execute function public.set_updated_at();

create table if not exists public.admin_notes (
  id         uuid primary key default gen_random_uuid(),
  lead_id    uuid not null references public.leads (id) on delete cascade,
  note       text not null check (char_length(note) between 1 and 4000),
  author     uuid default auth.uid(),
  created_at timestamptz not null default now()
);
create index if not exists admin_notes_lead_idx on public.admin_notes (lead_id, created_at desc);

-- ─── Content tables ─────────────────────────────────────────────────────
create table if not exists public.rooms (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  slug        text unique not null,
  description text not null default '',
  price_label text,
  features    text[] not null default '{}',
  image_url   text not null default '',
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.amenities (
  id          uuid primary key default gen_random_uuid(),
  title       text not null unique,
  description text not null default '',
  icon        text not null default 'sparkles',
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.gallery (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  category    text not null default 'Rooms',
  image_url   text not null unique,
  alt         text,
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.videos (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  placement   text not null default 'other' check (placement in ('hero','experience','tour','other')),
  src_mp4     text not null unique,
  src_webm    text,
  poster      text,
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.faqs (
  id          uuid primary key default gen_random_uuid(),
  question    text not null unique,
  answer      text not null,
  page        text not null default 'home',
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.testimonials (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  role        text,
  quote       text not null,
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.location_points (
  id          uuid primary key default gen_random_uuid(),
  label       text not null unique,
  minutes     int not null default 5,
  description text,
  icon        text not null default 'map-pin',
  map_x       real not null default 0.5,
  map_y       real not null default 0.5,
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.availability (
  id          uuid primary key default gen_random_uuid(),
  label       text not null unique,
  available   int not null default 0,
  total       int,
  note        text,
  is_public   boolean not null default false,
  sort_order  int not null default 0,
  updated_at  timestamptz not null default now()
);
drop trigger if exists availability_updated_at on public.availability;
create trigger availability_updated_at before update on public.availability
  for each row execute function public.set_updated_at();

create table if not exists public.seo_pages (
  id          uuid primary key default gen_random_uuid(),
  path        text not null unique,
  title       text not null,
  description text not null,
  keywords    text,
  og_image    text,
  updated_at  timestamptz not null default now()
);
drop trigger if exists seo_pages_updated_at on public.seo_pages;
create trigger seo_pages_updated_at before update on public.seo_pages
  for each row execute function public.set_updated_at();

create table if not exists public.settings (
  key        text primary key,
  value      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
drop trigger if exists settings_updated_at on public.settings;
create trigger settings_updated_at before update on public.settings
  for each row execute function public.set_updated_at();

create table if not exists public.blogs (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  slug            text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  excerpt         text not null default '',
  content         text not null default '',
  cover_image     text,
  tags            text[] not null default '{}',
  status          text not null default 'draft' check (status in ('draft','published')),
  author          text,
  published_at    timestamptz,
  seo_title       text,
  seo_description text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists blogs_status_published_idx on public.blogs (status, published_at desc);
drop trigger if exists blogs_updated_at on public.blogs;
create trigger blogs_updated_at before update on public.blogs
  for each row execute function public.set_updated_at();

-- Allow the "tour" video placement on databases created before it existed
alter table public.videos drop constraint if exists videos_placement_check;
alter table public.videos add constraint videos_placement_check check (placement in ('hero','experience','tour','other'));

-- ════════════════════════════════════════════════════════════════════════
--  Row Level Security
-- ════════════════════════════════════════════════════════════════════════
alter table public.admin_users      enable row level security;
alter table public.leads            enable row level security;
alter table public.admin_notes      enable row level security;
alter table public.rooms            enable row level security;
alter table public.amenities        enable row level security;
alter table public.gallery          enable row level security;
alter table public.videos           enable row level security;
alter table public.faqs             enable row level security;
alter table public.testimonials     enable row level security;
alter table public.location_points  enable row level security;
alter table public.availability     enable row level security;
alter table public.seo_pages        enable row level security;
alter table public.settings         enable row level security;
alter table public.blogs            enable row level security;

-- admin_users: admins can see the list; nobody can write from the client.
drop policy if exists "admins read admin_users" on public.admin_users;
create policy "admins read admin_users" on public.admin_users for select using (public.is_admin());

-- leads: NO public access. Enquiries are inserted by the server (/api/leads)
-- with the service-role key after validation + rate limiting.
drop policy if exists "admins manage leads" on public.leads;
create policy "admins manage leads" on public.leads for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins manage notes" on public.admin_notes;
create policy "admins manage notes" on public.admin_notes for all using (public.is_admin()) with check (public.is_admin());

-- Public content: anyone can read active rows; only admins can write.
do $$
declare t text;
begin
  foreach t in array array['rooms','amenities','gallery','videos','faqs','testimonials','location_points'] loop
    execute format('drop policy if exists "public read active %1$s" on public.%1$I', t);
    execute format('create policy "public read active %1$s" on public.%1$I for select using (is_active or public.is_admin())', t);
    execute format('drop policy if exists "admins write %1$s" on public.%1$I', t);
    execute format('create policy "admins write %1$s" on public.%1$I for all using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

drop policy if exists "public read availability" on public.availability;
create policy "public read availability" on public.availability for select using (is_public or public.is_admin());
drop policy if exists "admins write availability" on public.availability;
create policy "admins write availability" on public.availability for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public read seo_pages" on public.seo_pages;
create policy "public read seo_pages" on public.seo_pages for select using (true);
drop policy if exists "admins write seo_pages" on public.seo_pages;
create policy "admins write seo_pages" on public.seo_pages for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public read settings" on public.settings;
create policy "public read settings" on public.settings for select using (true);
drop policy if exists "admins write settings" on public.settings;
create policy "admins write settings" on public.settings for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public read published blogs" on public.blogs;
create policy "public read published blogs" on public.blogs for select using (status = 'published' or public.is_admin());
drop policy if exists "admins write blogs" on public.blogs;
create policy "admins write blogs" on public.blogs for all using (public.is_admin()) with check (public.is_admin());

-- ════════════════════════════════════════════════════════════════════════
--  Storage — public "media" bucket for gallery images, videos, blog covers
-- ════════════════════════════════════════════════════════════════════════
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 52428800,
        array['image/jpeg','image/png','image/webp','image/avif','image/gif','video/mp4','video/webm','application/pdf'])
on conflict (id) do update set public = true;

drop policy if exists "public read media" on storage.objects;
create policy "public read media" on storage.objects for select using (bucket_id = 'media');
drop policy if exists "admins upload media" on storage.objects;
create policy "admins upload media" on storage.objects for insert with check (bucket_id = 'media' and public.is_admin());
drop policy if exists "admins update media" on storage.objects;
create policy "admins update media" on storage.objects for update using (bucket_id = 'media' and public.is_admin());
drop policy if exists "admins delete media" on storage.objects;
create policy "admins delete media" on storage.objects for delete using (bucket_id = 'media' and public.is_admin());

-- ════════════════════════════════════════════════════════════════════════
--  Seed content (matches lib/defaults.ts — edit everything later in /admin)
-- ════════════════════════════════════════════════════════════════════════
insert into public.settings (key, value) values ('site', '{
  "business_name": "The New Snoozy Capsules Premise",
  "brand": "SNOOZ",
  "tagline": "The New Snoozy Capsules Premise",
  "phone_mobile": "7039071356",
  "phone_office_1": "7039613561",
  "phone_office_2": "",
  "phone_landline": "022-4665 0191",
  "contact_person": "Gian Chand Sippy",
  "contact_person_phone": "8850119077",
  "whatsapp": "917039071356",
  "whatsapp_message": "Hi SNOOZ, I''d like to check availability for a stay.",
  "email": "snoozycapsulspremise@gmail.com",
  "address_line_1": "402, 4th Floor, Bay View Tower, Plot No. 7",
  "address_line_2": "Sector 11, opposite CBD Belapur Railway Station",
  "landmarks": "Near UTI Building & Vindhya Complex, opposite Turning Point Hotel",
  "locality": "CBD Belapur",
  "city": "Navi Mumbai",
  "region": "Maharashtra",
  "postal_code": "400614",
  "country": "IN",
  "latitude": 19.0176437,
  "longitude": 73.0447435,
  "maps_url": "https://maps.google.com/maps?q=19.0176437%2C73.0447435&z=17&hl=en",
  "hours_label": "Open 24 hours, 7 days a week",
  "instagram": "https://www.instagram.com/snoozy_beds/",
  "instagram_handle": "@snoozy_beds",
  "facebook": "https://www.facebook.com/share/1KAuArXMXj/",
  "youtube": "https://youtube.com/@snoozsnoozycapsulespremise-c5r",
  "google_business": "https://maps.google.com/maps?q=19.0176437%2C73.0447435&z=17&hl=en",
  "google_review": "https://g.page/r/CXDbgJoajK-OEBE/review",
  "youtube_shorts": "https://youtube.com/shorts/RlLh6vFp4ek\nhttps://youtube.com/shorts/9FQGfQXgVg0",
  "facebook_reels": "https://www.facebook.com/share/r/1WuueKrMWo/\nhttps://www.facebook.com/share/r/1UUE3NYMeg/\nhttps://www.facebook.com/share/r/1C9vpELLYB/\nhttps://www.facebook.com/share/r/19NLT3iG4p/",
  "upi_vpa": "Getepay.mcooblqr344381",
  "upi_qr": "/media/img/qr-upi.jpg",
  "google_review_qr": "/media/img/qr-google-review.jpg",
  "instagram_qr": "/media/img/qr-instagram.jpg"
}'::jsonb)
on conflict (key) do update set value = public.settings.value || excluded.value;

insert into public.settings (key, value) values ('content', '{}'::jsonb), ('seo', '{}'::jsonb) on conflict (key) do nothing;

insert into public.rooms (title, slug, description, price_label, features, image_url, sort_order, is_active) values
  ('Capsule berth', 'capsule-berth', 'A curtained 3 × 6 ft berth in the air-conditioned dorm, made up with fresh white linen, a pillow and a warm blanket. Ideal for a night or a short work trip.', 'Nightly stays', array['3 × 6 ft bed','Privacy curtain','Personal light & socket','AC remote within reach']::text[], '/media/img/capsule-berth-wide.jpg', 1, true),
  ('AC dormitory', 'ac-dormitory', 'Upper and lower bunks in a clean, cool dorm with sturdy steel frames, a ladder to every upper berth and a locker to keep your things safe.', 'Weekly stays', array['Air-conditioned','Locker available','Wi-Fi','24/7 staff']::text[], '/media/img/dorm-bunks-ac.jpg', 2, true),
  ('PG long stay', 'pg-long-stay', 'Working or studying in Belapur? Make SNOOZ your base for the month — right opposite the station, with hot water, filtered drinking water and 24-hour water supply.', 'Monthly stays', array['Opposite Belapur station','Geyser / hot water','Filtered drinking water','Flexible move-in']::text[], '/media/img/property-bay-view-tower.jpg', 3, true)
on conflict (slug) do update set title = excluded.title, description = excluded.description, price_label = excluded.price_label, features = excluded.features, image_url = excluded.image_url, sort_order = excluded.sort_order, is_active = excluded.is_active;

insert into public.amenities (title, description, icon, sort_order, is_active) values
  ('AC beds, 3 × 6 ft', 'A full-length 3 × 6 ft bed in a cool, air-conditioned dorm.', 'snowflake', 1, true),
  ('Wi-Fi', 'Free Wi-Fi for calls, streaming and work.', 'wifi', 2, true),
  ('Sea view facing', 'A sea-view facing building — Bay View Tower lives up to its name.', 'waves', 3, true),
  ('Lockers', 'A locker to keep your bags and valuables safe.', 'lock', 4, true),
  ('Geyser / hot water', 'Hot water for a proper bath, any time of day.', 'shower', 5, true),
  ('24-hour water', 'Running water round the clock.', 'droplets', 6, true),
  ('Water filter', 'Clean, filtered drinking water on the floor.', 'glass', 7, true),
  ('Neat & clean', 'Fresh white linen and a tidy dorm, every stay.', 'spray', 8, true),
  ('24/7 service', 'Check in late, leave early. Someone is always on hand.', 'clock', 9, true),
  ('Opposite the station', 'Right opposite CBD Belapur railway station, Sector 11.', 'train', 10, true),
  ('Easy connectivity', 'Highway and airport within minutes.', 'route', 11, true),
  ('Secure environment', 'A staffed building with round-the-clock attention.', 'shield', 12, true)
on conflict (title) do update set description = excluded.description, icon = excluded.icon, sort_order = excluded.sort_order, is_active = excluded.is_active;

update public.amenities set is_active = false where title not in ('AC beds, 3 × 6 ft', 'Wi-Fi', 'Sea view facing', 'Lockers', 'Geyser / hot water', '24-hour water', 'Water filter', 'Neat & clean', '24/7 service', 'Opposite the station', 'Easy connectivity', 'Secure environment');

insert into public.gallery (title, category, image_url, alt, sort_order, is_active) values
  ('AC dormitory', 'Rooms', '/media/img/dorm-bunks-ac.jpg', 'White steel bunk beds with curtains under an inverter AC in the SNOOZ dormitory', 1, true),
  ('Capsule berth', 'Capsules', '/media/img/capsule-berth-wide.jpg', 'Lower berth with white linen, blanket, AC remote and a switchboard with sockets', 2, true),
  ('Bay View Tower', 'Property', '/media/img/property-bay-view-tower.jpg', 'Bay View Tower, Sector 11, CBD Belapur', 3, true),
  ('Night view from SNOOZ', 'Night View', '/media/img/night-view-window.jpg', 'Night view over the trees and city lights from the SNOOZ window', 4, true),
  ('Made-up berth', 'Capsules', '/media/img/capsule-bed.jpg', 'Made-up berth with a mustard blanket, pillow and tie-back curtain', 5, true),
  ('Dorm aisle', 'Rooms', '/media/img/dorm-aisle.jpg', 'Aisle between rows of bunks in the AC dormitory', 6, true),
  ('Reception', 'Property', '/media/img/reception-desk.jpg', 'SNOOZ reception desk with staff', 7, true),
  ('Bunks with curtains', 'Rooms', '/media/img/dorm-bunk.jpg', 'Bunk beds with privacy curtains, fresh linen and blankets', 8, true),
  ('Lower berth light', 'Capsules', '/media/img/lower-berth-light.jpg', 'Lower berth with a reading light and socket panel', 9, true),
  ('Wash area', 'Property', '/media/img/wash-area.jpg', 'Clean wash basin area at SNOOZ', 10, true),
  ('Right outside', 'Location', '/media/img/outside-sector-11.jpg', 'Street outside Bay View Tower, Sector 11, CBD Belapur', 11, true),
  ('Welcome to SNOOZ', 'Property', '/media/img/reception-snooz.jpg', 'SNOOZ banner at the entrance', 12, true),
  ('Upper berth ladder', 'Rooms', '/media/img/room-walk-2.jpg', 'Steel ladder up to an upper berth', 13, true),
  ('Wake up to the bay', 'Sea View', '/media/img/capsule-sea-window.jpg', 'Guest looking out at the sea from a capsule window', 14, true)
on conflict (image_url) do update set title = excluded.title, category = excluded.category, alt = excluded.alt, sort_order = excluded.sort_order, is_active = excluded.is_active;

update public.gallery set is_active = false where image_url like '/media/%' and image_url not in ('/media/img/dorm-bunks-ac.jpg', '/media/img/capsule-berth-wide.jpg', '/media/img/property-bay-view-tower.jpg', '/media/img/night-view-window.jpg', '/media/img/capsule-bed.jpg', '/media/img/dorm-aisle.jpg', '/media/img/reception-desk.jpg', '/media/img/dorm-bunk.jpg', '/media/img/lower-berth-light.jpg', '/media/img/wash-area.jpg', '/media/img/outside-sector-11.jpg', '/media/img/reception-snooz.jpg', '/media/img/room-walk-2.jpg', '/media/img/capsule-sea-window.jpg');

insert into public.videos (title, placement, src_mp4, src_webm, poster, sort_order, is_active) values
  ('Inside SNOOZ (hero background)', 'hero', '/media/video/hero-room.mp4', '/media/video/hero-room.webm', '/media/img/hero-poster.jpg', 1, true),
  ('SNOOZ brand film', 'experience', '/media/video/brand-film-1080.mp4', null, '/media/img/capsule-sea-window.jpg', 2, true),
  ('Walk in from the street', 'tour', '/media/video/tour-arrival.mp4', null, '/media/img/poster-tour-arrival.jpg', 3, true),
  ('Inside the AC dorm', 'tour', '/media/video/tour-dorm.mp4', null, '/media/img/poster-tour-dorm.jpg', 4, true),
  ('Rows of berths', 'tour', '/media/video/tour-bunks.mp4', null, '/media/img/poster-tour-bunks.jpg', 5, true),
  ('Night view', 'tour', '/media/video/tour-night.mp4', null, '/media/img/poster-tour-night.jpg', 6, true),
  ('Opening day', 'tour', '/media/video/tour-opening.mp4', null, '/media/img/poster-tour-opening.jpg', 7, true)
on conflict (src_mp4) do update set title = excluded.title, placement = excluded.placement, src_webm = excluded.src_webm, poster = excluded.poster, sort_order = excluded.sort_order, is_active = excluded.is_active;

insert into public.faqs (question, answer, page, sort_order, is_active) values
  ('What is SNOOZ?', 'SNOOZ — The New Snoozy Capsules Premise — is a capsule-style AC dormitory in CBD Belapur, Navi Mumbai. You get your own curtained 3 × 6 ft berth with fresh linen, a light and a socket, plus a locker, Wi-Fi, hot water and 24/7 service, in a sea-view facing building.', 'home', 1, true),
  ('Where is SNOOZ located?', '402, 4th Floor, Bay View Tower, Plot No. 7, Sector 11, CBD Belapur, Navi Mumbai 400614 — opposite CBD Belapur railway station, near the UTI Building and Vindhya Complex, opposite Turning Point Hotel.', 'home', 2, true),
  ('Is SNOOZ sea-facing?', 'Yes. SNOOZ is in a sea-view facing building on the fourth floor of Bay View Tower.', 'home', 3, true),
  ('What size are the beds?', 'Every berth has a 3 × 6 ft bed, made up with fresh white linen, a pillow and a blanket.', 'home', 4, true),
  ('Is the dormitory air conditioned?', 'Yes. The whole dormitory is air-conditioned, and there''s an AC remote within reach of the berths.', 'home', 5, true),
  ('Is WiFi available?', 'Yes, Wi-Fi is available for all guests.', 'home', 6, true),
  ('Is there a locker for my bags?', 'Yes, lockers are available so you can keep your bags and valuables safe.', 'home', 7, true),
  ('Is there hot water and drinking water?', 'Yes. There''s a geyser for hot water, water supply 24 hours a day, and a water filter for clean drinking water.', 'home', 8, true),
  ('Is SNOOZ available 24/7?', 'Yes. SNOOZ runs 24 hours a day, 7 days a week, so you can check in after a late train or flight.', 'home', 9, true),
  ('How far is SNOOZ from Belapur Railway Station?', 'SNOOZ is right opposite CBD Belapur railway station — about 2 minutes away.', 'home', 10, true),
  ('How far is SNOOZ from the highway?', 'About 3 minutes by road to the highway. Travel times are approximate and depend on traffic.', 'home', 11, true),
  ('How far is SNOOZ from the airport?', 'About 10 minutes by road to the Navi Mumbai airport. Travel times are approximate and depend on traffic.', 'home', 12, true),
  ('How can I check availability?', 'Use the Check availability form on this site with your dates, or call or WhatsApp us on 7039071356. We''ll confirm a berth for your dates.', 'home', 13, true),
  ('How can I contact SNOOZ?', 'WhatsApp or call 7039071356, call 7039613561, or speak to Gian Chand Sippy on 8850119077. Landline: 022-4665 0191. Email: snoozycapsulspremise@gmail.com.', 'home', 14, true)
on conflict (question) do update set answer = excluded.answer, page = excluded.page, sort_order = excluded.sort_order, is_active = excluded.is_active;

insert into public.location_points (label, minutes, description, icon, map_x, map_y, sort_order, is_active) values
  ('Railway Station', 2, 'Opposite CBD Belapur station', 'train', 0.42, 0.32, 1, true),
  ('Highway', 3, 'Quick highway access', 'route', -0.18, 0.78, 2, true),
  ('Airport', 10, 'Navi Mumbai International Airport', 'plane', 0.78, -0.72, 3, true)
on conflict (label) do update set minutes = excluded.minutes, description = excluded.description, icon = excluded.icon, map_x = excluded.map_x, map_y = excluded.map_y, sort_order = excluded.sort_order, is_active = excluded.is_active;

insert into public.availability (label, available, note, is_public, sort_order) values
('Capsule berths', 0, 'Call to confirm for tonight', false, 1)
on conflict (label) do nothing;


-- Starter blog posts (edit or unpublish them from /admin/blogs)
insert into public.blogs (title, slug, excerpt, content, cover_image, tags, status, author, published_at, seo_title, seo_description) values
('PG, hostel or capsule stay? Choosing where to stay in CBD Belapur',
 'pg-hostel-or-capsule-stay-cbd-belapur',
 'Moving to Belapur for work, an internship or exams? Here''s how a capsule-style AC dormitory compares with a traditional PG or a hotel room.',
 E'CBD Belapur is one of Navi Mumbai''s busiest business districts, and every week people arrive here for a new job, a training programme, an interview or an exam. The first question is always the same: **where do I stay?**\n\n## 1. A traditional PG\n\nA paying-guest room is the default for longer stays. You usually share a room, sign up for a month or more, and live by the house rules.\n\n## 2. A hotel room\n\nHotels give you a private room and full service, but the cost adds up quickly if your stay runs past a few nights.\n\n## 3. A capsule-style AC dormitory\n\nA capsule stay sits in between. You get **your own curtained berth** — your bed, your light, your socket — inside a shared, air-conditioned dorm. You can stay a night, a week or a month.\n\n## Where SNOOZ fits\n\nSNOOZ is a capsule-style AC dormitory on the 4th floor of Bay View Tower, Sector 11, CBD Belapur — about two minutes from the railway station. It runs 24/7 and has Wi-Fi.\n\n[Check availability](/contact) for your dates.',
 '/media/img/dorm-bunk.jpg', array['PG in CBD Belapur','Guides'], 'published', 'Team SNOOZ', '2026-09-20 09:00+00',
 'PG vs Hostel vs Capsule Stay in CBD Belapur — Which Should You Choose?',
 'Comparing PGs, hostels and capsule-style AC dormitories in CBD Belapur, Navi Mumbai: privacy, flexibility, location and what to ask before you book.'),
('What to pack for a capsule dormitory stay',
 'what-to-pack-capsule-dormitory-stay',
 'A short checklist for your first capsule-style stay — what we provide, and the few things worth bringing yourself.',
 E'Capsule stays are simple by design: a comfortable berth, clean linen and a quiet, cool room.\n\n## What SNOOZ provides\n\n- A made-up berth with **fresh white linen, a pillow and a blanket**\n- A **privacy curtain** for your berth\n- **Air-conditioning**, with a remote within reach\n- A **light and power socket** at your berth\n- **Wi-Fi**\n\n## What to bring\n\n1. Earplugs and an eye mask\n2. A small lock for your bag\n3. A long charging cable\n4. Slippers and a small toiletry kit\n5. A light layer — the AC keeps things cool\n\n[Check availability](/contact) and we''ll get back to you shortly.',
 '/media/img/capsule-bed.jpg', array['Capsule stay','Guides'], 'published', 'Team SNOOZ', '2026-10-02 09:00+00',
 'What to Pack for a Capsule Dormitory Stay — Checklist',
 'First capsule hotel or AC dormitory stay? Here''s what''s usually provided and a short packing checklist for a comfortable night.')
on conflict (slug) do nothing;

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
