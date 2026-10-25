import { AccountSettings } from "@/components/admin/AccountSettings";
import { isDemoMode, isSupabaseConfigured } from "@/lib/env";

export const metadata = { title: "Settings" };

export default function SettingsPage() {
  const checks = [
    { label: "Supabase connected", ok: isSupabaseConfigured, hint: "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY" },
    { label: "Enquiries can be stored", ok: !!process.env.SUPABASE_SERVICE_ROLE_KEY, hint: "SUPABASE_SERVICE_ROLE_KEY (server only)" },
    { label: "IP hashing salt set", ok: !!process.env.LEAD_IP_SALT && process.env.LEAD_IP_SALT !== "change-me-to-a-long-random-string", hint: "LEAD_IP_SALT" },
    { label: "Site URL set", ok: !!process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes("localhost"), hint: "NEXT_PUBLIC_SITE_URL — used for canonical URLs and the sitemap" },
    { label: "Google Analytics", ok: !!process.env.NEXT_PUBLIC_GA_ID, hint: "NEXT_PUBLIC_GA_ID (optional)" },
    { label: "Meta Pixel", ok: !!process.env.NEXT_PUBLIC_META_PIXEL_ID, hint: "NEXT_PUBLIC_META_PIXEL_ID (optional)" },
    { label: "Search Console verification", ok: !!process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION, hint: "NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION (optional)" },
    { label: "New-lead webhook", ok: !!process.env.LEAD_NOTIFY_WEBHOOK_URL, hint: "LEAD_NOTIFY_WEBHOOK_URL (optional — Zapier, Make, n8n…)" },
  ];
  return <AccountSettings checks={checks} demo={isDemoMode} />;
}
