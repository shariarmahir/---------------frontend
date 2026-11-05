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
export const category = (id: string) => services("service_category", id);

/** The guide's home is its All topics and services page; the About page sits under it. */
const HOME = "/bangladesh/government";
const ABOUT_PAGE = "/bangladesh/government/about";
const NP = "/bangladesh/government/national-portal";
const BENEFITS_PAGE = "/bangladesh/government/benefits";
/** A detail page (data/bd-gov-details.ts): the card explains, the page links out. */
const guide = (slug: string) => `${HOME}/${slug}`;

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
  search: { label: "Search government services" },
};

/** The header's categories, as usa.gov's seven. */
export const NAV: GovLink[] = [
  { label: "All topics and services", href: HOME },
  { label: "Bangladesh and its government", href: ABOUT_PAGE },
  { label: "Government benefits", href: BENEFITS_PAGE },
  { label: "Bangladesh National Portal", href: NP },
  { label: "Hotlines", href: `${NP}#hotlines` },
  { label: "Business and trade", href: guide("business-and-trade") },
  { label: "Visit Bangladesh", href: "/bangladesh" },
];

export const FOOTER = {
  columns: [
    {
      title: "Government information",
      links: [
        { label: "All topics and services", href: HOME },
        { label: "Directory of ministries and divisions", href: `${PORTAL}/views/ministry-and-directorate-list` },
        { label: "Government benefits", href: BENEFITS_PAGE },
        { label: "Branches of government", href: guide("branches-of-government") },
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
    { label: "Explore the three branches of government", href: guide("branches-of-government") },
  ] satisfies GovLink[],
  intro:
    "Discover Bangladesh's laws, history and statistics, find government tenders and job circulars, and learn how the state is organised, from its ministries and offices to the public services they provide.",
  cards: [
    {
      title: "Government tenders and procurement",
      icon: "shopping-basket",
      symbol: "shopping_bag",
      text: "Browse tenders, procurement notices and job circulars published by ministries and offices.",
      href: guide("government-tenders"),
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
      href: guide("ministries-and-divisions"),
    },
    {
      title: "Divisions, districts and local government",
      icon: "location-pin",
      symbol: "map",
      text: "Portals for all 8 divisions and 64 districts, and the offices that serve every upazila and union.",
      href: guide("local-government"),
    },
    {
      title: "Branches of government",
      icon: "bank",
      symbol: "account_balance",
      text: "How the legislative, executive and judicial branches share power under the Constitution.",
      href: guide("branches-of-government"),
    },
    {
      title: "The President and Prime Minister",
      icon: "city-hall",
      symbol: "domain",
      text: "Reach Bangabhaban, the Prime Minister's Office, the Cabinet Division and the National Parliament.",
      href: guide("president-and-prime-minister"),
    },
    {
      title: "Laws of Bangladesh",
      icon: "book-bookmark",
      symbol: "menu_book",
      text: "The Bangladesh Code: every act in force, in Bangla and English, and free legal aid.",
      href: guide("laws-and-legal-aid"),
    },
    {
      title: "Elections and national ID",
      icon: "hand-voting",
      symbol: "how_to_vote",
      text: "Register to vote, get or correct your national ID card, and find Election Commission services.",
      href: guide("voting-and-elections"),
    },
    {
      title: "Courts and legal aid",
      icon: "scale-retro",
      symbol: "gavel",
      text: "The Supreme Court, the courts beneath it, and village courts for local disputes.",
      href: guide("courts"),
    },
  ] satisfies GovCard[],
  looking: { before: "Looking for something else?", label: "Browse all topics and services", href: HOME },
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

/** Where things stand now. Offices and dates, not people or parties: office-holders change, and each office's own site names them. */
export const GOV_TODAY = {
  title: "The government today",
  lede: "Bangladesh is a parliamentary republic under its Constitution of 1972. This is where things stood when we last checked, on 5 November 2026.",
  points: [
    { title: "The election", text: "A general election was held on 12 February 2026, and a new government took office on 17 February 2026." },
    { title: "The referendum", text: "On the same day, voters were asked about the July National Charter. 68.26% voted yes, on a turnout of 60%." },
    { title: "What the vote changed", text: "The result is described as a political mandate, not a change in the law. The Charter's 84 proposals, such as an upper house of 100 seats and limits on how long one person can be Prime Minister, take effect only when they are enacted." },
    { title: "What we could not confirm", text: "Whether Parliament has enacted those changes yet. The Charter's process is disputed, so read the Constitution itself for what is in force today." },
  ],
  links: [
    { label: "The Constitution, in the Bangladesh Code", href: "http://bdlaws.minlaw.gov.bd/" },
    { label: "Bangladesh Election Commission", href: "https://www.ecs.gov.bd/" },
    { label: "The referendum, on Wikipedia", href: "https://en.wikipedia.org/wiki/2026_Bangladeshi_constitutional_referendum" },
  ] satisfies GovLink[],
};

/** Which office serves you, from the top down. Counts are the national portal's. */
export const LEVELS = {
  title: "From the capital to your village",
  lede: "Most people deal with government close to home. Start at the lowest office that can help.",
  items: [
    { name: "Ministries and divisions", count: "57", text: "Set national policy and run the directorates and agencies." },
    { name: "Divisions", count: "8", text: "Each led by a Divisional Commissioner, who oversees the districts in it." },
    { name: "Districts", count: "64", text: "The Deputy Commissioner's office is the state's main office locally, including for land." },
    { name: "Upazilas", count: "500", text: "The Upazila Nirbahi Officer runs government services for the sub-district." },
    { name: "Unions", count: "4,568", text: "The elected Union Parishad is the closest government to most villages." },
  ],
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
  title: "The Bangladesh government, made easy to use",
  lede: "Find any government service in English or Bangla, and go straight to the official page. For people who live here, Bangladeshis abroad and visitors.",
  doorsTitle: "Who is this for?",
  doors: [
    { title: "I live in Bangladesh", bn: "আমি বাংলাদেশে থাকি", text: "ID, study, jobs, land, tax, bills, health and support.", symbol: "home", href: `${NP}#services` },
    { title: "I'm Bangladeshi, living abroad", bn: "আমি প্রবাসী বাংলাদেশি", text: "Passport, missions, certificates, pension and help for migrant workers.", symbol: "public", href: `${NP}?need=abroad#services` },
    { title: "I'm visiting or investing", bn: "আমি বিদেশি অতিথি বা বিনিয়োগকারী", text: "Visa, customs, safety, travel, and starting a business.", symbol: "flight_land", href: `${NP}?need=visitors#services` },
  ],
  howTitle: "Most-used services",
  howLede: "One click to the official page.",
  jump: "See every service",
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
    { title: "Voting and elections", icon: "hand-voting", symbol: "how_to_vote", text: "Election Commission services, from national ID cards to voter registration.", href: guide("voting-and-elections") },
    { title: "Bangladesh and its government", icon: "city-hall", symbol: "account_balance", text: "Its laws, history and institutions, and how to reach every ministry and office.", href: ABOUT_PAGE },
    { title: "Disasters and emergencies", icon: "ambulance", symbol: "emergency", text: "Call 999 for police, fire and ambulance, or 102 for the fire service and disaster warnings.", href: guide("disasters-and-emergencies") },
    { title: "Education", icon: "school", symbol: "school", text: "Admissions, scholarships and education services, from school to university.", href: guide("education") },
    { title: "Exam results", icon: "file-pencil", symbol: "grading", text: "Public examination results from every education board.", href: guide("exam-results") },
    { title: "Health", icon: "heart-beat", symbol: "health_and_safety", text: "Government hospitals, health services and trusted health information.", href: guide("health") },
    { title: "Agriculture", icon: "growing-plant", symbol: "agriculture", text: "Farming advice, market prices and agricultural services.", href: guide("agriculture") },
    { title: "Fisheries and livestock", icon: "paper-boat", symbol: "set_meal", text: "Services for fish farmers and livestock keepers.", href: guide("fisheries-and-livestock") },
    { title: "Jobs and recruitment", icon: "briefcase", symbol: "work", text: "Government job circulars and recruitment exams.", href: guide("jobs-and-recruitment") },
    { title: "Passport, visa and immigration", icon: "globe", symbol: "flight_takeoff", text: "Apply for or renew a passport, and find visa and immigration services.", href: guide("passports-and-immigration") },
    { title: "Income tax", icon: "coins", symbol: "receipt_long", text: "Register for a tax number, file your return and pay income tax.", href: guide("income-tax") },
    { title: "Utility bills", icon: "outlet-type-g", symbol: "bolt", text: "Pay electricity, gas and water bills online.", href: guide("utility-bills") },
    { title: "Land services", icon: "image-mountain", symbol: "landscape", text: "Land records, e-mutation and the smart land service.", href: guide("land-services") },
    { title: "Transport and vehicles", icon: "road", symbol: "directions_car", text: "Driving licences, vehicle registration and other transport services.", href: guide("transport-and-vehicles") },
    { title: "Business and trade", icon: "stock-market", symbol: "storefront", text: "Start a business, get a trade licence and find support for foreign investment.", href: guide("business-and-trade") },
    { title: "Laws and legal aid", icon: "scale-retro", symbol: "gavel", text: "Read the laws of Bangladesh and get free legal aid from the government.", href: guide("laws-and-legal-aid") },
    { title: "Online applications", icon: "file-text", symbol: "edit_document", text: "Apply online for certificates, permits and other government services.", href: guide("online-applications") },
    { title: "Tickets and travel", icon: "car-ferry", symbol: "confirmation_number", text: "Book train, bus and launch tickets online.", href: guide("tickets-and-travel") },
    { title: "Digital centres", icon: "desktop", symbol: "computer", text: "Find a digital centre near you for help with any online service.", href: guide("digital-centres") },
    { title: "Bangla AI tools", icon: "magic-wand", symbol: "smart_toy", text: "The government's Bangla language and AI tools.", href: guide("bangla-ai-tools") },
  ] satisfies GovCard[],
};

/* ── Government benefits (usa.gov/benefits) ──────────────────────────── */

export const BENEFITS = {
  title: "Government benefits",
  hero: {
    src: "/motherland/photos/children.jpg",
    alt: "Five children laughing together on a sandy riverbank",
    focus: "50% 40%",
    credit: { author: "mohammad samir", license: "Unsplash License", licenseUrl: "https://unsplash.com/license", sourceUrl: "https://unsplash.com/photos/3-boys-and-2-girls-standing-on-brown-sand-during-daytime-vaXqT9L7LwY" },
  } satisfies Photo,
  popular: [
    { label: "Apply for an old age, widow or disability allowance", href: guide("social-allowances") },
    { label: "Join the universal pension", href: guide("universal-pension") },
    { label: "Get help with food", href: guide("food-assistance") },
  ] satisfies GovLink[],
  intro:
    "Find government programmes that help with food, housing, health care and other living costs, and learn about allowances, stipends and the universal pension. Every benefit is free to apply for.",
  cards: [
    { title: "Find government benefits", icon: "magnifier-heart", symbol: "volunteer_activism", text: "How the social safety net works, who it is for and how to apply.", href: guide("find-benefits") },
    { title: "Food assistance", icon: "shopping-basket", symbol: "rice_bowl", text: "Low-price rice, family cards, open market sales and food aid.", href: guide("food-assistance") },
    { title: "Health care", icon: "heart-beat", symbol: "health_and_safety", text: "Free community clinics, vaccines for children and mothers, and a doctor by phone.", href: guide("health") },
    { title: "Housing help", icon: "home", symbol: "home", text: "Homes for landless families, home loans and public housing.", href: guide("housing-help") },
    { title: "Allowances for older people, widows and people with disabilities", icon: "wheelchair", symbol: "accessible", text: "Monthly allowances paid straight to your mobile wallet.", href: guide("social-allowances") },
    { title: "Universal pension", icon: "bank", symbol: "account_balance", text: "Save a little each month for a pension for life from age 60.", href: guide("universal-pension") },
    { title: "Education stipends", icon: "school", symbol: "school", text: "Stipends that help children from poorer families stay in school.", href: guide("education-stipends") },
    { title: "Mothers and young children", icon: "baby-feeding", symbol: "family_restroom", text: "A monthly allowance for mothers on low incomes, and help lines for women and children.", href: guide("mothers-and-children") },
    { title: "Freedom fighters' honorarium", icon: "medal-first-place", symbol: "military_tech", text: "The monthly honorarium, medical care and support for families.", href: guide("freedom-fighters") },
    { title: "Migrant workers and their families", icon: "globe", symbol: "public", text: "Welfare, loans and help for Bangladeshis working abroad.", href: guide("migrant-workers") },
    { title: "Workers' and employees' welfare", icon: "briefcase", symbol: "work", text: "Grants for treatment, education and families after a death.", href: guide("employee-welfare") },
    { title: "Disaster relief", icon: "ambulance", symbol: "emergency", text: "Warnings, shelters and relief for families hit by cyclones and floods.", href: guide("disasters-and-emergencies") },
  ] satisfies GovCard[],
  looking: { before: "Looking for something else?", label: "Explore all topics and services", href: HOME },
};

/* ── The national portal (bangladesh.gov.bd) ─────────────────────────── */

export const NATIONAL_PORTAL = {
  title: "One click to every government service",
  intro: "Type what you need, in English or Bangla. Each button opens the official page straight away, so you can do it from home, with no photocopy shop and no middleman.",
  how: {
    title: "How one click works",
    steps: [
      { title: "You go straight to the official form", text: "Every button opens the government's own page in a new tab, and each card shows you its address first. You don't need to buy a printed form to use it." },
      { title: "You sign in and submit there", text: "BD Guide is not a government site. It can't file an application for you, and it never sees your details. Some services still ask you to appear in person, for example to give biometrics." },
      { title: "Every link is opened and checked", text: "About 80 of the 283 links on the national portal's own list did not open for our checker, so only working ones are here. Admission sites open only in season, and any site can go down for a while." },
    ],
  },
  help: {
    title: "Rather have someone help?",
    lede: "You don't have to do it alone, and you shouldn't have to pay a middleman to find the right form.",
  },
  schemes: {
    title: "New government loan schemes",
    lede: "What Bangladesh Bank has announced in 2026, as reported in the press. These are the terms reported at the time, so confirm them before you rely on them.",
    apply: "You apply at a bank branch, not online and not through us, and not every bank takes part in every scheme. Ask your bank, and read the original notices in",
    official: { label: "Bangladesh Bank's circulars", href: "https://www.bb.org.bd/en/index.php/mediaroom/circular" },
  },
  glance: {
    title: "The government at a glance",
    stats: [
      { value: "57", label: "Ministries and divisions" },
      { value: "72", label: "Directorates" },
      { value: "566", label: "Other offices" },
      { value: "8", label: "Divisions" },
      { value: "64", label: "Districts" },
      { value: "500", label: "Upazilas" },
      { value: "4,568", label: "Unions" },
    ],
  },
  services: {
    title: "The national portal's own categories",
    lede: "For anything we haven't listed, each of these opens the full list on bangladesh.gov.bd.",
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
      { label: "Bangladesh Parjatan Corporation", href: "https://parjatan.gov.bd/" },
    ] satisfies GovLink[],
  },
  looking: { before: "Looking for something else?", label: "Visit the national portal at bangladesh.gov.bd", href: PORTAL },
};
