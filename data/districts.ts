/** All 64 districts of Bangladesh, by division. Shared by the account forms and শিক্ষিতদের মিডিয়া. */
export const divisions = [
  { name: "ঢাকা", districts: ["ঢাকা", "গাজীপুর", "নারায়ণগঞ্জ", "নরসিংদী", "মুন্সীগঞ্জ", "মানিকগঞ্জ", "টাঙ্গাইল", "কিশোরগঞ্জ", "ফরিদপুর", "গোপালগঞ্জ", "মাদারীপুর", "রাজবাড়ী", "শরীয়তপুর"] },
  { name: "চট্টগ্রাম", districts: ["চট্টগ্রাম", "কক্সবাজার", "কুমিল্লা", "ফেনী", "নোয়াখালী", "লক্ষ্মীপুর", "চাঁদপুর", "ব্রাহ্মণবাড়িয়া", "রাঙামাটি", "খাগড়াছড়ি", "বান্দরবান"] },
  { name: "রাজশাহী", districts: ["রাজশাহী", "বগুড়া", "পাবনা", "সিরাজগঞ্জ", "নাটোর", "নওগাঁ", "চাঁপাইনবাবগঞ্জ", "জয়পুরহাট"] },
  { name: "খুলনা", districts: ["খুলনা", "যশোর", "সাতক্ষীরা", "বাগেরহাট", "কুষ্টিয়া", "মেহেরপুর", "চুয়াডাঙ্গা", "ঝিনাইদহ", "মাগুরা", "নড়াইল"] },
  { name: "বরিশাল", districts: ["বরিশাল", "পটুয়াখালী", "ভোলা", "বরগুনা", "ঝালকাঠি", "পিরোজপুর"] },
  { name: "সিলেট", districts: ["সিলেট", "মৌলভীবাজার", "হবিগঞ্জ", "সুনামগঞ্জ"] },
  { name: "রংপুর", districts: ["রংপুর", "দিনাজপুর", "ঠাকুরগাঁও", "পঞ্চগড়", "নীলফামারী", "লালমনিরহাট", "কুড়িগ্রাম", "গাইবান্ধা"] },
  { name: "ময়মনসিংহ", districts: ["ময়মনসিংহ", "জামালপুর", "শেরপুর", "নেত্রকোনা"] },
] as const;

export type Division = (typeof divisions)[number]["name"];
export const districts = divisions.flatMap((d) => d.districts);

export function divisionOf(district: string): Division | undefined {
  return divisions.find((d) => (d.districts as readonly string[]).includes(district))?.name;
}
