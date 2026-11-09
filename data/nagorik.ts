/**
 * "Citizen Rights and Duties" — data for /nagorik, in English.
 *
 * Real figures only: Bangladesh Bureau of Statistics, Time-Use Survey 2021,
 * as published in UN Women's summary brief (May 2024) — national averages
 * for people aged 15 and over. The brief does not split the rest of the day
 * into sleep, study or leisure, so the page keeps that time as one block.
 *
 * Rights and duties paraphrase the Constitution of Bangladesh (Part III,
 * Articles 27–44; Article 21, quoted from its official English text).
 * Helplines come from data/complaints.ts, verified numbers only.
 */

export const TUS = {
  survey: "Time-Use Survey 2021",
  publisher: "Bangladesh Bureau of Statistics (BBS); summary brief by UN Women, May 2024",
  url: "https://data.unwomen.org/publications/bangladesh-time-use-survey-2021",
  sample: "8,000 households · 17,770 people aged 15 and over · all 64 districts",
  fieldwork: "Early 2021",
  /** Hours per day, national average, ages 15+. */
  day: {
    women: { paid: 1.2, unpaid: 5.9 },
    men: { paid: 6.1, unpaid: 0.8 },
  },
  /** Unpaid care and domestic work, ages 25–44, hours per day. */
  prime: { women: 7.1, men: 0.9 },
  ratios: [
    { value: "7.3×", text: "as much time spent by women as by men on unpaid care and domestic work" },
    { value: "7.6×", text: "as much domestic work done by women as by men" },
    { value: "6×", text: "women's participation in caregiving, against men's" },
    { value: "7.5×", text: "the caregiving load of married women, against men's (3.8× for unmarried women)" },
  ],
  /** Share who believe men's work is more important than women's, by age. */
  menWorkMoreImportant: [
    { group: "Aged 18–30", pct: 60 },
    { group: "Aged 31 and over", pct: 71 },
  ],
  bothShouldEarn:
    "More than 90% of people, whatever their sex, age, area, division or education, believe that both husband and wife should earn.",
  womenLabourForce: { from: { year: "2017", pct: 36 }, to: { year: "2022", pct: 42.8 } },
} as const;

export type Sex = "women" | "men";

/* ── Rights ─────────────────────────────────────────────────────────── */

export const RIGHT_THEMES = ["Equality", "Life and justice", "Freedoms", "Home and property", "Remedy"] as const;
export type RightTheme = (typeof RIGHT_THEMES)[number];

export interface Right {
  article: string;
  theme: RightTheme;
  title: string;
  body: string;
  /** What to do when the right is denied. */
  denied: string;
  icon: string;
}

