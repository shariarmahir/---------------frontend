/**
 * Copy for the Bangladesh chapters (/bangladesh/crisis, shield, problems,
 * solutions): the attacks and the citizen shield, the 32 problems pixel
 * by pixel, and what we have, what we drop and who does what. The chapter
 * list itself is in data/bangladesh.ts.
 *
 * Figures are only those already sourced in data/amar-bangladesh.ts or
 * data/bangladesh-history.ts; everything else here is guidance, written as such.
 */

import { puzzleOf, type Decision } from "./gori/puzzles.ts";

/* ── Chapter 2 · the attacks, chapter 3 · the citizen shield ────────── */

export interface CrisisAttack {
  id: string;
  icon: string;
  threat: string;
  /** How it shows up in an ordinary household. */
  feels: string;
  /** What a citizen can hold up against it, today. */
  shield: string;
  problem: number;
}

export const CRISIS_ATTACKS: CrisisAttack[] = [
  {
    id: "prices",
    icon: "shopping_basket",
    threat: "Rising prices",
    feels: "The same shopping buys less every month.",
    shield: "Keep a record of local prices, report hoarding, and buy together as a neighbourhood.",
    problem: 19,
  },
  {
    id: "bribe",
    icon: "front_hand",
    threat: "Bribery and corruption",
    feels: "Without a payment, the file does not move.",
    shield: "Ask for a receipt, put complaints in writing, and report to the Anti-Corruption Commission on 106.",
    problem: 7,
  },
  {
    id: "fake",
    icon: "report",
    threat: "Adulterated and fake goods",
    feels: "Medicine, milk, cooking oil: you cannot tell which is real.",
    shield: "Keep your receipts and complain to the consumer rights directorate on 16121.",
    problem: 14,
  },
  {
    id: "flood",
    icon: "flood",
    threat: "Floods, erosion and climate",
    feels: "Every monsoon puts homes and crops at risk.",
    shield: "Pass on early warnings, know your nearest shelter, and keep canals free of encroachment.",
    problem: 16,
  },
  {
    id: "jobs",
    icon: "work_off",
    threat: "Unemployment and insecure work",
    feels: "A degree but no job; a job but no contract.",
    shield: "Teach the young people around you a skill, and give local work to local people.",
    problem: 3,
  },
  {
    id: "justice",
    icon: "gavel",
    threat: "Justice denied",
    feels: "Cases drag on for years, and the poor have no one on their side.",
    shield: "Free government legal aid is on 16430. Stand by the victim, and do not be afraid to be a witness.",
    problem: 23,
  },
  {
    id: "drain",
    icon: "flight_takeoff",
    threat: "Brain drain",
    feels: "The best student in the class is planning to leave the country.",
    shield: "Give opportunity and respect to the labs, startups and research here at home.",
    problem: 31,
  },
  {
    id: "rumour",
    icon: "campaign",
    threat: "Rumour and division",
    feels: "One unchecked post can set a neighbourhood alight.",
    shield: "Check before you share, and protect the neighbour who disagrees with you too.",
    problem: 32,
  },
];

export interface ShieldLayer {
  id: string;
  ring: string;
  title: string;
  promise: string;
  acts: string[];
  kindness: string;
}

