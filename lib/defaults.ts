import type {
  Amenity,
  Availability,
  ContentSettings,
  Faq,
  GalleryItem,
  LocationPoint,
  Room,
  SeoPage,
  SeoSettings,
  SiteContent,
  SiteSettings,
  Testimonial,
  VideoItem,
} from "./types";

/**
 * Default content. Used when Supabase is not configured yet, and to fill any
 * setting that is missing in the database. Everything here can be changed from
 * the admin panel once Supabase is connected (see supabase/schema.sql seed).
 */

export const DEFAULT_SITE: SiteSettings = {
  business_name: "The New Snoozy Capsules Premise",
  brand: "SNOOZ",
  tagline: "The New Snoozy Capsules Premise",
  phone_mobile: "7039071356",
  phone_office_1: "7039613561",
  phone_office_2: "",
  phone_landline: "022-4665 0191",
  contact_person: "Gian Chand Sippy",
  contact_person_phone: "8850119077",
  whatsapp: "917039071356",
  whatsapp_message: "Hi SNOOZ, I'd like to check availability for a stay.",
  email: "snoozycapsulspremise@gmail.com",
  address_line_1: "402, 4th Floor, Bay View Tower, Plot No. 7",
  address_line_2: "Sector 11, opposite CBD Belapur Railway Station",
  landmarks: "Near UTI Building & Vindhya Complex, opposite Turning Point Hotel",
  locality: "CBD Belapur",
  city: "Navi Mumbai",
  region: "Maharashtra",
  postal_code: "400614",
  country: "IN",
  latitude: 19.0176437,
  longitude: 73.0447435,
  maps_url: "https://maps.google.com/maps?q=19.0176437%2C73.0447435&z=17&hl=en",
  hours_label: "Open 24 hours, 7 days a week",
  instagram: "https://www.instagram.com/snoozy_beds/",
  instagram_handle: "@snoozy_beds",
  facebook: "https://www.facebook.com/share/1KAuArXMXj/",
  youtube: "https://youtube.com/@snoozsnoozycapsulespremise-c5r",
  google_business: "https://maps.google.com/maps?q=19.0176437%2C73.0447435&z=17&hl=en",
  google_review: "https://g.page/r/CXDbgJoajK-OEBE/review",
  youtube_shorts: "https://youtube.com/shorts/RlLh6vFp4ek\nhttps://youtube.com/shorts/9FQGfQXgVg0",
  facebook_reels:
    "https://www.facebook.com/share/r/1WuueKrMWo/\nhttps://www.facebook.com/share/r/1UUE3NYMeg/\nhttps://www.facebook.com/share/r/1C9vpELLYB/\nhttps://www.facebook.com/share/r/19NLT3iG4p/",
  upi_vpa: "Getepay.mcooblqr344381",
  upi_qr: "/media/img/qr-upi.jpg",
  google_review_qr: "/media/img/qr-google-review.jpg",
  instagram_qr: "/media/img/qr-instagram.jpg",
};

export const DEFAULT_CONTENT: ContentSettings = {
  hero_line_1: "Sleep above the city.",
  hero_line_2: "Wake up to the bay.",
  hero_subtext: "Premium sea-view capsule accommodation in CBD Belapur, Navi Mumbai.",
  cta_primary: "Check availability",
  cta_secondary: "Book your stay",
  cta_call: "Call now",
  location_title: "Connected to everything that matters.",
  location_text:
    "Bay View Tower is in Sector 11, right opposite CBD Belapur railway station, near the UTI Building and Vindhya Complex. The highway and the new airport are a short ride away.",
  sea_title: "Wake up to the bay.",
  sea_text:
    "SNOOZ is on the fourth floor of Bay View Tower, facing the water. Mornings start with light off the bay; evenings end with the city lit up below.",
  stay_title: "Your space. Your comfort. Your SNOOZ.",
  stay_text:
    "Air-conditioned 3 × 6 ft berths with a privacy curtain, fresh linen, your own light and socket, and a locker for your things. Stay a night, a week, or make it your PG.",
  capsule_title: "Step inside the capsule.",
  capsule_text: "Every berth is built around four things: comfort, privacy, cool air and a space that is yours.",
  amenities_title: "Everything a good night needs.",
  why_title: "Why SNOOZ?",
  gallery_title: "See the space.",
  video_title_1: "More than a stay.",
  video_title_2: "It's a better way to stay.",
  video_cta: "Plan your stay",
  trust_title: "Everything you need for a comfortable stay.",
  faq_title: "Questions, answered.",
  final_title: "Your next stay starts here.",
  final_subtitle: "Stay connected. Stay comfortable. Stay at SNOOZ.",
  enquiry_success: "Thank you. Our team will contact you shortly.",
  show_testimonials: true,
  show_availability: false,
};

