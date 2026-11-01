/**
 * BD Guide's detail pages (/bangladesh/government/<slug>), laid out after
 * usa.gov's topic pages such as usa.gov/branches-of-government: a card's
 * "Explore" opens one, it explains the topic in plain words, and its
 * button goes straight to the official government site.
 *
 * Written from the Constitution, the national portal (bangladesh.gov.bd)
 * and the offices' own sites, 1 November 2026. Offices are named, people
 * are not, and amounts, fees and dates that change every budget are left
 * to the official page the button opens.
 */
import { PORTAL, category, type GovLink } from "./bd-gov.ts";

/** Which card band a page belongs to: its breadcrumb and its side menu. */
export type DetailSection = "topics" | "about" | "benefits";

export interface DetailPart {
  title: string;
  text?: string;
  /** Shown as a numbered list when the order matters, else as bullets. */
  points?: string[];
  numbered?: boolean;
  links?: GovLink[];
}

export interface GovDetail {
  slug: string;
  title: string;
  section: DetailSection;
  icon: string;
  symbol: string;
  /** One line for search engines and link previews. */
  summary: string;
  intro: string;
  /** The page's main button: the office that runs the service, and its site. */
  official: { office: string; href: string; site: string };
  parts: DetailPart[];
  /** A number worth calling for this topic, if there is one. */
  call?: { tel: string; label: string };
}

export const UPDATED = "1 November 2026";

