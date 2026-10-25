"use client";
import Link from "next/link";
import { CrudManager } from "@/components/admin/CrudManager";

export default function AvailabilityPage() {
  return (
    <>
      <CrudManager
        table="availability"
        title="Availability"
        itemLabel="Availability row"
        hasActive={false}
        description="Optional live availability shown next to the enquiry form. Rows marked public appear only when “Show availability” is on in Website content."
        searchKeys={["label"]}
        defaults={{ label: "", available: 0, total: null, note: "", is_public: false, sort_order: 0 }}
        fields={[
          { key: "label", label: "Label", type: "text", required: true, placeholder: "Capsule berths" },
          { key: "available", label: "Available now", type: "number", required: true },
          { key: "total", label: "Total (optional)", type: "number" },
          { key: "is_public", label: "Show on website", type: "toggle" },
          { key: "note", label: "Note", type: "text", full: true, placeholder: "Lower berths only" },
        ]}
        columns={[
          { key: "label", label: "Label", render: (r) => <span className="font-semibold">{r.label as string}</span> },
          { key: "available", label: "Available", render: (r) => <span className="tabular-nums">{String(r.available)}{r.total ? ` / ${r.total}` : ""}</span> },
          { key: "is_public", label: "Public", render: (r) => (r.is_public ? "Yes" : "No") },
          { key: "note", label: "Note", className: "text-charcoal/60" },
        ]}
      />
      <p className="mt-4 text-sm text-charcoal/55">
        Turn the section on in <Link href="/admin/content" className="font-semibold text-maroon underline">Website content → Sections</Link>.
      </p>
    </>
  );
}
