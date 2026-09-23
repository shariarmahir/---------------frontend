/**
 * Product detail content — SWASTI, Aponjon and the Smart Pharmacy grid.
 *
 * ── Two kinds of number live here, and they must not blur ────────────
 *
 *   `stats` / `findings`   Published data about Bangladesh. Every one
 *                          carries a `source` with a URL, and was checked
 *                          against that source when written (Sept 2026).
 *                          Do not round, restate or "update" one without
 *                          re-reading the source.
 *
 *   `growth[].target`      Kandari-Lab's own goals. They are plans, not
 *                          results, and the UI labels them "Target".
 *
 * Nothing here claims clinical accuracy, regulatory approval or trial
 * outcomes for a Kandari-Lab product — none exist yet to cite. Scenario
 * cards are illustrations of how a product is meant to work, and are
 * labelled as such; the context photographs are landscapes, not patients.
 *
 * Content is shaped so one set of components renders every product
 * (CLAUDE.md §8): a future sector's product is a new entry, not new UI.
 */

export interface Source {
  publisher: string;
  title: string;
  year: string;
  url: string;
}

export interface Stat {
  value: string;
  label: string;
  source: Source;
}

export interface IconItem {
  icon: string;
  title: string;
  body: string;
}

export interface Scenario {
  image: string;
  imageAlt: string;
  title: string;
  without: string;
  withProduct: string;
}

export interface Phase {
  phase: string;
  title: string;
  body: string;
  target: string;
}

export interface VideoSlot {
  title: string;
  titleBn: string;
  poster: string;
  posterAlt: string;
  /** What the finished video will show — the brief for whoever films it. */
  brief: string;
}

export type ProductAccent = "green" | "orange" | "teal";

export interface Product {
  slug: string;
  name: string;
  nameBn: string;
  category: string;
  tagline: string;
  summary: string;
  stage: string;
  accent: ProductAccent;
  image: { src: string; alt: string; ratio: "4/3" | "3/4" };
  stats: Stat[];
  problems: IconItem[];
  problemImage: { src: string; alt: string; caption: string };
  coreProblem: { statement: string; detail: string };
  coreSolve: { statement: string; detail: string };
  capabilities: IconItem[];
  steps: { title: string; body: string }[];
  scenarios: Scenario[];
  benefits: (IconItem & { audience: string })[];
  growth: Phase[];
  videos: VideoSlot[];
  research: { summary: string[]; findings: { text: string; source: Source }[] };
}

/* ── Sources ─────────────────────────────────────────────────────────── */

const SRC = {
  oop: {
    publisher: "World Bank",
    title: "Out-of-pocket expenditure (% of current health expenditure) — Bangladesh",
    year: "2021",
    url: "https://data.worldbank.org/indicator/SH.XPD.OOPC.CH.ZS?locations=BD",
  },
  physicians: {
    publisher: "World Bank",
    title: "Physicians (per 1,000 people) — Bangladesh",
    year: "2023",
    url: "https://data.worldbank.org/indicator/SH.MED.PHYS.ZS?locations=BD",
  },
  rural: {
    publisher: "World Bank",
    title: "Rural population (% of total population) — Bangladesh",
    year: "2023",
    url: "https://data.worldbank.org/indicator/SP.RUR.TOTL.ZS?locations=BD",
  },
  steps: {
    publisher: "WHO / DGHS",
    title: "Bangladesh NCD Risk Factor Survey (STEPS)",
    year: "2018",
    url: "https://cdn.who.int/media/docs/default-source/searo/bangladesh/bangladesh-ncd-risk-factor-survey-2018.pdf?sfvrsn=266ad1da_1",
  },
  ncdProfile: {
    publisher: "WHO",
    title: "Noncommunicable diseases — Bangladesh country profile",
    year: "2018",
    url: "https://www.who.int/publications/m/item/noncommunicable-diseases-bgd-country-profile-2018",
  },
  gbd: {
    publisher: "The Lancet Global Health",
    title: "The burden of diseases and risk factors in Bangladesh, 1990–2019 (GBD 2019)",
    year: "2023",
    url: "https://www.thelancet.com/journals/langlo/article/PIIS2214-109X(23)00432-1/fulltext",
  },
  timeIsBrain: {
    publisher: "Stroke (AHA journal)",
    title: "Saver JL — Time Is Brain, Quantified",
    year: "2006",
    url: "https://www.ahajournals.org/doi/10.1161/01.str.0000196957.55928.ab",
  },
  mobile: {
    publisher: "BTRC, via The Business Standard",
    title: "Mobile subscriber statistics",
    year: "2025",
    url: "https://www.tbsnews.net/bangladesh/mobile-internet-subscribers-dip-3rd-straight-month-amid-sim-verification-drive-1285776",
  },
  drugShops: {
    publisher: "Journal of Pharmaceutical Policy and Practice",
    title: "Exploring the status of retail private drug shops in Bangladesh",
    year: "2017",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5506600/",
  },
  communityClinics: {
    publisher: "Community Based Health Care, DGHS",
    title: "Community Clinic — About",
    year: "2024",
    url: "http://www.communityclinic.gov.bd/about-us.php",
  },
} satisfies Record<string, Source>;