export const DEFAULT_SEO: SeoSettings = {
  title: "SNOOZ — Sea-View Capsule Stay & AC Dormitory in CBD Belapur, Navi Mumbai",
  title_template: "%s | SNOOZ CBD Belapur",
  description:
    "SNOOZ is a sea-view facing capsule stay and AC dormitory in Bay View Tower, Sector 11, CBD Belapur — opposite Belapur station. AC beds, Wi-Fi, lockers, hot water, 24/7. Check availability.",
  keywords:
    "PG in CBD Belapur, AC dormitory Belapur, capsule stay Navi Mumbai, sea view accommodation Belapur, PG near Belapur station, dormitory Navi Mumbai",
  og_image: "/media/og-snooz.jpg",
};

const id = (p: string, n: number) => `${p}-${n}`;

export const DEFAULT_ROOMS: Room[] = [
  {
    id: id("room", 1),
    title: "Capsule berth",
    slug: "capsule-berth",
    description:
      "A curtained 3 × 6 ft berth in the air-conditioned dorm, made up with fresh white linen, a pillow and a warm blanket. Ideal for a night or a short work trip.",
    price_label: "Nightly stays",
    features: ["3 × 6 ft bed", "Privacy curtain", "Personal light & socket", "AC remote within reach"],
    image_url: "/media/img/capsule-berth-wide.jpg",
    sort_order: 1,
    is_active: true,
  },
  {
    id: id("room", 2),
    title: "AC dormitory",
    slug: "ac-dormitory",
    description:
      "Upper and lower bunks in a clean, cool dorm with sturdy steel frames, a ladder to every upper berth and a locker to keep your things safe.",
    price_label: "Weekly stays",
    features: ["Air-conditioned", "Locker available", "Wi-Fi", "24/7 staff"],
    image_url: "/media/img/dorm-bunks-ac.jpg",
    sort_order: 2,
    is_active: true,
  },
  {
    id: id("room", 3),
    title: "PG long stay",
    slug: "pg-long-stay",
    description:
      "Working or studying in Belapur? Make SNOOZ your base for the month — right opposite the station, with hot water, filtered drinking water and 24-hour water supply.",
    price_label: "Monthly stays",
    features: ["Opposite Belapur station", "Geyser / hot water", "Filtered drinking water", "Flexible move-in"],
    image_url: "/media/img/property-bay-view-tower.jpg",
    sort_order: 3,
    is_active: true,
  },
];

export const DEFAULT_AMENITIES: Amenity[] = [
  ["AC beds, 3 × 6 ft", "A full-length 3 × 6 ft bed in a cool, air-conditioned dorm.", "snowflake"],
  ["Wi-Fi", "Free Wi-Fi for calls, streaming and work.", "wifi"],
  ["Sea view facing", "A sea-view facing building — Bay View Tower lives up to its name.", "waves"],
  ["Lockers", "A locker to keep your bags and valuables safe.", "lock"],
  ["Geyser / hot water", "Hot water for a proper bath, any time of day.", "shower"],
  ["24-hour water", "Running water round the clock.", "droplets"],
  ["Water filter", "Clean, filtered drinking water on the floor.", "glass"],
  ["Neat & clean", "Fresh white linen and a tidy dorm, every stay.", "spray"],
  ["24/7 service", "Check in late, leave early. Someone is always on hand.", "clock"],
  ["Opposite the station", "Right opposite CBD Belapur railway station, Sector 11.", "train"],
  ["Easy connectivity", "Highway and airport within minutes.", "route"],
  ["Secure environment", "A staffed building with round-the-clock attention.", "shield"],
].map(([title, description, icon], i) => ({ id: id("am", i + 1), title, description, icon, sort_order: i + 1, is_active: true }));

