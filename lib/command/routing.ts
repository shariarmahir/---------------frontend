import type { Category, Dept, PoliceCategory, Severity } from "./types.ts";

export interface CategoryMeta {
  dept: Dept;
  agency?: string;
  labelBn: string;
  label: string;
  icon: string;
  severity: Severity;
}

/** Which body receives each kind of complaint, and how urgent it is by default. */
export const CATEGORY_META: Record<Category, CategoryMeta> = {
  chadabaji: { dept: "police", labelBn: "চাঁদাবাজি", label: "Extortion", icon: "payments", severity: "critical" },
  harassment: { dept: "police", labelBn: "হয়রানি", label: "Harassment", icon: "report", severity: "critical" },
  "police-misconduct": { dept: "police", labelBn: "পুলিশি অসদাচরণ", label: "Police misconduct", icon: "gavel", severity: "high" },
  theft: { dept: "police", labelBn: "চুরি/ছিনতাই", label: "Theft and snatching", icon: "local_police", severity: "high" },
  assault: { dept: "police", labelBn: "হামলা", label: "Assault", icon: "emergency", severity: "critical" },
  protest: { dept: "police", labelBn: "বিক্ষোভ/প্রতিবাদ", label: "Protest and unrest", icon: "campaign", severity: "high" },
  "sexual-harassment": { dept: "police", labelBn: "যৌন হয়রানি/ইভটিজিং", label: "Sexual harassment", icon: "woman", severity: "critical" },
  "domestic-violence": { dept: "police", labelBn: "নারী নির্যাতন", label: "Domestic violence", icon: "family_restroom", severity: "high" },
  kidnapping: { dept: "police", labelBn: "অপহরণ", label: "Kidnapping", icon: "person_search", severity: "critical" },
  drugs: { dept: "police", labelBn: "মাদক", label: "Drugs", icon: "medication", severity: "high" },
  /** A press of the SOS button: critical, nearest unit, the shortest window (alerting.ts SOS_ACK_WINDOW_MS). */
  sos: { dept: "police", labelBn: "জরুরি SOS", label: "SOS emergency", icon: "sos", severity: "critical" },
  adulteration: { dept: "consumer", labelBn: "খাদ্যে ভেজাল", label: "Food adulteration", icon: "science", severity: "high" },
  overpricing: { dept: "consumer", labelBn: "অতিরিক্ত দাম", label: "Overpricing", icon: "price_change", severity: "normal" },
  "fake-product": { dept: "consumer", labelBn: "নকল পণ্য", label: "Fake product", icon: "inventory_2", severity: "normal" },
  "unsafe-business": { dept: "consumer", labelBn: "অনিরাপদ ব্যবসা", label: "Unsafe business", icon: "warning", severity: "high" },
  "false-weight": { dept: "consumer", labelBn: "ওজনে কম", label: "Short weight", icon: "scale", severity: "normal" },
  bribery: { dept: "other", agency: "Anti-Corruption Commission (ACC)", labelBn: "ঘুষ দাবি", label: "Bribe demand", icon: "account_balance", severity: "high" },
  "land-grab": { dept: "other", agency: "Land Office / AC Land", labelBn: "জমি দখল", label: "Land grabbing", icon: "landscape", severity: "normal" },
  "service-denial": { dept: "other", agency: "Grievance Redress System (GRS)", labelBn: "সেবা না পাওয়া", label: "Service denied", icon: "block", severity: "normal" },
  environment: { dept: "other", agency: "Department of Environment", labelBn: "পরিবেশ দূষণ", label: "Pollution", icon: "eco", severity: "normal" },
  labour: { dept: "other", agency: "DIFE (Labour inspection)", labelBn: "শ্রম অধিকার", label: "Labour rights", icon: "engineering", severity: "normal" },
  other: { dept: "other", agency: "District Commissioner's Office", labelBn: "অন্যান্য", label: "Other", icon: "help", severity: "normal" },
};

/** Police categories in CATEGORY_META order (history and intel index them by this). */
export const POLICE_CATEGORIES: readonly PoliceCategory[] = (Object.keys(CATEGORY_META) as Category[]).filter(
  (c): c is PoliceCategory => CATEGORY_META[c].dept === "police",
);

/** Categories that are about violence against women and girls (the women safety desk's own queue). */
export const WOMEN_CATEGORIES: readonly PoliceCategory[] = ["sexual-harassment", "domestic-violence"];

export function routeCategory(c: Category): { dept: Dept; agency?: string; severity: Severity } {
  const m = CATEGORY_META[c];
  return { dept: m.dept, agency: m.agency, severity: m.severity };
}
