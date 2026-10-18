/**
 * Projects built under a service (data/services.ts), shown on that
 * service's page and on a page of their own.
 *
 * A project here is what Kandari-Lab has proposed or built for a client.
 * Its `demo` figures are read off the project itself, and `copy.figures`
 * says where from: a demo's sample shift, or what a client's live site
 * publishes. They are never presented as our own results. The timeline
 * is the plan; only the stages before `timeline.current` are done (all of
 * them for a live site).
 */

import {
  siAndroid,
  siClaude,
  siCss,
  siDocker,
  siEspressif,
  siFastapi,
  siHtml5,
  siJavascript,
  siLucide,
  siMqtt,
  siNetlify,
  siNextdotjs,
  siPostgresql,
  siPython,
  siRaspberrypi,
  siReact,
  siStackblitz,
  siTailwindcss,
  siThreedotjs,
  siTypescript,
  siVercel,
} from "simple-icons";
import type { FilmId } from "@/components/films/motion-film";
import type { Pipeline, TechItem } from "./catalog";

export interface ProjectShot {
  src: string;
  alt: string;
  caption: string;
  /** The screenshot's own size in px, so it keeps its shape while it loads. */
  width: number;
  height: number;
}

export interface Project {
  id: string;
  /** The service it belongs to (data/services.ts `id`). */
  service: string;
  name: string;
  client: string;
  status: string;
  tagline: string;
  summary: string;
  problem: { statement: string; detail: string };
  solution: { statement: string; detail: string };
  /** Its screens or pages, in the order a visitor meets them. */
  modules: { icon: string; label: string; body: string }[];
  tech: TechItem[];
  /** Screenshots; the first runs the full width of the gallery. */
  shots: ProjectShot[];
  /** Figures read off the project; `copy.figures` says where from. */
  demo: { value: string; label: string }[];
  timeline: Pipeline & { notes: string[]; footnote?: string };
  /** The live site or full demo, opened by the "View project" buttons. */
  demoUrl?: string;
  /** Which 3D film explains it (components/films/motion-film.tsx). */
  film: FilmId;
  /** The lines above each section of its page. */
  copy: {
    tech: string;
    film: { lead: string; label: string };
    shots: { title: string; lead: string };
    modules: string;
    figures: { title: string; lead: string };
  };
}

