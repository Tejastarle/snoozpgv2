"use client";

import { useState } from "react";
import { CheckCircle2, CircleDashed, RefreshCw } from "lucide-react";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { revalidateSite } from "@/app/admin/actions";
import { Button, Card, Field, Input, PageHeader, useToast } from "./ui";

export function AccountSettings({ checks, demo }: { checks: { label: string; ok: boolean; hint: string }[]; demo: boolean }) {
  const toast = useToast();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [publishing, setPublishing] = useState(false);


  async function changePassword() {
    if (pw.length < 8) return toast("Use at least 8 characters", "error");
    if (pw !== pw2) return toast("Passwords don't match", "error");
    const sb = getBrowserSupabase();
    if (!sb) return toast("Not available in demo mode", "error");
    setBusy(true);
    const { error } = await sb.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return toast(error.message, "error");
    setPw("");
    setPw2("");
    toast("Password updated");
  }

  async function republish() {
    setPublishing(true);
    const r = await revalidateSite().catch(() => ({ ok: false }));
    setPublishing(false);
    toast(r.ok ? "Website refreshed with the latest content" : "Couldn't refresh — are you signed in?", r.ok ? "ok" : "error");
  }

  return (
    <>
      <PageHeader title="Settings" description="Your account, publishing and setup status." />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="p-6 md:p-7">
          <h2 className="font-bold">Account</h2>
          <p className="mt-1 text-sm text-charcoal/55">Change the admin password used on the login page.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="New password"><Input type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} /></Field>
            <Field label="Confirm password"><Input type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} /></Field>
          </div>
          <Button className="mt-5" onClick={changePassword} loading={busy} disabled={demo || !pw}>Update password</Button>
          <p className="mt-4 text-xs text-charcoal/45">Forgot it? Run <code>supabase/create-admin.sql</code> in Supabase to reset it to the password written in that file.</p>
        </Card>

        <Card className="p-6 md:p-7">
          <h2 className="font-bold">Publishing</h2>
          <p className="mt-1 text-sm text-charcoal/55">Changes publish automatically when you save. Pages also refresh every minute. Use this if something looks out of date.</p>
          <Button variant="secondary" className="mt-5" onClick={republish} loading={publishing}><RefreshCw className="h-4 w-4" /> Refresh website now</Button>
        </Card>

        <Card className="p-6 md:p-7 xl:col-span-2">
          <h2 className="font-bold">Setup checklist</h2>
          <p className="mt-1 text-sm text-charcoal/55">Environment variables are set in your hosting dashboard (e.g. Vercel → Settings → Environment Variables), never in the browser.</p>
          <ul className="mt-5 grid gap-3 md:grid-cols-2">
            {checks.map((c) => (
              <li key={c.label} className="flex gap-3 rounded-xl border border-charcoal/[0.07] p-4">
                {c.ok ? <CheckCircle2 className="h-5 w-5 shrink-0 text-[#1f6b3a]" /> : <CircleDashed className="h-5 w-5 shrink-0 text-charcoal/30" />}
                <div>
                  <p className="text-sm font-semibold">{c.label}</p>
                  <p className="text-xs text-charcoal/50">{c.hint}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
