"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { getDb } from "@/lib/admin/db";
import { revalidateSite } from "@/app/admin/actions";
import { FieldInput, type FieldDef } from "./CrudManager";
import { Button, Card, Field, PageHeader, useToast } from "./ui";

export type SettingsSection = { title: string; description?: string; fields: FieldDef[] };

/** Edits one JSON settings row (site / content / seo). Missing keys fall back to defaults. */
export function SettingsForm<T extends object>({
  settingKey,
  defaults,
  title,
  description,
  sections,
}: {
  settingKey: string;
  defaults: T;
  title: string;
  description?: string;
  sections: SettingsSection[];
}) {
  const toast = useToast();
  const [values, setValues] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    getDb()!
      .getSetting<Record<string, unknown>>(settingKey)
      .then((v) => setValues({ ...(defaults as Record<string, unknown>), ...(v ?? {}) }))
      .catch((e) => {
        toast((e as Error).message, "error");
        setValues({ ...(defaults as Record<string, unknown>) });
      });
  }, [settingKey, defaults, toast]);

  async function save() {
    if (!values) return;
    setSaving(true);
    try {
      await getDb()!.setSetting(settingKey, values);
      await revalidateSite().catch(() => {});
      setDirty(false);
      toast("Saved — the website is updated");
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        actions={
          <Button onClick={save} loading={saving} disabled={!values || !dirty}>
            <Save className="h-4 w-4" /> Save changes
          </Button>
        }
      />
      {!values ? (
        <Card className="h-64 animate-pulse bg-charcoal/[0.03]">{null}</Card>
      ) : (
        <div className="space-y-6">
          {sections.map((s) => (
            <Card key={s.title} className="p-6 md:p-7">
              <h2 className="font-bold">{s.title}</h2>
              {s.description && <p className="mt-1 text-sm text-charcoal/55">{s.description}</p>}
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                {s.fields.map((f) => (
                  <Field key={f.key} label={f.label} hint={f.hint} className={f.full || f.type === "textarea" || f.type === "image" ? "md:col-span-2" : undefined}>
                    <FieldInput
                      def={f}
                      value={values[f.key]}
                      onChange={(v) => {
                        setValues((x) => ({ ...(x ?? {}), [f.key]: v }));
                        setDirty(true);
                      }}
                    />
                  </Field>
                ))}
              </div>
            </Card>
          ))}
          <div className="sticky bottom-4 flex justify-end">
            {dirty && (
              <Button onClick={save} loading={saving} className="shadow-xl">
                <Save className="h-4 w-4" /> Save changes
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
