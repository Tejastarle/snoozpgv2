"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ExternalLink, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { getDb } from "@/lib/admin/db";
import type { Blog } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";
import { revalidateSite } from "@/app/admin/actions";
import { Badge, Button, Card, Confirm, EmptyState, Input, PageHeader, useToast } from "./ui";

export function BlogList() {
  const toast = useToast();
  const [blogs, setBlogs] = useState<Blog[] | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "published" | "draft">("all");
  const [del, setDel] = useState<Blog | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setBlogs(await getDb()!.list<Blog>("blogs", { order: "created_at", ascending: false }));
    } catch (e) {
      toast((e as Error).message, "error");
      setBlogs([]);
    }
  }, [toast]);
  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(
    () => (blogs ?? []).filter((b) => (status === "all" || b.status === status) && (!q || b.title.toLowerCase().includes(q.toLowerCase()))),
    [blogs, q, status],
  );

  async function remove() {
    if (!del) return;
    setBusy(true);
    try {
      await getDb()!.remove("blogs", del.id);
      toast("Post deleted");
      setDel(null);
      load();
      revalidateSite().catch(() => {});
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Blogs"
        description="Articles that help SNOOZ rank for local searches like “PG in CBD Belapur”. Published posts appear at /blog and in the sitemap."
        actions={
          <Link href="/admin/blogs/new">
            <Button><Plus className="h-4 w-4" /> New post</Button>
          </Link>
        }
      />
      <Card className="mb-4 flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal/35" />
          <Input placeholder="Search posts" value={q} onChange={(e) => setQ(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-1 rounded-xl bg-charcoal/[0.05] p-1">
          {(["all", "published", "draft"] as const).map((s) => (
            <button key={s} type="button" onClick={() => setStatus(s)} className={cn("rounded-lg px-3.5 py-2 text-sm font-semibold capitalize", status === s ? "bg-white shadow-sm" : "text-charcoal/55")}>{s}</button>
          ))}
        </div>
      </Card>
      <Card className="overflow-hidden">
        {!blogs ? (
          <div className="space-y-2 p-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-charcoal/[0.04]" />)}</div>
        ) : !visible.length ? (
          <EmptyState title={blogs.length ? "No posts match" : "No posts yet"} text={blogs.length ? undefined : "Write your first article — guides about staying in Belapur work well."} action={!blogs.length ? <Link href="/admin/blogs/new"><Button><Plus className="h-4 w-4" /> New post</Button></Link> : undefined} />
        ) : (
          <ul className="divide-y divide-charcoal/[0.06]">
            {visible.map((b) => (
              <li key={b.id} className="flex items-center gap-4 p-4 hover:bg-linen/50">
                <div className="hidden h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-charcoal/[0.05] sm:block">{b.cover_image && <img src={b.cover_image} alt="" className="h-full w-full object-cover" />}</div>
                <Link href={`/admin/blogs/${b.id}`} className="min-w-0 flex-1">
                  <p className="truncate font-semibold hover:text-maroon">{b.title}</p>
                  <p className="mt-0.5 truncate text-xs text-charcoal/50">/blog/{b.slug} — {b.status === "published" ? `Published ${formatDate(b.published_at)}` : `Updated ${formatDate(b.updated_at ?? b.created_at)}`}</p>
                </Link>
                <Badge tone={b.status}>{b.status}</Badge>
                <div className="flex gap-1">
                  {b.status === "published" && (
                    <a href={`/blog/${b.slug}`} target="_blank" rel="noopener" className="grid h-9 w-9 place-items-center rounded-lg text-charcoal/55 hover:bg-charcoal/5" aria-label="View on site"><ExternalLink className="h-4 w-4" /></a>
                  )}
                  <Link href={`/admin/blogs/${b.id}`} className="grid h-9 w-9 place-items-center rounded-lg text-charcoal/55 hover:bg-charcoal/5" aria-label="Edit"><Pencil className="h-4 w-4" /></Link>
                  <button type="button" onClick={() => setDel(b)} className="grid h-9 w-9 place-items-center rounded-lg text-charcoal/55 hover:bg-[#b4321f]/8 hover:text-[#b4321f]" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Confirm open={!!del} title="Delete this post?" text={del?.title} busy={busy} onCancel={() => setDel(null)} onConfirm={remove} />
    </>
  );
}
