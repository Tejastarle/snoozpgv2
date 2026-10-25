import { NextResponse, type NextRequest } from "next/server";
import { createHash } from "node:crypto";
import { leadSchema } from "@/lib/validation";
import { getServiceSupabase } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const memoryHits = new Map<string, number[]>(); // per-instance fast path; the DB check below is the real limit

function clientIp(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "0.0.0.0"
  );
}

function hashIp(ip: string) {
  return createHash("sha256")
    .update(ip + (process.env.LEAD_IP_SALT ?? "snooz"))
    .digest("hex")
    .slice(0, 32);
}

function memoryLimited(key: string) {
  const now = Date.now();
  const hits = (memoryHits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  memoryHits.set(key, hits);
  if (memoryHits.size > 5000) memoryHits.clear();
  return hits.length > MAX_PER_WINDOW;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const k = String(issue.path[0] ?? "form");
      if (!fieldErrors[k]) fieldErrors[k] = issue.message;
    }
    return NextResponse.json({ ok: false, error: "Please check the highlighted fields.", fieldErrors }, { status: 422 });
  }
  const data = parsed.data;

  // Bots: honeypot filled, or form submitted impossibly fast. Pretend success.
  if (data.company || (data.started_at && Date.now() - data.started_at < 2500)) {
    return NextResponse.json({ ok: true });
  }

  const ipHash = hashIp(clientIp(req));
  if (memoryLimited(ipHash)) {
    return NextResponse.json(
      { ok: false, error: "Too many enquiries from this connection. Please call or WhatsApp us instead." },
      { status: 429 },
    );
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    if (isDemoMode) return NextResponse.json({ ok: true, demo: true });
    console.error("[leads] Supabase service role is not configured — enquiry not stored.");
    return NextResponse.json(
      { ok: false, error: "Online enquiries are temporarily unavailable. Please call or WhatsApp us." },
      { status: 503 },
    );
  }

  // Durable rate limit across serverless instances
  const since = new Date(Date.now() - WINDOW_MS).toISOString();
  const { count } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", since);
  if ((count ?? 0) >= MAX_PER_WINDOW) {
    return NextResponse.json(
      { ok: false, error: "Too many enquiries from this connection. Please call or WhatsApp us instead." },
      { status: 429 },
    );
  }

  const row = {
    full_name: data.full_name,
    phone: data.phone,
    email: data.email,
    check_in: data.check_in,
    check_out: data.check_out,
    guests: data.guests ?? null,
    preference: data.preference,
    message: data.message,
    source: data.source ?? "website",
    page: data.page,
    utm: data.utm ?? null,
    ip_hash: ipHash,
    user_agent: req.headers.get("user-agent")?.slice(0, 300) ?? null,
  };

  const { data: inserted, error } = await supabase.from("leads").insert(row).select("id").single();
  if (error) {
    console.error("[leads] insert failed:", error.message);
    return NextResponse.json({ ok: false, error: "We couldn't send your enquiry. Please try again or call us." }, { status: 500 });
  }

  // Optional notification hook (Zapier / Make / n8n / Slack). Never blocks the response for long.
  const hook = process.env.LEAD_NOTIFY_WEBHOOK_URL;
  if (hook) {
    try {
      await fetch(hook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: inserted?.id, ...row, ip_hash: undefined, user_agent: undefined, created_at: new Date().toISOString() }),
        signal: AbortSignal.timeout(2500),
      });
    } catch (e) {
      console.warn("[leads] webhook failed:", (e as Error).message);
    }
  }

  return NextResponse.json({ ok: true, id: inserted?.id });
}