const g = (n: number, title: string, category: string, image_url: string, alt: string): GalleryItem => ({
  id: id("g", n), title, category, image_url, alt, sort_order: n, is_active: true,
});
export const DEFAULT_GALLERY: GalleryItem[] = [
  g(1, "AC dormitory", "Rooms", "/media/img/dorm-bunks-ac.jpg", "White steel bunk beds with curtains under an inverter AC in the SNOOZ dormitory"),
  g(2, "Capsule berth", "Capsules", "/media/img/capsule-berth-wide.jpg", "Lower berth with white linen, blanket, AC remote and a switchboard with sockets"),
  g(3, "Bay View Tower", "Property", "/media/img/property-bay-view-tower.jpg", "Bay View Tower, Sector 11, CBD Belapur"),
  g(4, "Night view from SNOOZ", "Night View", "/media/img/night-view-window.jpg", "Night view over the trees and city lights from the SNOOZ window"),
  g(5, "Made-up berth", "Capsules", "/media/img/capsule-bed.jpg", "Made-up berth with a mustard blanket, pillow and tie-back curtain"),
  g(6, "Dorm aisle", "Rooms", "/media/img/dorm-aisle.jpg", "Aisle between rows of bunks in the AC dormitory"),
  g(7, "Reception", "Property", "/media/img/reception-desk.jpg", "SNOOZ reception desk with staff"),
  g(8, "Bunks with curtains", "Rooms", "/media/img/dorm-bunk.jpg", "Bunk beds with privacy curtains, fresh linen and blankets"),
  g(9, "Lower berth light", "Capsules", "/media/img/lower-berth-light.jpg", "Lower berth with a reading light and socket panel"),
  g(10, "Wash area", "Property", "/media/img/wash-area.jpg", "Clean wash basin area at SNOOZ"),
  g(11, "Right outside", "Location", "/media/img/outside-sector-11.jpg", "Street outside Bay View Tower, Sector 11, CBD Belapur"),
  g(12, "Welcome to SNOOZ", "Property", "/media/img/reception-snooz.jpg", "SNOOZ banner at the entrance"),
  g(13, "Upper berth ladder", "Rooms", "/media/img/room-walk-2.jpg", "Steel ladder up to an upper berth"),
  g(14, "Wake up to the bay", "Sea View", "/media/img/capsule-sea-window.jpg", "Guest looking out at the sea from a capsule window"),
];

export const DEFAULT_VIDEOS: VideoItem[] = [
  { id: id("v", 1), title: "Inside SNOOZ (hero background)", placement: "hero", src_mp4: "/media/video/hero-room.mp4", src_webm: "/media/video/hero-room.webm", poster: "/media/img/hero-poster.jpg", sort_order: 1, is_active: true },
  { id: id("v", 2), title: "SNOOZ brand film", placement: "experience", src_mp4: "/media/video/brand-film-1080.mp4", src_webm: null, poster: "/media/img/capsule-sea-window.jpg", sort_order: 2, is_active: true },
  { id: id("v", 3), title: "Walk in from the street", placement: "tour", src_mp4: "/media/video/tour-arrival.mp4", src_webm: null, poster: "/media/img/poster-tour-arrival.jpg", sort_order: 3, is_active: true },
  { id: id("v", 4), title: "Inside the AC dorm", placement: "tour", src_mp4: "/media/video/tour-dorm.mp4", src_webm: null, poster: "/media/img/poster-tour-dorm.jpg", sort_order: 4, is_active: true },
  { id: id("v", 5), title: "Rows of berths", placement: "tour", src_mp4: "/media/video/tour-bunks.mp4", src_webm: null, poster: "/media/img/poster-tour-bunks.jpg", sort_order: 5, is_active: true },
  { id: id("v", 6), title: "Night view", placement: "tour", src_mp4: "/media/video/tour-night.mp4", src_webm: null, poster: "/media/img/poster-tour-night.jpg", sort_order: 6, is_active: true },
  { id: id("v", 7), title: "Opening day", placement: "tour", src_mp4: "/media/video/tour-opening.mp4", src_webm: null, poster: "/media/img/poster-tour-opening.jpg", sort_order: 7, is_active: true },
];

