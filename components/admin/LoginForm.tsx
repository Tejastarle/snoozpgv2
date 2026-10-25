"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { ADMIN_EMAIL } from "@/lib/env";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { Button, Input } from "./ui";

/** Password-only sign in. The admin account's email is fixed (see ADMIN_EMAIL), so staff only type the password. */
export function LoginForm({ configured, demo }: { configured: boolean; demo: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(
    params.get("error") === "not_admin" ? "This account doesn't have admin access. Run supabase/create-admin.sql in Supabase." : "",
  );

  async function submit(e: FormEvent) {
    e.preventDefault();
    const sb = getBrowserSupabase();
    if (!sb || !password) return;
    setBusy(true);
    setError("");
    const { error } = await sb.auth.signInWithPassword({ email: ADMIN_EMAIL, password });
    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "Wrong password. Try again."
          : error.message === "Email not confirmed"
            ? "Admin account isn't activated yet. Run supabase/create-admin.sql in Supabase."
            : error.message,
      );
      setBusy(false);
      return;
    }
    const { data: isAdmin } = await sb.rpc("is_admin");
    if (!isAdmin) {
      await sb.auth.signOut();
      setError("Password is right, but admin access isn't set up. Run supabase/create-admin.sql in Supabase.");
      setBusy(false);
      return;
    }
    const next = params.get("next");
    router.push(next && next.startsWith("/admin/") ? next : "/admin/leads");
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm">
      <Logo className="h-8 w-auto text-maroon" />
      <h1 className="mt-10 text-[1.9rem] font-extrabold tracking-tight [font-variation-settings:'wdth'_106]">SNOOZ admin</h1>
      <p className="mt-2 text-charcoal/55">Enter the admin password to see your leads.</p>

      {!configured ? (
        <div className="mt-8 rounded-2xl border border-charcoal/10 bg-white p-5 text-sm text-charcoal/70">
          Supabase isn&apos;t connected yet, so there&apos;s nothing to sign in to.
          {demo ? (
            <Link href="/admin/leads" className="mt-4 flex h-11 items-center justify-center rounded-xl bg-maroon font-semibold text-linen">Explore the demo panel</Link>
          ) : (
            <p className="mt-3">Add your Supabase keys to .env.local (or Vercel → Environment Variables) and restart. See README.md.</p>
          )}
        </div>
      ) : (
        <form onSubmit={submit} className="mt-8 space-y-4">
          {/* Hidden username field so password managers save the right login */}
          <input type="text" name="username" autoComplete="username" value={ADMIN_EMAIL} readOnly hidden />
          <label className="block">
            <span className="mb-1.5 block text-[0.8rem] font-semibold text-charcoal/75">Password</span>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal/35" />
              <Input
                type={show ? "text" : "password"}
                autoComplete="current-password"
                autoFocus
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-11"
                aria-invalid={error ? true : undefined}
              />
              <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-charcoal/50 hover:text-charcoal" aria-label={show ? "Hide password" : "Show password"}>
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>
          {error && <p role="alert" className="rounded-xl bg-[#b4321f]/8 px-3.5 py-2.5 text-sm text-[#9a2a19]">{error}</p>}
          <Button type="submit" loading={busy} disabled={!password} className="w-full">Sign in</Button>
          <p className="text-center text-xs text-charcoal/45">Forgot the password? Reset it by running supabase/create-admin.sql in Supabase.</p>
        </form>
      )}
      <Link href="/" className="mt-12 inline-block text-sm text-charcoal/50 hover:text-charcoal">← Back to website</Link>
    </div>
  );
}
