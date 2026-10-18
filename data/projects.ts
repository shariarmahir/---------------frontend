/**
 * Projects built under a service (data/services.ts), shown on that
 * service's page and on a page of their own.
 *
 * A project here is what Kandari-Lab has proposed or built for a client.
 * Its `demo` figures come from the project's demo dashboard, which runs on
 * a sample shift: they show what the system displays, not results from a
 * live floor, and the UI labels them so. The timeline is the proposed
 * plan; only the stages before `timeline.current` are done.
 */

import {
  siAndroid,
  siClaude,
  siDocker,
  siEspressif,
  siFastapi,
  siMqtt,
  siNextdotjs,
  siPostgresql,
  siPython,
  siRaspberrypi,
  siReact,
  siTailwindcss,
  siTypescript,
  siVercel,
  type SimpleIcon,
} from "simple-icons";
import type { Pipeline } from "./catalog";

export interface ProjectTech {
  /** The brand logo (simple-icons): its path, colour and name. */
  logo: SimpleIcon;
  /** What it does in this project, in a few words. */
  role: string;
  /** `demo`: the working demo is built with it; `proposed`: part of the plan for the floor. */
  layer: "demo" | "proposed";
}

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
  /** The demo's screens, in the order of its sidebar. */
  modules: { icon: string; label: string; body: string }[];
  tech: ProjectTech[];
  shots: ProjectShot[];
  /** Read off the demo dashboard's sample shift. */
  demo: { value: string; label: string }[];
  timeline: Pipeline & { notes: string[] };
  /** The live demo's address, once it is public. */
  demoUrl?: string;
}

export const projects: Project[] = [
  {
    id: "alliance-dyer",
    service: "automation",
    name: "Alliance Dyer Automation",
    client: "Alliance Automations",
    status: "Proposed, with a working demo",
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
      note: "The demo is built and the project is proposed; nothing is installed on the floor yet.",
      notes: [
        "Map the floor: fifty machines, five bays, and the signals each one gives.",
        "Overview, control panel, wallboard and tablet, running on a sample shift.",
        "Scope, hardware and cost agreed with the dyeing house.",
        "Connect one bay of ten machines and run it beside today's process.",
        "Roll out to the whole floor, train the operators and hand over.",
      ],
    },
  },
];

export const projectsFor = (service: string) => projects.filter((p) => p.service === service);

export const getProject = (service: string, id: string) => projects.find((p) => p.service === service && p.id === id);
