export type Dept = "police" | "consumer" | "other";
export type PoliceCategory = "chadabaji" | "harassment" | "police-misconduct" | "theft" | "assault" | "protest";
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
}

export type AlertOutcome = "pending" | "acknowledged" | "timed-out" | "declined";
export interface Alert { at: number; unitId: string; outcome: AlertOutcome }

export type TimelineKind = "reported" | "alerted" | "acknowledged" | "dispatched" | "arrived" | "resolved" | "closed" | "escalated" | "note" | "reopened" | "forwarded";
export interface TimelineEntry { at: number; kind: TimelineKind; text: string; by?: string }
export interface CaseNote { at: number; text: string; followUpAt?: number }

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
}

export interface Business extends LatLng { id: string; nameBn: string; name: string; kind: string; district: string; division: DivisionId }

export interface World {
  version: 1;
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
}

export type ActionResult = { ok: true; world: World } | { ok: false; error: string };
