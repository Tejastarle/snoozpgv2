"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  BookOpenText,
  CalendarCheck2,
  CircleHelp,
  ExternalLink,
  Film,
  Globe,
  Images,
  Inbox,
  LayoutDashboard,
  LogOut,
  MapPinned,
  Menu,
  MessageSquareQuote,
  PanelsTopLeft,
  Phone,
  Search,
  Settings,
  BedDouble,
  Sparkles,
  ToggleRight,
  X,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { getDb } from "@/lib/admin/db";
import { cn } from "@/lib/utils";
import type { Lead } from "@/lib/types";
import { ToastProvider } from "./ui";

const NAV: { group: string; items: { href: string; label: string; icon: typeof Inbox }[] }[] = [
  {
    group: "Overview",
    items: [
      { href: "/admin/leads", label: "Leads", icon: Inbox },
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck2 },
    ],
  },
  {
    group: "Content",
    items: [
      { href: "/admin/blogs", label: "Blogs", icon: BookOpenText },
      { href: "/admin/rooms", label: "Rooms", icon: BedDouble },
      { href: "/admin/gallery", label: "Gallery", icon: Images },
      { href: "/admin/videos", label: "Videos", icon: Film },
      { href: "/admin/amenities", label: "Amenities", icon: Sparkles },
      { href: "/admin/faqs", label: "FAQs", icon: CircleHelp },
      { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
      { href: "/admin/location", label: "Location", icon: MapPinned },
      { href: "/admin/availability", label: "Availability", icon: ToggleRight },
      { href: "/admin/content", label: "Website content", icon: PanelsTopLeft },
    ],
  },
  {
    group: "Settings",
    items: [
      { href: "/admin/contact", label: "Contact info", icon: Phone },
      { href: "/admin/seo", label: "SEO", icon: Search },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function AdminShell({ demo = false, children }: { email?: string; demo?: boolean; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [newCount, setNewCount] = useState(0);
  useEffect(() => setOpen(false), [pathname]);

  // Count of leads still marked "new" — shown on the Leads menu item, refreshed every 30s.
  useEffect(() => {
    let alive = true;
    const load = () =>
      getDb()
        ?.list<Lead>("leads", { eq: { status: "new" }, limit: 999 })
        .then((rows) => alive && setNewCount(rows.length))
        .catch(() => {});
    load();
    const t = setInterval(load, 30000);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    window.addEventListener("snooz:leads-changed", onFocus);
    return () => {
      alive = false;
      clearInterval(t);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("snooz:leads-changed", onFocus);
    };
  }, []);

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  async function signOut() {
    await getDb()?.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 pb-6 pt-6">
        <Link href="/admin" className="text-linen" aria-label="SNOOZ admin home">
          <Logo className="h-6 w-auto" />
        </Link>
        <span className="rounded-full bg-linen/10 px-2 py-0.5 text-[0.68rem] font-semibold text-linen/70">Admin</span>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 pb-6" aria-label="Admin">
        {NAV.map((g) => (
          <div key={g.group} className="mb-5">
            <p className="px-3 pb-2 text-[0.72rem] font-semibold text-linen/35">{g.group}</p>
            <ul className="space-y-0.5">
              {g.items.map((it) => (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.9rem] font-medium transition-colors",
                      isActive(it.href) ? "bg-linen text-charcoal" : "text-linen/65 hover:bg-linen/[0.06] hover:text-linen",
                    )}
                  >
                    <it.icon className="h-[18px] w-[18px]" strokeWidth={1.7} />
                    {it.label}
                    {it.href === "/admin/leads" && newCount > 0 && (
                      <span className="ml-auto rounded-full bg-[#e0533d] px-2 py-0.5 text-[0.7rem] font-bold tabular-nums text-white" aria-label={`${newCount} new leads`}>
                        {newCount}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-linen/10 p-4">
        <p className="px-1 text-xs text-linen/45">Signed in as admin</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <a href="/" target="_blank" rel="noopener" className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-linen/15 text-xs font-semibold text-linen/80 hover:text-linen">
            <Globe className="h-3.5 w-3.5" /> View site
          </a>
          <button type="button" onClick={signOut} className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-linen/15 text-xs font-semibold text-linen/80 hover:text-linen">
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <ToastProvider>
      <div className="min-h-screen lg:pl-[260px]">
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] bg-charcoal lg:block">{sidebar}</aside>

        {/* Mobile top bar + drawer */}
        <div className="sticky top-0 z-30 flex items-center justify-between bg-charcoal px-4 py-3 lg:hidden">
          <Logo className="h-5 w-auto text-linen" />
          <div className="flex items-center gap-1">
          {newCount > 0 && (
            <Link href="/admin/leads" className="rounded-full bg-[#e0533d] px-2.5 py-1 text-xs font-bold text-white">{newCount} new</Link>
          )}
          <button type="button" onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-lg text-linen" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          </div>
        </div>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-charcoal/50" onClick={() => setOpen(false)} />
            <aside className="absolute inset-y-0 left-0 w-[280px] bg-charcoal">
              <button type="button" onClick={() => setOpen(false)} className="absolute right-3 top-5 grid h-9 w-9 place-items-center rounded-lg text-linen/70" aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
              {sidebar}
            </aside>
          </div>
        )}

        {demo && (
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-[#fbf0dc] px-4 py-2 text-center text-[0.82rem] text-[#7a4f0c]">
            <strong>Demo mode.</strong> Sample data only — changes are not saved. Connect Supabase to go live.
            <a href="https://supabase.com/dashboard" target="_blank" rel="noopener" className="inline-flex items-center gap-1 font-semibold underline">
              Supabase <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
        <main className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">{children}</main>
      </div>
    </ToastProvider>
  );
}
