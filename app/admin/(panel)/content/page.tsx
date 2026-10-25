"use client";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { DEFAULT_CONTENT } from "@/lib/defaults";

const t = (key: string, label: string, full = false) => ({ key, label, type: "text" as const, full });
const ta = (key: string, label: string) => ({ key, label, type: "textarea" as const });

export default function ContentPage() {
  return (
    <SettingsForm
      settingKey="content"
      defaults={DEFAULT_CONTENT}
      title="Website content"
      description="Headlines, section text and button labels across the homepage. No code changes needed."
      sections={[
        { title: "Hero", description: "The first screen visitors see.", fields: [t("hero_line_1", "Headline line 1 (sans)"), t("hero_line_2", "Headline line 2 (serif)"), ta("hero_subtext", "Supporting line")] },
        { title: "Buttons", description: "Call-to-action labels used throughout the site.", fields: [t("cta_primary", "Primary — e.g. Check availability"), t("cta_secondary", "Secondary — e.g. Book your stay"), t("cta_call", "Call button"), t("video_cta", "Film section button")] },
        {
          title: "Sections",
          fields: [
            t("location_title", "Location title", true), ta("location_text", "Location text"),
            t("sea_title", "Sea view title", true), ta("sea_text", "Sea view text"),
            t("stay_title", "Accommodation title", true), ta("stay_text", "Accommodation text"),
            t("capsule_title", "3D capsule title", true), ta("capsule_text", "3D capsule text"),
            t("amenities_title", "Amenities title"), t("why_title", "Why SNOOZ title"),
            t("gallery_title", "Gallery title"), t("faq_title", "FAQ title"),
            t("video_title_1", "Film title line 1"), t("video_title_2", "Film title line 2"),
            t("trust_title", "Trust / enquiry title", true),
            t("final_title", "Final CTA title"), t("final_subtitle", "Final CTA subtitle"),
            t("enquiry_success", "Message after an enquiry is sent", true),
            { key: "show_testimonials", label: "Show testimonials section (when any exist)", type: "toggle" },
            { key: "show_availability", label: "Show availability next to the enquiry form", type: "toggle" },
          ],
        },
      ]}
    />
  );
}
