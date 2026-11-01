/**
 * BD Guide (/bangladesh/government): an independent guide to the Bangladesh
 * government, laid out after usa.gov. It is NOT an official government site
 * and says so in its banner and footer; the official portal is
 * bangladesh.gov.bd.
 *
 * Everything under "The national portal" was gathered from
 * bangladesh.gov.bd (বাংলাদেশ জাতীয় তথ্য বাতায়ন) on 1 November 2026:
 * the counts, the service categories, the hotlines and every link. The
 * constitutional facts (branches, symbols, holidays) are the Constitution's
 * own. Offices are named, people are not: office-holders change, the
 * offices' own sites stay current.
 */

export interface GovLink {
  label: string;
  href: string;
}

export interface GovCard {
  title: string;
  text: string;
  href: string;
  /** The card's animated icon: a file in public/lordicon/gov, without .json. */
  icon?: string;
  /** The Material Symbol shown until the animation arrives. */
  symbol?: string;
}

export interface Photo {
  src: string;
  alt: string;
  focus?: string;
  credit: { author: string; license: string; licenseUrl?: string; sourceUrl: string };
}

/** The official portal, and its service lists filtered by category or by office. */
export const PORTAL = "https://bangladesh.gov.bd";
const services = (filter: "service_category" | "service_sector", id: string) =>
  `${PORTAL}/pages/np-services?page=1&filters=${encodeURIComponent(JSON.stringify({ [filter]: id }))}`;
const category = (id: string) => services("service_category", id);
const sector = (id: string) => services("service_sector", id);

/** The guide's home is its All topics and services page; the About page sits under it. */
const HOME = "/bangladesh/government";
const ABOUT_PAGE = "/bangladesh/government/about";
const NP = "/bangladesh/government/national-portal";

/* ── The frame: banner, alert, header, footer ───────────────────────── */

export const SITE = {
  name: "BD Guide",
  /** The banner's line, in place of usa.gov's "An official website of…": this one is not. */
  banner: "An independent guide to the Bangladesh government, by Kandari-Lab",
  bannerToggle: "Here's how you know",
  howYouKnow: [
    {
      title: "This is not a government website",
      text: "BD Guide is made by Kandari-Lab to help people find the right government service. It cannot take applications, payments or complaints.",
    },
    {
      title: "Every service link is official",
      text: "Our facts and links come from the Bangladesh National Portal. Every service opens on the government's own .gov.bd site.",
    },
  ],
  alert: { before: "Need help? Call", info: "333", middle: "for government information and services, or", emergency: "999", after: "in an emergency." },
  phone: { label: "Helpline 333", tel: "333" },
  /** usa.gov's Español button: here, the official portal in Bangla. */
  language: { label: "বাংলা", href: PORTAL, lang: "bn" },
  search: { label: "Search bangladesh.gov.bd", site: "bangladesh.gov.bd" },
};

/** The header's categories, as usa.gov's seven. */
export const NAV: GovLink[] = [
  { label: "All topics and services", href: HOME },
  { label: "Bangladesh and its government", href: ABOUT_PAGE },
  { label: "Bangladesh National Portal", href: NP },
  { label: "Citizen services", href: `${NP}#services` },
  { label: "Hotlines", href: `${NP}#hotlines` },
  { label: "Business and trade", href: `${NP}#business` },
  { label: "Visit Bangladesh", href: "/bangladesh" },
];

