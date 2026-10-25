-- ════════════════════════════════════════════════════════════════════════
--  SNOOZ content update (October 2026)
--  Run this ONCE in Supabase → SQL Editor if you already ran schema.sql before.
--  Updates contact details, amenities, gallery, tour videos, FAQs and travel
--  times, and creates/resets the admin login. Safe to run more than once.
-- ════════════════════════════════════════════════════════════════════════

alter table public.videos drop constraint if exists videos_placement_check;
alter table public.videos add constraint videos_placement_check check (placement in ('hero','experience','tour','other'));

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
