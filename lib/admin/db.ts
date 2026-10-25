"use client";

import { getBrowserSupabase } from "@/lib/supabase/client";
import { isDemoMode } from "@/lib/env";
import {
  DEFAULT_AMENITIES,
  DEFAULT_AVAILABILITY,
  DEFAULT_CONTENT,
  DEFAULT_FAQS,
  DEFAULT_GALLERY,
  DEFAULT_LOCATIONS,
  DEFAULT_ROOMS,
  DEFAULT_SEO,
  DEFAULT_SITE,
  DEFAULT_VIDEOS,
} from "@/lib/defaults";
import { DEFAULT_BLOGS } from "@/lib/default-blogs";
import type { Lead, LeadStatus } from "@/lib/types";

export type Row = Record<string, unknown> & { id: string };

export interface ListOpts {
  order?: string;
  ascending?: boolean;
  limit?: number;
  eq?: Record<string, string | number | boolean>;
}

export interface Db {
  mode: "supabase" | "demo";
  list<T = Row>(table: string, opts?: ListOpts): Promise<T[]>;
  get<T = Row>(table: string, id: string): Promise<T | null>;
  insert<T = Row>(table: string, row: Record<string, unknown>): Promise<T>;
  update<T = Row>(table: string, id: string, patch: Record<string, unknown>): Promise<T>;
  remove(table: string, id: string): Promise<void>;
  removeMany(table: string, ids: string[]): Promise<void>;
  getSetting<T>(key: string): Promise<T | null>;
  setSetting(key: string, value: unknown): Promise<void>;
  upload(file: File, folder: string): Promise<string>;
  userEmail(): Promise<string | null>;
  signOut(): Promise<void>;
}

/* ─── Supabase adapter (RLS: only admins can read/write) ──────────────── */
function supabaseDb(): Db {
  const sb = getBrowserSupabase()!;
  const fail = (e: { message: string } | null) => {
    if (e) throw new Error(e.message);
  };
  return {
    mode: "supabase",
    async list<T>(table: string, opts: ListOpts = {}) {
      let q = sb.from(table).select("*");
      Object.entries(opts.eq ?? {}).forEach(([k, v]) => (q = q.eq(k, v)));
      if (opts.order) q = q.order(opts.order, { ascending: opts.ascending ?? true });
      if (opts.limit) q = q.limit(opts.limit);
      const { data, error } = await q;
      fail(error);
      return (data ?? []) as T[];
    },
    async get<T>(table: string, id: string) {
      const { data, error } = await sb.from(table).select("*").eq("id", id).maybeSingle();
      fail(error);
      return (data as T) ?? null;
    },
    async insert<T>(table: string, row: Record<string, unknown>) {
      const { id: _drop, ...clean } = row; // let Postgres generate ids
      void _drop;
      const { data, error } = await sb.from(table).insert(clean).select("*").single();
      fail(error);
      return data as T;
    },
    async update<T>(table: string, id: string, patch: Record<string, unknown>) {
      const { id: _drop, created_at: _c, ...clean } = patch;
      void _drop;
      void _c;
      const { data, error } = await sb.from(table).update(clean).eq("id", id).select("*").single();
      fail(error);
      return data as T;
    },
    async remove(table: string, id: string) {
      const { error } = await sb.from(table).delete().eq("id", id);
      fail(error);
    },
    async removeMany(table: string, ids: string[]) {
      if (!ids.length) return;
      const { error } = await sb.from(table).delete().in("id", ids);
      fail(error);
    },
    async getSetting<T>(key: string) {
      const { data, error } = await sb.from("settings").select("value").eq("key", key).maybeSingle();
      fail(error);
      return (data?.value as T) ?? null;
    },
    async setSetting(key: string, value: unknown) {
      const { error } = await sb.from("settings").upsert({ key, value }, { onConflict: "key" });
      fail(error);
    },
    async upload(file: File, folder: string) {
      const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await sb.storage.from("media").upload(path, file, { cacheControl: "31536000", upsert: false, contentType: file.type });
      fail(error);
      return sb.storage.from("media").getPublicUrl(path).data.publicUrl;
    },
    async userEmail() {
      const { data } = await sb.auth.getUser();
      return data.user?.email ?? null;
    },
    async signOut() {
      await sb.auth.signOut();
    },
  };
}

/* ─── Demo adapter (in-memory; nothing is saved) ──────────────────────── */
const uid = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2));

