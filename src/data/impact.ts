export interface ImpactStat {
  label: string;
  value: number;
  suffix?: string;
}

export const impactStats: ImpactStat[] = [
  { label: "People Trained", value: 12500, suffix: "+" },
  { label: "Partner Organizations", value: 42, suffix: "+" },
  { label: "Districts Reached", value: 38 },
  { label: "Jobs Facilitated", value: 3200, suffix: "+" },
];

export interface ImpactTrendPoint {
  year: string;
  peopleTrained: number;
  partners: number;
}

export const impactTrend: ImpactTrendPoint[] = [
  { year: "2021", peopleTrained: 800, partners: 4 },
  { year: "2022", peopleTrained: 2600, partners: 11 },
  { year: "2023", peopleTrained: 5400, partners: 21 },
  { year: "2024", peopleTrained: 9100, partners: 33 },
  { year: "2025", peopleTrained: 12500, partners: 42 },
];

export interface RegionImpact {
  region: string;
  peopleReached: number;
}

export const regionImpact: RegionImpact[] = [
  { region: "Dhaka", peopleReached: 4200 },
  { region: "Chattogram", peopleReached: 2600 },
  { region: "Khulna", peopleReached: 1800 },
  { region: "Rajshahi", peopleReached: 1500 },
  { region: "Sylhet", peopleReached: 1200 },
  { region: "Barishal", peopleReached: 1200 },
];
