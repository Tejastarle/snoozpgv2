"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, Bold, ExternalLink, Heading2, ImagePlus, Italic, Link2, List, ListOrdered, Quote, Trash2 } from "lucide-react";
import { getDb } from "@/lib/admin/db";
import type { Blog } from "@/lib/types";
import { cn, slugify } from "@/lib/utils";
import { revalidateSite } from "@/app/admin/actions";
import { MediaField } from "./CrudManager";
import { Badge, Button, Card, Confirm, Field, Input, Select, Textarea, useToast } from "./ui";

const EMPTY: Omit<Blog, "id" | "created_at"> = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  cover_image: "",
  tags: [],
  status: "draft",
  author: "Team SNOOZ",
  published_at: null,
  seo_title: "",
  seo_description: "",
};

const toLocalInput = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

export function BlogEditor({ id }: { id: string }) {
  const isNew = id === "new";
  const router = useRouter();
  const toast = useToast();
  const [post, setPost] = useState<Partial<Blog> | null>(isNew ? { ...EMPTY } : null);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [saving, setSaving] = useState<"" | "draft" | "published">("");
  const [del, setDel] = useState(false);
  const area = useRef<HTMLTextAreaElement>(null);
  const imgInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isNew) return;
    getDb()!
      .get<Blog>("blogs", id)
      .then((b) => (b ? setPost(b) : (toast("Post not found", "error"), router.push("/admin/blogs"))))
      .catch((e) => toast((e as Error).message, "error"));
  }, [id, isNew, router, toast]);

  const set = <K extends keyof Blog>(k: K, v: Blog[K]) => setPost((p) => ({ ...(p ?? {}), [k]: v }));

  function wrap(before: string, after = "", placeholder = "") {
    const el = area.current;
    if (!el || !post) return;
    const { selectionStart: s, selectionEnd: e, value } = el;
    const sel = value.slice(s, e) || placeholder;
    const next = value.slice(0, s) + before + sel + after + value.slice(e);
    set("content", next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + before.length, s + before.length + sel.length);
    });
  }
  const line = (prefix: string) => wrap(`\n${prefix}`, "", "Text");

  async function insertImage(file?: File) {
    if (!file) return;
    try {
      const url = await getDb()!.upload(file, "blog");
      wrap(`\n![${file.name.replace(/\.[^.]+$/, "")}](${url})\n`);
    } catch (e) {
      toast((e as Error).message, "error");
    }
  }

  async function save(status: "draft" | "published") {
    if (!post) return;
    if (!post.title?.trim()) return toast("Add a title first", "error");
    const slug = slugify(post.slug || post.title);
    if (!slug) return toast("Add a valid slug", "error");
    setSaving(status);
    const payload = {
      title: post.title.trim(),
      slug,
      excerpt: post.excerpt ?? "",
      content: post.content ?? "",
      cover_image: post.cover_image || null,
      tags: post.tags ?? [],
      status,
      author: post.author || null,
      published_at: status === "published" ? post.published_at || new Date().toISOString() : post.published_at ?? null,
      seo_title: post.seo_title || null,
      seo_description: post.seo_description || null,
    };
    try {
      if (isNew) {
        const created = await getDb()!.insert<Blog>("blogs", payload);
        toast(status === "published" ? "Post published" : "Draft saved");
        router.replace(`/admin/blogs/${created.id}`);
      } else {
        const updated = await getDb()!.update<Blog>("blogs", id, payload);
        setPost(updated);
        toast(status === "published" ? "Post published" : "Draft saved");
      }
      revalidateSite().catch(() => {});
    } catch (e) {
      const msg = (e as Error).message;
      toast(msg.includes("duplicate") ? "Another post already uses this slug" : msg, "error");
    } finally {
      setSaving("");
    }
  }

  async function remove() {
    await getDb()!.remove("blogs", id);
    revalidateSite().catch(() => {});
    toast("Post deleted");
    router.push("/admin/blogs");
  }

  if (!post) return <Card className="h-96 animate-pulse bg-charcoal/[0.03]">{null}</Card>;

  const seoTitle = post.seo_title || post.title || "";
  const seoDesc = post.seo_description || post.excerpt || "";

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/blogs" className="grid h-10 w-10 place-items-center rounded-xl border border-charcoal/10 bg-white text-charcoal/60 hover:text-charcoal" aria-label="Back to posts"><ArrowLeft className="h-4 w-4" /></Link>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">{isNew ? "New post" : "Edit post"}</h1>
            {!isNew && <Badge tone={post.status ?? "draft"}>{post.status}</Badge>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isNew && post.status === "published" && (
            <a href={`/blog/${post.slug}`} target="_blank" rel="noopener"><Button variant="ghost"><ExternalLink className="h-4 w-4" /> View</Button></a>
          )}
          {!isNew && <Button variant="ghost" onClick={() => setDel(true)} className="text-[#b4321f]"><Trash2 className="h-4 w-4" /></Button>}
          <Button variant="secondary" onClick={() => save("draft")} loading={saving === "draft"}>{post.status === "published" ? "Unpublish" : "Save draft"}</Button>
          <Button onClick={() => save("published")} loading={saving === "published"}>{post.status === "published" ? "Update" : "Publish"}</Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <Card className="p-6">
            <input
              value={post.title ?? ""}
              onChange={(e) => {
                set("title", e.target.value);
                if (!slugTouched) set("slug", slugify(e.target.value));
              }}
              placeholder="Post title"
              className="w-full border-0 bg-transparent text-[1.8rem] font-extrabold tracking-tight placeholder:text-charcoal/25 focus:outline-none [font-variation-settings:'wdth'_106]"
              aria-label="Title"
            />
            <div className="mt-2 flex items-center gap-1 text-sm text-charcoal/50">
              /blog/
              <input
                value={post.slug ?? ""}
                onChange={(e) => {
                  setSlugTouched(true);
                  set("slug", slugify(e.target.value));
                }}
                className="min-w-0 flex-1 rounded-md border-0 bg-charcoal/[0.04] px-2 py-1 text-charcoal/80 focus:outline-none focus:ring-2 focus:ring-maroon/20"
                aria-label="Slug"
              />
            </div>
            <Textarea className="mt-5" placeholder="Short excerpt shown on the blog page and in search results" value={post.excerpt ?? ""} onChange={(e) => set("excerpt", e.target.value)} rows={2} />
          </Card>

          <Card className="overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-charcoal/[0.07] px-3 py-2">
              <div className="flex flex-wrap gap-0.5">
                {[
                  { icon: Heading2, label: "Heading", fn: () => line("## ") },
                  { icon: Bold, label: "Bold", fn: () => wrap("**", "**", "bold") },
                  { icon: Italic, label: "Italic", fn: () => wrap("_", "_", "italic") },
                  { icon: Link2, label: "Link", fn: () => wrap("[", "](https://)", "link text") },
                  { icon: List, label: "Bullet list", fn: () => line("- ") },
                  { icon: ListOrdered, label: "Numbered list", fn: () => line("1. ") },
                  { icon: Quote, label: "Quote", fn: () => line("> ") },
                  { icon: ImagePlus, label: "Image", fn: () => imgInput.current?.click() },
                ].map((b) => (
                  <button key={b.label} type="button" title={b.label} aria-label={b.label} onClick={b.fn} disabled={tab === "preview"} className="grid h-9 w-9 place-items-center rounded-lg text-charcoal/60 hover:bg-charcoal/5 hover:text-charcoal disabled:opacity-30">
                    <b.icon className="h-4 w-4" />
                  </button>
                ))}
                <input ref={imgInput} type="file" accept="image/*" hidden onChange={(e) => insertImage(e.target.files?.[0])} />
              </div>
              <div className="flex gap-1 rounded-lg bg-charcoal/[0.05] p-0.5">
                {(["write", "preview"] as const).map((t) => (
                  <button key={t} type="button" onClick={() => setTab(t)} className={cn("rounded-md px-3 py-1.5 text-xs font-semibold capitalize", tab === t ? "bg-white shadow-sm" : "text-charcoal/55")}>{t}</button>
                ))}
              </div>
            </div>
            {tab === "write" ? (
              <textarea
                ref={area}
                value={post.content ?? ""}
                onChange={(e) => set("content", e.target.value)}
                placeholder={"Write in Markdown.\n\n## A heading\n\nA paragraph with **bold** text and a [link](/contact)."}
                className="min-h-[520px] w-full resize-y border-0 bg-white p-6 font-mono text-[0.9rem] leading-relaxed text-charcoal focus:outline-none"
                aria-label="Content"
              />
            ) : (
              <div className="prose-snooz min-h-[520px] bg-white p-6">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content || "_Nothing to preview yet._"}</ReactMarkdown>
              </div>
            )}
            <p className="border-t border-charcoal/[0.07] px-4 py-2 text-xs text-charcoal/45">{(post.content ?? "").split(/\s+/).filter(Boolean).length} words</p>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="space-y-5 p-6">
            <h2 className="font-bold">Post settings</h2>
            <Field label="Cover image"><MediaField value={post.cover_image ?? ""} onChange={(v) => set("cover_image", v)} folder="blog" /></Field>
            <Field label="Tags" hint="Comma separated">
              <Input value={(post.tags ?? []).join(", ")} onChange={(e) => set("tags", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
            </Field>
            <Field label="Author"><Input value={post.author ?? ""} onChange={(e) => set("author", e.target.value)} /></Field>
            <Field label="Publish date">
              <Input type="datetime-local" value={toLocalInput(post.published_at ?? null)} onChange={(e) => set("published_at", e.target.value ? new Date(e.target.value).toISOString() : null)} />
            </Field>
            <Field label="Status">
              <Select value={post.status} onChange={(e) => set("status", e.target.value as Blog["status"])}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </Select>
            </Field>
          </Card>

          <Card className="space-y-5 p-6">
            <h2 className="font-bold">Search appearance</h2>
            <Field label={`SEO title (${seoTitle.length}/60)`}>
              <Input value={post.seo_title ?? ""} onChange={(e) => set("seo_title", e.target.value)} placeholder={post.title} />
            </Field>
            <Field label={`Meta description (${seoDesc.length}/160)`}>
              <Textarea value={post.seo_description ?? ""} onChange={(e) => set("seo_description", e.target.value)} placeholder={post.excerpt} rows={3} />
            </Field>
            <div className="rounded-xl border border-charcoal/[0.07] bg-white p-4">
              <p className="text-xs text-charcoal/50">Google preview</p>
              <p className="mt-2 truncate text-[1.05rem] text-[#1a0dab]">{seoTitle || "Post title"} | SNOOZ</p>
              <p className="truncate text-xs text-[#006621]">snooz… › blog › {post.slug || "post-slug"}</p>
              <p className="mt-1 line-clamp-2 text-[0.82rem] text-charcoal/70">{seoDesc || "Meta description appears here."}</p>
            </div>
          </Card>
        </div>
      </div>
      <Confirm open={del} title="Delete this post?" text={post.title} onCancel={() => setDel(false)} onConfirm={remove} />
    </>
  );
}
