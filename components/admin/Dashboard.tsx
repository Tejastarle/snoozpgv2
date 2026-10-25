"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, CalendarCheck2, Clock3, Inbox, Percent, Sun } from "lucide-react";
import { getDb } from "@/lib/admin/db";
import { isSameDay, sourceLabel } from "@/lib/admin/leads";
import type { Lead } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { BarChart, HBarChart, LineChart } from "./charts";
import { Badge, Card, EmptyState, PageHeader } from "./ui";

export function Dashboard() {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getDb()
      ?.list<Lead>("leads", { order: "created_at", ascending: false, limit: 5000 })
      .then(setLeads)
      .catch((e) => setError(e.message));
  }, []);

  const stats = useMemo(() => {
    if (!leads) return null;
    const now = new Date();
    const total = leads.length;
    const booked = leads.filter((l) => l.status === "booked").length;
    const days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (29 - i));
      return d;
    });
    const trend = days.map((d) => ({
      label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      hint: d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }),
      value: leads.filter((l) => isSameDay(new Date(l.created_at), d)).length,
    }));
    const weeks = Array.from({ length: 12 }, (_, i) => {
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      end.setDate(end.getDate() - (11 - i) * 7);
      const start = new Date(end);
      start.setDate(end.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      return {
        label: start.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        hint: `Week of ${start.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`,
        value: leads.filter((l) => l.status === "booked" && new Date(l.created_at) >= start && new Date(l.created_at) <= end).length,
      };
    });
    const bySource = new Map<string, number>();
    leads.forEach((l) => bySource.set(sourceLabel(l.source), (bySource.get(sourceLabel(l.source)) ?? 0) + 1));
    const sources = [...bySource.entries()].sort((a, b) => b[1] - a[1]);
    const top = sources.slice(0, 6).map(([label, value]) => ({ label, value }));
    const rest = sources.slice(6).reduce((s, [, v]) => s + v, 0);
    if (rest) top.push({ label: "Other", value: rest });
    return {
      total,
      newLeads: leads.filter((l) => l.status === "new").length,
      today: leads.filter((l) => isSameDay(new Date(l.created_at), now)).length,
      pending: leads.filter((l) => l.status === "contacted" || l.status === "interested").length,
      booked,
      conversion: total ? Math.round((booked / total) * 1000) / 10 : 0,
      trend,
      weeks,
      sources: top,
      recent: leads.slice(0, 6),
    };
  }, [leads]);

  const tiles = stats
    ? [
        { label: "New leads", value: stats.newLeads, icon: Inbox, href: "/admin/leads?status=new", note: "Waiting for first contact" },
        { label: "Today's enquiries", value: stats.today, icon: Sun, href: "/admin/leads?range=today", note: new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" }) },
        { label: "Pending follow-ups", value: stats.pending, icon: Clock3, href: "/admin/leads?status=followup", note: "Contacted or interested" },
        { label: "Bookings", value: stats.booked, icon: CalendarCheck2, href: "/admin/bookings", note: "Leads marked booked" },
        { label: "Conversion rate", value: `${stats.conversion}%`, icon: Percent, href: "/admin/leads", note: `${stats.booked} of ${stats.total} leads` },
      ]
    : [];

  return (
    <>
      <PageHeader title="Dashboard" description="How enquiries are coming in, and what needs your attention." />
      {error && <Card className="mb-6 p-4 text-sm text-[#9a2a19]">Couldn&apos;t load leads: {error}</Card>}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {!stats
          ? Array.from({ length: 5 }).map((_, i) => <Card key={i} className="h-[132px] animate-pulse bg-charcoal/[0.03]">{null}</Card>)
          : tiles.map(({ label, value, icon: I, href, note }) => (
              <Link key={label} href={href} className="group">
                <Card className="h-full p-5 transition-colors group-hover:border-maroon/30">
                  <div className="flex items-center justify-between text-charcoal/50">
                    <span className="text-[0.82rem] font-semibold">{label}</span>
                    <I className="h-4 w-4" />
                  </div>
                  <p className="mt-4 text-[2.2rem] font-extrabold leading-none tracking-tight tabular-nums [font-variation-settings:'wdth'_108]">{value}</p>
                  <p className="mt-2 text-xs text-charcoal/45">{note}</p>
                </Card>
              </Link>
            ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="p-6 xl:col-span-2">
          <div className="flex items-baseline justify-between">
            <h2 className="font-bold">Lead trend</h2>
            <span className="text-xs text-charcoal/45">Last 30 days</span>
          </div>
          <div className="mt-4">{stats ? <LineChart data={stats.trend} caption="Leads per day, last 30 days" /> : <div className="h-[220px] animate-pulse rounded-xl bg-charcoal/[0.03]" />}</div>
        </Card>
        <Card className="p-6">
          <div className="flex items-baseline justify-between">
            <h2 className="font-bold">Enquiry sources</h2>
            <span className="text-xs text-charcoal/45">All time</span>
          </div>
          <div className="mt-5">
            {stats && stats.sources.length ? <HBarChart data={stats.sources} caption="Leads by source" /> : stats ? <p className="text-sm text-charcoal/50">No leads yet.</p> : <div className="h-[220px] animate-pulse rounded-xl bg-charcoal/[0.03]" />}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="p-6 xl:col-span-2">
          <div className="flex items-baseline justify-between">
            <h2 className="font-bold">Booking trend</h2>
            <span className="text-xs text-charcoal/45">Leads marked booked, by week enquired — last 12 weeks</span>
          </div>
          <div className="mt-4">{stats ? <BarChart data={stats.weeks} caption="Bookings per week, last 12 weeks" /> : <div className="h-[220px] animate-pulse rounded-xl bg-charcoal/[0.03]" />}</div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Latest enquiries</h2>
            <Link href="/admin/leads" className="inline-flex items-center gap-1 text-xs font-semibold text-maroon">
              All leads <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          {stats && !stats.recent.length && <EmptyState title="No enquiries yet" text="New website enquiries will appear here." />}
          <ul className="mt-4 divide-y divide-charcoal/[0.06]">
            {stats?.recent.map((l) => (
              <li key={l.id}>
                <Link href={`/admin/leads?open=${l.id}`} className="flex items-center justify-between gap-3 py-3 hover:text-maroon">
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{l.full_name}</span>
                    <span className="block text-xs text-charcoal/50">
                      {formatDate(l.created_at, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })} — {sourceLabel(l.source)}
                    </span>
                  </span>
                  <Badge tone={l.status}>{l.status}</Badge>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
