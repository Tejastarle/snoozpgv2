# SNOOZ — The New Snoozy Capsules Premise

Premium, lead-generating website for **SNOOZ**, a sea-view facing capsule stay / AC dormitory in Bay View Tower, Sector 11, CBD Belapur, Navi Mumbai — with a Supabase-backed admin panel for **leads, blogs and all website content**.

**Stack:** Next.js 16 (App Router, Turbopack) · React 19.2 · TypeScript · Tailwind CSS 4 · Three.js + React Three Fiber + drei · GSAP ScrollTrigger · Framer Motion · Lenis smooth scroll · Supabase (Postgres, Auth, Storage, RLS)

---

## 1. Run it locally (2 minutes)

Requires **Node.js 20.9 or newer** (`node -v`).

```bash
npm install
cp .env.example .env.local
# For a first look without Supabase, set NEXT_PUBLIC_DEMO_MODE=true in .env.local
npm run dev            # http://localhost:3000   ·   admin: http://localhost:3000/admin
```

`npm run dev` uses Turbopack, which keeps memory low even with the 3D libraries. The included `.npmrc` also raises Node's heap limit to 4 GB for `dev` and `build`.

With no Supabase keys the public site runs on the built-in default content (`lib/defaults.ts`). With `NEXT_PUBLIC_DEMO_MODE=true` you can also click around the admin panel with sample data — **nothing is saved** in demo mode.

## 2. Connect Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. **SQL Editor → New query →** paste all of `supabase/schema.sql` → **Run**.
   This creates every table, Row Level Security policy, the public `media` storage bucket and seed content (rooms, amenities, gallery, videos, FAQs, distances, starter blog posts). It is safe to re-run.
3. **Authentication → Providers → Email:** keep Email enabled and **turn off “Allow new users to sign up”** (admins are invited, nobody can self-register).
4. (Optional) To use a different admin password, edit `v_password` at the top of the last block in `schema.sql` (or in `supabase/create-admin.sql`) before running it.
5. The admin login is created automatically by the last block of `schema.sql`:
   **password `admin@123`** (the login page asks only for the password) — change it after your first login (Admin → Settings).
   To create or reset it again on its own, run `supabase/create-admin.sql`.
6. **Project Settings → API:** copy the URL, `anon` key and `service_role` key into your environment (below).

### Already ran an older `schema.sql`?

Run **`supabase/update-2026-10.sql`** once. It updates contact details (WhatsApp 7039071356, landmarks, map pin), the 12 amenities, gallery photos, the “See it for real” tour videos, FAQs and social links, and creates/resets the admin login. It is safe to run more than once.

## 3. Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | public | Your domain, e.g. `https://www.snoozcapsules.com` (canonical URLs, sitemap, OG) |
| `NEXT_PUBLIC_SUPABASE_URL` | public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | Supabase anon key (safe in the browser — RLS protects data) |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | Used only by `/api/leads` to store enquiries. Never prefix with `NEXT_PUBLIC_` |
| `LEAD_IP_SALT` | server only | Any long random string — visitor IPs are hashed for rate limiting, never stored raw |
| `LEAD_NOTIFY_WEBHOOK_URL` | server only, optional | Every new lead is POSTed here as JSON (Zapier / Make / n8n → WhatsApp, email, Sheets…) |
| `NEXT_PUBLIC_GA_ID` | optional | Google Analytics 4 measurement ID (`G-XXXX`) |
| `NEXT_PUBLIC_META_PIXEL_ID` | optional | Meta Pixel ID |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | optional | Google Search Console HTML-tag verification code |
| `NEXT_PUBLIC_DEMO_MODE` | optional | `true` only for demos **without** Supabase. Ignored once Supabase is configured |

## 4. Deploy to Vercel

1. Push this folder to a GitHub repo → **Vercel → Add New Project → Import**.
2. Framework preset: Next.js (auto). Add the environment variables above (Production + Preview).
3. Deploy. Then add your domain in Vercel → Domains and update `NEXT_PUBLIC_SITE_URL`.
4. Submit `https://your-domain/sitemap.xml` in Google Search Console.

## 5. Admin panel — `/admin`

Password-only login (Supabase Auth): the page asks for the password alone and signs in to a fixed admin account (`snooz@gmail.com` by default, set with `NEXT_PUBLIC_ADMIN_EMAIL`). After signing in you land on **Leads**, which checks for new enquiries every 30 seconds and shows a red count on the Leads menu item. Access requires both a valid session **and** a row in `admin_users`; every table is protected by RLS, so even the anon key can't read leads.

| Section | What you can do |
|---|---|
| **Dashboard** | New leads, today’s enquiries, pending follow-ups, bookings, conversion rate; lead trend (30 days), enquiry sources, booking trend (12 weeks), latest enquiries |
| **Leads** | Search, filter by status / date / source, change status (New → Contacted → Interested → Booked → Closed), add notes, call/WhatsApp/email in one tap, bulk delete, **export CSV** |
| **Bookings** | The same CRM, focused on interested + booked guests |
| **Blogs** | Markdown editor with toolbar, image upload, live preview, slug, tags, cover image, publish date, draft/publish, SEO title & description with Google preview |
| **Rooms · Gallery · Videos · Amenities · FAQs · Testimonials** | Add / edit / reorder / hide; upload images and videos to Supabase Storage |
| **Location** | Travel times (2 / 3 / 10 min) and their positions on the 3D map |
| **Availability** | Optional “X berths available” note beside the enquiry form |
| **Website content** | Every homepage headline, paragraph and CTA label; toggles for testimonials and availability |
| **Contact info** | Phones, WhatsApp, email, address, map coordinates, social links |
| **SEO** | Default title / description / keywords / OG image, plus per-page overrides |
| **Settings** | Change password, refresh the live site, environment checklist |

