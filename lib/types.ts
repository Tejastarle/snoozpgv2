export type LeadStatus = "new" | "contacted" | "interested" | "booked" | "closed";
export const LEAD_STATUSES: LeadStatus[] = ["new", "contacted", "interested", "booked", "closed"];

export interface Lead {
  id: string;
  created_at: string;
  updated_at?: string | null;
  full_name: string;
  phone: string;
  email: string | null;
  check_in: string | null;
  check_out: string | null;
  guests: number | null;
  preference: string | null;
  message: string | null;
  status: LeadStatus;
  source: string | null;
  page: string | null;
  utm: Record<string, string> | null;
}

export interface AdminNote {
  id: string;
  lead_id: string;
  note: string;
  created_at: string;
}

export interface Room {
  id: string;
  title: string;
  slug: string;
  description: string;
  price_label: string | null;
  features: string[];
  image_url: string;
  sort_order: number;
  is_active: boolean;
}

export interface Amenity {
  id: string;
  title: string;
  description: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
}

export const GALLERY_CATEGORIES = ["Rooms", "Capsules", "Sea View", "Property", "Location", "Night View"] as const;
export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image_url: string;
  alt: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface VideoItem {
  id: string;
  title: string;
  placement: "hero" | "experience" | "tour" | "other";
  src_mp4: string;
  src_webm: string | null;
  poster: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  page: string;
  sort_order: number;
  is_active: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  quote: string;
  sort_order: number;
  is_active: boolean;
}

export interface LocationPoint {
  id: string;
  label: string;
  minutes: number;
  description: string | null;
  icon: string;
  /** Position on the stylised map, -1..1 (x = west→east, y = south→north) */
  map_x: number;
  map_y: number;
  sort_order: number;
  is_active: boolean;
}

export interface Availability {
  id: string;
  label: string;
  available: number;
  total: number | null;
  note: string | null;
  is_public: boolean;
  sort_order: number;
}

export interface SeoPage {
  id: string;
  path: string;
  title: string;
  description: string;
  keywords: string | null;
  og_image: string | null;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  tags: string[];
  status: "draft" | "published";
  author: string | null;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at?: string | null;
}

/* ─── Settings (key/value JSON rows) ─────────────────────── */

export interface SiteSettings {
  business_name: string;
  brand: string;
  tagline: string;
  phone_office_1: string;
  phone_office_2: string;
  phone_mobile: string;
  phone_landline: string;
  contact_person: string;
  contact_person_phone: string;
  whatsapp: string;
  whatsapp_message: string;
  email: string;
  address_line_1: string;
  address_line_2: string;
  landmarks: string;
  locality: string;
  city: string;
  region: string;
  postal_code: string;
  country: string;
  latitude: number;
  longitude: number;
  maps_url: string;
  hours_label: string;
  instagram: string;
  facebook: string;
  youtube: string;
  google_business: string;
  google_review: string;
  /** One YouTube URL (Shorts or normal) per line */
  youtube_shorts: string;
  /** One Facebook reel/video URL per line */
  facebook_reels: string;
  upi_vpa: string;
  upi_qr: string;
  google_review_qr: string;
  instagram_qr: string;
  instagram_handle: string;
}

export interface ContentSettings {
  hero_line_1: string;
  hero_line_2: string;
  hero_subtext: string;
  cta_primary: string;
  cta_secondary: string;
  cta_call: string;
  location_title: string;
  location_text: string;
  sea_title: string;
  sea_text: string;
  stay_title: string;
  stay_text: string;
  capsule_title: string;
  capsule_text: string;
  amenities_title: string;
  why_title: string;
  gallery_title: string;
  video_title_1: string;
  video_title_2: string;
  video_cta: string;
  trust_title: string;
  faq_title: string;
  final_title: string;
  final_subtitle: string;
  enquiry_success: string;
  show_testimonials: boolean;
  show_availability: boolean;
}

export interface SeoSettings {
  title: string;
  title_template: string;
  description: string;
  keywords: string;
  og_image: string;
}

export interface SiteContent {
  site: SiteSettings;
  content: ContentSettings;
  seo: SeoSettings;
  rooms: Room[];
  amenities: Amenity[];
  gallery: GalleryItem[];
  videos: VideoItem[];
  faqs: Faq[];
  testimonials: Testimonial[];
  locations: LocationPoint[];
  availability: Availability[];
  seoPages: SeoPage[];
}
