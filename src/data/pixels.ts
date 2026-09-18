export interface PixelThesis {
  code: string;
  icon: string;
  title: string;
  problem: string;
  resolution: string;
}

export const pixelThesis: PixelThesis[] = [
  {
    code: "PIXEL_01 // BIO-GRID",
    icon: "vital_signs",
    title: "Clinical Blindspots",
    problem:
      "82% of rural citizens lack access to rapid electrocardiograms or certified diagnostic triage during acute cardiovascular infarctions.",
    resolution:
      "Aponjon Neuro Wearable & SWASTI Golden 2-Hours Network",
  },
  {
    code: "PIXEL_02 // SILICON",
    icon: "memory",
    title: "Foundry Vulnerability",
    problem:
      "100% dependency on imported micro-controllers and bio-sensing ICs costs billions and sacrifices national technological sovereignty.",
    resolution:
      "Indigenous ASIC Architecture & Dhaka Cleanroom Testing Lab",
  },
  {
    code: "PIXEL_03 // MECHATRONICS",
    icon: "compost",
    title: "Organic Waste Toxicity",
    problem:
      "Unsegregated landfill leachate pollutes Dhaka water aquifers while chemical fertilizers deplete agricultural topsoils.",
    resolution:
      "Edge-AI Optical Waste Segregation & 48-Hour Biomechatronic Soil Converters",
  },
  {
    code: "PIXEL_04 // SENSORY-AI",
    icon: "blind",
    title: "Tactile Isolation",
    problem:
      "Over 4 million visually impaired citizens navigate chaotic urban topographies with zero sovereign assisted infrastructure.",
    resolution:
      "2-Meter FMCW Radar Sensory Eyewear with Bengali Audio Consciousness",
  },
];
