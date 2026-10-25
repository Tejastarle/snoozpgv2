"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/env";

/** Re-renders the public site after admin edits (ISR). Only signed-in admins may call it. */
export async function revalidateSite() {
  if (isDemoMode) return { ok: true, demo: true };
  const user = await getAdminUser();
  if (!user) return { ok: false };
  revalidatePath("/", "layout");
  return { ok: true };
}