/* ── Products ────────────────────────────────────────────────────────── */

export const products: Product[] = [
  {
    slug: "aponjon",
    name: "Aponjon",
    nameBn: "আপনজন",
    category: "Wearable AI neuro-device",
    tagline: "Catch the silent warning before it becomes an emergency.",
    summary:
      "An affordable smart band that watches heart rhythm, oxygen, temperature and stress around the clock — and raises the alarm while there is still time to act.",
    stage: "Prototype · in development",
    accent: "green",
    image: {
      src: "/sections/device.png",
      alt: "আপনজন AI নিউরো ব্যান্ড পরা এক নারীর কব্জি থেকে পালস, SpO₂ ও স্ট্রেস রিডিং ভেসে উঠছে",
      ratio: "4/3",
    },
    stats: [
      { value: "21%", label: "of adults aged 25+ have high blood pressure", source: SRC.steps },
      { value: "51.3%", label: "of them do not know they have it", source: SRC.steps },
      { value: "#1", label: "cause of death in Bangladesh is stroke, then heart disease", source: SRC.gbd },
      { value: "1.9M", label: "brain cells lost every minute a stroke goes untreated", source: SRC.timeIsBrain },
    ],
    problems: [
      {
        icon: "visibility_off",
        title: "The disease has no symptoms",
        body: "High blood pressure and rhythm problems rarely hurt. Half of the people who have hypertension have never been told.",
      },
      {
        icon: "event_busy",
        title: "Checks happen once, if ever",
        body: "A blood-pressure reading at a clinic is one moment. Risk builds between visits, when nobody is measuring.",
      },
      {
        icon: "directions_boat",
        title: "The hospital is hours away",
        body: "For many villages the nearest emergency care is a boat, a bus and a transfer away — the first hours are spent travelling.",
      },
      {
        icon: "payments",
        title: "Monitors cost too much",
        body: "Clinical-grade wearables are priced for other markets and depend on foreign cloud services and English interfaces.",
      },
    ],
    problemImage: {
      src: "/hero/Hero-6.jpg",
      alt: "সুন্দরবনের খাল ধরে যাত্রীবোঝাই নৌকা চলেছে",
      caption: "For much of rural Bangladesh, the road to a hospital runs over water.",
    },
    coreProblem: {
      statement: "Warning signs arrive hours before an emergency — and nobody is watching.",
      detail:
        "Stroke and heart attack are the country's leading killers, and both are driven by risks that can be measured early. The failure is not treatment; it is that detection starts only once the patient collapses, and the Golden Two Hours are already being spent on the road.",
    },
    coreSolve: {
      statement: "Put continuous, affordable monitoring on the wrist — and an alarm on the phone of someone nearby.",
      detail:
        "Aponjon turns the time before an emergency into warning time: it tracks the signals that change first, flags a worrying trend early, and routes the alert to family, a local health worker and SWASTI's triage — so the journey starts sooner.",
    },
    capabilities: [
      { icon: "monitor_heart", title: "ECG & heart rhythm", body: "Continuous rhythm tracking to spot irregular beats that raise stroke risk." },
      { icon: "spo2", title: "SpO₂ & temperature", body: "Oxygen saturation and body temperature for respiratory and fever warnings." },
      { icon: "psychology", title: "Stress & energy score", body: "EMG and heart-rate variability summarised into a daily, readable score." },
      { icon: "memory", title: "On-device AI", body: "Risk detection runs on the band itself, so it keeps working without internet." },
      { icon: "notifications_active", title: "Caregiver alerts", body: "A warning reaches family and the nearest health worker, not only the wearer." },
      { icon: "battery_charging_full", title: "Built for village life", body: "Designed for long battery life, heat, dust and monsoon humidity." },
    ],
    steps: [
      { title: "Wear", body: "The band measures heart rhythm, oxygen, temperature and stress through the day and night." },
      { title: "Detect", body: "On-device AI compares readings against the wearer's own baseline and flags a risky trend." },
      { title: "Alert", body: "A plain-Bangla warning reaches the wearer, their family and a local health worker." },
      { title: "Act", body: "SWASTI opens a triage call and points the family to the nearest care that can treat it." },
    ],
    scenarios: [
      {
        image: "/hero/Hero-10.jpg",
        imageAlt: "ভোরের কুয়াশায় দুই প্রবীণ একে অপরকে পানি এগিয়ে দিচ্ছেন",
        title: "Elderly parents alone in the village",
        without: "The father feels dizzy at dawn and lies down; their son in Dhaka finds out by noon.",
        withProduct: "His band flags an irregular rhythm at dawn; the son and the village health worker get an alert within minutes.",
      },
      {
        image: "/hero/Hero-9.jpg",
        imageAlt: "ক্ষেতে লাঙল হাতে কৃষক ও পাশে দাঁড়ানো এক কিশোর",
        title: "A farmer with undiagnosed hypertension",
        without: "He has never had his blood pressure measured; the first sign is a stroke in the field.",
        withProduct: "Weeks of elevated readings prompt a pharmacy check-up, a diagnosis and daily medicine — long before an emergency.",
      },
    ],
    benefits: [
      { audience: "Families", icon: "family_restroom", title: "Peace of mind at a distance", body: "Children working in cities can know their parents are safe in the village." },
      { audience: "Health system", icon: "local_hospital", title: "Fewer late emergencies", body: "Earlier detection shifts care from costly emergency admission to cheap prevention." },
      { audience: "Economy", icon: "trending_up", title: "Working years protected", body: "Stroke and heart disease strike people in their working years; prevention keeps them earning." },
      { audience: "Industry", icon: "precision_manufacturing", title: "Local hardware skills", body: "Designing and assembling medical electronics at home builds a new engineering base." },
    ],
    growth: [
      { phase: "Phase 1", title: "Validation", body: "Test the band against clinical reference devices with partner doctors.", target: "Clinical comparison study" },
      { phase: "Phase 2", title: "Village pilot", body: "Deploy with elderly and high-risk households around the first Smart Pharmacies.", target: "First pilot households" },
      { phase: "Phase 3", title: "District scale", body: "Subsidised bands through pharmacies, NGOs and employers.", target: "District-wide rollout" },
      { phase: "Phase 4", title: "National", body: "Local manufacturing to bring the price within reach of every family.", target: "Affordable for every district" },
    ],
    videos: [
      { title: "The silent risk", titleBn: "নীরব ঝুঁকি", poster: "/hero/Hero-9.jpg", posterAlt: "ক্ষেতে লাঙল হাতে কৃষক", brief: "Why hypertension goes unnoticed in rural Bangladesh — told through a farming family." },
      { title: "How Aponjon works", titleBn: "আপনজন যেভাবে কাজ করে", poster: "/sections/device.png", posterAlt: "আপনজন ব্যান্ড", brief: "The band, the alert and the response, from first reading to care." },
      { title: "The Golden Two Hours", titleBn: "সোনালি দুই ঘণ্টা", poster: "/hero/Hero-6.jpg", posterAlt: "যাত্রীবোঝাই নৌকা", brief: "A real journey from village to hospital, timed — and where the minutes go." },
    ],
    research: {
      summary: [
        "Bangladesh has already made the shift most countries fear: non-communicable diseases now cause most deaths, and stroke and ischaemic heart disease lead the list. High blood pressure is the single largest risk factor behind both.",
        "The gap is detection. One in five adults over 25 has hypertension, and half of them do not know. Because stroke damage accumulates by the minute, every hour gained before an emergency is worth more than any improvement after it.",
      ],
      findings: [
        { text: "Stroke, ischaemic heart disease and COPD were the three leading causes of death in 2019; high blood pressure was the top risk factor.", source: SRC.gbd },
        { text: "21% of adults aged 25+ had raised blood pressure, and 51.3% of them were unaware of it.", source: SRC.steps },
        { text: "Non-communicable diseases account for an estimated 67% of all deaths in Bangladesh.", source: SRC.ncdProfile },
        { text: "In a typical large-vessel stroke, about 1.9 million neurons are lost each minute without treatment.", source: SRC.timeIsBrain },
      ],
    },
  },

  {
    slug: "swasti",
    name: "SWASTI",
    nameBn: "স্বস্তি",
    category: "Health super-app",
    tagline: "A doctor's first opinion, in Bangla, on any phone.",
    summary:
      "A voice-first health app that answers in plain Bangla, checks risk, connects to a doctor and keeps one lifelong health record — built for people who have a phone but not a nearby clinic.",
    stage: "Beta · in development",
    accent: "orange",
    image: {
      src: "/sections/mobileapp.png",
      alt: "SWASTI স্বস্তি অ্যাপের হোম স্ক্রিন — হার্ট রেট, SpO₂, রক্তচাপ ও দ্রুত অ্যাকশন বোতাম",
      ratio: "3/4",
    },
    stats: [
      { value: "0.72", label: "doctors per 1,000 people", source: SRC.physicians },
      { value: "73%", label: "of health spending comes out of patients' pockets", source: SRC.oop },
      { value: "~18.8 crore", label: "mobile subscriptions in the country", source: SRC.mobile },
      { value: "59.5%", label: "of people live in rural areas", source: SRC.rural },
    ],
    problems: [
      {
        icon: "person_off",
        title: "Too few doctors, in the wrong places",
        body: "Under one doctor for every thousand people — and most practise in cities, far from the rural majority.",
      },
      {
        icon: "account_balance_wallet",
        title: "Families pay for everything",
        body: "Nearly three-quarters of health spending is out of pocket. A day's travel to the city is a cost many put off until it is too late.",
      },
      {
        icon: "translate",
        title: "Health apps speak the wrong language",
        body: "Most digital health tools assume English, typing and a data plan — excluding elders and low-literacy users.",
      },
      {
        icon: "folder_off",
        title: "No record follows the patient",
        body: "Prescriptions live on paper slips. Every new doctor starts from zero, and test results are repeated and lost.",
      },
    ],
    problemImage: {
      src: "/hero/Hero-8.jpg",
      alt: "সরিষা ক্ষেতের ভেতর দিয়ে স্কুলে যাচ্ছে চার কিশোরী",
      caption: "Almost six in ten Bangladeshis live in rural areas — where most doctors do not.",
    },
    coreProblem: {
      statement: "The phone is already in every pocket. The doctor is not.",
      detail:
        "Bangladesh has nearly as many mobile subscriptions as people, yet the first medical advice most rural families get is a guess at the drug shop. The bottleneck is not connectivity — it is a trustworthy first step in a language and format everyone can use.",
    },
    coreSolve: {
      statement: "Make the phone the front door of the health system — voice-first, in Bangla, free to start.",
      detail:
        "SWASTI answers health questions by voice, runs a structured risk check, connects to a doctor when it matters, and keeps every prescription and reading in one record that travels with the patient.",
    },
    capabilities: [
      { icon: "record_voice_over", title: "Bangla voice assistant", body: "Speak a symptom in your own dialect; hear the answer back — no typing needed." },
      { icon: "clinical_notes", title: "Medical guidance (RAG)", body: "Answers grounded in vetted clinical guidelines, with clear 'see a doctor now' limits." },
      { icon: "biotech", title: "AI risk check", body: "A structured triage that sorts 'rest at home' from 'go today' from 'emergency'." },
      { icon: "video_call", title: "Doctor on call", body: "Video or audio consultation with a registered doctor when the risk check says so." },
      { icon: "description", title: "One health record", body: "Prescriptions, test results and Aponjon readings in one timeline the patient owns." },
      { icon: "wifi_off", title: "Works on weak networks", body: "Core guidance cached on the phone, built for 2G/3G and low-cost handsets." },
    ],
    steps: [
      { title: "Ask", body: "Tap and speak in Bangla — 'my mother has chest pain' — or pick a symptom." },
      { title: "Check", body: "SWASTI asks the right follow-up questions and scores how urgent it is." },
      { title: "Connect", body: "For anything serious, it books a doctor call or points to the nearest care." },
      { title: "Follow", body: "The prescription and reminders land in the record, ready for the next visit." },
    ],
    scenarios: [
      {
        image: "/hero/Hero-5.jpg",
        imageAlt: "সুন্দরবনের ম্যানগ্রোভ জলাভূমিতে একা নৌকা বাইছেন এক মাঝি",
        title: "A child's fever in a remote char village",
        without: "The nearest doctor is a day's journey; the family buys antibiotics at a stall and waits.",
        withProduct: "The mother describes the fever by voice; SWASTI flags danger signs and connects her to a doctor that evening.",
      },
      {
        image: "/hero/Hero-3.jpg",
        imageAlt: "গোধূলিতে ধানক্ষেতের আলপথ ধরে মাথায় খড়ের আঁটি নিয়ে হেঁটে চলেছেন কৃষকেরা",
        title: "A diabetic farmer between clinic visits",
        without: "The paper prescription is lost; he stops the medicine when the strip runs out.",
        withProduct: "His record holds the prescription, and a reminder tells him — and the local pharmacy — when to refill.",
      },
    ],
    benefits: [
      { audience: "Citizens", icon: "savings", title: "Less travel, less cost", body: "Many questions are answered at home, saving a day's wages and fares." },
      { audience: "Doctors", icon: "stethoscope", title: "Time for the sick", body: "Triage sends the urgent cases forward and handles the routine ones by guidance." },
      { audience: "Health system", icon: "database", title: "A national health record", body: "Anonymised, consented data shows where disease is rising — district by district." },
      { audience: "Inclusion", icon: "accessibility_new", title: "Care for every literacy", body: "Voice-first design includes elders and people who cannot read or type." },
    ],
    growth: [
      { phase: "Phase 1", title: "Beta", body: "Bangla voice assistant and risk check with a closed group of test users.", target: "Closed beta" },
      { phase: "Phase 2", title: "Doctor network", body: "Onboard registered doctors for consultations; link to Aponjon readings.", target: "Partner doctor panel" },
      { phase: "Phase 3", title: "Pharmacy link", body: "Connect every Smart Pharmacy for prescriptions, refills and records.", target: "Pharmacy integration" },
      { phase: "Phase 4", title: "National", body: "Free public release with regional dialects and an offline mode.", target: "All 64 districts" },
    ],
    videos: [
      { title: "A day without a doctor", titleBn: "ডাক্তার ছাড়া একটি দিন", poster: "/hero/Hero-5.jpg", posterAlt: "ম্যানগ্রোভে নৌকা বাইছেন এক মাঝি", brief: "A family in a remote village facing a health scare with no doctor nearby." },
      { title: "Talk to SWASTI", titleBn: "স্বস্তির সাথে কথা বলুন", poster: "/sections/mobileapp.png", posterAlt: "SWASTI অ্যাপ", brief: "A walkthrough of the voice assistant, risk check and doctor call." },
      { title: "One record for life", titleBn: "সারা জীবনের এক রেকর্ড", poster: "/hero/Hero-3.jpg", posterAlt: "ধানক্ষেতের আলপথে কৃষকেরা", brief: "How a single health record changes the next doctor's visit." },
    ],
    research: {
      summary: [
        "Bangladesh's health system carries one of the heaviest out-of-pocket burdens in the region: nearly three-quarters of all health spending is paid directly by families, at the moment they are ill.",
        "Doctors are scarce — about 0.72 per thousand people — and concentrated in cities, while almost six in ten people live rurally. Mobile access, by contrast, is close to universal. A phone-first, Bangla-first entry point uses the infrastructure the country already has.",
      ],
      findings: [
        { text: "Out-of-pocket payments were 73% of current health expenditure in 2021.", source: SRC.oop },
        { text: "Bangladesh had about 0.72 physicians per 1,000 people in 2023.", source: SRC.physicians },
        { text: "About 59.5% of the population lived in rural areas in 2023.", source: SRC.rural },
        { text: "Mobile subscriptions stood at roughly 188 million in 2025.", source: SRC.mobile },
      ],
    },
  },

  {
    slug: "smart-pharmacy",
    name: "Smart Pharmacy",
    nameBn: "স্মার্ট ফার্মেসি",
    category: "One Village, One Health Care Center",
    tagline: "Turn the village drug shop into the village clinic.",
    summary:
      "The drug shop is already where rural Bangladesh goes first. We upgrade it — solar power, diagnostic devices, a doctor on video and SWASTI records — into a trusted primary-care point in every village.",
    stage: "Pilot planning",
    accent: "teal",
    image: {
      src: "/sections/smartpharmacy.png",
      alt: "গ্রামীণ স্মার্ট ফার্মেসিতে একজন স্বাস্থ্যকর্মী এক প্রবীণ রোগীর রক্তচাপ মাপছেন; পাশে টেলিমেডিসিন স্ক্রিন",
      ratio: "4/3",
    },
    stats: [
      { value: "~1 lakh+", label: "licensed retail drug shops — and about as many unlicensed", source: SRC.drugShops },
      { value: "14,000+", label: "community clinics, planned at one per 6,000 people", source: SRC.communityClinics },
      { value: "73%", label: "of health spending paid out of pocket", source: SRC.oop },
      { value: "59.5%", label: "of people live in rural areas", source: SRC.rural },
    ],
    problems: [
      {
        icon: "storefront",
        title: "The drug seller is the first doctor",
        body: "For a fever, a cough or chest pain, rural families go to the nearest medicine shop first — often staffed by someone with no clinical training.",
      },
      {
        icon: "medication",
        title: "Medicine without diagnosis",
        body: "Antibiotics and steroids are sold on request, fuelling resistance while the real problem goes unmeasured.",
      },
      {
        icon: "power_off",
        title: "No power, no cold chain",
        body: "Load-shedding spoils insulin and vaccines and switches off any device a shop might own.",
      },
      {
        icon: "hub",
        title: "Clinics are stretched thin",
        body: "Community clinics serve thousands each, with limited hours, staff and equipment.",
      },
    ],
    problemImage: {
      src: "/hero/Hero-4.jpg",
      alt: "পাহাড় ও হ্রদের মাঝে জলের উপর দাঁড়িয়ে থাকা একটি কাঠের ঘর",
      caption: "In remote villages the drug shop is often the only health counter for miles.",
    },
    coreProblem: {
      statement: "Rural Bangladesh already has a front line of care — it just isn't equipped to be one.",
      detail:
        "Tens of thousands of drug shops sit inside every village and market. People trust them and visit them first. But without diagnostics, trained staff, power or a link to a doctor, that first visit sells medicine instead of finding the illness.",
    },
    coreSolve: {
      statement: "Upgrade the shop people already trust, instead of building a clinic they have to travel to.",
      detail:
        "A Smart Pharmacy adds a trained health worker, basic diagnostics, solar power with cold storage, a video link to a doctor and SWASTI records — so the first visit becomes a real check-up, with a prescription behind the medicine.",
    },
    capabilities: [
      { icon: "solar_power", title: "Solar power & cold chain", body: "Keeps lights, devices and refrigerated medicine running through load-shedding." },
      { icon: "blood_pressure", title: "Diagnostic kiosk", body: "Blood pressure, glucose, SpO₂ and weight measured and logged on the spot." },
      { icon: "video_call", title: "Doctor on video", body: "A registered doctor consults remotely and issues the prescription." },
      { icon: "badge", title: "Trained health worker", body: "The shopkeeper or a local worker certified to run checks and refer." },
      { icon: "inventory_2", title: "Verified medicine stock", body: "Traceable supply to keep counterfeit and expired medicine off the shelf." },
      { icon: "sync_alt", title: "Linked to SWASTI & Aponjon", body: "Readings and prescriptions flow into the patient's own record." },
    ],
    steps: [
      { title: "Walk in", body: "The patient comes to the same shop they always use." },
      { title: "Measure", body: "The health worker checks vitals at the kiosk; readings go to SWASTI." },
      { title: "Consult", body: "If needed, a doctor joins by video and writes a prescription." },
      { title: "Dispense & follow", body: "Verified medicine is dispensed, and a refill reminder is set." },
    ],
    scenarios: [
      {
        image: "/hero/Hero-7.jpg",
        imageAlt: "হলুদ আলোয় ধান মাড়াইয়ের যন্ত্রে কাজ করছেন কৃষকেরা",
        title: "Harvest-season chest pain",
        without: "A labourer buys an antacid for chest pain and goes back to the field.",
        withProduct: "A blood-pressure reading at the counter is dangerously high; the video doctor refers him the same hour.",
      },
      {
        image: "/sections/Bangladesh.jpg",
        imageAlt: "বাংলাদেশের গ্রামীণ ভূদৃশ্য",
        title: "Insulin through a power cut",
        without: "A night of load-shedding spoils the shop's insulin; patients go without.",
        withProduct: "Solar-backed cold storage keeps the insulin safe, and stock alerts reorder before it runs out.",
      },
    ],
    benefits: [
      { audience: "Villages", icon: "home_health", title: "Care within walking distance", body: "A real check-up in the village, without a day's travel to the upazila." },
      { audience: "Shop owners", icon: "storefront", title: "A better business", body: "New services and trusted status for pharmacies that join the network." },
      { audience: "Public health", icon: "coronavirus", title: "Less antibiotic misuse", body: "Medicine dispensed against a prescription, not on request." },
      { audience: "Economy", icon: "work", title: "Rural jobs & skills", body: "Trained health workers and solar technicians in every union." },
    ],
    growth: [
      { phase: "Phase 1", title: "First pilot", body: "Equip the first shops, starting with Kazaikat village, Nakla, Sherpur.", target: "First pilot pharmacies" },
      { phase: "Phase 2", title: "Union network", body: "Expand across a union with a shared doctor panel and supply chain.", target: "Union-level network" },
      { phase: "Phase 3", title: "District model", body: "A franchise model that shop owners can join and finance.", target: "District franchise" },
      { phase: "Phase 4", title: "One village, one center", body: "A Smart Pharmacy within reach of every village in the country.", target: "Every village covered" },
    ],
    videos: [
      { title: "The village drug shop", titleBn: "গ্রামের ওষুধের দোকান", poster: "/hero/Hero-4.jpg", posterAlt: "জলের উপর কাঠের ঘর", brief: "A day at a rural drug shop — who comes in, and what they are sold." },
      { title: "Inside a Smart Pharmacy", titleBn: "স্মার্ট ফার্মেসির ভেতরে", poster: "/sections/smartpharmacy.png", posterAlt: "স্মার্ট ফার্মেসি", brief: "A tour of the kiosk, the video doctor and solar cold storage." },
      { title: "Kazaikat: the first village", titleBn: "প্রথম গ্রাম", poster: "/sections/Bangladesh.jpg", posterAlt: "গ্রামীণ বাংলাদেশ", brief: "Why the pilot starts in Kazaikat, Nakla, Sherpur — and who it serves." },
    ],
    research: {
      summary: [
        "Studies of rural health-seeking in Bangladesh consistently find the retail drug shop is the first point of contact for common illness. The regulator has licensed over a hundred thousand of them, and researchers estimate a similar number operate without a licence.",
        "The public system's answer — more than 14,000 community clinics, one planned for every 6,000 people — reaches far, but with limited hours and staff. Upgrading the shops people already use complements that network instead of competing with it.",
      ],
      findings: [
        { text: "DGDA had licensed over 100,000 retail drug shops, with an estimated similar number unlicensed.", source: SRC.drugShops },
        { text: "More than 14,000 community clinics operate, planned at one per 6,000 people.", source: SRC.communityClinics },
        { text: "Out-of-pocket payments were 73% of current health expenditure in 2021.", source: SRC.oop },
        { text: "About 59.5% of the population lived in rural areas in 2023.", source: SRC.rural },
      ],
    },
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

/** Accent tokens per product. Literal class strings so Tailwind keeps them. */
export const productAccents: Record<
  ProductAccent,
  { cssVar: string; text: string; bg: string; soft: string; border: string; button: string }
> = {
  green: {
    cssVar: "var(--color-bd-green)",
    text: "text-bd-green",
    bg: "bg-bd-green",
    soft: "bg-bd-green-light",
    border: "border-emerald-200",
    button: "bg-bd-green hover:bg-bd-green-dark",
  },
  orange: {
    cssVar: "var(--color-signal-orange)",
    text: "text-bdorange-600",
    bg: "bg-signal-orange",
    soft: "bg-orange-50",
    border: "border-orange-200",
    button: "bg-signal-orange hover:bg-bdorange-600",
  },
  teal: {
    cssVar: "var(--color-teal-600)",
    text: "text-teal-700",
    bg: "bg-teal-600",
    soft: "bg-teal-50",
    border: "border-teal-200",
    button: "bg-teal-600 hover:bg-teal-700",
  },
};
