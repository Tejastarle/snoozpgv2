"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Film, ImagePlus, Pencil, Plus, Search, Trash2, Upload } from "lucide-react";
import { getDb, type Row } from "@/lib/admin/db";
import { Icon, ICON_NAMES } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { revalidateSite } from "@/app/admin/actions";
import { Button, Card, Confirm, Drawer, EmptyState, Field, Input, PageHeader, Select, Textarea, Toggle, useToast } from "./ui";

export type FieldDef = {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "select" | "toggle" | "image" | "video" | "tags" | "icon" | "url";
  options?: { value: string; label: string }[];
  hint?: string;
  required?: boolean;
  full?: boolean;
  placeholder?: string;
  folder?: string;
};

export type ColumnDef = { key: string; label: string; render?: (row: Row) => ReactNode; className?: string };

/** Upload-or-paste field for images and videos (Supabase Storage "media" bucket). */
export function MediaField({ value, onChange, kind = "image", folder = "uploads" }: { value: string; onChange: (v: string) => void; kind?: "image" | "video"; folder?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  async function pick(file?: File) {
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) return toast("File is larger than 50 MB", "error");
    setBusy(true);
    try {
      const url = await getDb()!.upload(file, folder);
      onChange(url);
      toast("Uploaded");
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="grid h-20 w-28 shrink-0 place-items-center overflow-hidden rounded-xl border border-charcoal/10 bg-charcoal/[0.03]">
          {value ? (
            kind === "image" ? <img src={value} alt="" className="h-full w-full object-cover" /> : <video src={value} className="h-full w-full object-cover" muted playsInline />
          ) : kind === "image" ? (
            <ImagePlus className="h-5 w-5 text-charcoal/30" />
          ) : (
            <Film className="h-5 w-5 text-charcoal/30" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Button type="button" variant="secondary" size="sm" loading={busy} onClick={() => input.current?.click()}>
            <Upload className="h-3.5 w-3.5" /> Upload {kind}
          </Button>
          {value && (
            <button type="button" className="text-left text-xs font-medium text-charcoal/50 hover:text-[#b4321f]" onClick={() => onChange("")}>Remove</button>
          )}
        </div>
        <input ref={input} type="file" hidden accept={kind === "image" ? "image/*" : "video/mp4,video/webm"} onChange={(e) => pick(e.target.files?.[0])} />
      </div>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={kind === "image" ? "…or paste an image URL / path" : "…or paste a video URL / path"} />
    </div>
  );
}

export function FieldInput({ def, value, onChange }: { def: FieldDef; value: unknown; onChange: (v: unknown) => void }) {
  switch (def.type) {
    case "textarea":
      return <Textarea value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={def.placeholder} rows={4} />;
    case "number":
      return <Input type="number" step="any" value={value === null || value === undefined ? "" : String(value)} onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))} />;
    case "select":
      return (
        <Select value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)}>
          {def.options?.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>
      );
    case "toggle":
      return (
        <div className="flex h-11 items-center">
          <Toggle checked={!!value} onChange={onChange} label={def.label} />
        </div>
      );
    case "image":
      return <MediaField value={(value as string) ?? ""} onChange={onChange} folder={def.folder} />;
    case "video":
      return <MediaField kind="video" value={(value as string) ?? ""} onChange={onChange} folder={def.folder ?? "videos"} />;
    case "tags":
      return (
        <Input
          value={Array.isArray(value) ? (value as string[]).join(", ") : ""}
          onChange={(e) => onChange(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
          placeholder={def.placeholder ?? "Comma separated"}
        />
      );
    case "icon":
      return (
        <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-9">
          {ICON_NAMES.map((n) => (
            <button
              key={n}
              type="button"
              title={n}
              onClick={() => onChange(n)}
              className={cn("grid h-10 place-items-center rounded-lg border transition", value === n ? "border-maroon bg-maroon text-linen" : "border-charcoal/10 bg-white text-charcoal/70 hover:border-charcoal/30")}
            >
              <Icon name={n} className="h-4 w-4" strokeWidth={1.6} />
            </button>
          ))}
        </div>
      );
    default:
      return <Input type={def.type === "url" ? "url" : "text"} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={def.placeholder} />;
  }
}

export function CrudManager({
  table,
  title,
  description,
  itemLabel,
  fields,
  columns,
  defaults,
  order = "sort_order",
  orderAsc = true,
  searchKeys = ["title"],
  sortable = true,
  hasActive = true,
}: {
  table: string;
  title: string;
  description?: string;
  itemLabel: string;
  fields: FieldDef[];
  columns: ColumnDef[];
  defaults: Record<string, unknown>;
  order?: string;
  orderAsc?: boolean;
  searchKeys?: string[];
  sortable?: boolean;
  hasActive?: boolean;
}) {
  const toast = useToast();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);
  const [del, setDel] = useState<Row | null>(null);
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    try {
      setRows(await getDb()!.list<Row>(table, { order, ascending: orderAsc }));
    } catch (e) {
      toast((e as Error).message, "error");
      setRows([]);
    }
  }, [table, order, orderAsc, toast]);
  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!rows) return [];
    return t ? rows.filter((r) => searchKeys.some((k) => String(r[k] ?? "").toLowerCase().includes(t))) : rows;
  }, [rows, q, searchKeys]);

  const publish = () => revalidateSite().catch(() => {});

  async function save() {
    if (!editing) return;
    const missing = fields.filter((f) => f.required && (editing[f.key] === undefined || editing[f.key] === null || editing[f.key] === ""));
    if (missing.length) return toast(`${missing[0].label} is required`, "error");
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {};
      fields.forEach((f) => (payload[f.key] = editing[f.key] ?? null));
      if (sortable && "sort_order" in defaults && editing.sort_order !== undefined) payload.sort_order = editing.sort_order;
      if (editing.id) await getDb()!.update(table, String(editing.id), payload);
      else {
        if (sortable && "sort_order" in defaults) payload.sort_order = (rows?.length ?? 0) + 1;
        await getDb()!.insert(table, payload);
      }
      toast(editing.id ? `${itemLabel} saved` : `${itemLabel} added`);
      setEditing(null);
      await load();
      publish();
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(r: Row) {
    setRows((rs) => rs?.map((x) => (x.id === r.id ? { ...x, is_active: !x.is_active } : x)) ?? null);
    try {
      await getDb()!.update(table, r.id, { is_active: !r.is_active });
      publish();
    } catch (e) {
      toast((e as Error).message, "error");
      load();
    }
  }

  async function move(r: Row, dir: -1 | 1) {
    if (!rows) return;
    const i = rows.findIndex((x) => x.id === r.id);
    const j = i + dir;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[i], next[j]] = [next[j], next[i]];
    const withOrder = next.map((x, k) => ({ ...x, sort_order: k + 1 }));
    setRows(withOrder);
    try {
      await Promise.all([getDb()!.update(table, next[i].id, { sort_order: i + 1 }), getDb()!.update(table, next[j].id, { sort_order: j + 1 })]);
      publish();
    } catch (e) {
      toast((e as Error).message, "error");
      load();
    }
  }

  async function remove() {
    if (!del) return;
    setSaving(true);
    try {
      await getDb()!.remove(table, del.id);
      toast(`${itemLabel} deleted`);
      setDel(null);
      await load();
      publish();
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setSaving(false);
    }
  }

  const canSort = sortable && !q && order === "sort_order";

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        actions={
          <Button onClick={() => setEditing({ ...defaults })}>
            <Plus className="h-4 w-4" /> Add {itemLabel.toLowerCase()}
          </Button>
        }
      />
      {rows && rows.length > 6 && (
        <div className="relative mb-4 max-w-sm">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal/35" />
          <Input placeholder={`Search ${title.toLowerCase()}`} value={q} onChange={(e) => setQ(e.target.value)} className="pl-10" />
        </div>
      )}
      <Card className="overflow-hidden">
        {!rows ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-charcoal/[0.04]" />
            ))}
          </div>
        ) : !visible.length ? (
          <EmptyState
            title={rows.length ? "Nothing matches your search" : `No ${title.toLowerCase()} yet`}
            text={rows.length ? undefined : `Add your first ${itemLabel.toLowerCase()} — it appears on the website right away.`}
            action={!rows.length ? <Button onClick={() => setEditing({ ...defaults })}><Plus className="h-4 w-4" /> Add {itemLabel.toLowerCase()}</Button> : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[0.88rem]">
              <thead className="border-b border-charcoal/[0.07] bg-charcoal/[0.02] text-[0.75rem] font-semibold text-charcoal/50">
                <tr>
                  {canSort && <th className="w-16 px-4 py-3">Order</th>}
                  {columns.map((c) => (
                    <th key={c.key} className={cn("px-3 py-3", c.className)}>{c.label}</th>
                  ))}
                  {hasActive && <th className="w-24 px-3 py-3">Visible</th>}
                  <th className="w-24 px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/[0.06]">
                {visible.map((r, i) => (
                  <tr key={r.id} className="hover:bg-linen/50">
                    {canSort && (
                      <td className="px-4 py-2">
                        <div className="flex flex-col">
                          <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => move(r, -1)} className="grid h-5 w-6 place-items-center rounded text-charcoal/40 hover:bg-charcoal/5 hover:text-charcoal disabled:opacity-20"><ArrowUp className="h-3.5 w-3.5" /></button>
                          <button type="button" aria-label="Move down" disabled={i === visible.length - 1} onClick={() => move(r, 1)} className="grid h-5 w-6 place-items-center rounded text-charcoal/40 hover:bg-charcoal/5 hover:text-charcoal disabled:opacity-20"><ArrowDown className="h-3.5 w-3.5" /></button>
                        </div>
                      </td>
                    )}
                    {columns.map((c) => (
                      <td key={c.key} className={cn("px-3 py-3 align-middle", c.className)}>{c.render ? c.render(r) : String(r[c.key] ?? "—")}</td>
                    ))}
                    {hasActive && (
                      <td className="px-3 py-3">
                        <Toggle checked={!!r.is_active} onChange={() => toggleActive(r)} label="Visible on website" />
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button type="button" onClick={() => setEditing({ ...r })} className="grid h-9 w-9 place-items-center rounded-lg text-charcoal/55 hover:bg-charcoal/5 hover:text-charcoal" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                        <button type="button" onClick={() => setDel(r)} className="grid h-9 w-9 place-items-center rounded-lg text-charcoal/55 hover:bg-[#b4321f]/8 hover:text-[#b4321f]" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Drawer
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? `Edit ${itemLabel.toLowerCase()}` : `Add ${itemLabel.toLowerCase()}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save} loading={saving}>{editing?.id ? "Save changes" : `Add ${itemLabel.toLowerCase()}`}</Button>
          </>
        }
      >
        {editing && (
          <div className="grid grid-cols-2 gap-5">
            {fields.map((f) => (
              <Field key={f.key} label={f.label + (f.required ? " *" : "")} hint={f.hint} className={f.full || ["textarea", "image", "video", "icon", "tags"].includes(f.type) ? "col-span-2" : "col-span-2 sm:col-span-1"}>
                <FieldInput def={f} value={editing[f.key]} onChange={(v) => setEditing((e) => ({ ...(e ?? {}), [f.key]: v }))} />
              </Field>
            ))}
          </div>
        )}
      </Drawer>
      <Confirm open={!!del} title={`Delete this ${itemLabel.toLowerCase()}?`} text="It will be removed from the website." busy={saving} onCancel={() => setDel(null)} onConfirm={remove} />
    </>
  );
}

/** Thumbnail + title cell used by several managers. */
export function ThumbCell({ src, title, sub }: { src?: string; title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-charcoal/[0.05]">{src && <img src={src} alt="" className="h-full w-full object-cover" />}</div>
      <div className="min-w-0">
        <p className="truncate font-semibold">{title}</p>
        {sub && <p className="truncate text-xs text-charcoal/50">{sub}</p>}
      </div>
    </div>
  );
}
