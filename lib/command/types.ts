export type Dept = "police" | "consumer" | "other";
export type PoliceCategory =
  | "chadabaji"
  | "harassment"
  | "police-misconduct"
  | "theft"
  | "assault"
  | "protest"
  | "sexual-harassment"
  | "domestic-violence"
  | "kidnapping"
  | "drugs"
  | "sos";
export type ConsumerCategory = "adulteration" | "overpricing" | "fake-product" | "unsafe-business" | "false-weight";
export type OtherCategory = "bribery" | "land-grab" | "service-denial" | "environment" | "labour" | "other";
export type Category = PoliceCategory | ConsumerCategory | OtherCategory;
export type Severity = "critical" | "high" | "normal";
export type Status = "new" | "alerted" | "acknowledged" | "en-route" | "on-scene" | "resolved" | "closed";
export type UnitKind = "station" | "patrol" | "office" | "team";
export type UnitStatus = "available" | "busy" | "off-duty";
export type DivisionId = "dhaka" | "chattogram" | "khulna" | "rajshahi" | "sylhet" | "barishal" | "rangpur" | "mymensingh";

export interface LatLng { lat: number; lng: number }
export interface Place extends LatLng { division: DivisionId; district: string; areaBn: string }

export interface Unit extends LatLng {
  id: string;
  kind: UnitKind;
  dept: "police" | "consumer";
  name: string;
  nameBn: string;
  /** The station/office this unit belongs to (a station/office points at itself). */
  homeId: string;
  status: UnitStatus;
  /** Case the unit is working, when busy. */
  caseId?: string;
  /** Set on stations and patrols (data/command/stations.ts); offices and teams get theirs from selectors' unitDivision(). */
  division?: DivisionId;
}

export type AlertOutcome = "pending" | "acknowledged" | "timed-out" | "declined";
export interface Alert { at: number; unitId: string; outcome: AlertOutcome }

export type TimelineKind = "reported" | "alerted" | "acknowledged" | "dispatched" | "arrived" | "resolved" | "closed" | "escalated" | "note" | "reopened" | "forwarded";
export interface TimelineEntry { at: number; kind: TimelineKind; text: string; by?: string }
/** What a note records: a call, or the outcome of an inspection (consumer cases). */
export type NoteKind = "call" | "inspection" | "warning" | "fine" | "sealed";
export interface CaseNote {
  at: number;
  text: string;
  followUpAt?: number;
  kind?: NoteKind;
  /** Whole taka; set only on a "fine". */
  amountTk?: number;
}

/** Who the complaint is about protecting. Nothing else about a person is ever recorded. */
export type Victim = "woman" | "child" | "elderly" | "general";
/**
 * The kind of actor behind a case. Only the kind, a fictional group code and a
 * head count: never religion, ethnicity, party, caste or appearance.
 */
export type InvolvedKind = "ring" | "gang" | "repeat" | "individual" | "unknown";
export interface Involved {
  kind: InvolvedKind;
  /** Fictional code shared by every case of one ring or gang, e.g. "চক্র-০৭". */
  groupId?: string;
  people?: number;
}

export interface Case {
  id: string;            // "PB-" + 6 digits, e.g. "PB-000042"
  dept: Dept;
  agency?: string;       // receiving body for dept "other" (English name)
  category: Category;
  severity: Severity;
  titleBn: string;
  summaryBn: string;
  place: Place;
  reportedAt: number;    // epoch ms
  status: Status;
  /** Owning station (police) or office (consumer): the nearest one to the place. */
  homeId?: string;
  assignedUnitId?: string;
  distanceKm?: number;
  etaMin?: number;
  /** First acknowledgement time, for response-time stats. */
  firstAckAt?: number;
  resolvedAt?: number;
  overdue?: boolean;
  alerts: Alert[];
  timeline: TimelineEntry[];
  notes: CaseNote[];
  businessId?: string;
  victim?: Victim;
  /** The complainant asked not to be named (their identity is never on the board either way). */
  anonymous?: boolean;
  involved?: Involved;
  /** Consumer cases about one product: a price-watch item (data/command/prices.ts) or a recall (data/command/recalls.ts). */
  productId?: string;
}

export interface Business extends LatLng { id: string; nameBn: string; name: string; kind: string; district: string; division: DivisionId }

/* ------------------------------------------------------------- price watch */

export type PriceUnit = "kg" | "litre" | "dozen" | "piece";
export type PriceGroup = "rice" | "pulses" | "oil" | "sugar" | "vegetables" | "protein" | "fruit" | "dairy" | "other";
/** A price the government fixed: verified, with its source and when it took effect. */
export interface FixedPrice { priceTk: number; source: string; effective: string; reportedBy: readonly string[] }
/** A sample market range (not an official figure). */
export interface PriceRange { lowTk: number; highTk: number }
interface PriceBase { id: string; nameBn: string; name: string; unit: PriceUnit; group: PriceGroup }
export type PriceItem = PriceBase & ({ fixed: FixedPrice; reference?: undefined } | { reference: PriceRange; fixed?: undefined });

/* ---------------------------------------------------------- remove from sale */

export type Hazard =
  | "formalin"
  | "carbide-ripening"
  | "textile-dye"
  | "expired-relabelled"
  | "counterfeit-medicine"
  | "mercury-cream"
  | "fake-bsti-mark"
  | "adulterated-honey-ghee"
  | "reused-oil"
  | "unsafe-baby-food";
export type RegulatorId = "bsti" | "dgda" | "bfsa" | "dncrp";
export type Danger = "critical" | "high" | "medium";
export interface RecallItem {
  id: string;
  brandBn: string;
  brand: string;
  productBn: string;
  product: string;
  hazard: Hazard;
  regulator: RegulatorId;
  danger: Danger;
  /** Real district names where the (fictional) product was found. */
  districts: readonly string[];
  /** Units the regulator expects to pull from shelves. */
  seededUnits: number;
  /** Business kinds that would stock it (consumer cases can point at it). */
  kinds: readonly string[];
}
export type RecallStatus = "ordered" | "seizing" | "seized" | "destroyed";
export interface RecallState { status: RecallStatus; seizedUnits: number; updatedAt: number; log: { at: number; text: string }[] }

export interface World {
  version: 2;
  seed: number;
  now: number;
  /** RNG state, so a tick continues the same sequence. */
  rngState: number;
  nextId: number;
  /** Epoch ms when the next simulated case arrives. */
  nextArrivalAt: number;
  paused: boolean;
  cases: Case[];
  units: Unit[];
  businesses: Business[];
  /** Remove-from-sale progress per recall id (lib/command/recalls.ts); absent on a world saved before recalls. */
  recalls?: Record<string, RecallState>;
}

export type ActionResult = { ok: true; world: World } | { ok: false; error: string };
