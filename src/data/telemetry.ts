export interface TelemetryReading {
  icon: string;
  label: string;
  value: string;
  tone: "primary" | "signal";
}

export const telemetryReadings: TelemetryReading[] = [
  {
    icon: "schedule",
    label: "Golden 2-Hours Critical Response Protocol:",
    value: "ONLINE",
    tone: "primary",
  },
  {
    icon: "domain_verification",
    label: "One Village, One Health Node:",
    value: "45,120 Mapped",
    tone: "signal",
  },
  {
    icon: "sensors",
    label: "Aponjon Neuro Synapse Telemetry:",
    value: "Sub-24ms RTT",
    tone: "primary",
  },
];

export interface HeroProofPoint {
  label: string;
  value: string;
  caption: string;
  tone: "primary" | "signal";
}

export const heroProofPoints: HeroProofPoint[] = [
  {
    label: "EMERGENCY PROTOCOL",
    value: "< 120 Mins",
    caption: "Golden window triage",
    tone: "primary",
  },
  {
    label: "DISTRICT COVERAGE",
    value: "64 / 64",
    caption: "Sub-divisional nodes",
    tone: "signal",
  },
  {
    label: "DIALECT ENGINE",
    value: "14 Dialects",
    caption: "Real-time local NLP",
    tone: "primary",
  },
];