/** From the self outward — each ring protects the one around it. */
export const SHIELD_LAYERS: ShieldLayer[] = [
  {
    id: "self",
    ring: "Me",
    title: "Keeping myself straight",
    promise: "I will not give or take a bribe. I will not sell adulterated goods. I will not spread lies.",
    acts: ["No transaction without a receipt", "Work on time, and keep my word", "No litter on the street"],
    kindness: "Your own honesty is the first shield, even when no one is watching.",
  },
  {
    id: "family",
    ring: "Family",
    title: "Fairness at home",
    promise: "We share the housework. Daughters and sons get the same chances.",
    acts: ["Teach children to ask questions", "Share the care of our elders", "Save water and electricity at home"],
    kindness: "Honest citizens grow up in homes where there is respect.",
  },
  {
    id: "para",
    ring: "Neighbourhood",
    title: "Looking out for neighbours",
    promise: "No one here will face trouble alone. We will keep watch.",
    acts: ["Know who is sick, elderly or living alone", "Share a local price list and adulteration warnings", "Lights at night and safe paths home"],
    kindness: "In a disaster, neighbours arrive before the government does.",
  },
  {
    id: "union",
    ring: "Union / ward",
    title: "Watching over local services",
    promise: "Schools, clinics, embankments and markets will run where we can see them.",
    acts: ["Attend the union budget meeting", "Request information under the Right to Information Act", "Keep canals and ponds free of encroachment"],
    kindness: "Make the complaint, and offer a hand with the solution too.",
  },
  {
    id: "city",
    ring: "City / upazila",
    title: "Defending city rights",
    promise: "Footpaths, water, cleanliness and safety are rights, not favours.",
    acts: ["Report waterlogging and broken roads with photos", "Keep women and children safe on public transport", "Protect green spaces and playgrounds"],
    kindness: "The city belongs to everyone, from the rickshaw puller to the officer, with equal respect.",
  },
  {
    id: "desh",
    ring: "Country",
    title: "Our duty to the country",
    promise: "We will obey the law, pay our taxes, vote, and not stay silent in the face of injustice.",
    acts: ["Protect public property as your own", "Put your talent and work to use at home", "Respect those who disagree"],
    kindness:
      "Article 21 of the Constitution: every citizen has a duty to observe the Constitution and the laws, to maintain discipline, to perform public duties and to protect public property.",
  },
];

export interface CityRight {
  right: string;
  icon: string;
  what: string;
  myPart: string;
}

export const CITY_RIGHTS: CityRight[] = [
  { right: "Safe water", icon: "water_drop", what: "Drinkable water in every home.", myPart: "Stop wasting water, and report contaminated lines to WASA or the municipality." },
  { right: "A clean city", icon: "delete", what: "Regular waste collection, and no open drains.", myPart: "Put rubbish out at the set time and place, and keep plastic out of the drains." },
  { right: "Room to walk", icon: "directions_walk", what: "Footpaths free of encroachment, and safe crossings.", myPart: "No shops or parking on the footpath, and use the zebra crossing." },
  { right: "Fair prices", icon: "sell", what: "Price lists on display, and honest weights.", myPart: "Ask for a receipt, and complain when you find adulteration." },
  { right: "Safe streets", icon: "shield_person", what: "Lit streets at night, and safe roads for women and children.", myPart: "If you see harassment, call 999 and stand by the person." },
  { right: "Open space", icon: "park", what: "Fields, parks and water bodies for everyone.", myPart: "Report encroachment, and plant trees and protect them." },
  { right: "Clean, quiet air", icon: "air", what: "Noise and air pollution kept within tolerable limits.", myPart: "No needless horns, and no burning rubbish in the open." },
  { right: "The right to know", icon: "info", what: "Information on government work and budgets (Right to Information Act, 2009).", myPart: "Request information in writing, and appeal if no answer comes." },
];

/* ── Chapter 5 · solutions ──────────────────────────────────────────── */

export interface Resource {
  icon: string;
  title: string;
  body: string;
}

/** What Bangladesh already has. Numbers only where a source already backs them. */
export const RESOURCES: Resource[] = [
  { icon: "groups", title: "People", body: "About 176 million people (World Bank estimate, 2025), a large share of them young. The population is not a burden; it is our greatest strength." },
  { icon: "grass", title: "Fertile silt", body: "The silt our rivers leave behind grows more than one crop a year. The land is here; what it needs is fair prices and modern advice." },
  { icon: "water", title: "Rivers and water", body: "Hundreds of rivers give us irrigation, fish and waterways. Stop the encroachment and pollution, and the rivers become the economy." },
  { icon: "handyman", title: "Labour and skill", body: "Farmers, fishers, garment workers and workers abroad: the economy runs on their hands. With recognised skills and respect, output grows." },
  { icon: "volunteer_activism", title: "The habit of standing together", body: "Cyclone deaths have fallen about a hundredfold since 1970, through early warnings, shelters and volunteers working together." },
  { icon: "lightbulb", title: "Talent", body: "Students, researchers and entrepreneurs: given the chance, they can build the answers to the country's problems here at home." },
];

export interface LetGo {
  id: string;
  habit: string;
  cost: string;
  instead: string;
  /** Highlighted: the founder's first priority. */
  key?: true;
}

