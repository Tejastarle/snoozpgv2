"use client";
import { CrudManager, ThumbCell } from "@/components/admin/CrudManager";
import { slugify } from "@/lib/utils";

export default function RoomsPage() {
  return (
    <CrudManager
      table="rooms"
      title="Rooms"
      itemLabel="Room"
      description="Stay types shown in the “Your space. Your comfort.” section. Rates are optional — use a label like “Nightly stays” or “From ₹…”."
      defaults={{ title: "", slug: "", description: "", price_label: "", features: [], image_url: "", is_active: true, sort_order: 0 }}
      fields={[
        { key: "title", label: "Title", type: "text", required: true },
        { key: "slug", label: "Slug", type: "text", required: true, hint: "Lowercase, hyphens only, e.g. capsule-berth" },
        { key: "price_label", label: "Rate / label", type: "text", placeholder: "Nightly stays" },
        { key: "description", label: "Description", type: "textarea", required: true },
        { key: "features", label: "Features", type: "tags", placeholder: "Privacy curtain, Fresh linen, Wi-Fi" },
        { key: "image_url", label: "Image", type: "image", folder: "rooms", required: true },
      ]}
      columns={[
        { key: "title", label: "Room", render: (r) => <ThumbCell src={r.image_url as string} title={r.title as string} sub={(r.slug as string) || slugify(String(r.title))} /> },
        { key: "price_label", label: "Label", className: "text-charcoal/60" },
        { key: "features", label: "Features", render: (r) => <span className="text-charcoal/60">{((r.features as string[]) ?? []).length} features</span> },
      ]}
    />
  );
}
