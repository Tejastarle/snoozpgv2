import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { SetupNotice } from "@/components/admin/SetupNotice";
import { getAdminUser, getServerSupabase } from "@/lib/supabase/server";
import { isDemoMode, isSupabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured) {
    if (!isDemoMode) return <SetupNotice />;
    return <AdminShell email="demo@snooz.local" demo>{children}</AdminShell>;
  }
  const user = await getAdminUser();
  if (!user) {
    // Signed in but not listed in admin_users → send back to login with an explanation.
    const sb = await getServerSupabase();
    const { data } = (await sb?.auth.getUser()) ?? { data: { user: null } };
    if (data?.user) redirect("/admin/login?error=not_admin");
    redirect("/admin/login");
  }
  return <AdminShell email={user.email ?? ""}>{children}</AdminShell>;
}
