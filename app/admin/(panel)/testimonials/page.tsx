"use client";
import { CrudManager } from "@/components/admin/CrudManager";

export default function TestimonialsPage() {
  return (
    <CrudManager
      table="testimonials"
      title="Testimonials"
      itemLabel="Testimonial"
      description="Only add real feedback from real guests (with their permission). The section stays hidden on the website until at least one testimonial is visible."
      searchKeys={["name", "quote"]}
      defaults={{ name: "", role: "", quote: "", is_active: true, sort_order: 0 }}
      fields={[
        { key: "name", label: "Guest name", type: "text", required: true },
        { key: "role", label: "Role / context", type: "text", placeholder: "Stayed 2 weeks for work" },
        { key: "quote", label: "Quote", type: "textarea", required: true },
      ]}
      columns={[
        { key: "name", label: "Guest", render: (r) => <span className="font-semibold">{r.name as string}</span> },
        { key: "quote", label: "Quote", render: (r) => <span className="line-clamp-2 max-w-lg text-charcoal/60">“{r.quote as string}”</span> },
      ]}
    />
  );
}