Saving anything re-publishes the site immediately (on-demand ISR); pages also refresh every 60 s.

## 6. Media

- **Hero background:** `public/media/video/hero-room.(mp4|webm)` — the WhatsApp walkthrough of the dorm, slowed and turned into a seamless ping-pong loop (≈1 MB). Swap it any time in **Admin → Videos** (placement “Hero background”).
- **Film section:** `brand-film-1080/720.mp4` + `.webm` — the 4K brand film transcoded to 1080p/720p, muted, lazy-loaded, paused off-screen.
- **Photos:** your building, bed and bunk photos plus frames from both videos live in `public/media/img`. `next/image` serves them as AVIF/WebP at the right size.
- The **SNOOZ wordmark** (`components/brand/logo-path.ts`, `public/media/img/snooz-logo.svg`) was traced to a vector from the business card, in the original burgundy `#67231A`.

> The sea-view section and one gallery image use a still from the brand film. The gallery otherwise shows only real photos of the dorm and building; brand-film frames of the skyline, the night tower and the wooden capsule are in `public/media/img` but not in the gallery, since they don't show the actual property. Add real 4th-floor sea and night views via Admin → Gallery when you have them — the Location and Night View tabs appear automatically.

## 7. SEO

- Pages: `/`, `/pg-in-cbd-belapur`, `/ac-dormitory-belapur`, `/sea-view-accommodation-belapur`, `/pg-near-belapur-station`, `/capsule-stay-navi-mumbai`, `/contact`, `/blog`, `/blog/[slug]` — each with unique copy (`lib/landing-pages.ts`), metadata, canonical URL and Open Graph.
- Structured data: `LodgingBusiness`/`Hostel` (address, geo, phone, email, 24/7 hours, amenities, social profiles), `FAQPage`, `BreadcrumbList`, `BlogPosting`.
- `sitemap.xml` (includes published blogs), `robots.txt` (blocks `/admin`, `/api`, `/thank-you`), web manifest, icons.
- Strong internal linking: footer “Stay in Belapur” links, related pages and blog posts on every landing page.

## 8. Analytics events

Sent to GA4 and Meta Pixel (when configured) via `lib/analytics.ts`:

`check_availability` (enquiry opened, with source) · `form_start` · `form_submit` · `generate_lead` (Meta: `Lead`) · `phone_click` · `whatsapp_click` · `email_click` · `directions_click` · `scroll_depth` (25/50/75/100) · `thank_you_view` · page views. Each lead also stores its **source** (which CTA), page and UTM parameters, shown in the admin.

## 9. Performance & accessibility

- Three.js scenes are code-split, mounted only near the viewport and paused off-screen; the hero particles start after first paint.
- Device tiers (`hooks/useDevice.ts`): full 3D on capable desktops, lighter scenes on phones, and static/SVG/photo fallbacks for `prefers-reduced-motion`, data-saver or no WebGL.
- Fonts are self-hosted (`app/fonts`), images via `next/image`, videos lazy with posters, no autoplay sound.
- Keyboard focus styles, skip link, ARIA on dialogs/accordions/tabs, form errors announced, reduced-motion respected.

## 10. Security

- Row Level Security on every table; public can read only active content and published blogs.
- Leads are written **only** by `/api/leads` (server) after Zod validation, input sanitisation, a honeypot, a time-trap and rate limiting (5 per 10 min per hashed IP, enforced in the database).
- Service-role key is server-only; admin routes are protected by `proxy.ts` **and** a server-side admin check.
- Google Maps uses the keyless embed, so no API key is exposed.

## Troubleshooting

**`JavaScript heap out of memory` during `npm run dev`** — this happens with the webpack dev server on machines with a small default Node heap. This project uses Next 16 + Turbopack, so it shouldn't occur. If it does, delete the caches and reinstall:

```powershell
# Windows PowerShell
Remove-Item -Recurse -Force .next, node_modules
npm install
npm run dev
```

Make sure you run scripts through `npm run …` (that's what applies the `.npmrc` heap setting), and close other heavy apps if your machine has 4 GB of RAM or less.

**`npm audit`** — should report 0 vulnerabilities. Don't run `npm audit fix --force`; it can install mismatched major versions.

## Project structure

```
app/
  (site)/            public pages: home, [landing] SEO pages, contact, thank-you, blog
  admin/             login + (panel) dashboard, leads, bookings, blogs, CMS pages
  api/leads/         validated, rate-limited enquiry endpoint
proxy.ts             protects /admin (Next 16's replacement for middleware.ts)
  sitemap.ts robots.ts manifest.ts layout.tsx globals.css fonts/
components/
  site/              Hero, Location, SeaView, Stay, Capsule, Amenities, Why, Gallery, Video,
                     TrustEnquiry, FAQ, Visit, FinalCTA, Navbar, Footer, EnquiryForm/Modal, FloatingCTA
  three/             HeroParticles, LocationScene, CapsuleScene, OceanScene (R3F)
  admin/             AdminShell, Dashboard, charts, LeadsManager, CrudManager, BlogEditor, SettingsForm
  brand/ ui/
lib/                 content loader, defaults, Supabase clients, schema.org, validation, analytics
supabase/schema.sql  tables, RLS, storage bucket, seed data
public/media/        optimised videos & images
```
