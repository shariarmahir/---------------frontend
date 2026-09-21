export interface FooterTelemetry {
  label: string;
  value: string;
  tone: "primary" | "signal" | "crimson";
}

export const footerTelemetry: FooterTelemetry[] = [
  {
    label: "National Impact Telemetry",
    value: "64 Districts Active Grid",
    tone: "primary",
  },
  {
    label: "Target Capacity",
    value: "10M+ Health Telemetry Records",
    tone: "signal",
  },
  {
    label: "Mission Threshold",
    value: "Golden 2 Hours Response Protocol",
    tone: "crimson",
  },
];

export const corePipelines: string[] = [
  "SWASTI Emergency Super App",
  "Aponjon Neuro Wearable Telemetry",
  "Autonomous Computer Vision Waste Sorting",
  "Tactile Blind Assistance Artificial Intelligence",
  "Semiconductor Cleanroom & Foundry Roadmap",
];
