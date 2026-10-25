"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, Download, Mail, MessageSquare, Phone, RefreshCw, Search, Trash2, Users } from "lucide-react";
import { getDb } from "@/lib/admin/db";
import { downloadCsv, isSameDay, leadsToCsv, sourceLabel } from "@/lib/admin/leads";
import { LEAD_STATUSES, type AdminNote, type Lead, type LeadStatus } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";
import { WhatsAppIcon } from "@/components/brand/SocialIcons";
import { Badge, Button, Card, Confirm, Drawer, EmptyState, Input, PageHeader, Select, STATUS_STYLE, Textarea, useToast } from "./ui";

type Range = "all" | "today" | "7d" | "30d" | "90d";

const fmtDate = (d: string | null) => (d ? formatDate(d, { day: "numeric", month: "short" }) : "—");
const waLink = (phone: string, name: string) => {
  let d = phone.replace(/\D/g, "");
  if (d.length === 10) d = "91" + d;
  return `https://wa.me/${d}?text=${encodeURIComponent(`Hi ${name.split(" ")[0]}, this is SNOOZ, CBD Belapur, following up on your enquiry.`)}`;
};

export function LeadsManager({ mode = "leads" }: { mode?: "leads" | "bookings" }) {
  const params = useSearchParams();
  const toast = useToast();
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>(mode === "bookings" ? "booked" : params.get("status") ?? "all");
  const [range, setRange] = useState<Range>((params.get("range") as Range) ?? "all");
  const [source, setSource] = useState("all");
  const [openId, setOpenId] = useState<string | null>(params.get("open"));
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirm, setConfirm] = useState<{ ids: string[] } | null>(null);
  const [busy, setBusy] = useState(false);

  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [freshIds, setFreshIds] = useState<Set<string>>(new Set());
  const known = useRef<Set<string> | null>(null);

  const load = useCallback(
    async (opts: { silent?: boolean } = {}) => {
      try {
        const rows = await getDb()!.list<Lead>("leads", { order: "created_at", ascending: false, limit: 5000 });
        // Highlight leads that arrived since the page was opened
        if (known.current) {
          const added = rows.filter((r) => !known.current!.has(r.id));
          if (added.length) {
            setFreshIds((f) => new Set([...f, ...added.map((a) => a.id)]));
            toast(added.length === 1 ? `New enquiry from ${added[0].full_name}` : `${added.length} new enquiries`);
            window.dispatchEvent(new Event("snooz:leads-changed"));
          }
        }
        known.current = new Set(rows.map((r) => r.id));
        setLeads(rows);
        setUpdatedAt(new Date());
      } catch (e) {
        if (!opts.silent) toast((e as Error).message, "error");
        setLeads((l) => l ?? []);
      }
    },
    [toast],
  );
  useEffect(() => {
    load();
    // Check for new enquiries every 30 seconds, and whenever you come back to the tab
    const t = setInterval(() => load({ silent: true }), 30000);
    const onFocus = () => load({ silent: true });
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(t);
      window.removeEventListener("focus", onFocus);
    };
  }, [load]);

  const sources = useMemo(() => [...new Set((leads ?? []).map((l) => l.source ?? "website"))], [leads]);

  const filtered = useMemo(() => {
    if (!leads) return [];
    const now = new Date();
    const term = q.trim().toLowerCase();
    return leads.filter((l) => {
      if (mode === "bookings" && status === "all" && !["booked", "interested"].includes(l.status)) return false;
      if (status === "followup" ? !["contacted", "interested"].includes(l.status) : status !== "all" && l.status !== status) return false;
      if (source !== "all" && (l.source ?? "website") !== source) return false;
      const created = new Date(l.created_at);
      if (range === "today" && !isSameDay(created, now)) return false;
      if (range !== "all" && range !== "today") {
        const days = Number(range.replace("d", ""));
        if (now.getTime() - created.getTime() > days * 86400000) return false;
      }
      if (term && ![l.full_name, l.phone, l.email, l.message, l.preference].some((v) => v?.toLowerCase().includes(term))) return false;
      return true;
    });
  }, [leads, q, status, source, range, mode]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: leads?.length ?? 0 };
    LEAD_STATUSES.forEach((s) => (c[s] = leads?.filter((l) => l.status === s).length ?? 0));
    return c;
  }, [leads]);

  async function setLeadStatus(id: string, next: LeadStatus) {
    const prev = leads;
    setLeads((ls) => ls?.map((l) => (l.id === id ? { ...l, status: next } : l)) ?? null);
    try {
      await getDb()!.update("leads", id, { status: next });
      toast(`Marked as ${next}`);
      window.dispatchEvent(new Event("snooz:leads-changed"));
    } catch (e) {
      setLeads(prev);
      toast((e as Error).message, "error");
    }
  }

  async function remove(ids: string[]) {
    setBusy(true);
    try {
      await getDb()!.removeMany("leads", ids);
      setLeads((ls) => ls?.filter((l) => !ids.includes(l.id)) ?? null);
      setSelected(new Set());
      if (openId && ids.includes(openId)) setOpenId(null);
      toast(ids.length === 1 ? "Lead deleted" : `${ids.length} leads deleted`);
      window.dispatchEvent(new Event("snooz:leads-changed"));
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setBusy(false);
      setConfirm(null);
    }
  }

  const exportCsv = () => {
    downloadCsv(`snooz-${mode}-${new Date().toISOString().slice(0, 10)}.csv`, leadsToCsv(filtered));
    toast(`Exported ${filtered.length} ${filtered.length === 1 ? "lead" : "leads"}`);
  };

  const allChecked = filtered.length > 0 && filtered.every((l) => selected.has(l.id));
  const open = leads?.find((l) => l.id === openId) ?? null;

  const tabs = mode === "bookings" ? ["all", "interested", "booked"] : ["all", ...LEAD_STATUSES];

  return (
    <>
      <PageHeader
        title={mode === "bookings" ? "Bookings & enquiries" : "Leads"}
        description={mode === "bookings" ? "Guests who are interested or have booked. Update status as stays are confirmed." : "Every enquiry from the website. Search, filter, follow up and export."}
        actions={
          <>
            {updatedAt && (
              <span className="text-xs text-charcoal/45" aria-live="polite">
                Updated {updatedAt.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })} · checks every 30s
              </span>
            )}
            <Button variant="secondary" onClick={() => load()}><RefreshCw className="h-4 w-4" /> Refresh</Button>
            <Button onClick={exportCsv} disabled={!filtered.length}><Download className="h-4 w-4" /> Export CSV</Button>
          </>
        }
      />

      <div className="no-scrollbar -mx-4 mb-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex w-max gap-1 rounded-xl bg-charcoal/[0.05] p-1">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setStatus(t)}
              className={cn("rounded-lg px-3.5 py-2 text-sm font-semibold capitalize transition-colors", status === t ? "bg-white text-charcoal shadow-sm" : "text-charcoal/55 hover:text-charcoal")}
            >
              {t === "all" ? "All" : t} <span className="ml-1 text-charcoal/40 tabular-nums">{t === "all" && mode === "bookings" ? counts.booked + counts.interested : counts[t]}</span>
            </button>
          ))}
        </div>
      </div>

      <Card className="mb-4 flex flex-col gap-3 p-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal/35" />
          <Input placeholder="Search name, phone, email or message" value={q} onChange={(e) => setQ(e.target.value)} className="pl-10" aria-label="Search leads" />
        </div>
        <Select value={range} onChange={(e) => setRange(e.target.value as Range)} className="md:w-40" aria-label="Date range">
          <option value="all">All time</option>
          <option value="today">Today</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </Select>
        <Select value={source} onChange={(e) => setSource(e.target.value)} className="md:w-52" aria-label="Source">
          <option value="all">All sources</option>
          {sources.map((s) => (
            <option key={s} value={s}>{sourceLabel(s)}</option>
          ))}
        </Select>
        {status === "followup" && <Badge tone="contacted">Follow-ups</Badge>}
      </Card>

      {selected.size > 0 && (
        <div className="mb-3 flex items-center justify-between rounded-xl bg-charcoal px-4 py-2.5 text-sm text-linen">
          <span>{selected.size} selected</span>
          <div className="flex gap-2">
            <button type="button" className="rounded-lg px-3 py-1.5 font-semibold hover:bg-linen/10" onClick={() => downloadCsv("snooz-selected-leads.csv", leadsToCsv(filtered.filter((l) => selected.has(l.id))))}>Export</button>
            <button type="button" className="rounded-lg bg-[#b4321f] px-3 py-1.5 font-semibold" onClick={() => setConfirm({ ids: [...selected] })}>Delete</button>
          </div>
        </div>
      )}

      <Card className="overflow-hidden">
        {!leads ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-charcoal/[0.04]" />
            ))}
          </div>
        ) : !filtered.length ? (
          <EmptyState title={leads.length ? "No leads match these filters" : "No enquiries yet"} text={leads.length ? "Try clearing the search or picking another status." : "When visitors use Check availability, their enquiries land here."} />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-left text-[0.88rem]">
                <thead className="border-b border-charcoal/[0.07] bg-charcoal/[0.02] text-[0.75rem] font-semibold text-charcoal/50">
                  <tr>
                    <th className="w-10 px-4 py-3">
                      <input type="checkbox" aria-label="Select all" checked={allChecked} onChange={() => setSelected(allChecked ? new Set() : new Set(filtered.map((l) => l.id)))} className="accent-maroon" />
                    </th>
                    <th className="px-3 py-3">Guest</th>
                    <th className="px-3 py-3">Phone</th>
                    <th className="px-3 py-3">Stay</th>
                    <th className="px-3 py-3">Preference</th>
                    <th className="px-3 py-3">Source</th>
                    <th className="px-3 py-3">Submitted</th>
                    <th className="px-3 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal/[0.06]">
                  {filtered.map((l) => (
                    <tr key={l.id} className={cn("cursor-pointer transition-colors hover:bg-linen/60", freshIds.has(l.id) && "bg-[#e7f0f7]/70")} onClick={() => setOpenId(l.id)}>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          aria-label={`Select ${l.full_name}`}
                          checked={selected.has(l.id)}
                          onChange={() => setSelected((s) => {
                            const n = new Set(s);
                            if (n.has(l.id)) n.delete(l.id); else n.add(l.id);
                            return n;
                          })}
                          className="accent-maroon"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <p className="font-semibold text-charcoal">
                          {l.full_name}
                          {freshIds.has(l.id) && <span className="ml-2 rounded-full bg-[#1d4e6b] px-1.5 py-0.5 text-[0.65rem] font-bold uppercase text-white">Just in</span>}
                        </p>
                        {l.email && <p className="text-xs text-charcoal/50">{l.email}</p>}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 tabular-nums">{l.phone}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-charcoal/70">
                        {fmtDate(l.check_in)} → {fmtDate(l.check_out)}
                        {l.guests ? <span className="ml-1.5 text-charcoal/40">· {l.guests}</span> : null}
                      </td>
                      <td className="max-w-[180px] truncate px-3 py-3 text-charcoal/70">{l.preference ?? "—"}</td>
                      <td className="max-w-[160px] truncate px-3 py-3 text-charcoal/60">{sourceLabel(l.source)}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-charcoal/60">{formatDate(l.created_at, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</td>
                      <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                        <StatusSelect value={l.status} onChange={(s) => setLeadStatus(l.id, s)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile cards */}
            <ul className="divide-y divide-charcoal/[0.06] lg:hidden">
              {filtered.map((l) => (
                <li key={l.id}>
                  <button type="button" className="w-full p-4 text-left" onClick={() => setOpenId(l.id)}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{l.full_name}</p>
                        <p className="text-sm text-charcoal/55 tabular-nums">{l.phone}</p>
                      </div>
                      <Badge tone={l.status}>{l.status}</Badge>
                    </div>
                    <p className="mt-2 text-xs text-charcoal/50">
                      {fmtDate(l.check_in)} → {fmtDate(l.check_out)} — {sourceLabel(l.source)} — {formatDate(l.created_at, { day: "numeric", month: "short" })}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
            <p className="border-t border-charcoal/[0.06] px-4 py-3 text-xs text-charcoal/45">Showing {filtered.length} of {leads.length}</p>
          </>
        )}
      </Card>

      <LeadDrawer
        lead={open}
        onClose={() => setOpenId(null)}
        onStatus={(s) => open && setLeadStatus(open.id, s)}
        onDelete={() => open && setConfirm({ ids: [open.id] })}
      />
      <Confirm
        open={!!confirm}
        title={confirm?.ids.length === 1 ? "Delete this lead?" : `Delete ${confirm?.ids.length} leads?`}
        text="This permanently removes the enquiry and its notes."
        busy={busy}
        onCancel={() => setConfirm(null)}
        onConfirm={() => confirm && remove(confirm.ids)}
      />
    </>
  );
}

function StatusSelect({ value, onChange }: { value: LeadStatus; onChange: (s: LeadStatus) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as LeadStatus)}
      aria-label="Lead status"
      className={cn("h-8 cursor-pointer rounded-full border-0 py-0 pl-3 pr-7 text-xs font-semibold capitalize focus:ring-2 focus:ring-maroon/30", STATUS_STYLE[value])}
    >
      {LEAD_STATUSES.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
}

function LeadDrawer({ lead, onClose, onStatus, onDelete }: { lead: Lead | null; onClose: () => void; onStatus: (s: LeadStatus) => void; onDelete: () => void }) {
  const toast = useToast();
  const [notes, setNotes] = useState<AdminNote[]>([]);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!lead) return;
    setNotes([]);
    getDb()!
      .list<AdminNote>("admin_notes", { eq: { lead_id: lead.id }, order: "created_at", ascending: false })
      .then(setNotes)
      .catch(() => {});
  }, [lead]);

  async function addNote() {
    if (!lead || !text.trim()) return;
    setSaving(true);
    try {
      const n = await getDb()!.insert<AdminNote>("admin_notes", { lead_id: lead.id, note: text.trim() });
      setNotes((ns) => [n, ...ns]);
      setText("");
      toast("Note added");
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setSaving(false);
    }
  }

  const rows: [string, string | null | undefined][] = lead
    ? [
        ["Email", lead.email],
        ["Check-in", lead.check_in ? formatDate(lead.check_in, { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : null],
        ["Check-out", lead.check_out ? formatDate(lead.check_out, { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : null],
        ["Guests", lead.guests ? String(lead.guests) : null],
        ["Preference", lead.preference],
        ["Source", sourceLabel(lead.source)],
        ["Page", lead.page],
        ["Submitted", formatDate(lead.created_at, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })],
        ["Campaign", lead.utm ? Object.entries(lead.utm).map(([k, v]) => `${k}: ${v}`).join(", ") : null],
      ]
    : [];

  return (
    <Drawer
      open={!!lead}
      onClose={onClose}
      title={lead?.full_name ?? "Lead"}
      footer={
        <>
          <Button variant="ghost" onClick={onDelete} className="mr-auto text-[#b4321f] hover:bg-[#b4321f]/8 hover:text-[#9a2a19]"><Trash2 className="h-4 w-4" /> Delete</Button>
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </>
      }
    >
      {lead && (
        <div className="space-y-7">
          <div className="grid grid-cols-3 gap-2">
            <a href={`tel:${lead.phone}`} className="flex flex-col items-center gap-1.5 rounded-xl border border-charcoal/10 bg-white py-3 text-xs font-semibold hover:border-maroon/40"><Phone className="h-4 w-4 text-maroon" /> Call</a>
            <a href={waLink(lead.phone, lead.full_name)} target="_blank" rel="noopener" className="flex flex-col items-center gap-1.5 rounded-xl border border-charcoal/10 bg-white py-3 text-xs font-semibold hover:border-maroon/40"><WhatsAppIcon className="h-4 w-4 text-maroon" /> WhatsApp</a>
            <a href={lead.email ? `mailto:${lead.email}?subject=${encodeURIComponent("Your SNOOZ enquiry")}` : undefined} aria-disabled={!lead.email} className={cn("flex flex-col items-center gap-1.5 rounded-xl border border-charcoal/10 bg-white py-3 text-xs font-semibold", lead.email ? "hover:border-maroon/40" : "pointer-events-none opacity-40")}><Mail className="h-4 w-4 text-maroon" /> Email</a>
          </div>

          <div>
            <p className="text-sm font-semibold text-charcoal/60">Phone</p>
            <p className="mt-0.5 text-xl font-bold tabular-nums">{lead.phone}</p>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-charcoal/60">Status</p>
            <div className="flex flex-wrap gap-1.5">
              {LEAD_STATUSES.map((s) => (
                <button key={s} type="button" onClick={() => onStatus(s)} className={cn("rounded-full px-3 py-1.5 text-xs font-semibold capitalize ring-1 transition", lead.status === s ? cn(STATUS_STYLE[s], "ring-transparent") : "bg-white text-charcoal/60 ring-charcoal/10 hover:ring-charcoal/25")}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <dl className="divide-y divide-charcoal/[0.06] rounded-xl border border-charcoal/[0.07] bg-white">
            {rows.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[110px_1fr] gap-3 px-4 py-2.5 text-sm">
                <dt className="text-charcoal/50">{k}</dt>
                <dd className="break-words font-medium">{v || "—"}</dd>
              </div>
            ))}
          </dl>

          {lead.message && (
            <div>
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-charcoal/60"><MessageSquare className="h-4 w-4" /> Message</p>
              <p className="whitespace-pre-wrap rounded-xl bg-linen p-4 text-[0.92rem] leading-relaxed">{lead.message}</p>
            </div>
          )}

          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-charcoal/60"><Users className="h-4 w-4" /> Notes</p>
            <Textarea placeholder="Called — will confirm by evening. Prefers lower berth." value={text} onChange={(e) => setText(e.target.value)} rows={3} />
            <div className="mt-2 flex justify-end">
              <Button size="sm" onClick={addNote} loading={saving} disabled={!text.trim()}>Add note</Button>
            </div>
            <ul className="mt-4 space-y-2.5">
              {notes.map((n) => (
                <li key={n.id} className="rounded-xl border border-charcoal/[0.07] bg-white p-3.5">
                  <p className="whitespace-pre-wrap text-sm">{n.note}</p>
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-charcoal/45"><CalendarDays className="h-3 w-3" /> {formatDate(n.created_at, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</p>
                </li>
              ))}
              {!notes.length && <li className="text-sm text-charcoal/45">No notes yet.</li>}
            </ul>
          </div>
        </div>
      )}
    </Drawer>
  );
}