export const FOOTER = {
  columns: [
    {
      title: "Government information",
      links: [
        { label: "All topics and services", href: HOME },
        { label: "Directory of ministries and divisions", href: `${PORTAL}/views/ministry-and-directorate-list` },
        { label: "Branches of government", href: `${ABOUT_PAGE}#branches` },
      ],
    },
    {
      title: "About this guide",
      links: [
        { label: "About Kandari-Lab", href: "/about" },
        { label: "MOTHERLAND", href: "/bangladesh" },
        { label: "নাগরিক অধিকার ও দায়িত্ব", href: "/nagorik" },
      ],
    },
    {
      title: "Official sources",
      links: [
        { label: "Bangladesh National Portal", href: PORTAL },
        { label: "Laws of Bangladesh", href: "http://bdlaws.minlaw.gov.bd/" },
        { label: "Bangladesh Bureau of Statistics", href: "https://bbs.gov.bd/" },
      ],
    },
  ] satisfies { title: string; links: GovLink[] }[],
  blurb: "An independent guide to the government of Bangladesh. Every link leads to the official source.",
  /** The corner note's numbers (components/bd-gov/help-note.tsx). */
  help: {
    title: "Need help?",
    text: "Two numbers worth knowing, free from any phone in Bangladesh.",
    lines: [
      { tel: "333", label: "Government information and services" },
      { tel: "999", label: "Police, fire and ambulance" },
    ],
  },
  identity: "BD Guide is an independent guide to the Bangladesh government and its services",
  maker: { label: "Kandari-Lab", href: "/" },
  disclaimer: "BD Guide is not a government website. For official information and services, visit the Bangladesh National Portal at",
  legal: [
    { label: "Bangladesh National Portal", href: PORTAL },
    { label: "Portal site map", href: `${PORTAL}/pages/site-map` },
    { label: "Join Kandari Profile", href: "/signup" },
  ] satisfies GovLink[],
};

/* ── Bangladesh and its government (usa.gov/about-the-us) ───────────── */

