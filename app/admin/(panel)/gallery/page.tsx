"use client";
import { CrudManager, ThumbCell } from "@/components/admin/CrudManager";
import { GALLERY_CATEGORIES } from "@/lib/types";

export default function GalleryPage() {
  return (
    <CrudManager
      table="gallery"
      title="Gallery"
      itemLabel="Image"
      description="Photos in the masonry gallery. Upload real photos of the dorm, capsules, sea view and building — they're optimised to WebP/AVIF automatically."
      searchKeys={["title", "category", "alt"]}
      defaults={{ title: "", category: "Rooms", image_url: "", alt: "", is_active: true, sort_order: 0 }}
      fields={[
        { key: "title", label: "Title", type: "text", required: true },
        { key: "category", label: "Category", type: "select", options: GALLERY_CATEGORIES.map((c) => ({ value: c, label: c })) },
        { key: "image_url", label: "Image", type: "image", folder: "gallery", required: true },
        { key: "alt", label: "Alt text (for SEO & screen readers)", type: "text", full: true, placeholder: "Describe what's in the photo" },
      ]}
      columns={[
        { key: "title", label: "Image", render: (r) => <ThumbCell src={r.image_url as string} title={r.title as string} sub={r.alt as string} /> },
        { key: "category", label: "Category", className: "text-charcoal/60" },
      ]}
    />
  );
}
