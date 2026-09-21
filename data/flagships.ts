export interface SwastiFeature {
  icon: string;
  title: string;
  description: string;
  tone: "primary" | "signal";
}

export const swastiFeatures: SwastiFeature[] = [
  {
    icon: "mic",
    title: "Dialect NLP",
    description: "Voice symptom intake in 14 native dialects",
    tone: "primary",
  },
  {
    icon: "quick_reference",
    title: "RAG Clinical Core",
    description: "BMDC-compliant medical protocol engine",
    tone: "primary",
  },
  {
    icon: "document_scanner",
    title: "Prescription Vision",
    description: "OCR deciphering unstructured doctor handwriting",
    tone: "primary",
  },
  {
    icon: "emergency",
    title: "Golden 2-Hrs Dispatch",
    description: "GPS automated fleet and blood donor beaconing",
    tone: "signal",
  },
];

export interface SensorSpec {
  icon: string;
  title: string;
  description: string;
  tone: "primary" | "signal";
}

export const aponjonSensors: SensorSpec[] = [
  {
    icon: "monitor_heart",
    title: "ECG / PPG",
    description: "Single-lead continuous",
    tone: "primary",
  },
  {
    icon: "blood_pressure",
    title: "SpO2 Optical",
    description: "Pulse oximetry radar",
    tone: "primary",
  },
  {
    icon: "thermostat",
    title: "Sub-dermal Temp",
    description: "±0.05°C precision",
    tone: "primary",
  },
  {
    icon: "water_drop",
    title: "Glucose Index",
    description: "Non-invasive trend AI",
    tone: "primary",
  },
  {
    icon: "psychology",
    title: "Stress & EMG",
    description: "Sympathetic telemetry",
    tone: "primary",
  },
  {
    icon: "battery_charging_full",
    title: "14-Day Cell",
    description: "Low-power RISC-V",
    tone: "signal",
  },
];

export interface PharmacyCapability {
  icon: string;
  title: string;
  description: string;
  tone: "primary" | "signal";
}

export const pharmacyCapabilities: PharmacyCapability[] = [
  {
    icon: "inventory_2",
    title: "Counterfeit Drug Barcode AI",
    description:
      "Spectroscopic medicine verification to eliminate spurious pharmaceuticals",
    tone: "primary",
  },
  {
    icon: "contactless",
    title: "Micro-Diagnostics Terminal",
    description:
      "Integrated strip reader for lipid profiles, kidney function, and liver enzymes",
    tone: "primary",
  },
  {
    icon: "local_hospital",
    title: "Instant Tele-Doctor Relay",
    description:
      "Guaranteed sub-3 minute video connection with specialized medical officers",
    tone: "signal",
  },
];