export const projects: Project[] = [
  {
    id: "alliance-dyer",
    service: "automation",
    name: "Alliance Dyer Automation",
    client: "Alliance Automations",
    status: "Proposed, with a working demo",
    demoUrl: "https://alliance-automations-frontend.vercel.app/",
    film: "dye-floor",
    tagline: "A live control room for a fifty-machine dyeing floor.",
    summary:
      "Every dyeing machine already knows what it is doing. The system reads those machine signals and turns five bays and fifty machines into one live picture: what is running, what is late and by how much, which batch is next, and what the operator should do now.",
    problem: {
      statement: "On a dyeing floor, a late batch is usually found out when it is already due.",
      detail:
        "Supervisors walk from machine to machine to learn each one's step and temperature. Delays surface at unload, the next batch waits on whoever remembers it, and nobody sees the whole floor at once.",
    },
    solution: {
      statement: "Read every machine's signals, project each batch's end, and say what needs attention now.",
      detail:
        "Status comes from the machines, not from a clipboard. Delay is the projected end minus the standard target, so an overrun shows while there is still time to act, ranked most urgent first, on the wall, on a tablet at the machine and in the office.",
    },
    modules: [
      { icon: "dashboard", label: "Plant overview", body: "Running, delayed, on hold and output for the whole floor, with a fleet map of all fifty machines by bay." },
      { icon: "tune", label: "Control panel", body: "Live bath temperature, liquor level, pressure, circulation and pump power, and the temperature curve against the recipe." },
      { icon: "inventory_2", label: "Batches", body: "Every batch with its order, shade, weight, start, target unload and projected end." },
      { icon: "calendar_month", label: "Schedule", body: "The next batch for each machine, ready before the current one comes out." },
      { icon: "speed", label: "Efficiency", body: "Utilisation, right-first-time, energy and water per kilogram, hour by hour." },
      { icon: "smart_toy", label: "AI agents", body: "Agents that rank what needs attention and suggest the next best action on each machine." },
      { icon: "groups", label: "CRM", body: "Buyers and orders linked to the batches being dyed for them." },
      { icon: "tv", label: "TV wallboard", body: "The floor at a glance for everyone: bays, machines, live steps and a running alert ticker." },
      { icon: "tablet_android", label: "Operator tablet", body: "Only the commands that fit the machine right now: raise hold, record a shade check, add a note, call a supervisor." },
    ],
    tech: [
      { logo: siNextdotjs, role: "Demo app", layer: "demo" },
      { logo: siReact, role: "Screens", layer: "demo" },
      { logo: siTypescript, role: "Demo code", layer: "demo" },
      { logo: siTailwindcss, role: "Styling", layer: "demo" },
      { logo: siVercel, role: "Demo hosting", layer: "demo" },
      { logo: siEspressif, role: "Machine sensors", layer: "proposed" },
      { logo: siRaspberrypi, role: "Bay gateway", layer: "proposed" },
      { logo: siMqtt, role: "Machine signals", layer: "proposed" },
      { logo: siPython, role: "Delay engine", layer: "proposed" },
      { logo: siFastapi, role: "Plant API", layer: "proposed" },
      { logo: siPostgresql, role: "Batch history", layer: "proposed" },
      { logo: siDocker, role: "Deployment", layer: "proposed" },
      { logo: siClaude, role: "AI agents", layer: "proposed" },
      { logo: siAndroid, role: "Operator tablet", layer: "proposed" },
    ],
    shots: [
      {
        src: "/projects/alliance-dyer/wallboard.png",
        width: 1918,
        height: 909,
        alt: "ডাইং ফ্লোরের লাইভ মনিটরিং ওয়ালবোর্ড: চলমান, বিলম্বিত ও সম্পন্ন মেশিনের সংখ্যা, পাঁচটি বে, প্রতিটি মেশিনের ধাপ আর ঘণ্টাভিত্তিক উৎপাদন",
        caption: "TV wallboard: every machine's live step, the bays, the alert ticker and output by hour.",
      },
      {
        src: "/projects/alliance-dyer/overview.png",
        width: 1911,
        height: 782,
        alt: "প্ল্যান্ট ওভারভিউ: পঞ্চাশটি মেশিনের ফ্লিট ম্যাপ আর কোন মেশিনে এখনই নজর দরকার তার তালিকা",
        caption: "Plant overview: the fleet map by bay, and what needs you now, most urgent first.",
      },
      {
        src: "/projects/alliance-dyer/control-panel.png",
        width: 1908,
        height: 815,
        alt: "একটি মেশিনের কন্ট্রোল প্যানেল: তাপমাত্রা, লিকার লেভেল, চাপ, সার্কুলেশন ও পাম্প পাওয়ারের গেজ, রেসিপির সঙ্গে তাপমাত্রার রেখা আর অপারেটরের কমান্ড",
        caption: "Control panel: live gauges, the temperature curve against the recipe, and the operator's commands.",
      },
    ],
    demo: [
      { value: "50", label: "machines in five bays" },
      { value: "53,060 kg", label: "produced in the sample shift" },
      { value: "113", label: "batches completed" },
      { value: "93.8%", label: "utilisation of available machines" },
      { value: "95.6%", label: "right first time" },
      { value: "0.84 kWh/kg", label: "energy, with 65 L/kg of water" },
    ],
    timeline: {
      stages: ["Discover", "Demo", "Proposal", "Pilot bay", "All five bays"],
      current: 2,
      note: "The demo is built and the project is proposed; nothing is installed on the floor yet. The stages after the proposal are the plan.",
      footnote: "Dates are set with the client when the proposal is agreed.",
      notes: [
        "Map the floor: fifty machines, five bays, and the signals each one gives.",
        "Overview, control panel, wallboard and tablet, running on a sample shift.",
        "Scope, hardware and cost agreed with the dyeing house.",
        "Connect one bay of ten machines and run it beside today's process.",
        "Roll out to the whole floor, train the operators and hand over.",
      ],
    },
    copy: {
      tech: "The working demo runs on Next.js, React, TypeScript, Tailwind CSS and Vercel. The rest is the stack we propose for the floor, from the machine sensors to the operator's tablet.",
      film: {
        lead: "The machines report, the gateway passes their signals on, the store keeps every batch, and the displays show what to do next.",
        label: "A film of the system: dyeing machines lit by their status send signals through a gateway into the store, which feeds the wallboard and the operator's tablet.",
      },
      shots: { title: "Inside the demo", lead: "Screens from the working demo, running on a sample shift." },
      modules: "Nine screens, one for each person on the floor and in the office.",
      figures: { title: "What the demo shows", lead: "Figures from the demo's sample shift: what the system displays, not results from a live floor." },
    },
  },
  {
    id: "biluibaba-study-insights",
    service: "development",
    name: "Biluibaba × Study Insights",
    client: "Biluibaba and Study Insights",
    status: "Live",
    demoUrl: "https://stirring-brigadeiros-a9a9fd.netlify.app/",
    film: "biluibaba",
    tagline: "One site for two Dhaka ventures: pet care and study abroad.",
    summary:
      "Biluibaba and Study Insights share one team and one office in Dhaka: one cares for pets, the other guides students abroad. Their site tells both stories side by side and lays the whole financial plan open, chart by chart.",
    problem: {
      statement: "Two young companies, one shared team, and investors who need the whole picture.",
      detail:
        "The two ventures share staff, an office and a budget. Told apart, each looks smaller than it is, and the money behind them is hard to follow from a spreadsheet.",
    },
    solution: {
      statement: "One site that tells both stories and shows where every taka goes.",
      detail:
        "Each company gets its own page and services, the team is shown once, and the financial model is drawn as charts: the BDT 88 lakh commitment, the monthly operating rhythm and the one-time setup, with every line item behind them.",
    },
    modules: [
      { icon: "home", label: "Home", body: "Both promises in one line each, over a moving wave of light, with the key numbers below." },
      { icon: "apartment", label: "Companies", body: "The two ventures side by side: what each does and who it serves." },
      { icon: "pets", label: "Biluibaba", body: "E-commerce, vet service, pet delivery and adoption, with the purpose behind them." },
      { icon: "school", label: "Study Insights", body: "Seven education services, from choosing a university to the visa." },
      { icon: "groups", label: "Team", body: "The ten-person team the two ventures share." },
      { icon: "donut_large", label: "Financials", body: "Where the BDT 88 lakh goes: allocation, the monthly rhythm and the one-time setup." },
    ],
    tech: [
      { logo: siHtml5, role: "Pages", layer: "built" },
      { logo: siCss, role: "Design system", layer: "built" },
      { logo: siJavascript, role: "Charts and motion", layer: "built" },
      { logo: siThreedotjs, role: "Hero wave", layer: "built" },
      { logo: siNetlify, role: "Hosting", layer: "built" },
    ],
    shots: [
      {
        src: "/projects/biluibaba-study-insights/home.png",
        width: 1910,
        height: 758,
        alt: "বিলুইবাবা ও স্টাডি ইনসাইটসের হোম পেজ: অন্ধকার পটভূমিতে আলোর ঢেউ, দুই কোম্পানির প্রতিশ্রুতি আর মূল সংখ্যা",
        caption: "Home: both promises over the wave of light, with the key numbers below.",
      },
      {
        src: "/projects/biluibaba-study-insights/companies.png",
        width: 1904,
        height: 910,
        alt: "বিলুইবাবার পেজ: ই-কমার্স, ভেট সার্ভিস, পেট ডেলিভারি ও পেট অ্যাডপশনের কার্ড আর কোম্পানির উদ্দেশ্য",
        caption: "Biluibaba: four pet-care services and the purpose behind them.",
      },
      {
        src: "/projects/biluibaba-study-insights/financials.png",
        width: 812,
        height: 790,
        alt: "আর্থিক পরিকল্পনার চার্ট: ৮৮ লাখ টাকার বণ্টন, মাসিক খরচ আর এককালীন খরচের খাত",
        caption: "Financials: the BDT 88 lakh plan, drawn as charts.",
      },
    ],
    demo: [
      { value: "2", label: "companies, one shared team" },
      { value: "4", label: "pet-care services" },
      { value: "7", label: "education services" },
      { value: "BDT 88 L", label: "total commitment in the plan" },
      { value: "73.6%", label: "of monthly spending is salaries" },
      { value: "89", label: "line items in the financial model" },
    ],
    timeline: {
      stages: ["Brief", "Design", "Build", "Check", "Launch"],
      current: 5,
      note: "The site is live at its own address; every stage is finished.",
      notes: [
        "Two companies, one team, one budget: what an investor needs to see.",
        "A dark home with a wave of light, and calm cream pages for the detail.",
        "The pages, the charts and the moving wave, in plain HTML, CSS and JavaScript.",
        "Every chart checked against the financial model.",
        "Live on Netlify.",
      ],
    },
    copy: {
      tech: "Built with plain HTML, CSS and JavaScript, with a Three.js wave on the home page.",
      film: {
        lead: "A pet parent and a student each find what they need, and both companies sit on one site, backed by one plan.",
        label: "A film of the site: a pet parent with a dog and a student in a graduation cap each send their needs to their company's page, and both pages feed one shared site with a turning chart of the financial plan, over a wave of light.",
      },
      shots: { title: "Inside the site", lead: "Screens from the live site." },
      modules: "Six pages, one for each thing a visitor or an investor wants to know.",
      figures: { title: "What the site shows", lead: "Figures as the site publishes them, from the companies' own plan." },
    },
  },
  {
    id: "autolink",
    service: "development",
    name: "AutoLink",
    client: "AutoLink Integrated Technologies",
    status: "Live, with its admin system",
    demoUrl: "https://www.auto-bd.com/",
    film: "autolink",
    tagline: "A parts store and a back office for hard-to-find industrial electronics.",
    summary:
      "AutoLink sources obsolete and hard-to-find industrial electronics and automation parts. Engineers search by part number and ask for a price on the site; the admin system turns each request into a quotation, an order, an invoice and a challan, with stock and staff in the same place.",
    problem: {
      statement: "A plant waiting on one discontinued part loses production every hour.",
      detail:
        "Engineers search by part number, and many of those parts are no longer made. Quotes went back and forth by phone and WhatsApp, and every order then needed its own invoice, challan and follow-up.",
    },
    solution: {
      statement: "A catalogue that answers by part number, and one back office for everything after.",
      detail:
        "Engineers search by keyword, part number or SKU and ask for a price; the team confirms stock and sends a firm quote. Accepted quotes become orders, and each order carries its payment, invoice and challan through to completion.",
    },
    modules: [
      { icon: "search", label: "Part search", body: "Search by keyword, part number or SKU, across brands and manufacturers." },
      { icon: "inventory_2", label: "Product page", body: "Condition, warranty, other part numbers it is known by, and the repair route." },
      { icon: "request_quote", label: "Price requests", body: "Ask for a price or add parts to a request list; no price shows until stock is confirmed." },
      { icon: "build", label: "Repair & exchange", body: "Send a part for repair, or exchange it for a bench-tested one." },
      { icon: "receipt_long", label: "Orders", body: "Accepted quotes, each with its payment, invoice and challan status." },
      { icon: "description", label: "Invoices & challans", body: "Prepared from the order, so the paperwork matches what was sold." },
      { icon: "warehouse", label: "Stock", body: "What is on the shelf, with a warning when a line runs low." },
      { icon: "badge", label: "Staff & leave", body: "Sub-admin accounts with access by area, tasks, daily reports and a leave calendar." },
      { icon: "mail", label: "Enquiries", body: "Contact requests and emails answered from one inbox." },
    ],
    tech: [
      { logo: siNextdotjs, role: "Store and admin", layer: "built" },
      { logo: siReact, role: "Screens", layer: "built" },
      { logo: siTailwindcss, role: "Styling", layer: "built" },
      { logo: siVercel, role: "Hosting", layer: "built" },
    ],
    shots: [
      {
        src: "/projects/autolink/home.png",
        width: 1910,
        height: 701,
        alt: "অটোলিংকের হোম পেজ: পার্ট নম্বর দিয়ে খোঁজার বার, অপ্রচলিত যন্ত্রাংশ খুঁজে দেওয়ার প্রতিশ্রুতি আর দাম জানতে চাওয়ার বোতাম",
        caption: "Home: search by part number, and ask for a price.",
      },
      {
        src: "/projects/autolink/product.png",
        width: 1895,
        height: 917,
        alt: "একটি সিমেন্স কন্টাক্টরের পণ্য পেজ: অবস্থা, ওয়ারেন্টি, বিকল্প পার্ট নম্বর আর দাম জানতে চাওয়ার ঘর",
        caption: "Product page: condition, warranty and a firm-quote request.",
      },
      {
        src: "/projects/autolink/orders.png",
        width: 1913,
        height: 904,
        alt: "অ্যাডমিন প্যানেলের অর্ডার পেজ: পেমেন্ট, ইনভয়েস ও চালানের অবস্থাসহ অর্ডারের তালিকা",
        caption: "Admin, orders: payment, invoice and challan for every order.",
      },
      {
        src: "/projects/autolink/employees.png",
        width: 1919,
        height: 677,
        alt: "অ্যাডমিন প্যানেলের কর্মী ও ছুটির পেজ: সাব-অ্যাডমিন অ্যাকাউন্ট, কাজ ভাগ করা আর ছুটির ক্যালেন্ডার",
        caption: "Admin, staff and leave: accounts, tasks and the leave calendar.",
      },
    ],
    demo: [
      { value: "42,000+", label: "parts catalogued" },
      { value: "4 hours", label: "working-hour quote turnaround" },
      { value: "2 years", label: "AutoLink warranty" },
      { value: "100+", label: "countries shipped to" },
      { value: "ISO 9001", label: "2015 quality system" },
      { value: "24/7", label: "engineers on WhatsApp" },
    ],
    timeline: {
      stages: ["Brief", "Design", "Build", "Check", "Launch"],
      current: 5,
      note: "The store and its admin system are live; every stage is finished.",
      notes: [
        "How engineers look for parts, and how a quote becomes an order.",
        "A store that leads with the part number, and a back office built round the order.",
        "Catalogue, price requests, and the admin: orders, paperwork, stock and staff.",
        "Orders run through from request to completed challan.",
        "Live at auto-bd.com, on Vercel.",
      ],
    },
    copy: {
      tech: "Built with Next.js, React and Tailwind CSS, and hosted on Vercel: the store and the admin system alike.",
      film: {
        lead: "An engineer looks for a discontinued part. The catalogue finds it, the quote becomes an order with its paperwork, and the part ships.",
        label: "A film of AutoLink: an engineer sends a part number from his phone, one box in a wall of parts lights up and lifts out, a quote is stamped, the order joins the admin table, and a van carries the part to a turning globe.",
      },
      shots: { title: "Inside the site", lead: "The live store, and the admin system behind it." },
      modules: "The store for engineers, and the back office for the team.",
      figures: { title: "What the site states", lead: "Figures AutoLink publishes on its own site." },
    },
  },
  {
    id: "study-insights",
    service: "development",
    name: "Study Insights",
    client: "Study-Insights",
    status: "Live",
    demoUrl: "https://study-insights-landi-jieb.bolt.host/",
    film: "study-insights",
    tagline: "An honest front door for studying abroad.",
    summary:
      "Study Insights is an educational consultancy in Dhaka that guides students from choosing a country and a university to the visa. Its site leads with one promise, “We don't sell dreams, we build trust”, and lays out every service and scholarship plainly.",
    problem: {
      statement: "Students heading abroad often meet agents who sell a dream and hide the cost.",
      detail:
        "Promises of a sure admission or visa, and fees that appear late, have made families wary of every consultancy, even the honest ones.",
    },
    solution: {
      statement: "Show every service and every scholarship, with the real terms, up front.",
      detail:
        "Eight services from university selection to pre-departure support, the scholarships it manages with their amounts, coverage and deadlines, and one clear way to start: apply now, or ask on WhatsApp.",
    },
    modules: [
      { icon: "travel_explore", label: "University selection", body: "Universities matched to the student's profile, goals and budget." },
      { icon: "description", label: "Applications", body: "Statement of purpose, recommendation letters, CV and documents." },
      { icon: "flight_takeoff", label: "Visa guidance", body: "Realistic timelines, document checklists and interview practice." },
      { icon: "workspace_premium", label: "Scholarships", body: "Erasmus+, DAAD and more, each with its amount, coverage and deadline." },
      { icon: "school", label: "Erasmus+ programmes", body: "Exchange and degree programmes across European universities." },
      { icon: "work", label: "Career counselling", body: "Post-study work, residency pathways and long-term plans." },
      { icon: "luggage", label: "Pre-departure", body: "Accommodation, travel, banking and SIM cards, before the flight." },
      { icon: "handshake", label: "Partnerships", body: "Recruitment and exchange channels with universities and agencies." },
      { icon: "chat", label: "Apply and ask", body: "Apply now from any page, or ask straight away on WhatsApp." },
    ],
    tech: [
      { logo: siNextdotjs, role: "Site", layer: "built" },
      { logo: siReact, role: "Screens", layer: "built" },
      { logo: siTailwindcss, role: "Styling", layer: "built" },
      { logo: siLucide, role: "Icons", layer: "built" },
      { logo: siStackblitz, role: "Built and hosted on Bolt", layer: "built" },
    ],
    shots: [
      {
        src: "/projects/study-insights/home.png",
        width: 1909,
        height: 907,
        alt: "স্টাডি ইনসাইটসের হোম পেজ: “আমরা স্বপ্ন বিক্রি করি না, আস্থা গড়ি” শিরোনাম, দেশ, স্কলারশিপ, শিক্ষার্থী ও বিশ্ববিদ্যালয়ের সংখ্যা",
        caption: "Home: the promise first, then the numbers.",
      },
      {
        src: "/projects/study-insights/scholarships.png",
        width: 1919,
        height: 903,
        alt: "স্কলারশিপের পেজ: ইরাসমাস প্লাস, ডাড, ফিনল্যান্ড ও সুইডেনের স্কলারশিপ, প্রতিটির অঙ্ক, সুবিধা ও সময়সীমা",
        caption: "Scholarships: amount, coverage, eligibility and deadline for each.",
      },
      {
        src: "/projects/study-insights/services.png",
        width: 1919,
        height: 893,
        alt: "সেবার পেজ: বিশ্ববিদ্যালয় বাছাই থেকে যাত্রার প্রস্তুতি পর্যন্ত আটটি সেবার কার্ড",
        caption: "Services: eight, from the first question to the first day on campus.",
      },
    ],
    demo: [
      { value: "1,000+", label: "students placed" },
      { value: "50+", label: "countries" },
      { value: "98%", label: "visa success" },
      { value: "200+", label: "scholarships" },
      { value: "500+", label: "partner universities" },
      { value: "8", label: "services, start to finish" },
    ],
    timeline: {
      stages: ["Brief", "Design", "Build", "Check", "Launch"],
      current: 5,
      note: "The site is live at its own address; every stage is finished.",
      notes: [
        "What makes a family trust a consultancy, and what makes them leave.",
        "A warm, open page that shows every service and scholarship.",
        "Services, scholarships, team and community, with apply and WhatsApp.",
        "Pages, forms and links checked before going live.",
        "Live, built and hosted on Bolt.",
      ],
    },
    copy: {
      tech: "Built with Next.js, React and Tailwind CSS, with Lucide icons, and hosted on Bolt.",
      film: {
        lead: "A student and a counsellor choose a country together. The documents go in, the visa is stamped, and the student flies to campus.",
        label: "A film of the student journey: a student with a counsellor picks a country on a turning globe, documents fly into a folder, a passport is stamped, and a plane carries the student to a university campus.",
      },
      shots: { title: "Inside the site", lead: "Screens from the live site." },
      modules: "Eight services and one clear way to start.",
      figures: { title: "What the site states", lead: "Figures Study Insights publishes on its own site." },
    },
  },
];

export const projectsFor = (service: string) => projects.filter((p) => p.service === service);

export const getProject = (service: string, id: string) => projects.find((p) => p.service === service && p.id === id);