/** Fundamental rights, Part III of the Constitution — enforceable in the High Court Division (Art. 44). */
export const RIGHTS: Right[] = [
  {
    article: "27",
    theme: "Equality",
    icon: "balance",
    title: "Equal before the law",
    body: "All citizens are equal before the law and are entitled to its equal protection.",
    denied: "Write down who treated you differently, when and how. Complain in writing to the head of that office and keep a copy.",
  },
  {
    article: "28",
    theme: "Equality",
    icon: "diversity_1",
    title: "No discrimination",
    body: "The state shall not discriminate against anyone on grounds of religion, race, caste, sex or place of birth.",
    denied: "Record what was said or done and by whom. Complain in writing to the authority in charge, then seek legal aid.",
  },
  {
    article: "29",
    theme: "Equality",
    icon: "work",
    title: "Equal chance at public jobs",
    body: "Every citizen has equal opportunity in appointment to the service of the Republic.",
    denied: "Ask for the recruitment rules and results under the Right to Information Act, 2009, and challenge an unfair process in writing.",
  },
  {
    article: "31",
    theme: "Life and justice",
    icon: "gavel",
    title: "Protection of the law",
    body: "No one's life, liberty, body, reputation or property may be harmed except in accordance with law.",
    denied: "Ask, in writing, for the law or order being used against you. If none is shown, go to legal aid.",
  },
  {
    article: "32",
    theme: "Life and justice",
    icon: "favorite",
    title: "Life and personal liberty",
    body: "No one shall be deprived of life or personal liberty except in accordance with law.",
    denied: "If a life is in danger, call 999 at once. Then document everything you saw.",
  },
  {
    article: "33",
    theme: "Life and justice",
    icon: "lock_open",
    title: "Safeguards on arrest",
    body: "Anyone arrested must be told why, may consult a lawyer of their choice, and must be brought before a magistrate within 24 hours.",
    denied: "Ask why the person was arrested and where they are held, note the time, and call a lawyer or legal aid straight away.",
  },
  {
    article: "35",
    theme: "Life and justice",
    icon: "policy",
    title: "A fair trial",
    body: "A speedy, public trial by an independent court; no one punished twice for the same offence or forced to be a witness against themselves; no torture.",
    denied: "Never sign a statement under pressure. Tell the magistrate or judge about any torture, and ask for legal aid.",
  },
  {
    article: "36–38",
    theme: "Freedoms",
    icon: "groups",
    title: "Movement, assembly and association",
    body: "Freedom to move throughout the country, to assemble peacefully and without arms, and to form associations, subject to reasonable limits set by law.",
    denied: "Note the date, the place, who stopped you and the order they cited. A lawyer can challenge an unlawful ban in court.",
  },
  {
    article: "39",
    theme: "Freedoms",
    icon: "record_voice_over",
    title: "Thought, speech and the press",
    body: "Freedom of thought and conscience; freedom of speech and expression, and freedom of the press.",
    denied: "Keep copies of what you said or published and of any notice you received, and get legal advice before you respond.",
  },
  {
    article: "40–41",
    theme: "Freedoms",
    icon: "self_improvement",
    title: "Work and faith",
    body: "The right to follow any lawful profession or business, and to profess, practise and propagate any religion.",
    denied: "Record the threat or obstruction and report it to the police; in an emergency, call 999.",
  },
  {
    article: "42–43",
    theme: "Home and property",
    icon: "home",
    title: "Property, home and privacy",
    body: "The right to acquire and hold property; security in your home, and privacy of your letters and communications.",
    denied: "Ask for the legal order behind any seizure or search. Keep your deeds and receipts, and get legal aid for a land dispute.",
  },
  {
    article: "44",
    theme: "Remedy",
    icon: "verified_user",
    title: "Enforcing your rights",
    body: "When a fundamental right is violated, you may move the High Court Division to enforce it.",
    denied: "Through a lawyer, file a writ petition in the High Court Division (Article 102). If you cannot afford one, legal aid can provide a lawyer.",
  },
];

/** Article 21, in the Constitution's official English text. */
export const ARTICLE_21 = {
  citizen:
    "It is the duty of every citizen to observe the Constitution and the laws, to maintain discipline, to perform public duties and to protect public property.",
  servant: "Every person in the service of the Republic has a duty to strive at all times to serve the people.",
};

/** Laws a citizen can use without a lawyer. */
export const CIVIC_LAWS = [
  { name: "Right to Information Act, 2009", use: "Ask any public body, or any body run on public money, for information in writing." },
  { name: "Consumer Rights Protection Act, 2009", use: "Complain about adulterated goods, short weight, or a price list that is not displayed." },
  { name: "Legal Aid Services Act, 2000", use: "People who cannot afford it get a lawyer and legal help at the state's cost." },
];

/* ── Duties, by role ────────────────────────────────────────────────── */

export interface Group {
  id: string;
  label: string;
  icon: string;
  duties: string[];
  mindset: string;
  bravery: string;
}

