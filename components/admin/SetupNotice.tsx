import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export function SetupNotice() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16">
      <Logo className="h-8 w-auto self-start text-maroon" />
      <h1 className="mt-10 text-3xl font-extrabold tracking-tight">Connect Supabase to use the admin panel</h1>
      <p className="mt-3 text-charcoal/65">The website is running on built-in default content. To manage leads, blogs and content:</p>
      <ol className="mt-6 list-decimal space-y-3 pl-5 text-[0.95rem] text-charcoal/80">
        <li>Create a project at supabase.com and run <code className="rounded bg-charcoal/5 px-1.5 py-0.5">supabase/schema.sql</code> in the SQL editor.</li>
        <li>Add <code className="rounded bg-charcoal/5 px-1.5 py-0.5">NEXT_PUBLIC_SUPABASE_URL</code>, <code className="rounded bg-charcoal/5 px-1.5 py-0.5">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> and <code className="rounded bg-charcoal/5 px-1.5 py-0.5">SUPABASE_SERVICE_ROLE_KEY</code> to your environment (Vercel → Settings → Environment Variables).</li>
        <li>Create your admin user in Supabase → Authentication, then add it to <code className="rounded bg-charcoal/5 px-1.5 py-0.5">admin_users</code> (see the last lines of the schema file).</li>
        <li>Redeploy and sign in at <code className="rounded bg-charcoal/5 px-1.5 py-0.5">/admin/login</code>.</li>
      </ol>
      <p className="mt-6 text-sm text-charcoal/55">Want to look around first? Set <code className="rounded bg-charcoal/5 px-1.5 py-0.5">NEXT_PUBLIC_DEMO_MODE=true</code> to explore the panel with sample data (nothing is saved).</p>
      <Link href="/" className="mt-10 self-start font-semibold text-maroon underline underline-offset-4">Back to the website</Link>
    </main>
  );
}
