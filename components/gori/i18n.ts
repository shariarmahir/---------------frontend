/**
 * Interface strings, Bengali first with an English fallback (Prompt V3 §11).
 * Scenario content (briefs, explanations) is Bengali only, with English
 * titles carried in the data — a documented limitation.
 */

const dict = {
  appName: ["চলো বাংলাদেশ গড়ি", "Cholo Bangladesh Gori"],
  tagline: ["ব্যবস্থা গড়ুন। ভবিষ্যৎ পরীক্ষা করুন। ফলের মুখোমুখি হোন।", "Build the system. Test the future. Face the consequences."],
  navHome: ["কমান্ড সেন্টার", "Command centre"],
  navMission: ["জাতীয় মিশন", "National mission"],
  navPlay: ["অভিযান", "Campaign"],
  navLab: ["বিজ্ঞানাগার", "Lab"],
  navEvidence: ["প্রমাণ", "Evidence"],
  navCompare: ["তুলনা", "Compare"],
  navForge: ["দৃশ্যকল্প কারখানা", "Scenario forge"],
  navCommunity: ["কমিউনিটি মিশন", "Community"],
  navProgress: ["অগ্রগতি", "Progress"],
  navProfile: ["প্রোফাইল ও সেটিংস", "Profile & settings"],
  turn: ["টার্ন", "Turn"],
  budget: ["বাজেট", "Budget"],
  workforce: ["কর্মী", "Workforce"],
  index: ["সেবা সূচক", "Service index"],
  gameIndex: ["খেলার সূচক — বাস্তব পরিসংখ্যান নয়", "Game index — not a real statistic"],
  runTurn: ["টার্ন চালান", "Run turn"],
  finish: ["ফলাফল দেখুন", "See results"],
  rewind: ["এক টার্ন পিছনে", "Back one turn"],
  restart: ["নতুন করে শুরু", "Restart"],
  tabMap: ["কারণ-মানচিত্র", "Causal map"],
  tabBuild: ["হস্তক্ষেপ", "Interventions"],
  tabAllocate: ["সম্পদ বণ্টন", "Allocation"],
  tabResults: ["ফলাফল", "Results"],
  aiOpen: ["AI বিশ্লেষণ", "AI analysis"],
  pilot: ["পাইলট", "Pilot"],
  full: ["পূর্ণ পরিসর", "Full scale"],
  scale: ["বড় করুন", "Scale up"],
  stop: ["থামান", "Stop"],
  queued: ["পরিকল্পনায় আছে", "Planned"],
  running: ["চলছে", "Running"],
  locked: ["শর্ত বাকি", "Blocked"],
  available: ["চালু করা যায়", "Available"],
  cancel: ["বাতিল", "Cancel"],
  save: ["সংরক্ষণ", "Save"],
  loading: ["লোড হচ্ছে…", "Loading…"],
  simulated: ["সিমুলেশন — বাস্তব ফল নয়", "Simulation — not real-world results"],
  offline: ["অফলাইন বিশ্লেষণ", "Offline analysis"],
  live: ["Claude · লাইভ", "Claude · live"],
  unlockAt: ["খুলবে স্তর", "Unlocks at level"],
  level: ["স্তর", "Level"],
  settings: ["সেটিংস", "Settings"],
} as const;

export type Lang = "bn" | "en";
export type Key = keyof typeof dict;

export function translate(lang: Lang, key: Key): string {
  return dict[key][lang === "en" ? 1 : 0];
}

const DIGITS = "০১২৩৪৫৬৭৮৯";

/** Digits for display in the chosen language. */
export function num(v: number | string, lang: Lang = "bn"): string {
  const s = typeof v === "number" ? String(Math.round(v * 10) / 10) : v;
  return lang === "en" ? s : s.replace(/\d/g, (d) => DIGITS[Number(d)]);
}
