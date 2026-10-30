/**
 * The R&D Fellowship (/team/fellowship): Kandari-Lab's rotating research
 * cohort. Facts come from CLAUDE.md §2: rotating interns on the lab's
 * early-stage research, a 2.5-month cycle, high performers converted to
 * paid roles; the tracks are the R&D pipeline (blind-assistance wearable,
 * organic waste to soil, both "In research") and the two flagship products.
 * Who works on a track is read from each member's `works` in data/team.ts,
 * never typed in here. The week-by-week phases are a draft for Mahir to
 * confirm before a cohort is announced.
 */
import { fellowship, team, type DeptId } from "./team.ts";

export type TrackId = "sight" | "soil" | "swasti" | "aponjon";

export interface FellowshipTrack {
  id: TrackId;
  title: string;
  /** The product or project the track belongs to. */
  project: string;
  icon: string;
  status: "In research" | "Flagship product";
  summary: string;
  /** What a fellow works on. */
  work: string[];
  skills: string[];
  /** The `works` entry in data/team.ts that names this project. */
  worksKey?: string;
  /** Teams the fellow sits with when no member is named on the project yet. */
  depts: DeptId[];
  /** The Genius entry on this research, if there is one. */
  research?: string;
}

export const TRACKS: FellowshipTrack[] = [
  {
    id: "sight",
    title: "Sight for the blind",
    project: "Blind-assistance wearable",
    icon: "visibility",
    status: "In research",
    summary: "A wearable that senses the two metres around a person in real time and tells them, through an AI \"eye\", what is there.",
    work: ["Distance and obstacle sensing within two metres", "On-device vision models that name what is ahead", "Feedback a person can trust: sound and vibration"],
    skills: ["Embedded C", "LiDAR and ultrasonic sensors", "Computer vision", "User testing"],
    worksKey: "Blind-assistance wearable (in research)",
    depts: ["iot", "dev"],
    research: "blind-assist-wearable",
  },
  {
    id: "soil",
    title: "Waste into soil",
    project: "Organic waste to soil",
    icon: "compost",
    status: "In research",
    summary: "Sorting a city's organic waste with cameras and sensors, and guiding it through composting into soil farmers can use.",
    work: ["Collecting and labelling images of household waste", "A classifier that separates organic waste", "Sensors that track a compost pile's temperature and moisture"],
    skills: ["Python and data labelling", "Image classification", "Sensors and logging", "Field work"],
    depts: ["dev", "iot"],
    research: "organic-waste-to-soil",
  },
  {
    id: "swasti",
    title: "Health AI in Bangla",
    project: "SWASTI (স্বস্তি)",
    icon: "neurology",
    status: "Flagship product",
    summary: "The health super-app: a Bangla voice assistant, a retrieval (RAG) medical agent and a CNN diagnostic model, built for people far from a doctor.",
    work: ["Bangla speech and retrieval for medical questions", "Evaluating models against what doctors expect", "App features in Flutter and the APIs behind them"],
    skills: ["Python and PyTorch", "RAG and evaluation", "Flutter", "APIs"],
    worksKey: "SWASTI",
    depts: ["dev"],
  },
  {
    id: "aponjon",
    title: "Wearable vital signs",
    project: "আপনজন (Aponjon)",
    icon: "ecg_heart",
    status: "Flagship product",
    summary: "The wearable that reads ECG, EMG, SpO2, temperature and glucose, and turns them into stress and energy scores.",
    work: ["Sensor circuits and low-power firmware", "Cleaning signals and scoring them", "A case comfortable enough to wear all day"],
    skills: ["Embedded systems", "Signal processing", "PCB design", "Ergonomic design"],
    worksKey: "আপনজন (Aponjon)",
    depts: ["iot", "creative"],
  },
];

/** The members already on a track's project, from their own `works`. */
export const trackTeam = (t: FellowshipTrack) => (t.worksKey ? team.filter((m) => m.works.includes(t.worksKey!)) : []);

export const findTrack = (id: string) => TRACKS.find((t) => t.id === id);

/** How a cohort runs: a draft schedule across the 2.5 months (about ten weeks). */
export const PHASES = [
  { weeks: "Weeks 1–2", title: "Join and choose a problem", icon: "flag", body: "Meet the team on your track, pick one problem inside it and write a one-page plan: the question, the method, what done looks like." },
  { weeks: "Weeks 3–7", title: "Build and test", icon: "build", body: "Prototype the circuit, the model or the study, with a review every week. What fails is recorded as carefully as what works." },
  { weeks: "Weeks 8–9", title: "Field test and write up", icon: "travel_explore", body: "Test with real users or real data, then write the work up to Genius's standard so others can build on it." },
  { weeks: "Week 10", title: "Demo and review", icon: "rocket_launch", body: "Show the team what you built and what you learned. High performers are offered paid roles at Kandari-Lab." },
] as const;

/** What the lab looks for in a fellow. */
export const LOOK_FOR = [
  { icon: "location_on", title: "A problem you care about", body: "You know a Bangladeshi problem up close and want to see it fixed." },
  { icon: "construction", title: "Something you can build", body: "Code, circuits, design or field research: show us one thing you made." },
  { icon: "fact_check", title: "Honesty with data", body: "You report what happened, including what did not work." },
  { icon: "event_available", title: "Time for the whole cycle", body: `You can commit to the full ${fellowship.cycle} of a cohort.` },
] as const;

export const FAQ = [
  { q: "How long is a cohort?", a: `${fellowship.cycle} (${fellowship.cycleBn}). Each cohort works on the lab's early-stage research from start to demo.` },
  { q: "Is the fellowship paid?", a: "Each cohort's terms are set out in its call on Kandari Profile. Fellows who perform well are converted to paid roles at Kandari-Lab." },
  { q: "Who can apply?", a: "Anyone who can commit to the full cycle and can show something they built or researched. Students and recent graduates in engineering, computing, design and the sciences are the most common fit." },
  { q: "Can I apply to more than one track?", a: "Choose one track per cohort. You can withdraw your application and apply again with a different track until the call closes." },
  { q: "What happens to my work?", a: "With the team's agreement, it can be published on Genius under your name, with its own tracking number, so it stays citable after the cohort ends." },
  { q: "Where do fellows work?", a: "Each cohort's call says where and how fellows work. We announce every call on Kandari Profile." },
] as const;
