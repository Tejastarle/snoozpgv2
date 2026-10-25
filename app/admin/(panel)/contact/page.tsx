"use client";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { DEFAULT_SITE } from "@/lib/defaults";

const t = (key: string, label: string, hint?: string, full = false) => ({ key, label, type: "text" as const, hint, full });

export default function ContactSettingsPage() {
  return (
    <SettingsForm
      settingKey="site"
      defaults={DEFAULT_SITE}
      title="Contact information"
      description="Phone numbers, WhatsApp, email, address and map location. Used in the header, footer, CTAs and Google structured data."
      sections={[
        { title: "Business", fields: [t("brand", "Brand"), t("business_name", "Business name"), t("tagline", "Tagline", undefined, true), t("contact_person", "Contact person / host"), t("contact_person_phone", "Host's mobile"), t("hours_label", "Hours label")] },
        {
          title: "Phone & messaging",
          fields: [
            t("phone_mobile", "Primary mobile (Call / WhatsApp)", "Used for every Call button"),
            t("phone_office_1", "Second mobile"),
            t("phone_office_2", "Third mobile (optional)"),
            t("phone_landline", "Landline"),
            t("whatsapp", "WhatsApp number", "With country code, digits only — e.g. 917039071356"),
            t("email", "Email"),
            { key: "whatsapp_message", label: "WhatsApp pre-filled message", type: "textarea" },
          ],
        },
        {
          title: "Address & map",
          fields: [
            t("address_line_1", "Address line 1", undefined, true),
            t("address_line_2", "Address line 2", undefined, true),
            t("landmarks", "Landmarks", "e.g. Near UTI Building, opposite Turning Point Hotel", true),
            t("locality", "Locality"),
            t("city", "City"),
            t("region", "State"),
            t("postal_code", "PIN code"),
            { key: "latitude", label: "Latitude", type: "number" },
            { key: "longitude", label: "Longitude", type: "number" },
            { key: "maps_url", label: "Google Maps link", type: "url", full: true },
          ],
        },
        {
          title: "Social profiles",
          description: "Leave blank to hide. Shown in the footer and linked in structured data.",
          fields: [
            { key: "instagram", label: "Instagram URL", type: "url" },
            { key: "facebook", label: "Facebook URL", type: "url" },
            { key: "youtube", label: "YouTube URL", type: "url" },
            { key: "google_business", label: "Google Business Profile URL", type: "url" },
            { key: "instagram_handle", label: "Instagram handle", type: "text", placeholder: "@snoozy_beds" },
            { key: "google_review", label: "Google review link", type: "url" },
            { key: "youtube_shorts", label: "YouTube videos / Shorts (one link per line)", type: "textarea" },
            { key: "facebook_reels", label: "Facebook reels (one link per line)", type: "textarea" },
          ],
        },
        {
          title: "QR codes & payment",
          description: "Shown in the “Watch, follow, review” section on the home and contact pages.",
          fields: [
            { key: "google_review_qr", label: "Google review QR image", type: "image", folder: "qr" },
            { key: "instagram_qr", label: "Instagram QR image", type: "image", folder: "qr" },
            { key: "upi_qr", label: "UPI payment QR image", type: "image", folder: "qr" },
            { key: "upi_vpa", label: "UPI ID (VPA)", type: "text" },
          ],
        },
      ]}
    />
  );
}