export const DEFAULT_FAQS: Faq[] = [
  ["What is SNOOZ?", "SNOOZ — The New Snoozy Capsules Premise — is a capsule-style AC dormitory in CBD Belapur, Navi Mumbai. You get your own curtained 3 × 6 ft berth with fresh linen, a light and a socket, plus a locker, Wi-Fi, hot water and 24/7 service, in a sea-view facing building."],
  ["Where is SNOOZ located?", "402, 4th Floor, Bay View Tower, Plot No. 7, Sector 11, CBD Belapur, Navi Mumbai 400614 — opposite CBD Belapur railway station, near the UTI Building and Vindhya Complex, opposite Turning Point Hotel."],
  ["Is SNOOZ sea-facing?", "Yes. SNOOZ is in a sea-view facing building on the fourth floor of Bay View Tower."],
  ["What size are the beds?", "Every berth has a 3 × 6 ft bed, made up with fresh white linen, a pillow and a blanket."],
  ["Is the dormitory air conditioned?", "Yes. The whole dormitory is air-conditioned, and there's an AC remote within reach of the berths."],
  ["Is WiFi available?", "Yes, Wi-Fi is available for all guests."],
  ["Is there a locker for my bags?", "Yes, lockers are available so you can keep your bags and valuables safe."],
  ["Is there hot water and drinking water?", "Yes. There's a geyser for hot water, water supply 24 hours a day, and a water filter for clean drinking water."],
  ["Is SNOOZ available 24/7?", "Yes. SNOOZ runs 24 hours a day, 7 days a week, so you can check in after a late train or flight."],
  ["How far is SNOOZ from Belapur Railway Station?", "SNOOZ is right opposite CBD Belapur railway station — about 2 minutes away."],
  ["How far is SNOOZ from the highway?", "About 3 minutes by road to the highway. Travel times are approximate and depend on traffic."],
  ["How far is SNOOZ from the airport?", "About 10 minutes by road to the Navi Mumbai airport. Travel times are approximate and depend on traffic."],
  ["How can I check availability?", "Use the Check availability form on this site with your dates, or call or WhatsApp us on 7039071356. We'll confirm a berth for your dates."],
  ["How can I contact SNOOZ?", "WhatsApp or call 7039071356, call 7039613561, or speak to Gian Chand Sippy on 8850119077. Landline: 022-4665 0191. Email: snoozycapsulspremise@gmail.com."],
].map(([question, answer], i) => ({ id: id("faq", i + 1), question, answer, page: "home", sort_order: i + 1, is_active: true }));

/** Testimonials ship empty on purpose — add real guest feedback from the admin panel. */
export const DEFAULT_TESTIMONIALS: Testimonial[] = [];

export const DEFAULT_LOCATIONS: LocationPoint[] = [
  { id: id("loc", 1), label: "Railway Station", minutes: 2, description: "Opposite CBD Belapur station", icon: "train", map_x: 0.42, map_y: 0.32, sort_order: 1, is_active: true },
  { id: id("loc", 2), label: "Highway", minutes: 3, description: "Quick highway access", icon: "route", map_x: -0.18, map_y: 0.78, sort_order: 2, is_active: true },
  { id: id("loc", 3), label: "Airport", minutes: 10, description: "Navi Mumbai International Airport", icon: "plane", map_x: 0.78, map_y: -0.72, sort_order: 3, is_active: true },
];

export const DEFAULT_AVAILABILITY: Availability[] = [
  { id: id("av", 1), label: "Capsule berths", available: 0, total: null, note: "Call to confirm for tonight", is_public: false, sort_order: 1 },
];

export const DEFAULT_SEO_PAGES: SeoPage[] = [];

export const DEFAULT_SITE_CONTENT: SiteContent = {
  site: DEFAULT_SITE,
  content: DEFAULT_CONTENT,
  seo: DEFAULT_SEO,
  rooms: DEFAULT_ROOMS,
  amenities: DEFAULT_AMENITIES,
  gallery: DEFAULT_GALLERY,
  videos: DEFAULT_VIDEOS,
  faqs: DEFAULT_FAQS,
  testimonials: DEFAULT_TESTIMONIALS,
  locations: DEFAULT_LOCATIONS,
  availability: DEFAULT_AVAILABILITY,
  seoPages: DEFAULT_SEO_PAGES,
};

export const ACCOMMODATION_PREFERENCES = [
  "Capsule berth (nightly)",
  "AC dormitory (weekly)",
  "PG long stay (monthly)",
  "Lower berth",
  "Upper berth",
  "Not sure yet",
];