export const GROUPS: Group[] = [
  {
    id: "everyone",
    label: "Everyone",
    icon: "groups",
    duties: ["Obey the law and pay your taxes", "Vote", "Protect public property", "Stand by your neighbours in trouble"],
    mindset: "Before looking for someone to blame, ask: what can I fix?",
    bravery: "Never stay silent in the face of wrong. If you cannot act yourself, report it on 999 or 106.",
  },
  {
    id: "men",
    label: "Men",
    icon: "man",
    duties: ["Share the housework and the care of children", "Respect women's income and decisions", "Look after the health and education of the whole family"],
    mindset: "The survey shows men give 0.8 hours a day to unpaid care and domestic work. A larger share frees time for everyone at home.",
    bravery: "When you see harassment, step in. Do not be a silent bystander.",
  },
  {
    id: "women",
    label: "Women",
    icon: "woman",
    duties: ["Claim your right to education, income and health", "Keep your voice in family decisions", "Give daughters and sons the same chances"],
    mindset: "Housework deserves respect, but it is not a load to carry alone.",
    bravery: "Report violence or a child marriage on 109, for yourself or for someone else.",
  },
  {
    id: "children",
    label: "Children",
    icon: "child_care",
    duties: ["Go to school and learn with care", "Respect elders, look after younger ones", "Keep your things in order"],
    mindset: "A mistake is nothing to be ashamed of. Learning from it is how you grow up.",
    bravery: "If someone touches you wrongly or frightens you, tell a parent or teacher at once, or call 109.",
  },
  {
    id: "boys",
    label: "Teenage boys",
    icon: "boy",
    duties: ["Study, and learn a skill with your hands", "Respect your sisters and the girls you study with", "Stay away from drugs and gambling"],
    mindset: "Strength means protecting others, not frightening them.",
    bravery: "Stop a friend who is going the wrong way, and do not bow to the pressure of the group.",
  },
  {
    id: "girls",
    label: "Teenage girls",
    icon: "girl",
    duties: ["Keep studying, and do not shrink your dreams", "Look after your own health and safety", "Stand by your sisters and friends"],
    mindset: "Being a girl is no reason to stay behind. The Constitution gives you equal rights.",
    bravery: "Say no to child marriage and harassment. Help is there on 109.",
  },
  {
    id: "youth",
    label: "Young adults (18–35)",
    icon: "rocket_launch",
    duties: ["Build skills and create work", "Vote, and check what you read", "Volunteer on your area's problems"],
    mindset: "Before leaving the country, ask once whether you could make your place here.",
    bravery: "Say no to a corrupt offer, and stand by those who say no.",
  },
  {
    id: "elders",
    label: "Elders",
    icon: "elderly",
    duties: ["Pass experience and history to the next generation", "Mediate family disputes fairly", "Look after your own health"],
    mindset: "Age does not shrink a duty. It only changes its shape.",
    bravery: "Against an unjust custom, one word from an elder is a strong shield.",
  },
  {
    id: "workers",
    label: "Workers and traders",
    icon: "storefront",
    duties: ["Fair prices and fair wages", "No adulteration, no hoarding", "Pay taxes and follow the rules"],
    mindset: "Fair profit is what lasts. Greed wins a day's gain and loses trust for good.",
    bravery: "Speak up together about pressure from syndicates or extortion.",
  },
  {
    id: "servants",
    label: "Public servants and representatives",
    icon: "account_balance",
    duties: ["Serve the people (Constitution, Article 21)", "Give timely, transparent service", "Give information when it is asked for"],
    mindset: "The chair is a duty, not power. The salary comes from the people's taxes.",
    bravery: "Refuse unlawful pressure from above, in writing.",
  },
];

/** The pledges a reader can take, each with the line they tick at night when it was kept. */
export const DAILY_CHECKS = [
  { pledge: "Never give or take a bribe", check: "I neither gave nor took a bribe today" },
  { pledge: "Finish one task on time", check: "I finished a task on time today" },
  { pledge: "Share the housework", check: "I helped with the housework today" },
  { pledge: "Learn something new", check: "I learned something new today" },
  { pledge: "Check on someone", check: "I checked on or helped someone today" },
  { pledge: "Check before I share", check: "I shared nothing without checking it first" },
  { pledge: "Keep the street clean", check: "I dropped no litter today" },
  { pledge: "Less idle screen time", check: "I spent under an hour on idle screen time" },
  { pledge: "Put no one down", check: "I spoke to no one with contempt today" },
  { pledge: "Speak up against wrong", check: "I did not stay silent in the face of wrong today" },
];
