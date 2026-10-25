/** Unique local-SEO landing pages. Titles/descriptions can be overridden per path in Admin → SEO. */

export interface LandingPage {
  slug: string;
  navLabel: string;
  title: string;
  description: string;
  keywords: string;
  h1: [string, string];
  intro: string;
  image: string;
  highlights: { title: string; text: string }[];
  sections: { heading: string; body: string[] }[];
  faqs: { q: string; a: string }[];
  related: string[];
}

export const LANDING_PAGES: LandingPage[] = [
  {
    slug: "pg-in-cbd-belapur",
    navLabel: "PG in CBD Belapur",
    title: "PG in CBD Belapur — AC Capsule PG Near the Station",
    description:
      "Looking for a PG in CBD Belapur? SNOOZ offers AC capsule berths with Wi-Fi and 24/7 service in Bay View Tower, Sector 11 — opposite CBD Belapur station.",
    keywords: "PG in CBD Belapur, PG in Belapur, best PG in Belapur, AC PG in Belapur, PG for working professionals Belapur",
    h1: ["PG in CBD Belapur,", "the capsule way."],
    intro:
      "SNOOZ is a capsule-style PG in Sector 11, CBD Belapur. Instead of a crowded shared room, you get your own curtained berth in an air-conditioned dorm, with Wi-Fi, fresh linen and staff on hand around the clock.",
    image: "/media/img/dorm-bunk.jpg",
    highlights: [
      { title: "Your own berth", text: "A curtained capsule bed with a light and socket — not just a bed in a room." },
      { title: "AC all night", text: "The whole dorm is air-conditioned." },
      { title: "Walk to work", text: "In the CBD Belapur business district, about 2 minutes from the station." },
      { title: "Stay flexibly", text: "Start with a few nights, then stay weekly or monthly." },
    ],
    sections: [
      {
        heading: "A PG for people who work in Belapur",
        body: [
          "CBD Belapur is full of offices, government buildings and training centres, and most people who stay here need the same few things: a clean bed, a quiet night, reliable Wi-Fi and a short commute.",
          "SNOOZ is built around exactly that. Bay View Tower is in Sector 11, right opposite CBD Belapur railway station, so the highway and the business district are a short ride away.",
        ],
      },
      {
        heading: "What's different from a regular PG",
        body: [
          "In a typical PG you share a room and hope your roommates keep the same hours. At SNOOZ each berth has its own privacy curtain, reading light and power socket, so you can sleep, work late or wake early without disturbing anyone.",
          "Housekeeping keeps the linen fresh and the dorm tidy, and the building is staffed 24/7 — useful if your shifts or trains run late.",
        ],
      },
      {
        heading: "Who stays here",
        body: [
          "Working professionals on a new posting, interns, people in Belapur for training or exams, and anyone who wants a comfortable base in Navi Mumbai without a long lock-in.",
        ],
      },
    ],
    faqs: [
      { q: "Is SNOOZ a PG or a hostel?", a: "SNOOZ is a capsule-style AC dormitory. You can stay for a night like a hostel, or for weeks and months like a PG." },
      { q: "Can working professionals stay long-term?", a: "Yes. Many guests stay weekly or monthly. Send an enquiry with your dates and we'll share options." },
      { q: "How close is SNOOZ to CBD Belapur station?", a: "SNOOZ is right opposite CBD Belapur railway station — about 2 minutes away." },
    ],
    related: ["ac-dormitory-belapur", "pg-near-belapur-station", "sea-view-accommodation-belapur"],
  },
  {
    slug: "ac-dormitory-belapur",
    navLabel: "AC dormitory Belapur",
    title: "AC Dormitory in Belapur — Clean Capsule Beds, 24/7",
    description:
      "Air-conditioned dormitory in CBD Belapur, Navi Mumbai. Curtained capsule beds, fresh linen, Wi-Fi and 24/7 check-in at SNOOZ, Bay View Tower, Sector 11.",
    keywords: "AC dormitory Belapur, dormitory in Belapur, dormitory Navi Mumbai, AC dorm CBD Belapur, cheap stay Belapur",
    h1: ["A cool, quiet", "dormitory in Belapur."],
    intro:
      "Most dorms give you a bed. SNOOZ gives you a berth: an air-conditioned capsule-style bunk with a privacy curtain, fresh white linen, a blanket and the AC remote within reach.",
    image: "/media/img/capsule-bed.jpg",
    highlights: [
      { title: "Fully air-conditioned", text: "Inverter AC keeps the dorm cool through the night." },
      { title: "Privacy curtains", text: "Close your berth off when you want to sleep." },
      { title: "Fresh linen", text: "White sheets, a pillow and a warm blanket on every berth." },
      { title: "24/7 check-in", text: "Arrive on a late train or an early flight." },
    ],
    sections: [
      {
        heading: "Upper or lower berth — your choice",
        body: [
          "Our steel-frame bunks have a sturdy ladder to every upper berth and a reading light and switchboard at the lower berth. Tell us your preference when you enquire and we'll do our best to match it.",
        ],
      },
      {
        heading: "Clean, simple and secure",
        body: [
          "The dorm is kept tidy, linen is changed regularly, and the building is staffed around the clock. It's a straightforward, comfortable place to sleep in the middle of CBD Belapur.",
        ],
      },
      {
        heading: "Good for short and long stays",
        body: [
          "Stay a single night between meetings, a week for training, or a month while you settle into a new job. Weekly and monthly stays are available on request.",
        ],
      },
    ],
    faqs: [
      { q: "Is the dormitory air-conditioned at night?", a: "Yes. The dorm is air-conditioned, and there is an AC remote within reach of the berths." },
      { q: "Do you provide bedding?", a: "Yes. Every berth comes with fresh white linen, a pillow and a blanket." },
      { q: "Can I check in late at night?", a: "Yes. SNOOZ runs 24/7. Let us know your arrival time when you enquire." },
    ],
    related: ["capsule-stay-navi-mumbai", "pg-in-cbd-belapur", "pg-near-belapur-station"],
  },
  {
    slug: "sea-view-accommodation-belapur",
    navLabel: "Sea-view stay Belapur",
    title: "Sea-View Accommodation in Belapur, Navi Mumbai",
    description:
      "Sea-view facing accommodation in CBD Belapur. SNOOZ capsule stay is on the 4th floor of Bay View Tower, Sector 11 — AC dorm, Wi-Fi and 24/7 service.",
    keywords: "sea view accommodation Belapur, sea view PG Navi Mumbai, sea facing stay CBD Belapur, Bay View Tower Belapur",
    h1: ["Sea-view stays", "in CBD Belapur."],
    intro:
      "SNOOZ is in Bay View Tower — a sea-view facing building in Sector 11, CBD Belapur. Sleep in a cool capsule berth and start your day with the bay outside.",
    image: "/media/img/capsule-sea-window.jpg",
    highlights: [
      { title: "Sea-view facing", text: "On the 4th floor of Bay View Tower." },
      { title: "Business district", text: "Right in CBD Belapur, Sector 11." },
      { title: "Capsule comfort", text: "Curtained AC berths with fresh linen." },
      { title: "Always open", text: "24/7 service and Wi-Fi." },
    ],
    sections: [
      {
        heading: "A view you don't usually get at this price",
        body: [
          "Sea-view rooms in Navi Mumbai usually mean a hotel bill. SNOOZ offers a sea-view facing address with the simplicity and value of a capsule dormitory.",
        ],
      },
      {
        heading: "Mornings by the bay, evenings above the city",
        body: [
          "Whether you're in Belapur for work or passing through Navi Mumbai, Bay View Tower puts you close to the water and in the middle of the business district at the same time.",
        ],
      },
    ],
    faqs: [
      { q: "Is SNOOZ really sea-facing?", a: "Yes. SNOOZ is in a sea-view facing building on the 4th floor of Bay View Tower, Sector 11, CBD Belapur." },
      { q: "Where exactly is Bay View Tower?", a: "Plot No. 7, Sector 11, CBD Belapur, Navi Mumbai 400614 — opposite CBD Belapur railway station, near the UTI Building and Vindhya Complex, opposite Turning Point Hotel." },
    ],
    related: ["pg-in-cbd-belapur", "capsule-stay-navi-mumbai", "ac-dormitory-belapur"],
  },
  {
    slug: "pg-near-belapur-station",
    navLabel: "PG near Belapur station",
    title: "PG Near Belapur Railway Station — 2 Minutes Away",
    description:
      "Need a PG near CBD Belapur railway station? SNOOZ is right opposite the station in Sector 11 — AC capsule berths, Wi-Fi, 24/7 check-in. Enquire for nightly to monthly stays.",
    keywords: "PG near Belapur railway station, PG near CBD Belapur, stay near Belapur station, accommodation near Belapur",
    h1: ["Right opposite", "Belapur station."],
    intro:
      "If your days start and end at CBD Belapur station, stay right across from it. SNOOZ is in Bay View Tower, Sector 11 — opposite the station.",
    image: "/media/img/property-bay-view-tower.jpg",
    highlights: [
      { title: "Opposite the station", text: "Right across from CBD Belapur railway station." },
      { title: "≈ 3 min to the highway", text: "Quick access for road trips and cabs." },
      { title: "≈ 10 min to the airport", text: "Handy for early and late flights." },
      { title: "24/7 check-in", text: "Arrive whenever your train does." },
    ],
    sections: [
      {
        heading: "Cut your commute, not your sleep",
        body: [
          "Living next to the station means less time in autos and more time to rest. From SNOOZ you can be on the platform in minutes, whether you're heading into Mumbai or across Navi Mumbai.",
        ],
      },
      {
        heading: "Easy to find",
        body: [
          "We're at 402, 4th Floor, Bay View Tower, Plot No. 7, Sector 11 — right opposite CBD Belapur railway station, near the UTI Building and Vindhya Complex, opposite Turning Point Hotel. Share that with your driver, or tap Get directions on our contact page.",
        ],
      },
    ],
    faqs: [
      { q: "How far is SNOOZ from CBD Belapur station?", a: "SNOOZ is right opposite CBD Belapur railway station — about 2 minutes away." },
      { q: "Is there a landmark near SNOOZ?", a: "Yes — Bay View Tower is right opposite CBD Belapur railway station, near the UTI Building and Vindhya Complex, and opposite Turning Point Hotel." },
    ],
    related: ["pg-in-cbd-belapur", "ac-dormitory-belapur", "capsule-stay-navi-mumbai"],
  },
  {
    slug: "capsule-stay-navi-mumbai",
    navLabel: "Capsule stay Navi Mumbai",
    title: "Capsule Stay in Navi Mumbai — SNOOZ, CBD Belapur",
    description:
      "Capsule accommodation in Navi Mumbai: private curtained berths in an AC dorm with Wi-Fi, fresh linen and 24/7 service at SNOOZ, CBD Belapur. Check availability.",
    keywords: "capsule stay Navi Mumbai, capsule accommodation Belapur, capsule hotel Navi Mumbai, pod stay Navi Mumbai",
    h1: ["Capsule living", "comes to Navi Mumbai."],
    intro:
      "Capsule stays are popular in cities where space is precious: a private sleeping berth, shared common space, and a lower cost than a hotel room. SNOOZ brings that idea to CBD Belapur.",
    image: "/media/img/room-walk-3.jpg",
    highlights: [
      { title: "Private berth", text: "Curtain, light and socket at every bed." },
      { title: "Air-conditioned", text: "Cool, quiet nights." },
      { title: "Wi-Fi", text: "Stay connected for work and calls." },
      { title: "Central", text: "Sector 11, CBD Belapur." },
    ],
    sections: [
      {
        heading: "What a capsule stay is like",
        body: [
          "You check in, get your berth, and that's your space: a full-length mattress with fresh linen, a pillow, a blanket, a reading light and a power socket, with a curtain you can close. Bags stay close, the room stays cool, and the lights stay low at night.",
        ],
      },
      {
        heading: "Why travellers choose capsules",
        body: [
          "If you mostly need somewhere clean and comfortable to sleep, a capsule gives you privacy where it matters without paying for a full room. It's ideal for solo travellers, work trips and short stays.",
        ],
      },
    ],
    faqs: [
      { q: "What is a capsule stay?", a: "A capsule stay gives you your own enclosed or curtained sleeping berth in a shared room — more privacy than a dorm bed, more value than a hotel room." },
      { q: "Is a capsule comfortable for a week or more?", a: "Yes. Each berth has a full-length mattress, fresh linen and personal lighting, and the dorm is air-conditioned." },
    ],
    related: ["ac-dormitory-belapur", "sea-view-accommodation-belapur", "pg-in-cbd-belapur"],
  },
];

export const landingBySlug = (slug: string) => LANDING_PAGES.find((p) => p.slug === slug);
