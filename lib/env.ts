export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes("YOUR-PROJECT"),
);
/** Demo mode only ever applies when Supabase is not configured. */
export const isDemoMode = !isSupabaseConfigured && process.env.NEXT_PUBLIC_DEMO_MODE === "true";
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

/**
 * The admin panel signs in with a password only. Behind the scenes Supabase still needs an
 * account email, so this fixed address is used. Override with NEXT_PUBLIC_ADMIN_EMAIL if needed
 * (it must match the email in supabase/create-admin.sql).
 */
export const ADMIN_EMAIL = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "snooz@gmail.com").trim().toLowerCase();