function demoLeads(): Lead[] {
  const names = ["Aarav Mehta", "Priya Nair", "Rohan Kulkarni", "Sneha Patil", "Vikram Singh", "Ananya Iyer", "Karan Shah", "Neha Joshi", "Arjun Rao", "Pooja Desai", "Siddharth Jain", "Meera Pillai", "Rahul Verma", "Isha Gupta", "Aditya Pawar", "Kavya Reddy", "Nikhil Sawant", "Riya Kapoor", "Omkar Shinde", "Tanvi More", "Yash Thakur", "Divya Menon", "Harsh Chavan", "Sakshi Bhosale", "Manish Yadav", "Gauri Naik", "Kunal Dubey", "Shruti Kadam"];
  const sources = ["hero", "enquiry-section", "floating", "mobile-bar", "landing-pg-in-cbd-belapur", "contact-page", "final-cta", "nav", "landing-ac-dormitory-belapur", "gallery"];
  const prefs = ["Capsule berth (nightly)", "AC dormitory (weekly)", "PG long stay (monthly)", "Lower berth", "Upper berth", "Not sure yet"];
  const statuses: LeadStatus[] = ["new", "new", "contacted", "interested", "booked", "closed", "contacted", "booked", "new", "interested"];
  let seed = 11;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  return names.map((n, i) => {
    const daysAgo = Math.floor(rand() * 30);
    const created = new Date(Date.now() - daysAgo * 86400000 - Math.floor(rand() * 86400000));
    const ci = new Date(created.getTime() + (1 + Math.floor(rand() * 10)) * 86400000);
    const co = new Date(ci.getTime() + (1 + Math.floor(rand() * 20)) * 86400000);
    const status = daysAgo < 2 ? "new" : statuses[i % statuses.length];
    return {
      id: uid(),
      created_at: created.toISOString(),
      full_name: n,
      phone: `9${Math.floor(100000000 + rand() * 899999999)}`,
      email: rand() > 0.3 ? `${n.split(" ")[0].toLowerCase()}@example.com` : null,
      check_in: ci.toISOString().slice(0, 10),
      check_out: co.toISOString().slice(0, 10),
      guests: 1 + Math.floor(rand() * 3),
      preference: prefs[Math.floor(rand() * prefs.length)],
      message: rand() > 0.5 ? "Arriving late by train, around 11 pm. Lower berth preferred." : null,
      status,
      source: sources[Math.floor(rand() * sources.length)],
      page: "/",
      utm: rand() > 0.6 ? { utm_source: "google", utm_medium: "cpc" } : null,
    };
  });
}

type Store = Record<string, Row[]> & { __settings: Row[] };
let store: Store | null = null;
function demoStore(): Store {
  if (store) return store;
  const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));
  store = {
    leads: demoLeads() as unknown as Row[],
    admin_notes: [],
    rooms: clone(DEFAULT_ROOMS) as unknown as Row[],
    amenities: clone(DEFAULT_AMENITIES) as unknown as Row[],
    gallery: clone(DEFAULT_GALLERY) as unknown as Row[],
    videos: clone(DEFAULT_VIDEOS) as unknown as Row[],
    faqs: clone(DEFAULT_FAQS) as unknown as Row[],
    testimonials: [],
    location_points: clone(DEFAULT_LOCATIONS) as unknown as Row[],
    availability: clone(DEFAULT_AVAILABILITY) as unknown as Row[],
    seo_pages: [],
    blogs: clone(DEFAULT_BLOGS) as unknown as Row[],
    __settings: [
      { id: "site", value: clone(DEFAULT_SITE) },
      { id: "content", value: clone(DEFAULT_CONTENT) },
      { id: "seo", value: clone(DEFAULT_SEO) },
    ],
  } as Store;
  return store;
}

function demoDb(): Db {
  const t = (name: string) => (demoStore()[name] ??= []);
  const wait = () => new Promise((r) => setTimeout(r, 120));
  return {
    mode: "demo",
    async list<T>(table: string, opts: ListOpts = {}) {
      await wait();
      let rows = [...t(table)];
      Object.entries(opts.eq ?? {}).forEach(([k, v]) => (rows = rows.filter((r) => r[k] === v)));
      if (opts.order) {
        const k = opts.order;
        const dir = opts.ascending === false ? -1 : 1;
        rows.sort((a, b) => (String(a[k] ?? "") > String(b[k] ?? "") ? dir : String(a[k] ?? "") < String(b[k] ?? "") ? -dir : 0));
        if (typeof rows[0]?.[k] === "number") rows.sort((a, b) => ((a[k] as number) - (b[k] as number)) * dir);
      }
      return (opts.limit ? rows.slice(0, opts.limit) : rows) as T[];
    },
    async get<T>(table: string, id: string) {
      await wait();
      return (t(table).find((r) => r.id === id) as T) ?? null;
    },
    async insert<T>(table: string, row: Record<string, unknown>) {
      await wait();
      const full = { ...row, id: uid(), created_at: new Date().toISOString() } as Row;
      t(table).push(full);
      return full as T;
    },
    async update<T>(table: string, id: string, patch: Record<string, unknown>) {
      await wait();
      const rows = t(table);
      const i = rows.findIndex((r) => r.id === id);
      if (i < 0) throw new Error("Not found");
      rows[i] = { ...rows[i], ...patch, id, updated_at: new Date().toISOString() };
      return rows[i] as T;
    },
    async remove(table: string, id: string) {
      await wait();
      demoStore()[table] = t(table).filter((r) => r.id !== id);
    },
    async removeMany(table: string, ids: string[]) {
      await wait();
      demoStore()[table] = t(table).filter((r) => !ids.includes(r.id));
    },
    async getSetting<T>(key: string) {
      await wait();
      return (demoStore().__settings.find((s) => s.id === key)?.value as T) ?? null;
    },
    async setSetting(key: string, value: unknown) {
      await wait();
      const s = demoStore().__settings;
      const i = s.findIndex((x) => x.id === key);
      if (i >= 0) s[i] = { id: key, value };
      else s.push({ id: key, value });
    },
    async upload(file: File) {
      await wait();
      return URL.createObjectURL(file);
    },
    async userEmail() {
      return "demo@snooz.local";
    },
    async signOut() {},
  };
}

let cached: Db | null = null;
export function getDb(): Db | null {
  if (cached) return cached;
  const sb = getBrowserSupabase();
  if (sb) cached = supabaseDb();
  else if (isDemoMode) cached = demoDb();
  return cached;
}
