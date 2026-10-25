"use client";
import { CrudManager } from "@/components/admin/CrudManager";
import { Icon } from "@/lib/icons";

export default function AmenitiesPage() {
  return (
    <CrudManager
      table="amenities"
      title="Amenities"
      itemLabel="Amenity"
      description="The line-icon grid on the homepage. Also used in the business's structured data for Google."
      defaults={{ title: "", description: "", icon: "sparkles", is_active: true, sort_order: 0 }}
      fields={[
        { key: "title", label: "Title", type: "text", required: true },
        { key: "description", label: "Short description", type: "textarea" },
        { key: "icon", label: "Icon", type: "icon" },
      ]}
      columns={[
        { key: "title", label: "Amenity", render: (r) => (
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full border border-charcoal/10 text-maroon"><Icon name={r.icon as string} className="h-4 w-4" /></span>
            <span className="font-semibold">{r.title as string}</span>
          </div>
        ) },
        { key: "description", label: "Description", className: "max-w-md text-charcoal/60" },
      ]}
    />
  );
}