export const DETAILS: GovDetail[] = [
  /* ── All topics and services ─────────────────────────────────────── */
  {
    slug: "voting-and-elections",
    title: "Voting and elections",
    section: "topics",
    icon: "hand-voting",
    symbol: "how_to_vote",
    summary: "How to register to vote, get or correct your national ID card, and reach the Election Commission.",
    intro: "The Bangladesh Election Commission runs national and local elections, keeps the voter list and issues the national identity (NID) card that most government services ask for.",
    official: { office: "Bangladesh Election Commission", href: "https://www.ecs.gov.bd/", site: "ecs.gov.bd" },
    parts: [
      {
        title: "Who can vote",
        text: "Any citizen of Bangladesh aged 18 or over whose name is on the voter list can vote in the constituency where they are registered.",
      },
      {
        title: "Register to vote and get your NID card",
        text: "Registering as a voter and getting your national ID card are one process. The Election Commission updates the voter list regularly and takes your photo, fingerprints and iris scan at your local election office.",
        points: [
          "Bring your birth registration certificate and proof of address, and your educational certificate if you have one",
          "Enrol at your upazila or thana election office during an update drive, or apply online first",
          "Collect your card, or download your NID copy online once it is ready",
        ],
        numbered: true,
      },
      {
        title: "Correct or replace your NID card",
        text: "You can apply online to correct your name, date of birth or address, or to replace a lost card. Corrections need supporting documents, and a fee applies to some changes.",
        links: [{ label: "NID services from the Election Commission", href: "https://services.nidw.gov.bd/" }],
      },
    ],
  },
  {
    slug: "disasters-and-emergencies",
    title: "Disasters and emergencies",
    section: "topics",
    icon: "ambulance",
    symbol: "emergency",
    summary: "Emergency numbers, cyclone and flood warnings, shelters and disaster relief in Bangladesh.",
    intro: "In any emergency, call 999 for police, fire service or an ambulance. It is free from every phone in Bangladesh. For cyclones, floods and other disasters, the government issues warnings, opens shelters and gives relief to affected families.",
    official: { office: "Department of Disaster Management", href: "https://ddm.gov.bd/", site: "ddm.gov.bd" },
    call: { tel: "999", label: "National emergency service" },
    parts: [
      {
        title: "Stay ahead of a cyclone or flood",
        points: [
          "The Bangladesh Meteorological Department issues weather forecasts and cyclone signals",
          "The Flood Forecasting and Warning Centre publishes river levels and flood warnings",
          "Cyclone Preparedness Programme volunteers spread warnings and help people reach shelters on the coast",
        ],
        links: [
          { label: "Bangladesh Meteorological Department", href: "https://www.bmd.gov.bd/" },
          { label: "Flood Forecasting and Warning Centre", href: "http://www.ffwc.gov.bd/" },
        ],
      },
      {
        title: "Relief after a disaster",
        text: "The Ministry of Disaster Management and Relief and the district and upazila administrations give food, cash and shelter help to affected families. Ask your Union Parishad or upazila office how to be included.",
        links: [{ label: "Ministry of Disaster Management and Relief", href: "https://modmr.gov.bd/" }],
      },
      {
        title: "Fire and rescue",
        text: "The Fire Service and Civil Defence answers fires, building collapses and water rescues, and trains volunteers in every district.",
        links: [{ label: "Fire Service and Civil Defence", href: "https://fireservice.gov.bd/" }],
      },
    ],
  },
  {
    slug: "education",
    title: "Education",
    section: "topics",
    icon: "school",
    symbol: "school",
    summary: "School and college admissions, free textbooks, stipends and education services in Bangladesh.",
    intro: "The Ministry of Education and the Ministry of Primary and Mass Education run the country's schools, colleges and madrasahs. Primary education is free and compulsory, and every student gets free textbooks at the start of the year.",
    official: { office: "Ministry of Education", href: "https://moedu.gov.bd/", site: "moedu.gov.bd" },
    parts: [
      {
        title: "School and college admissions",
        points: [
          "Primary schools enrol children in their own catchment area",
          "Admission to government secondary schools is by lottery, announced by the Directorate of Secondary and Higher Education",
          "Class eleven admissions to colleges are made online after the SSC results",
          "Public universities hold their own admission tests",
        ],
        links: [
          { label: "Directorate of Primary Education", href: "https://dpe.gov.bd/" },
          { label: "Directorate of Secondary and Higher Education", href: "https://dshe.gov.bd/" },
          { label: "University Grants Commission", href: "https://ugc.gov.bd/" },
        ],
      },
      {
        title: "Textbooks and curriculum",
        text: "The National Curriculum and Textbook Board writes the curriculum and prints the free textbooks, and publishes every book online.",
        links: [{ label: "National Curriculum and Textbook Board", href: "https://nctb.gov.bd/" }],
      },
      {
        title: "Help with costs",
        text: "Stipends help students from poorer families stay in school, from primary to degree level.",
        links: [{ label: "Education stipends", href: "/bangladesh/government/education-stipends" }],
      },
    ],
  },
  {
    slug: "exam-results",
    title: "Exam results",
    section: "topics",
    icon: "file-pencil",
    symbol: "grading",
    summary: "Find SSC, HSC and equivalent public examination results from every education board.",
    intro: "Bangladesh's education boards publish the results of the public examinations online on the day they are announced. You need your roll number, registration number, board and exam year.",
    official: { office: "Education boards of Bangladesh", href: "http://www.educationboardresults.gov.bd/", site: "educationboardresults.gov.bd" },
    parts: [
      {
        title: "Which results you can find",
        points: [
          "SSC (Secondary School Certificate) and its madrasah and vocational equivalents",
          "HSC (Higher Secondary Certificate) and its madrasah and vocational equivalents",
          "Results for each student, and results by institution",
        ],
      },
      {
        title: "How to check a result",
        points: ["Open the education boards' results site", "Choose the exam, the year and your board", "Enter your roll and registration numbers"],
        numbered: true,
      },
      {
        title: "Boards that set their own exams",
        text: "Nine general education boards, the Madrasah Education Board and the Technical Education Board each publish their own notices, re-scrutiny dates and certificates.",
        links: [
          { label: "Bangladesh Madrasah Education Board", href: "https://bmeb.gov.bd/" },
          { label: "Bangladesh Technical Education Board", href: "https://bteb.gov.bd/" },
        ],
      },
    ],
  },
  {
    slug: "health",
    title: "Health",
    section: "topics",
    icon: "heart-beat",
    symbol: "health_and_safety",
    summary: "Government hospitals, free community care, vaccinations and the Shasthyo Batayon health line.",
    intro: "The government runs a health service that reaches every village: community clinics, union health centres, upazila health complexes, district hospitals and medical college hospitals. Care at the first levels is free or very low cost.",
    official: { office: "Directorate General of Health Services", href: "https://dghs.gov.bd/", site: "dghs.gov.bd" },
    call: { tel: "16263", label: "Shasthyo Batayon, the national health line" },
    parts: [
      {
        title: "Where to get care",
        points: [
          "Community clinics for basic care, medicines and advice near your home",
          "Upazila health complexes for doctors, maternity care and emergencies",
          "District and medical college hospitals for specialist treatment",
        ],
      },
      {
        title: "Free vaccines for children and mothers",
        text: "The Expanded Programme on Immunization gives children and pregnant women free vaccines at health centres and outreach sessions across the country.",
      },
      {
        title: "Advice by phone",
        text: "Call 16263 to speak to a doctor, at any time of day.",
        links: [{ label: "Ministry of Health and Family Welfare", href: "https://mohfw.gov.bd/" }],
      },
    ],
  },
  {
    slug: "agriculture",
    title: "Agriculture",
    section: "topics",
    icon: "growing-plant",
    symbol: "agriculture",
    summary: "Farming advice, input support, crop varieties and market prices from the government.",
    intro: "The Department of Agricultural Extension has an office in every upazila and field officers in every union. They advise farmers on crops, pests and fertiliser, and deliver the government's help to farmers.",
    official: { office: "Department of Agricultural Extension", href: "https://dae.gov.bd/", site: "dae.gov.bd" },
    call: { tel: "16123", label: "Krishi call centre" },
    parts: [
      {
        title: "Support for farmers",
        points: [
          "An agricultural input assistance card that lets registered farmers receive subsidies and help",
          "Subsidised fertiliser, and seeds and machinery support through the upazila agriculture office",
          "Free advice from your sub-assistant agriculture officer",
        ],
      },
      {
        title: "New varieties and prices",
        text: "Research institutes release rice and crop varieties suited to floods, salt and drought. The Department of Agricultural Marketing publishes market prices.",
        links: [
          { label: "Bangladesh Rice Research Institute", href: "https://brri.gov.bd/" },
          { label: "Department of Agricultural Marketing", href: "https://dam.gov.bd/" },
        ],
      },
    ],
  },
  {
    slug: "fisheries-and-livestock",
    title: "Fisheries and livestock",
    section: "topics",
    icon: "paper-boat",
    symbol: "set_meal",
    summary: "Services for fishers, fish farmers and livestock keepers, from registration to veterinary care.",
    intro: "The Department of Fisheries and the Department of Livestock Services have offices in every upazila. They advise farmers, register fishers, protect breeding seasons and treat animals.",
    official: { office: "Ministry of Fisheries and Livestock", href: "https://mofl.gov.bd/", site: "mofl.gov.bd" },
    parts: [
      {
        title: "For fishers",
        points: [
          "Register as a fisher and get a fisher ID card",
          "Registered fishers can receive food support during fishing bans that protect hilsa and other fish",
          "Advice on fish farming from the upazila fisheries office",
        ],
        links: [{ label: "Department of Fisheries", href: "https://fisheries.gov.bd/" }],
      },
      {
        title: "For livestock keepers",
        text: "Upazila livestock offices give vaccines, veterinary treatment and advice on cattle, goats and poultry.",
        links: [{ label: "Department of Livestock Services", href: "https://dls.gov.bd/" }],
      },
    ],
  },
  {
    slug: "jobs-and-recruitment",
    title: "Jobs and recruitment",
    section: "topics",
    icon: "briefcase",
    symbol: "work",
    summary: "Government job circulars, the BCS exam and how recruitment works in Bangladesh.",
    intro: "Government jobs are advertised in public circulars. The Bangladesh Public Service Commission recruits the civil service through the BCS examination, and ministries and departments recruit for other posts.",
    official: { office: "Bangladesh Public Service Commission", href: "https://bpsc.gov.bd/", site: "bpsc.gov.bd" },
    parts: [
      {
        title: "The BCS examination",
        text: "The Bangladesh Civil Service (BCS) exam recruits cadre officers in three stages.",
        points: ["Preliminary test", "Written examination", "Viva voce (interview)"],
        numbered: true,
      },
      {
        title: "Other government jobs",
        text: "Ministries, departments, banks and local offices publish their own circulars. Most applications are made online, and each circular sets out who can apply, the fee and the deadline.",
        links: [{ label: "Job and tender announcements on the national portal", href: `${PORTAL}/pages/job-tender-announcements` }],
      },
      {
        title: "Beware of fraud",
        text: "Government jobs are never sold. Apply only through the circular's official link, and report anyone who asks for money for a post.",
      },
    ],
  },
  {
    slug: "passports-and-immigration",
    title: "Passport, visa and immigration",
    section: "topics",
    icon: "globe",
    symbol: "flight_takeoff",
    summary: "Apply for or renew a Bangladeshi e-passport, and find visa and immigration services.",
    intro: "Bangladesh issues e-passports with a chip that holds your details. You apply online, pay the fee, then give your fingerprints, photo and iris scan at a passport office.",
    official: { office: "Department of Immigration and Passports", href: "https://www.epassport.gov.bd/", site: "epassport.gov.bd" },
    call: { tel: "16445", label: "Passport helpline" },
    parts: [
      {
        title: "Apply for an e-passport",
        points: [
          "Fill in the application online",
          "Pay the fee online or at a bank; it depends on the number of pages, the validity and the delivery speed",
          "Book an appointment and give your biometrics at the passport office",
          "Track your application and collect your passport",
        ],
        numbered: true,
      },
      {
        title: "What to bring",
        text: "Your national ID card, or your birth registration certificate if you are under 18, along with any documents the online checklist asks for.",
      },
      {
        title: "Visas for visitors",
        text: "Foreign nationals apply for a Bangladesh visa at a Bangladesh mission abroad, and some can get a visa on arrival.",
        links: [{ label: "Department of Immigration and Passports", href: "https://dip.gov.bd/" }],
      },
    ],
  },
  {
    slug: "income-tax",
    title: "Income tax",
    section: "topics",
    icon: "coins",
    symbol: "receipt_long",
    summary: "Get a taxpayer number, file your income tax return online and pay tax in Bangladesh.",
    intro: "The National Board of Revenue collects income tax, VAT and customs duty. If your income is above the tax-free limit, or you need a return for a loan, a licence or a contract, you must file a return every year.",
    official: { office: "National Board of Revenue", href: "https://nbr.gov.bd/", site: "nbr.gov.bd" },
    parts: [
      {
        title: "Get your e-TIN",
        text: "A Taxpayer Identification Number (e-TIN) is free and takes a few minutes online with your NID.",
        links: [{ label: "Register for an e-TIN", href: "https://secure.incometax.gov.bd/" }],
      },
      {
        title: "File your return",
        text: "The tax year runs from July to June. Most individuals file by Tax Day, usually 30 November, and many can file online.",
        links: [{ label: "File your return online (e-return)", href: "https://etaxnbr.gov.bd/" }],
      },
      {
        title: "Help with your taxes",
        text: "Your circle's tax office can help, and tax fairs and help desks open during return season.",
      },
    ],
  },
  {
    slug: "utility-bills",
    title: "Utility bills",
    section: "topics",
    icon: "outlet-type-g",
    symbol: "bolt",
    summary: "Pay electricity, gas and water bills online, and reach the power and gas utilities.",
    intro: "Electricity, gas and water are supplied by government companies and utilities in each area. You can pay most bills with mobile banking, online banking or at a bank, and recharge prepaid meters the same way.",
    official: { office: "Bangladesh National Portal", href: category("69a5597fc4774958d7c92fda"), site: "bangladesh.gov.bd" },
    call: { tel: "16999", label: "Power Division services" },
    parts: [
      {
        title: "Pay a bill",
        points: [
          "Find your account or meter number on your bill",
          "Pay through your mobile financial service, your bank's app or the utility's own site",
          "Keep the transaction ID as your receipt",
        ],
        numbered: true,
      },
      {
        title: "New connections and complaints",
        text: "Apply for a new connection or report a fault to the utility that serves your area. The Power Division and the Energy and Mineral Resources Division oversee them.",
        links: [
          { label: "Power Division", href: "https://powerdivision.gov.bd/" },
          { label: "Bangladesh Power Development Board", href: "https://bpdb.gov.bd/" },
          { label: "Energy and Mineral Resources Division", href: "https://emrd.gov.bd/" },
        ],
      },
    ],
  },
  {
    slug: "land-services",
    title: "Land services",
    section: "topics",
    icon: "image-mountain",
    symbol: "landscape",
    summary: "Land records, e-mutation, land development tax and the smart land service.",
    intro: "The Ministry of Land keeps the country's land records and runs its land services online: you can search records, apply for mutation and pay land development tax without visiting an office.",
    official: { office: "Ministry of Land", href: "https://land.gov.bd/", site: "land.gov.bd" },
    call: { tel: "16122", label: "Smart land service" },
    parts: [
      {
        title: "Land records",
        text: "Search and order certified copies of khatians (records of rights) and mouza maps online.",
        links: [{ label: "e-Porcha land records", href: "https://eporcha.gov.bd/" }],
      },
      {
        title: "Mutation (namjari)",
        text: "When you buy or inherit land, apply for mutation so the record shows you as the owner. Applications are made online and heard by the assistant commissioner (land).",
        links: [{ label: "Apply for e-mutation", href: "https://mutation.land.gov.bd/" }],
      },
      {
        title: "Land development tax",
        text: "Pay your yearly land development tax online and download the receipt.",
        links: [{ label: "Pay land development tax", href: "https://ldtax.gov.bd/" }],
      },
    ],
  },
  {
    slug: "transport-and-vehicles",
    title: "Transport and vehicles",
    section: "topics",
    icon: "road",
    symbol: "directions_car",
    summary: "Driving licences, vehicle registration, fitness and tax tokens from BRTA.",
    intro: "The Bangladesh Road Transport Authority (BRTA) issues driving licences and registers vehicles. Most of its services start online on the BRTA service portal.",
    official: { office: "Bangladesh Road Transport Authority", href: "https://brta.gov.bd/", site: "brta.gov.bd" },
    call: { tel: "16107", label: "BRTA service portal" },
    parts: [
      {
        title: "Get a driving licence",
        points: [
          "Apply for a learner licence online",
          "Pass the written, oral and field driving tests",
          "Give your biometrics and receive your smart card licence",
        ],
        numbered: true,
        links: [{ label: "BRTA service portal", href: "https://bsp.brta.gov.bd/" }],
      },
      {
        title: "Your vehicle",
        text: "Register a new vehicle, transfer ownership, and renew its fitness certificate and tax token at your BRTA circle office or through the service portal.",
      },
    ],
  },
  {
    slug: "business-and-trade",
    title: "Business and trade",
    section: "topics",
    icon: "stock-market",
    symbol: "storefront",
    summary: "Start a business, get a trade licence, register a company and find support for investors.",
    intro: "Starting a business in Bangladesh usually means a trade licence from your local authority, a tax number, and, for a company, registration with the Registrar of Joint Stock Companies. Investors can do much of this in one place through BIDA's One Stop Service.",
    official: { office: "Bangladesh Investment Development Authority", href: "https://bida.gov.bd/", site: "bida.gov.bd" },
    parts: [
      {
        title: "Start a business",
        points: [
          "Get a trade licence from your city corporation, pourashava or union parishad",
          "Register for an e-TIN, and for VAT (a BIN) if your business must charge VAT",
          "Register a company or partnership with the Registrar of Joint Stock Companies",
        ],
        numbered: true,
        links: [
          { label: "Registrar of Joint Stock Companies and Firms", href: "https://roc.gov.bd/" },
          { label: "VAT online services", href: "https://vat.gov.bd/" },
        ],
      },
      {
        title: "Invest and export",
        text: "BIDA's One Stop Service brings investors' licences and permits together online. The Export Promotion Bureau helps exporters reach new markets.",
        links: [{ label: "Export Promotion Bureau", href: "https://epb.gov.bd/" }],
      },
      {
        title: "Support for small businesses",
        text: "The SME Foundation offers loans through partner banks, training and help for small and medium enterprises.",
        links: [{ label: "SME Foundation", href: "https://smef.gov.bd/" }],
      },
    ],
  },
  {
    slug: "laws-and-legal-aid",
    title: "Laws and legal aid",
    section: "topics",
    icon: "book-bookmark",
    symbol: "menu_book",
    summary: "Read the laws of Bangladesh and get free legal aid from the government.",
    intro: "Every act in force in Bangladesh, from the Constitution down, is published free online in the Bangladesh Code. If you cannot afford a lawyer, the government's legal aid service can help.",
    official: { office: "Legislative and Parliamentary Affairs Division", href: "http://bdlaws.minlaw.gov.bd/", site: "bdlaws.minlaw.gov.bd" },
    parts: [
      {
        title: "Read the law",
        text: "The Bangladesh Code holds every act in force, in Bangla and English, searchable by name, year and subject.",
        links: [{ label: "The Constitution of Bangladesh", href: "http://bdlaws.minlaw.gov.bd/act-367.html" }],
      },
      {
        title: "Free legal aid",
        text: "The National Legal Aid Services Organization gives free advice, mediation and lawyers to people who cannot pay. Every district has a legal aid office at the district judge's court.",
        points: ["People on low incomes", "Women and children who face violence", "People with disabilities, older people and others the law names"],
        links: [{ label: "National Legal Aid Services Organization", href: "https://nlaso.gov.bd/" }],
      },
    ],
  },
  {
    slug: "online-applications",
    title: "Online applications",
    section: "topics",
    icon: "file-text",
    symbol: "edit_document",
    summary: "Apply online for certificates, permits and other government services.",
    intro: "Many government services now start online: birth and death registration, police clearance, permits and certificates. The national portal lists them all by category.",
    official: { office: "Bangladesh National Portal", href: category("69a5597fc4774958d7c92fdd"), site: "bangladesh.gov.bd" },
    parts: [
      {
        title: "Common applications",
        points: ["Birth and death registration", "Police clearance certificate", "National ID card corrections", "Trade licences and permits"],
        links: [
          { label: "Birth and death registration", href: "https://bdris.gov.bd/" },
          { label: "Police clearance", href: "https://pcc.police.gov.bd/" },
        ],
      },
      {
        title: "Need help applying?",
        text: "Your nearest digital centre can fill in and submit an application for you for a small fee.",
        links: [{ label: "Digital centres", href: "/bangladesh/government/digital-centres" }],
      },
    ],
  },
  {
    slug: "tickets-and-travel",
    title: "Tickets and travel",
    section: "topics",
    icon: "car-ferry",
    symbol: "confirmation_number",
    summary: "Book train tickets online, and find government bus, launch and ferry services.",
    intro: "Bangladesh Railway sells its tickets online, and the state bus and water transport corporations run services across the country.",
    official: { office: "Bangladesh Railway", href: "https://eticket.railway.gov.bd/", site: "eticket.railway.gov.bd" },
    parts: [
      {
        title: "Buy a train ticket",
        points: ["Register with your mobile number and NID", "Choose your train, class and seat", "Pay online and keep the e-ticket on your phone"],
        numbered: true,
      },
      {
        title: "Buses, launches and ferries",
        links: [
          { label: "Bangladesh Road Transport Corporation (BRTC)", href: "https://brtc.gov.bd/" },
          { label: "Bangladesh Inland Water Transport Corporation", href: "https://biwtc.gov.bd/" },
          { label: "Bangladesh Railway", href: "https://railway.gov.bd/" },
        ],
      },
    ],
  },
  {
    slug: "digital-centres",
    title: "Digital centres",
    section: "topics",
    icon: "desktop",
    symbol: "computer",
    summary: "Find a digital centre near you for help with any online government service.",
    intro: "Digital centres in every union, pourashava and city ward help people use government services online. Local entrepreneurs run them, and they charge small, set fees.",
    official: { office: "Bangladesh National Portal", href: category("69a5597fc4774958d7c92fe8"), site: "bangladesh.gov.bd" },
    parts: [
      {
        title: "What a digital centre can do",
        points: [
          "Birth registration and certificates",
          "Land records and applications",
          "Passport, exam and job applications",
          "Utility bills, mobile banking and printing",
        ],
      },
      {
        title: "Find your centre",
        text: "Ask at your Union Parishad or pourashava office, or browse the digital centre services on the national portal.",
      },
    ],
  },
  {
    slug: "bangla-ai-tools",
    title: "Bangla AI tools",
    section: "topics",
    icon: "magic-wand",
    symbol: "smart_toy",
    summary: "The government's free tools for Bangla on computers and phones.",
    intro: "The government builds free tools so that Bangla works as well as English on computers and phones, such as tools that read printed Bangla, turn speech into text and check spelling.",
    official: { office: "Bangladesh National Portal", href: category("69df6ab3e252a315b7e6cffb"), site: "bangladesh.gov.bd" },
    parts: [
      {
        title: "What the tools do",
        points: ["Read printed and handwritten Bangla into text", "Turn spoken Bangla into text, and text into speech", "Check Bangla spelling and grammar"],
      },
      {
        title: "Who they are for",
        text: "Anyone can use them, and developers can build them into their own apps. The national portal lists each tool and how to use it.",
        links: [{ label: "ICT Division", href: "https://ictd.gov.bd/" }],
      },
    ],
  },

  /* ── Bangladesh and its government ───────────────────────────────── */
  {
    slug: "government-tenders",
    title: "Government tenders and procurement",
    section: "about",
    icon: "shopping-basket",
    symbol: "shopping_bag",
    summary: "How the Bangladesh government buys goods, works and services, and where to find its tenders.",
    intro: "Government offices buy goods, works and services under the Public Procurement Act 2006 and its rules. Most tenders are published and submitted online through the electronic government procurement system, e-GP.",
    official: { office: "Electronic Government Procurement (e-GP)", href: "https://www.eprocure.gov.bd/", site: "eprocure.gov.bd" },
    call: { tel: "16575", label: "e-GP helpline" },
    parts: [
      {
        title: "Sell to the government",
        points: [
          "Register your business on e-GP, with your trade licence, e-TIN and VAT registration",
          "Find tenders by office, district or category",
          "Buy the documents, submit your bid and security online",
          "Follow the opening and the award notice on e-GP",
        ],
        numbered: true,
      },
      {
        title: "Rules and oversight",
        text: "The Bangladesh Public Procurement Authority sets procurement policy and runs e-GP.",
        links: [{ label: "Bangladesh Public Procurement Authority", href: "https://bppa.gov.bd/" }],
      },
      {
        title: "Job circulars",
        text: "Offices also publish job circulars and notices on the national portal.",
        links: [{ label: "Job and tender announcements", href: `${PORTAL}/pages/job-tender-announcements` }],
      },
    ],
  },
  {
    slug: "ministries-and-divisions",
    title: "Ministries and divisions, A to Z",
    section: "about",
    icon: "buildings-downtown",
    symbol: "account_tree",
    summary: "How the Bangladesh government is organised, and contact details for every ministry and division.",
    intro: "The government's work is shared among ministries and divisions, each led by a minister and run by a secretary. Under them, directorates, departments and other offices deliver services across the country.",
    official: { office: "Bangladesh National Portal", href: `${PORTAL}/views/ministry-and-directorate-list`, site: "bangladesh.gov.bd" },
    parts: [
      {
        title: "How it fits together",
        points: [
          "Ministries set policy for an area of government, such as health or education",
          "Some ministries have two or more divisions, each with its own secretary",
          "Directorates and departments carry the work out in divisions, districts and upazilas",
        ],
      },
      {
        title: "The national portal lists them all",
        text: "Contact details for 57 ministries and divisions, 72 directorates and 565 other offices, each linked to its own website.",
        links: [
          { label: "Directorates and other offices", href: `${PORTAL}/views/directorates-n-others` },
          { label: "Cabinet Division", href: "https://cabinet.gov.bd/" },
        ],
      },
    ],
  },
  {
    slug: "local-government",
    title: "Divisions, districts and local government",
    section: "about",
    icon: "location-pin",
    symbol: "map",
    summary: "Bangladesh's divisions, districts, upazilas and unions, and the local councils that serve them.",
    intro: "Bangladesh is divided into 8 divisions and 64 districts. Districts are divided into upazilas, and upazilas into unions. Each level has its own government offices, and elected councils serve the people locally.",
    official: { office: "Bangladesh National Portal", href: `${PORTAL}/views/district-list`, site: "bangladesh.gov.bd" },
    parts: [
      {
        title: "Field administration",
        points: [
          "A divisional commissioner coordinates each division",
          "The deputy commissioner (DC) heads the district administration",
          "The upazila nirbahi officer (UNO) heads the upazila administration",
        ],
      },
      {
        title: "Elected local councils",
        points: [
          "Union Parishads in rural unions",
          "Upazila Parishads and Zila Parishads",
          "Pourashavas (municipalities) and city corporations in towns and cities",
        ],
        links: [{ label: "Local Government Division", href: "https://lgd.gov.bd/" }],
      },
      {
        title: "Your district's portal",
        text: "Every division, district, upazila and union has its own page on the national portal, with its offices, services and notices.",
      },
    ],
  },
  {
    slug: "branches-of-government",
    title: "Branches of the Bangladesh government",
    section: "about",
    icon: "bank",
    symbol: "account_balance",
    summary: "The legislative, executive and judicial branches of the Bangladesh government, and how each checks the others.",
    intro: "Learn about the three branches of the Bangladesh government, what each one does, and how they keep each other in balance.",
    official: { office: "The Constitution of Bangladesh", href: "http://bdlaws.minlaw.gov.bd/act-367.html", site: "bdlaws.minlaw.gov.bd" },
    parts: [
      {
        title: "What are the three branches of government?",
        text: "The Constitution of the People's Republic of Bangladesh, adopted on 4 November 1972, makes Bangladesh a unitary parliamentary republic with three branches of government:",
        points: [
          "Legislative: makes laws (Jatiya Sangsad, the National Parliament)",
          "Executive: carries out laws (the President, the Prime Minister and the Cabinet)",
          "Judicial: interprets laws (the Supreme Court and the courts beneath it)",
        ],
        numbered: true,
      },
      {
        title: "Legislative branch",
        text: "The Jatiya Sangsad is a single house of 350 members: 300 elected from single-member constituencies and 50 seats reserved for women. Members serve five-year terms. The legislative branch:",
        points: [
          "Makes laws, and can amend the Constitution with a two-thirds majority",
          "Passes the national budget and approves all taxes and spending",
          "Elects the President",
          "Holds the government to account through questions, committees and votes",
        ],
        links: [{ label: "Bangladesh Parliament", href: "https://www.parliament.gov.bd/" }],
      },
      {
        title: "Executive branch",
        text: "The President is the head of state. The Prime Minister, who commands a majority in Parliament, is the head of government and leads the Cabinet. The executive branch:",
        points: [
          "Carries out and enforces the law through the ministries and divisions",
          "Prepares the budget and runs public services",
          "Leads foreign relations and commands the armed forces through the President",
        ],
        links: [
          { label: "Bangabhaban, the President's Office", href: "https://bangabhaban.gov.bd/" },
          { label: "Prime Minister's Office", href: "https://pmo.gov.bd/" },
          { label: "Cabinet Division", href: "https://cabinet.gov.bd/" },
        ],
      },
      {
        title: "Judicial branch",
        text: "The Supreme Court of Bangladesh has two divisions: the Appellate Division and the High Court Division. The Chief Justice heads the judiciary, and district and subordinate courts hear cases across the country. The judicial branch:",
        points: [
          "Decides cases under the law",
          "Can declare a law or an action void if it breaks the Constitution",
          "Protects fundamental rights through writs of the High Court Division",
        ],
        links: [{ label: "Supreme Court of Bangladesh", href: "https://www.supremecourt.gov.bd/" }],
      },
      {
        title: "How each branch provides checks and balances",
        text: "The Constitution gives each branch ways to limit the others, so that no one branch holds too much power:",
        points: [
          "Parliament can remove the government with a vote of no confidence, and can impeach the President",
          "The President can return a bill to Parliament for reconsideration, except a money bill",
          "The courts can strike down laws and government actions that break the Constitution",
          "Parliament controls the budget, so no tax or spending is lawful without its approval",
        ],
      },
      {
        title: "Reforms under discussion",
        text: "The July National Charter of 2025 proposes changes to this structure, including an upper house of Parliament. For the position in force today, read the Constitution on the official site.",
      },
    ],
  },
  {
    slug: "president-and-prime-minister",
    title: "The President and Prime Minister",
    section: "about",
    icon: "city-hall",
    symbol: "domain",
    summary: "The roles of the President and the Prime Minister of Bangladesh, and how to reach their offices.",
    intro: "Bangladesh is a parliamentary republic: the President is the head of state, and the Prime Minister leads the government. Each official site names its current office-holder.",
    official: { office: "Prime Minister's Office", href: "https://pmo.gov.bd/", site: "pmo.gov.bd" },
    parts: [
      {
        title: "The President",
        points: [
          "Head of state, elected by Parliament for a five-year term",
          "Appoints the Prime Minister and the Chief Justice",
          "Acts on the Prime Minister's advice in most other matters",
        ],
        links: [{ label: "Bangabhaban, the President's Office", href: "https://bangabhaban.gov.bd/" }],
      },
      {
        title: "The Prime Minister",
        points: [
          "Head of government, the member of Parliament who commands a majority",
          "Leads the Cabinet and allocates the work of ministries",
          "Answers to Parliament",
        ],
      },
      {
        title: "The Cabinet",
        text: "The Cabinet Division supports the Cabinet's meetings and coordinates the government's work.",
        links: [{ label: "Cabinet Division", href: "https://cabinet.gov.bd/" }],
      },
    ],
  },
  {
    slug: "courts",
    title: "Courts and the justice system",
    section: "about",
    icon: "scale-retro",
    symbol: "gavel",
    summary: "The Supreme Court, the courts beneath it, village courts and free legal aid in Bangladesh.",
    intro: "The Supreme Court sits at the top of Bangladesh's courts. Beneath it, district courts hear civil and criminal cases, and village courts settle small local disputes.",
    official: { office: "Supreme Court of Bangladesh", href: "https://www.supremecourt.gov.bd/", site: "supremecourt.gov.bd" },
    call: { tel: "103", label: "Supreme Court helpline" },
    parts: [
      {
        title: "The courts, from the top",
        points: [
          "The Appellate Division of the Supreme Court hears final appeals",
          "The High Court Division hears appeals and protects fundamental rights",
          "District and sessions judges' courts hear civil and criminal cases",
          "Village courts in Union Parishads settle small disputes quickly and cheaply",
        ],
      },
      {
        title: "Follow your case",
        text: "The Supreme Court publishes its daily cause lists and judgments online.",
      },
      {
        title: "If you cannot afford a lawyer",
        text: "Free legal aid is available in every district.",
        links: [{ label: "Laws and legal aid", href: "/bangladesh/government/laws-and-legal-aid" }],
      },
    ],
  },

  /* ── Government benefits ─────────────────────────────────────────── */
  {
    slug: "find-benefits",
    title: "Find government benefits",
    section: "benefits",
    icon: "magnifier-heart",
    symbol: "volunteer_activism",
    summary: "How Bangladesh's social safety net works, and how to find the benefits you may qualify for.",
    intro: "Bangladesh runs many social safety net programmes: allowances, food, stipends, housing and pensions. The Cabinet Division coordinates them under the National Social Security Strategy, and ministries deliver them through local offices.",
    official: { office: "Social protection, Cabinet Division", href: "https://socialprotection.gov.bd/", site: "socialprotection.gov.bd" },
    parts: [
      {
        title: "Who the benefits are for",
        points: [
          "Older people, widows and people with disabilities",
          "Poor families, mothers and young children",
          "Students from low-income families",
          "Farmers, fishers and workers, and people hit by disasters",
        ],
      },
      {
        title: "How to apply",
        points: [
          "Find the programme that fits you",
          "Apply at your Union Parishad, pourashava or upazila office, or online where the programme allows it",
          "Bring your NID card; most payments go to your mobile wallet or bank account",
        ],
        numbered: true,
      },
      {
        title: "Benefits are free",
        text: "No one may charge you to be included in a government programme. If someone asks for money, report it to your UNO or to the Anti-Corruption Commission on 106.",
      },
    ],
  },
  {
    slug: "food-assistance",
    title: "Food assistance",
    section: "benefits",
    icon: "shopping-basket",
    symbol: "rice_bowl",
    summary: "Government food programmes: low-price rice, family cards, open market sales and food aid.",
    intro: "The government sells rice and other essentials at low prices to families on low incomes, and gives food aid in hard months and after disasters.",
    official: { office: "Directorate General of Food", href: "https://dgfood.gov.bd/", site: "dgfood.gov.bd" },
    parts: [
      {
        title: "Programmes",
        points: [
          "The Food Friendly Programme sells rice at a low price to poor families in the lean months",
          "Open Market Sales (OMS) sell rice and flour at low prices from trucks and dealers",
          "The Trading Corporation of Bangladesh sells essentials at fair prices to family-card holders",
          "VGF food aid reaches families after disasters and during fishing bans",
        ],
        links: [
          { label: "Trading Corporation of Bangladesh", href: "https://tcb.gov.bd/" },
          { label: "Ministry of Food", href: "https://mofood.gov.bd/" },
        ],
      },
      {
        title: "How to get help",
        text: "Lists for each programme are drawn up locally. Ask your Union Parishad, ward councillor or upazila food office.",
      },
    ],
  },
  {
    slug: "housing-help",
    title: "Housing help",
    section: "benefits",
    icon: "home",
    symbol: "home",
    summary: "Homes for landless and homeless families, and government home loans in Bangladesh.",
    intro: "The government gives homes with land to landless and homeless families, and offers home loans through a state finance corporation.",
    official: { office: "Ashrayan Project", href: "https://www.ashrayan.gov.bd/", site: "ashrayan.gov.bd" },
    parts: [
      {
        title: "Homes for landless families",
        text: "The Ashrayan project gives landless and homeless families a house and the title to its land. Families are chosen locally; ask your UNO's office.",
      },
      {
        title: "Home loans and public housing",
        links: [
          { label: "Bangladesh House Building Finance Corporation", href: "https://bhbfc.gov.bd/" },
          { label: "National Housing Authority", href: "https://nha.gov.bd/" },
        ],
      },
    ],
  },
  {
    slug: "social-allowances",
    title: "Allowances for older people, widows and people with disabilities",
    section: "benefits",
    icon: "wheelchair",
    symbol: "accessible",
    summary: "The old age allowance, the widow allowance and the disability allowance, and how to apply.",
    intro: "The Department of Social Services pays monthly allowances to older people, to widows and women deserted by their husbands, and to people with disabilities. The money goes straight to your mobile wallet or bank account.",
    official: { office: "Department of Social Services", href: "https://dss.gov.bd/", site: "dss.gov.bd" },
    parts: [
      {
        title: "The allowances",
        points: [
          "Old age allowance, for older people on low incomes",
          "Allowance for widows and women deserted by their husbands",
          "Disability allowance, and stipends for students with disabilities",
        ],
      },
      {
        title: "How to apply",
        points: [
          "Get a disability ID card first if you are applying for the disability allowance",
          "Apply online or at your upazila or city social services office",
          "A local committee checks applications and chooses recipients",
        ],
        numbered: true,
        links: [{ label: "Ministry of Social Welfare", href: "https://msw.gov.bd/" }],
      },
    ],
  },
  {
    slug: "universal-pension",
    title: "Universal pension",
    section: "benefits",
    icon: "piggy-bank",
    symbol: "savings",
    summary: "Join the universal pension scheme: Probash, Progoti, Surokkha and Somota.",
    intro: "The universal pension scheme, launched in 2023, lets anyone aged 18 or over save a monthly amount and receive a pension for life from age 60. The government adds to the savings of people on low incomes.",
    official: { office: "National Pension Authority", href: "https://upension.gov.bd/", site: "upension.gov.bd" },
    call: { tel: "16131", label: "Universal pension helpline" },
    parts: [
      {
        title: "Four schemes",
        points: [
          "Probash, for Bangladeshis working abroad",
          "Progoti, for employees of private companies",
          "Surokkha, for the self-employed and informal workers",
          "Somota, for people on low incomes, with a government contribution",
        ],
      },
      {
        title: "Join online",
        text: "Register with your NID and mobile number, choose a scheme and a monthly amount, and pay online or at a bank.",
      },
    ],
  },
  {
    slug: "education-stipends",
    title: "Education stipends",
    section: "benefits",
    icon: "school",
    symbol: "school",
    summary: "Stipends for primary, secondary, higher secondary and degree students in Bangladesh.",
    intro: "Stipends help children from poorer families stay in school. Primary stipends are paid to mothers, and secondary and higher stipends to students, through mobile wallets.",
    official: { office: "Prime Minister's Education Assistance Trust", href: "https://pmeat.gov.bd/", site: "pmeat.gov.bd" },
    parts: [
      {
        title: "Who gets a stipend",
        points: [
          "Primary pupils, through the Directorate of Primary Education",
          "Secondary, higher secondary and degree students, through the Prime Minister's Education Assistance Trust",
          "Students with disabilities, through the Department of Social Services",
        ],
        links: [{ label: "Directorate of Primary Education", href: "https://dpe.gov.bd/" }],
      },
      {
        title: "How to apply",
        text: "Schools and colleges collect applications from eligible students. Students must keep up their attendance and results to keep the stipend.",
      },
    ],
  },
  {
    slug: "mothers-and-children",
    title: "Mothers and young children",
    section: "benefits",
    icon: "baby-feeding",
    symbol: "family_restroom",
    summary: "The Mother and Child Benefit Programme, and help lines for women and children.",
    intro: "The Mother and Child Benefit Programme pays a monthly allowance to mothers on low incomes during pregnancy and the child's first years, to help with food and health care.",
    official: { office: "Department of Women Affairs", href: "https://dwa.gov.bd/", site: "dwa.gov.bd" },
    call: { tel: "109", label: "Help for women and children facing violence" },
    parts: [
      {
        title: "Who can apply",
        points: ["Mothers on low incomes, from pregnancy", "Apply online or at your upazila women affairs office", "Payments go to your mobile wallet"],
      },
      {
        title: "Help when you need it",
        points: ["109: help for women and children facing violence", "1098: the child helpline"],
      },
    ],
  },
  {
    slug: "freedom-fighters",
    title: "Freedom fighters' honorarium",
    section: "benefits",
    icon: "medal-first-place",
    symbol: "military_tech",
    summary: "The monthly honorarium and other support for the freedom fighters of 1971 and their families.",
    intro: "Freedom fighters of the 1971 Liberation War on the government's official list receive a monthly honorarium, medical care and other support, and their families receive support after their death.",
    official: { office: "Ministry of Liberation War Affairs", href: "https://molwa.gov.bd/", site: "molwa.gov.bd" },
    call: { tel: "16171", label: "Freedom Fighter Welfare Trust" },
    parts: [
      {
        title: "Support",
        points: ["A monthly honorarium paid to your bank account", "Medical treatment at government hospitals", "Housing and other help for families"],
      },
      {
        title: "Records and corrections",
        text: "The ministry keeps the official list of freedom fighters. Apply to it to correct your details.",
      },
    ],
  },
  {
    slug: "migrant-workers",
    title: "Migrant workers and their families",
    section: "benefits",
    icon: "globe",
    symbol: "public",
    summary: "Welfare, loans and help for Bangladeshis working abroad and their families at home.",
    intro: "The Wage Earners' Welfare Board supports Bangladeshis working abroad and their families: help in a crisis abroad, scholarships for children and support if a worker dies or is injured.",
    official: { office: "Wage Earners' Welfare Board", href: "https://wewb.gov.bd/", site: "wewb.gov.bd" },
    call: { tel: "16135", label: "Expatriate call centre" },
    parts: [
      {
        title: "Before you go",
        text: "Register with the Bureau of Manpower, Employment and Training, and check that your recruiting agency is licensed.",
        links: [{ label: "Bureau of Manpower, Employment and Training", href: "https://bmet.gov.bd/" }],
      },
      {
        title: "Loans and savings",
        text: "Probashi Kallyan Bank gives loans to go abroad and to start a business on return. The Probash scheme of the universal pension lets you save for later.",
        links: [
          { label: "Probashi Kallyan Bank", href: "https://pkb.gov.bd/" },
          { label: "Universal pension", href: "/bangladesh/government/universal-pension" },
        ],
      },
    ],
  },
  {
    slug: "employee-welfare",
    title: "Workers' and government employees' welfare",
    section: "benefits",
    icon: "briefcase",
    symbol: "work",
    summary: "Welfare grants for workers and government employees, including support for families after a death.",
    intro: "Workers in factories and the informal sector, and government employees and their families, can get grants for treatment, education and funerals, and support after a worker's death.",
    official: { office: "Bangladesh Labour Welfare Foundation", href: "https://blwf.gov.bd/", site: "blwf.gov.bd" },
    call: { tel: "16357", label: "Workers' helpline" },
    parts: [
      {
        title: "For workers",
        text: "The Bangladesh Labour Welfare Foundation gives grants for treatment, children's education and help after a workplace death or injury. The Department of Inspection for Factories and Establishments enforces safety at work.",
        links: [{ label: "Department of Inspection for Factories and Establishments", href: "https://dife.gov.bd/" }],
      },
      {
        title: "For government employees",
        text: "The Bangladesh Karmachari Kalyan Board gives grants for treatment, education, funerals and group insurance to government employees and their families.",
        links: [{ label: "Bangladesh Karmachari Kalyan Board", href: "https://bkkb.gov.bd/" }],
      },
    ],
  },
];

/** The detail page at a slug, if there is one. */
export const detailFor = (slug: string) => DETAILS.find((d) => d.slug === slug);

/** Card hrefs that open a detail page share this prefix. */
export const DETAIL_BASE = "/bangladesh/government/";
