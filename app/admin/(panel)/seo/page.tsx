"use client";
import { CrudManager } from "@/components/admin/CrudManager";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { DEFAULT_SEO } from "@/lib/defaults";
import { LANDING_PAGES } from "@/lib/landing-pages";

const PATHS = ["/", "/contact", "/blog", ...LANDING_PAGES.map((p) => `/${p.slug}`)];

export default function SeoPage() {
  return (
    <div className="space-y-14">
      <SettingsForm
        settingKey="seo"
        defaults={DEFAULT_SEO}
        title="SEO settings"
        description="Site-wide defaults for search results and social sharing."
        sections={[
          {
            title: "Defaults",
            fields: [
              { key: "title", label: "Default title", type: "text", full: true, hint: "Aim for 50–60 characters" },
              { key: "title_template", label: "Title template", type: "text", hint: "%s is replaced with the page title" },
              { key: "description", label: "Meta description", type: "textarea", hint: "Aim for 140–160 characters" },
              { key: "keywords", label: "Keywords", type: "textarea", hint: "Comma separated" },
              { key: "og_image", label: "Open Graph image (1200 × 630)", type: "image", folder: "seo" },
            ],
          },
        ]}
      />
      <CrudManager
        table="seo_pages"
        title="Per-page SEO overrides"
        itemLabel="Page override"
        hasActive={false}
        sortable={false}
        order="path"
        description={`Override the title and description for a specific page. Pages: ${PATHS.join(", ")}`}
        searchKeys={["path", "title"]}
        defaults={{ path: "/", title: "", description: "", keywords: "", og_image: "" }}
        fields={[
          { key: "path", label: "Page", type: "select", options: PATHS.map((p) => ({ value: p, label: p })) },
          { key: "title", label: "Title", type: "text", required: true, full: true },
          { key: "description", label: "Meta description", type: "textarea", required: true },
          { key: "keywords", label: "Keywords", type: "text", full: true },
          { key: "og_image", label: "Open Graph image", type: "image", folder: "seo" },
        ]}
        columns={[
          { key: "path", label: "Page", render: (r) => <code className="rounded bg-charcoal/5 px-1.5 py-0.5 text-xs">{r.path as string}</code> },
          { key: "title", label: "Title", render: (r) => <span className="font-semibold">{r.title as string}</span> },
          { key: "description", label: "Description", render: (r) => <span className="line-clamp-1 max-w-md text-charcoal/60">{r.description as string}</span> },
        ]}
      />
    </div>
  );
}