export const ABOUT = {
  title: "Bangladesh and its government",
  hero: {
    src: "/bangladesh/parliament-night.jpg",
    alt: "The National Parliament House, Jatiya Sangsad Bhaban, lit gold and green at night",
    focus: "50% 55%",
    credit: { author: "Mohosin.a94", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Jatiyo_Sangsad_Bhaban_or_National_Parliament_House.jpg" },
  } satisfies Photo,
  popular: [
    { label: "Find a ministry or division", href: `${PORTAL}/views/ministry-and-directorate-list` },
    { label: "Reach a government office", href: `${NP}#hotlines` },
    { label: "Explore the three branches of government", href: "#branches" },
  ] satisfies GovLink[],
  intro:
    "Discover Bangladesh's laws, history and statistics, find government tenders and job circulars, and learn how the state is organised, from its ministries and offices to the public services they provide.",
  cards: [
    {
      title: "Government tenders and procurement",
      icon: "shopping-basket",
      symbol: "shopping_bag",
      text: "Browse tenders, procurement notices and job circulars published by ministries and offices.",
      href: `${PORTAL}/pages/job-tender-announcements`,
    },
    {
      title: "Facts and figures",
      icon: "bar-chart-vertical-grow",
      symbol: "insights",
      text: "Independence, the Constitution, national symbols, public holidays and official statistics.",
      href: "#facts",
    },
    {
      title: "Ministries and divisions, A to Z",
      icon: "buildings-downtown",
      symbol: "account_tree",
      text: "Contact details for 57 ministries and divisions, 72 directorates and hundreds of other offices.",
      href: `${PORTAL}/views/ministry-and-directorate-list`,
    },
    {
      title: "Divisions, districts and local government",
      icon: "location-pin",
      symbol: "map",
      text: "Portals for all 8 divisions and 64 districts, and the offices that serve every upazila and union.",
      href: `${PORTAL}/views/district-list`,
    },
    {
      title: "Branches of government",
      icon: "bank",
      symbol: "account_balance",
      text: "How the legislative, executive and judicial branches share power under the Constitution.",
      href: "#branches",
    },
    {
      title: "The President and Prime Minister",
      icon: "city-hall",
      symbol: "domain",
      text: "Reach Bangabhaban, the Prime Minister's Office, the Cabinet Division and the National Parliament.",
      href: "#offices",
    },
    {
      title: "Laws of Bangladesh",
      icon: "book-bookmark",
      symbol: "menu_book",
      text: "The Bangladesh Code: every act in force, in Bangla and English.",
      href: "http://bdlaws.minlaw.gov.bd/",
    },
    {
      title: "Elections and national ID",
      icon: "hand-voting",
      symbol: "how_to_vote",
      text: "Register to vote, get or correct your national ID card, and find Election Commission services.",
      href: sector("69a5597fc4774958d7c92ffa"),
    },
    {
      title: "Courts and legal aid",
      icon: "scale-retro",
      symbol: "gavel",
      text: "The Supreme Court, the courts beneath it, and free legal aid from the government.",
      href: "#branches",
    },
  ] satisfies GovCard[],
  looking: { before: "Looking for something else?", label: "Browse all topics and services", href: HOME },
};

/** The three branches, as the Constitution of 1972 sets them out. */
export const BRANCHES = {
  title: "Branches of the Bangladesh government",
  lede: "The Constitution of the People's Republic of Bangladesh, adopted on 4 November 1972, makes Bangladesh a unitary parliamentary republic and divides its government into three branches.",
  branches: [
    {
      name: "Legislative",
      body: "Jatiya Sangsad (the National Parliament)",
      points: [
        "One house of 350 members: 300 elected from single-member constituencies and 50 seats reserved for women",
        "Members serve five-year terms",
        "Makes laws, passes the budget and holds the government to account",
      ],
      link: { label: "National Parliament", href: `${PORTAL}/pages/static-pages/69a55ba386514399668e4e94` },
    },
    {
      name: "Executive",
      body: "The President, the Prime Minister and the Cabinet",
      points: [
        "The President is head of state, elected by the members of Parliament",
        "The Prime Minister is head of government and leads the Cabinet",
        "Ministries and divisions carry out the law and run public services",
      ],
      link: { label: "Cabinet Division", href: "https://cabinet.gov.bd/" },
    },
    {
      name: "Judicial",
      body: "The Supreme Court of Bangladesh",
      points: [
        "The Supreme Court has two divisions: the Appellate Division and the High Court Division",
        "The Chief Justice heads the judiciary",
        "District and subordinate courts hear cases across the country",
      ],
      link: { label: "Supreme Court helpline: 103", href: "tel:103" },
    },
  ],
};

export const FACTS = {
  title: "Bangladesh facts and figures",
  rows: [
    ["Official name", "The People's Republic of Bangladesh (গণপ্রজাতন্ত্রী বাংলাদেশ)"],
    ["Capital", "Dhaka"],
    ["Independence declared", "26 March 1971"],
    ["Victory Day", "16 December 1971"],
    ["Constitution", "Adopted 4 November 1972, in force from 16 December 1972"],
    ["State language", "Bangla"],
    ["Currency", "Taka (৳, BDT)"],
    ["Administrative units", "8 divisions and 64 districts, divided into upazilas and unions"],
    ["National anthem", "Amar Shonar Bangla (আমার সোনার বাংলা)"],
    ["National symbols", "Royal Bengal tiger, water lily (shapla), magpie robin (doyel), hilsa, jackfruit"],
    ["Time zone", "Bangladesh Standard Time, UTC+6"],
    ["Calling code and web domain", "+880 and .bd"],
  ] as [string, string][],
  holidays: {
    title: "National days",
    items: [
      ["21 February", "Shaheed Day and International Mother Language Day"],
      ["26 March", "Independence Day"],
      ["14 April", "Pohela Boishakh, Bangla New Year"],
      ["16 December", "Victory Day"],
    ] as [string, string][],
  },
  source: { label: "Bangladesh Bureau of Statistics", href: "https://bbs.gov.bd/" },
};

export const OFFICES = {
  title: "Offices of the President and Prime Minister",
  lede: "The offices at the head of government, as listed on the national portal. Each official site names its current office-holders.",
  links: [
    { label: "The President's Office (Bangabhaban)", href: "https://bangabhaban.gov.bd" },
    { label: "Prime Minister's Office", href: "https://pmo.gov.bd/" },
    { label: "Cabinet Division", href: "https://cabinet.gov.bd/" },
    { label: "National Parliament", href: `${PORTAL}/pages/static-pages/69a55ba386514399668e4e94` },
  ] satisfies GovLink[],
};

/** usa.gov's home page, for the guide's All topics and services page: the welcome, "How do I…", one featured topic, then every topic. */
export const ALL_TOPICS = {
  hero: {
    src: "/bangladesh/flag-ahsan-manzil.jpg",
    alt: "The national flag of Bangladesh flying outside Ahsan Manzil in Dhaka",
    focus: "62% 18%",
    credit: { author: "Tanvir Rahat", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:The_national_flag_of_Bangladesh_is_flying_outside_the_Ahsan_Manzil_Museum_,_Dhaka,_Bangladesh.jpg" },
  } satisfies Photo,
  title: "Making Bangladesh's government services easier to find",
  lede: "BD Guide brings the government's services, offices and information together in one place, and takes you straight to the official source.",
  howTitle: "How do I ...",
  how: [
    { label: "Get or renew a passport", href: category("69a5597fc4774958d7c92fdc") },
    { label: "Check exam results", href: category("69a5597fc4774958d7c92fef") },
    { label: "Pay a utility bill", href: category("69a5597fc4774958d7c92fda") },
    { label: "Get a trade licence", href: `${PORTAL}/pages/static-pages/69a55ba386514399668e4e5a` },
  ] satisfies GovLink[],
  jump: "Jump to all topics and services",
  featured: {
    icon: "ambulance",
    symbol: "emergency",
    title: "Emergency and helpline numbers",
    text: "Free government numbers for police, fire, ambulance, legal aid and more.",
    cta: { label: "View all hotlines", href: `${NP}#hotlines` },
  },
};

/** usa.gov's "All topics and services", Bangladesh's own: twenty ways in, most straight to the portal. */
export const TOPICS = {
  title: "All topics and services",
  cards: [
    { title: "Voting and elections", icon: "hand-voting", symbol: "how_to_vote", text: "Election Commission services, from national ID cards to voter registration.", href: sector("69a5597fc4774958d7c92ffa") },
    { title: "Bangladesh and its government", icon: "city-hall", symbol: "account_balance", text: "Its laws, history and institutions, and how to reach every ministry and office.", href: ABOUT_PAGE },
    { title: "Disasters and emergencies", icon: "ambulance", symbol: "emergency", text: "Call 999 for police, fire and ambulance, or 102 for the fire service and disaster warnings.", href: `${NP}#hotlines` },
    { title: "Education", icon: "school", symbol: "school", text: "Admissions, scholarships and education services, from school to university.", href: category("69a5597fc4774958d7c92fe2") },
    { title: "Exam results", icon: "file-pencil", symbol: "grading", text: "Public examination results from every education board.", href: category("69a5597fc4774958d7c92fef") },
    { title: "Health", icon: "heart-beat", symbol: "health_and_safety", text: "Government hospitals, health services and trusted health information.", href: category("69a5597fc4774958d7c92fe6") },
    { title: "Agriculture", icon: "growing-plant", symbol: "agriculture", text: "Farming advice, market prices and agricultural services.", href: category("69a5597fc4774958d7c92fd9") },
    { title: "Fisheries and livestock", icon: "paper-boat", symbol: "set_meal", text: "Services for fish farmers and livestock keepers.", href: category("69a55980c4774958d7c9307f") },
    { title: "Jobs and recruitment", icon: "briefcase", symbol: "work", text: "Government job circulars and recruitment exams.", href: category("69a5597fc4774958d7c92fdb") },
    { title: "Passport, visa and immigration", icon: "globe", symbol: "flight_takeoff", text: "Apply for or renew a passport, and find visa and immigration services.", href: category("69a5597fc4774958d7c92fdc") },
    { title: "Income tax", icon: "coins", symbol: "receipt_long", text: "Register for a tax number, file your return and pay income tax.", href: category("69a5597fc4774958d7c92fe1") },
    { title: "Utility bills", icon: "outlet-type-g", symbol: "bolt", text: "Pay electricity, gas and water bills online.", href: category("69a5597fc4774958d7c92fda") },
    { title: "Land services", icon: "image-mountain", symbol: "landscape", text: "Land records, e-mutation and the smart land service.", href: sector("69a55980c4774958d7c930a1") },
    { title: "Transport and vehicles", icon: "road", symbol: "directions_car", text: "Driving licences, vehicle registration and other transport services.", href: category("69a5597fc4774958d7c92fe4") },
    { title: "Business and trade", icon: "stock-market", symbol: "storefront", text: "Start a business, get a trade licence and find support for foreign investment.", href: `${NP}#business` },
    { title: "Laws and legal issues", icon: "scale-retro", symbol: "gavel", text: "Read the laws of Bangladesh and get free legal aid from the government.", href: "http://bdlaws.minlaw.gov.bd/" },
    { title: "Online applications", icon: "file-text", symbol: "edit_document", text: "Apply online for certificates, permits and other government services.", href: category("69a5597fc4774958d7c92fdd") },
    { title: "Tickets and travel", icon: "car-ferry", symbol: "confirmation_number", text: "Book train, bus and launch tickets online.", href: category("69a5597fc4774958d7c92feb") },
    { title: "Digital centres", icon: "desktop", symbol: "computer", text: "Find a digital centre near you for help with any online service.", href: category("69a5597fc4774958d7c92fe8") },
    { title: "Bangla AI tools", icon: "magic-wand", symbol: "smart_toy", text: "The government's Bangla language and AI tools.", href: category("69df6ab3e252a315b7e6cffb") },
  ] satisfies GovCard[],
};

/* ── The national portal (bangladesh.gov.bd) ─────────────────────────── */

export const NATIONAL_PORTAL = {
  title: "Bangladesh National Portal",
  hero: {
    src: "/motherland/photos/martyrs-memorial.jpg",
    alt: "The National Martyrs' Memorial at Savar from the air, its seven peaks rising over green lawns",
    focus: "50% 45%",
    credit: { author: "Md Rumon Munshi", license: "Unsplash License", licenseUrl: "https://unsplash.com/license", sourceUrl: "https://unsplash.com/photos/the-national-martyrs-memorial-of-bangladesh-tT4mUnA_M7w" },
  } satisfies Photo,
  popular: [
    { label: "Browse every e-service", href: `${PORTAL}/views/all-eservices-in-bangladesh` },
    { label: "Find ministries and directorates", href: `${PORTAL}/views/ministry-and-directorate-list` },
    { label: "Open your district's portal", href: `${PORTAL}/views/district-list` },
  ] satisfies GovLink[],
  intro:
    "বাংলাদেশ জাতীয় তথ্য বাতায়ন (bangladesh.gov.bd) is the government's front door: every ministry, directorate, district and online service in one place. Everything below was gathered from the portal on 1 November 2026, and every link opens the service itself.",
  glance: {
    title: "The government at a glance",
    note: "Figures as published on the national portal.",
    stats: [
      { value: "57", label: "Ministries and divisions" },
      { value: "72", label: "Directorates" },
      { value: "565", label: "Other offices" },
      { value: "8", label: "Divisions" },
      { value: "64", label: "Districts" },
      { value: "500", label: "Upazilas" },
      { value: "4,568", label: "Unions" },
    ],
  },
  services: {
    title: "Citizen services",
    lede: "The portal's service categories. Each one opens its full list of services.",
    items: [
      { title: "Digital centre", icon: "desktop", symbol: "computer", bn: "ডিজিটাল সেন্টার", href: category("69a5597fc4774958d7c92fe8") },
      { title: "Finance and commerce", icon: "coins", symbol: "payments", bn: "অর্থ ও বাণিজ্য", href: category("69a5597fc4774958d7c92fe5") },
      { title: "Online application", icon: "file-text", symbol: "edit_document", bn: "অনলাইন আবেদন", href: category("69a5597fc4774958d7c92fdd") },
      { title: "Education", icon: "school", symbol: "school", bn: "শিক্ষা-বিষয়ক", href: category("69a5597fc4774958d7c92fe2") },
      { title: "Online registration", icon: "list-rules", symbol: "app_registration", bn: "অনলাইন নিবন্ধন", href: category("69a5597fc4774958d7c92fde") },
      { title: "Agriculture", icon: "growing-plant", symbol: "agriculture", bn: "কৃষি", href: category("69a5597fc4774958d7c92fd9") },
      { title: "Recruitment", icon: "briefcase", symbol: "work", bn: "নিয়োগ সংক্রান্ত", href: category("69a5597fc4774958d7c92fdb") },
      { title: "Passport, visa and immigration", icon: "globe", symbol: "flight_takeoff", bn: "পাসপোর্ট, ভিসা ও ইমিগ্রেশন", href: category("69a5597fc4774958d7c92fdc") },
      { title: "Admission applications", icon: "folder", symbol: "folder_open", bn: "ভর্তির আবেদন", href: category("69a5597fc4774958d7c92fd7") },
      { title: "Utility bills", icon: "outlet-type-g", symbol: "bolt", bn: "ইউটিলিটি বিল", href: category("69a5597fc4774958d7c92fda") },
      { title: "Exam results", icon: "file-pencil", symbol: "grading", bn: "পরীক্ষার ফলাফল", href: category("69a5597fc4774958d7c92fef") },
      { title: "Information bank", icon: "bar-chart-vertical-grow", symbol: "database", bn: "তথ্য ভাণ্ডার", href: category("69a5597fc4774958d7c92fe9") },
      { title: "Training", icon: "book-bookmark", symbol: "co_present", bn: "প্রশিক্ষণ", href: category("69a5597fc4774958d7c92fe0") },
      { title: "Income tax", icon: "lock-dollar", symbol: "receipt_long", bn: "আয়কর", href: category("69a5597fc4774958d7c92fe1") },
      { title: "Vehicle services", icon: "truck", symbol: "directions_car", bn: "যানবাহন সেবা", href: category("69a5597fc4774958d7c92fe4") },
      { title: "Postal and courier", icon: "mail-fast", symbol: "local_post_office", bn: "পোস্টাল ও কুরিয়ার", href: category("69a5597fc4774958d7c92fdf") },
      { title: "Your questions", icon: "avatars-chatting", symbol: "forum", bn: "আপনার জিজ্ঞাসা", href: category("69a5597fc4774958d7c92fe7") },
      { title: "Ticket booking", icon: "car-ferry", symbol: "confirmation_number", bn: "টিকিট বুকিং ও ক্রয়", href: category("69a5597fc4774958d7c92feb") },
      { title: "Health", icon: "heart-beat", symbol: "health_and_safety", bn: "স্বাস্থ্য বিষয়ক", href: category("69a5597fc4774958d7c92fe6") },
      { title: "Treasury challan", icon: "bank", symbol: "account_balance", bn: "ট্রেজারি চালান", href: category("69a5597fc4774958d7c92fd8") },
      { title: "Forms", icon: "file-pencil", symbol: "description", bn: "ফরমস", href: category("69a5597fc4774958d7c92fea") },
      { title: "Fisheries and livestock", icon: "paper-boat", symbol: "set_meal", bn: "মৎস্য ও প্রাণী", href: category("69a55980c4774958d7c9307f") },
      { title: "Radio and TV news", icon: "radio-walkie-talkie", symbol: "radio", bn: "রেডিও, টিভির খবর", href: category("69a5597fc4774958d7c92fe3") },
      { title: "Bangla AI tools", icon: "magic-wand", symbol: "smart_toy", bn: "বাংলা এআই টুলস", href: category("69df6ab3e252a315b7e6cffb") },
    ],
  },
  hotlines: {
    title: "Emergency and helpline numbers",
    lede: "Free to call from any phone in Bangladesh, as listed on the national portal.",
    items: [
      { tel: "999", label: "National emergency service: police, fire, ambulance" },
      { tel: "333", label: "Government information and services" },
      { tel: "102", label: "Fire service and disaster early warning" },
      { tel: "109", label: "Preventing violence against women and children" },
      { tel: "1098", label: "Child helpline" },
      { tel: "106", label: "Anti-Corruption Commission" },
      { tel: "103", label: "Supreme Court helpline" },
      { tel: "16699", label: "Government legal aid" },
      { tel: "16107", label: "BRTA service portal" },
      { tel: "16122", label: "Smart land service" },
      { tel: "16445", label: "Passport portal" },
      { tel: "16135", label: "Expatriate call centre" },
      { tel: "16357", label: "Workers' helpline" },
      { tel: "16131", label: "Universal pension scheme" },
      { tel: "16999", label: "Power Division services" },
      { tel: "100", label: "Telecommunication services" },
      { tel: "16113", label: "Inland water transport emergencies" },
      { tel: "16111", label: "Bangladesh Coast Guard" },
      { tel: "16109", label: "Bangladesh Employees Welfare Board" },
      { tel: "16171", label: "Freedom Fighter Welfare Trust" },
      { tel: "16575", label: "e-GP (e-procurement) emergencies" },
      { tel: "01908888888", label: "Narcotics control" },
    ],
  },
  about: {
    title: "Offices and official records",
    links: [
      { label: "The President's Office", href: "https://bangabhaban.gov.bd" },
      { label: "Prime Minister's Office", href: "https://pmo.gov.bd/" },
      { label: "National Parliament", href: `${PORTAL}/pages/static-pages/69a55ba386514399668e4e94` },
      { label: "Cabinet Division", href: "https://cabinet.gov.bd/" },
      { label: "Directorates and other offices", href: `${PORTAL}/views/directorates-n-others` },
      { label: "Bangladesh Bureau of Statistics", href: "https://bbs.gov.bd/" },
      { label: "Bangladesh Geocode", href: "https://bbs.gov.bd/pages/static-pages/6922ded1933eb65569e1d95d" },
      { label: "Bangladesh Code (laws)", href: "http://bdlaws.minlaw.gov.bd/" },
      { label: "National Budget", href: "https://mof.gov.bd/" },
      { label: "Bangladesh Tourism Board", href: "https://tourismboard.gov.bd/" },
      { label: "Bangladesh Parjatan Corporation", href: "https://www.parjatan.gov.bd/" },
    ] satisfies GovLink[],
  },
  business: {
    title: "Business and investment",
    links: [
      { label: "Foreign investment", href: `${PORTAL}/pages/static-pages/69a55ba386514399668e4e5b` },
      { label: "Trade licence", href: `${PORTAL}/pages/static-pages/69a55ba386514399668e4e5a` },
      { label: "Investment services (BIDA)", href: sector("69a5597fc4774958d7c92ff5") },
      { label: "Trading Corporation of Bangladesh", href: "https://tcb.gov.bd/" },
      { label: "National Board of Revenue services", href: sector("69a5597fc4774958d7c9301e") },
      { label: "Bangladesh Bank services", href: sector("69a5597fc4774958d7c9302b") },
      { label: "Exchange rates (Bangladesh Bank)", href: "https://www.bb.org.bd/en/index.php" },
      { label: "Job and tender announcements", href: `${PORTAL}/pages/job-tender-announcements` },
      { label: "Weather (Bangladesh Meteorological Department)", href: "https://live6.bmd.gov.bd/" },
    ] satisfies GovLink[],
  },
  looking: { before: "Looking for something else?", label: "Visit the national portal at bangladesh.gov.bd", href: PORTAL },
};
