export interface ResearchSpec {
  label: string;
  value: string;
  tone: "primary" | "signal";
}

export interface ResearchInitiative {
  badge: string;
  badgeTone: "primary" | "signal";
  icon: string;
  title: string;
  description: string;
  specs: ResearchSpec[];
  stage: string;
  trl: string;
}

export const researchInitiatives: ResearchInitiative[] = [
  {
    badge: "RADAR SENSORY AI",
    badgeTone: "primary",
    icon: "visibility",
    title: "2-Meter Radar Eye-Consciousness",
    description:
      "Lightweight wearable eyewear with 60GHz FMCW millimeter-wave radar and stereoscopic ultrasound. Translates urban obstacles (rickshaws, open potholes, hanging electric cables) into directional spatial haptic feedback and natural Bengali audio cues for the blind.",
    specs: [
      { label: "Detection Range:", value: "0.1m - 3.2m spherical", tone: "primary" },
      { label: "Latency:", value: "< 8ms on-device DSP", tone: "signal" },
    ],
    stage: "Clinical Trials",
    trl: "TRL-6 Verified",
  },
  {
    badge: "BIOMECHATRONICS",
    badgeTone: "signal",
    icon: "precision_manufacturing",
    title: "Autonomous Waste-to-Soil Recycler",
    description:
      "Industrial edge-computing mechatronic unit utilizing multi-spectral computer vision to isolate wet organic refuse, applying accelerated thermophilic microbial digestion to transform municipal garbage into rich agricultural fertilizer in under 48 hours.",
    specs: [
      { label: "Sorting Precision:", value: "99.4% CNN Accuracy", tone: "primary" },
      { label: "Conversion Cycle:", value: "48 Hours Continuous", tone: "signal" },
    ],
    stage: "Tejgaon Field Unit 02",
    trl: "TRL-7 Deployed",
  },
  {
    badge: "SEMICONDUCTOR",
    badgeTone: "primary",
    icon: "developer_board",
    title: "Indigenous IC & Cleanroom Roadmap",
    description:
      "Establishing Bangladesh's first dedicated open-architecture RISC-V biomedical IC design cell. Laying the micro-architectural groundwork for an ISO Class 5 pilot semiconductor packaging and testing cleanroom in Dhaka.",
    specs: [
      { label: "Architecture:", value: "RISC-V 32-bit Bio-Core", tone: "primary" },
      { label: "Fabrication Target:", value: "TSMC / GF Tapeout Q4", tone: "signal" },
    ],
    stage: "RTL Verification",
    trl: "TRL-4 Active",
  },
];
