/**
 * Kandari-Lab's services: the four kinds of work the team builds for
 * others, beside its own healthcare products (data/products.ts).
 *
 * Every line here describes a capability, not a result. There are no
 * client names, project counts or performance figures, because none have
 * been published to cite. `proof` points only at Kandari-Lab's own
 * products, where the same skills are already in use.
 *
 * Photos are from Wikimedia Commons and carry their credit; the card shows it.
 */

export type ServiceMotion = "neural" | "factory" | "signal" | "code";

export interface Service {
  id: string;
  name: string;
  nameBn: string;
  /** One line, the promise. */
  pitch: string;
  pitchBn: string;
  /** What we build, four items. */
  builds: { title: string; body: string }[];
  /** Where the same skill already works inside Kandari-Lab. */
  proof: string;
  /** Material Symbols name for small places (footer links, lists). */
  icon: string;
  /** Which motion-graphic scene plays over the photo. */
  motion: ServiceMotion;
  image: { src: string; alt: string; credit: string };
}

export const services: Service[] = [
  {
    id: "ai",
    name: "AI · LLM · Agents",
    nameBn: "এআই, এলএলএম ও এজেন্ট",
    pitch: "Bangla-first AI that reads your documents, talks to your customers and runs routine work.",
    pitchBn: "বাংলায় কথা বলা এআই — আপনার নথি পড়ে, গ্রাহকের প্রশ্নের উত্তর দেয়, রোজকার কাজ নিজে সারে।",
    builds: [
      { title: "LLM apps & RAG", body: "Chat and search over your own files, with answers that cite the page." },
      { title: "AI agents", body: "Agents that file, follow up, triage and report — with a human sign-off." },
      { title: "Voice in Bangla", body: "Speech in and out for people who would rather talk than type." },
      { title: "Vision & prediction", body: "Models that read images and sensor data to flag problems early." },
    ],
    proof: "The same stack runs SWASTI's Bangla voice assistant and its offline medical RAG.",
    icon: "neurology",
    motion: "neural",
    image: {
      src: "/services/ai.webp",
      alt: "রাতে একটি হ্যাকাথনে অনেক তরুণ ল্যাপটপে কোড করছেন",
      credit: "ছবি: Vmuru, CC BY-SA 4.0, উইকিমিডিয়া কমন্স",
    },
  },
  {
    id: "automation",
    name: "Automation",
    nameBn: "অটোমেশন — কারখানা, বাসা, অফিস",
    pitch: "Machines, homes and offices that run themselves, and tell you when they need you.",
    pitchBn: "কারখানার লাইন, বাসা আর অফিস — নিজে চলে, দরকার হলে আপনাকে জানায়।",
    builds: [
      { title: "Factory lines", body: "PLC and sensor retrofits, line monitoring and downtime alerts." },
      { title: "Predictive maintenance", body: "Vibration and heat sensing that warns before a motor fails." },
      { title: "Smart home", body: "Lights, locks, pumps and power on a schedule, with app control." },
      { title: "Office workflows", body: "Attendance, approvals, documents and reports without the paper chase." },
    ],
    proof: "Built on the low-power sensing and edge chips designed for Aponjon.",
    icon: "precision_manufacturing",
    motion: "factory",
    image: {
      src: "/services/automation.webp",
      alt: "কারখানায় একটি হলুদ রোবট বাহু সাদা সিলিন্ডার তুলে নিচ্ছে",
      credit: "ছবি: Shixart1985, CC BY 2.0, উইকিমিডিয়া কমন্স",
    },
  },
  {
    id: "iot",
    name: "IoT Solutions",
    nameBn: "আইওটি সমাধান",
    pitch: "Sensors that keep working where power and signal do not — farms, rivers, clinics, cold rooms.",
    pitchBn: "যেখানে বিদ্যুৎ আর নেটওয়ার্ক দুর্বল — খেত, নদী, ক্লিনিক, কোল্ড রুম — সেখানেও চলে এমন সেন্সর।",
    builds: [
      { title: "Sensor networks", body: "Water, soil, air, temperature and power, measured where it matters." },
      { title: "Rural connectivity", body: "GSM, LoRa and offline buffering for weak or no internet." },
      { title: "Solar & low power", body: "Nodes that run for months on a small panel and battery." },
      { title: "Dashboards & alerts", body: "Live maps, SMS alerts and reports a manager actually reads." },
    ],
    proof: "Aponjon's 7-day battery and SWASTI's hardware pairing come from this work.",
    icon: "sensors",
    motion: "signal",
    image: {
      src: "/services/iot.webp",
      alt: "ব্রেডবোর্ডে তার আর সেন্সর জোড়া একটি সার্কিট, ছোট পর্দায় তাপমাত্রা দেখাচ্ছে",
      credit: "ছবি: Mitch Altman, CC BY-SA 2.0, উইকিমিডিয়া কমন্স",
    },
  },
  {
    id: "development",
    name: "Development",
    nameBn: "ডেভেলপমেন্ট — ওয়েবসাইট, অ্যাপ, ইউআই",
    pitch: "Websites, apps and interfaces that load fast on a cheap phone and read well in Bangla.",
    pitchBn: "ওয়েবসাইট, অ্যাপ আর ইউআই — সস্তা ফোনেও দ্রুত খোলে, বাংলায় পড়তে আরাম।",
    builds: [
      { title: "Websites", body: "Company sites, portals and stores, built for speed and search." },
      { title: "Mobile apps", body: "Android and iOS apps from one codebase, working offline where needed." },
      { title: "UI/UX design", body: "Design systems and screens tested with the people who will use them." },
      { title: "Dashboards & admin", body: "Back offices for orders, stock, staff and data." },
    ],
    proof: "This website, শিক্ষিতদের মিডিয়া and গবেষণাকোষ were built by the same team.",
    icon: "code_blocks",
    motion: "code",
    image: {
      src: "/services/development.webp",
      alt: "একটি ব্যবসায়িক ড্যাশবোর্ডের পর্দা — চার্ট, গ্রাফ আর মানচিত্র",
      credit: "ছবি: Growthlakes, CC BY-SA 4.0, উইকিমিডিয়া কমন্স",
    },
  },
];
