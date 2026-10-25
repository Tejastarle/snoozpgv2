"use client";
import { CrudManager } from "@/components/admin/CrudManager";
import { Icon } from "@/lib/icons";

export default function LocationPage() {
  return (
    <CrudManager
      table="location_points"
      title="Location & distances"
      itemLabel="Destination"
      description="Travel times shown in “Connected to everything that matters” and on the SEO pages. Map position: x from -1 (west) to 1 (east), y from -1 (south) to 1 (north), with SNOOZ at 0, 0."
      searchKeys={["label", "description"]}
      defaults={{ label: "", minutes: 5, description: "", icon: "map-pin", map_x: 0.5, map_y: 0.5, is_active: true, sort_order: 0 }}
      fields={[
        { key: "label", label: "Destination", type: "text", required: true },
        { key: "minutes", label: "Minutes (approx.)", type: "number", required: true },
        { key: "description", label: "Description", type: "text", full: true },
        { key: "map_x", label: "Map position x (-1 to 1)", type: "number" },
        { key: "map_y", label: "Map position y (-1 to 1)", type: "number" },
        { key: "icon", label: "Icon", type: "icon" },
      ]}
      columns={[
        { key: "label", label: "Destination", render: (r) => (
          <div className="flex items-center gap-3">
            <Icon name={r.icon as string} className="h-4 w-4 text-maroon" />
            <span className="font-semibold">{r.label as string}</span>
          </div>
        ) },
        { key: "minutes", label: "Time", render: (r) => <span className="tabular-nums">{String(r.minutes)} min</span> },
        { key: "description", label: "Description", className: "text-charcoal/60" },
      ]}
    />
  );
}