export const LET_GO: LetGo[] = [
  {
    id: "living-cost",
    habit: "Driving up the cost of living",
    cost: "Hoarding, syndicates and “everyone is raising prices, so will I”: every extra markup along the way ends up on a poor family's plate.",
    instead: "Publish the price at every step from farm to market, buy together through neighbourhood co-operatives, run businesses content with a fair profit, and complain about unjustified prices.",
    key: true,
  },
  {
    id: "greed",
    habit: "Greed",
    cost: "Chasing more, faster, breeds adulteration, land grabs and cheating.",
    instead: "Respect for honest income: a society that honours the honest worker, not the dishonest rich.",
  },
  {
    id: "illegal",
    habit: "Illegal work and encroachment",
    cost: "Seizing rivers, canals, footpaths and public land harms everyone for the gain of a few.",
    instead: "Report encroachment with evidence, and never take advantage of it yourself.",
  },
  {
    id: "blame",
    habit: "Blame alone",
    cost: "Saying “it is all their fault” gets no one started.",
    instead: "Change the question: “What one thing can I fix in my area today?”",
  },
];

export interface DutyColumn {
  id: string;
  who: string;
  icon: string;
  lead: string;
  items: string[];
}

export const DUTY_COLUMNS: DutyColumn[] = [
  {
    id: "state",
    who: "The state",
    icon: "account_balance",
    lead: "Rules, services and justice: only the state can guarantee these.",
    items: [
      "Oversee fair markets and punish hoarding",
      "Timely, transparent public services",
      "Swift and impartial justice",
      "Accurate, public data",
      "Doctors, engineers and agriculture officers present in the villages",
    ],
  },
  {
    id: "citizen",
    who: "The citizen",
    icon: "person_check",
    lead: "The government cannot do it alone, and where it falls short we will not stand still.",
    items: ["Obey the law and pay taxes", "Refuse to pay bribes, and ask for receipts", "Keep watch over your own area", "Complain with evidence, not rumour", "Vote, and ask questions"],
  },
  {
    id: "together",
    who: "Each other",
    icon: "diversity_3",
    lead: "Kindness is our oldest strength: in floods, in storms, in 1971.",
    items: [
      "Stand by neighbours in trouble",
      "Teach young people skills",
      "Give blood and volunteer",
      "Help the vulnerable find legal and medical aid",
      "Honour honest people in public",
    ],
  },
];

/** Mahir's words (written in English, 2026-09-27), lightly edited for reading, with the original kept. */
export const FOUNDER_QUOTE = {
  text: "I believe we know our own problems best, so we must solve them our own way, for our own needs, and we can help one another do it. We know ourselves best; we are Bangali.",
  author: "Mahir Shariar Mahin",
  role: "Founder and CEO, Kandari-Lab",
  original: "I believe that we only know our problems, so we have solved problems according to our needs and know one another can help in this; we know ourselves better; we are Banggali.",
};

export const BRAVERY = {
  title: "Live with courage, and no wrongdoer can stand in our way",
  /** Words in `title` set apart in white. */
  accent: "no wrongdoer",
  body: "We have the resources, the people, and the soil to grow our food: we have enough. Drop the habits of blame, illegal work and greed, correct a few basic mistakes, and stand together against the few who do wrong, and we can solve these problems together.",
};

/* ── The 32 problems → the 32 ideas ─────────────────────────────────── */

export interface ProblemIdeas {
  title: string;
  brief: string;
  fact?: { text: string; source: string };
  /** Proposals the dossier's evidence supports — the way forward. */
  doThis: Decision[];
  /** Tempting moves the evidence rules out. */
  avoid: Decision[];
}

/** Bangla title, brief and the idea checklist for dossier point `n`. */
export function ideasFor(n: number): ProblemIdeas | undefined {
  const p = puzzleOf(n);
  if (!p) return undefined;
  return {
    title: p.title,
    brief: p.brief,
    fact: p.fact,
    doThis: p.decisions.filter((d) => d.answer === "yes"),
    avoid: p.decisions.filter((d) => d.answer === "no"),
  };
}

/** A decision is phrased as a question in the game; as advice it is a statement. */
export const asStatement = (q: string) => q.replace(/\s*\?$/, "").replace(/\s*—\s*/g, " — ");
