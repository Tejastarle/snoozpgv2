"use client";
import { CrudManager } from "@/components/admin/CrudManager";

export default function VideosPage() {
  return (
    <CrudManager
      table="videos"
      title="Videos"
      itemLabel="Video"
      description="The first visible “Hero” video plays behind the landing page; the first “Experience” video plays in the cinematic film section; all “Tour” videos appear in “See it for real”. Keep files short, muted and under ~5 MB (MP4 H.264, optionally WebM)."
      defaults={{ title: "", placement: "hero", src_mp4: "", src_webm: "", poster: "", is_active: true, sort_order: 0 }}
      fields={[
        { key: "title", label: "Title", type: "text", required: true },
        { key: "placement", label: "Placement", type: "select", options: [{ value: "hero", label: "Hero background" }, { value: "experience", label: "Film section" }, { value: "tour", label: "“See it for real” tour" }, { value: "other", label: "Not placed" }] },
        { key: "src_mp4", label: "MP4 file", type: "video", required: true },
        { key: "src_webm", label: "WebM file (optional, smaller)", type: "video" },
        { key: "poster", label: "Poster image (shown while loading)", type: "image", folder: "posters" },
      ]}
      columns={[
        { key: "title", label: "Video", render: (r) => (
          <div className="flex items-center gap-3">
            <video src={r.src_mp4 as string} poster={(r.poster as string) || undefined} muted playsInline className="h-12 w-20 rounded-lg bg-charcoal object-cover" />
            <span className="font-semibold">{r.title as string}</span>
          </div>
        ) },
        { key: "placement", label: "Placement", render: (r) => <span className="capitalize text-charcoal/60">{r.placement === "experience" ? "Film section" : r.placement === "hero" ? "Hero background" : r.placement === "tour" ? "Tour videos" : "Not placed"}</span> },
      ]}
    />
  );
}
