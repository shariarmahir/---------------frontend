/**
 * The road map behind the trip planner: where you can go from Dhaka, how, for
 * how much, and when not to. A fare marked `checked` comes from a published
 * chart or report (November 2026); the rest are our rough estimates and the
 * page labels them as such. Fuel rises moved fares twice in 2026.
 */

export type LegKind = "cheapest" | "easiest" | "fun";
type Mode = "Bus" | "Train" | "Launch" | "Flight" | "Ship" | "Jeep" | "Boat";

export interface Leg {
  mode: Mode;
  how: string;
  /** One-way, one person, in taka. */
  fare: number;
  hours: number;
  checked?: boolean;
  kinds: LegKind[];
}

export interface SeasonNote {
  months: number[];
  level: "closed" | "caution" | "best";
  text: string;
}

export interface Region {
  id: string;
  name: string;
  lat: number;
  lon: number;
  blurb: string;
  /** A rough day of bed, food and local transport, per person, in taka. */
  dayBudget: number;
  dayComfort: number;
  sights: string[];
  legs: Leg[];
  notes: SeasonNote[];
  nearby: string[];
  /** Words a visitor might use for this place. */
  names: string[];
  forVisitors?: string;
  /** Most visits last about this long; past it the planner says so. */
  usualDays?: number;
}

const HILLS = "Foreigners need a travel permit for the Hill Tracts, and some governments, including the US, advise against travel to these districts. Check with a local operator and your embassy first.";

export const REGIONS: Region[] = [
  {
    id: "coxs-bazar", name: "Cox's Bazar", lat: 21.43, lon: 91.97, blurb: "A sea beach that runs about 120 km, and the 80 km Marine Drive south to Teknaf.",
    dayBudget: 3000, dayComfort: 9000, sights: ["Sunset at Kolatoli", "Himchari and Inani by Marine Drive", "Ramu's Buddhist temples", "Fresh fish at the market"],
    legs: [
      { mode: "Flight", how: "Dhaka to Cox's Bazar", fare: 7000, hours: 1, kinds: ["easiest"] },
      { mode: "Train", how: "Cox's Bazar Express, AC chair, through hills and paddy", fare: 1449, hours: 9, checked: true, kinds: ["fun"] },
      { mode: "Bus", how: "Overnight coach from Sayedabad, 40 seats", fare: 1147, hours: 10, checked: true, kinds: ["cheapest"] },
    ],
    notes: [
      { months: [11, 12, 1, 2], level: "best", text: "Dry, cool and clear, the best time for the beach." },
      { months: [6, 7, 8], level: "caution", text: "Rough sea and heavy rain. Swim only between the lifeguard flags." },
      { months: [5, 10], level: "caution", text: "Cyclones can form in the Bay in these months. Watch the forecast." },
    ],
    nearby: ["st-martin", "bandarban"], names: ["cox", "coxs", "cox's", "coxsbazar", "beach", "sea"],
  },
  {
    id: "st-martin", name: "Saint Martin's Island", lat: 20.62, lon: 92.32, blurb: "The only coral island in the country, 9 km off the southern tip.",
    dayBudget: 3500, dayComfort: 8000, sights: ["Coral shore at Chhera Dwip", "Coconut palms and clear water", "Sunset on the west beach"],
    legs: [{ mode: "Ship", how: "Coach to Cox's Bazar, then the licensed ship with online registration", fare: 3500, hours: 14, kinds: ["cheapest", "easiest", "fun"] }],
    notes: [
      { months: [11, 12, 1, 2, 3], level: "best", text: "Open from 1 November to 15 March in 2026-27, up to 3,500 visitors a day, with a ৳100 conservation fee. Rules were under review, so confirm." },
      { months: [4, 5, 6, 7, 8, 9, 10], level: "closed", text: "Closed to visitors outside the season." },
    ],
    usualDays: 3, nearby: ["coxs-bazar"], names: ["st martin", "saint martin", "st. martin", "coral", "island"],
  },
  {
    id: "bandarban", name: "Bandarban", lat: 22.2, lon: 92.22, blurb: "The highest hills in the country, with cloud below the ridge and villages of many peoples.",
    dayBudget: 3000, dayComfort: 7000, sights: ["Nilgiri above the clouds", "Boga Lake", "Nafakhum waterfall", "The Golden Temple"],
    legs: [
      { mode: "Bus", how: "Overnight coach from Dhaka", fare: 1200, hours: 9, kinds: ["cheapest", "easiest"] },
      { mode: "Train", how: "Train to Chattogram, then the hill road by bus", fare: 1400, hours: 10, kinds: ["fun"] },
    ],
    notes: [
      { months: [10, 11, 12, 1, 2], level: "best", text: "Clear ridgelines and cool nights." },
      { months: [6, 7, 8, 9], level: "caution", text: "Landslides close hill roads in the rains. Allow extra days." },
    ],
    nearby: ["sajek", "coxs-bazar"], names: ["bandarban", "nilgiri", "nafakhum", "boga", "hill", "hills", "mountain"], forVisitors: HILLS,
  },
  {
    id: "sajek", name: "Sajek Valley", lat: 23.38, lon: 92.29, blurb: "A ridge-top village above a sea of cloud, reached by jeep.",
    dayBudget: 3500, dayComfort: 8000, sights: ["Sunrise over the clouds", "Konglak Para", "The winding army road"],
    legs: [{ mode: "Jeep", how: "Coach to Khagrachhari, then a shared jeep up the hill road", fare: 1600, hours: 11, kinds: ["cheapest", "easiest", "fun"] }],
    notes: [
      { months: [6, 7, 8, 9, 10], level: "best", text: "Cloud fills the valleys in and after the rains, which is why people come. Roads can be slippery." },
      { months: [11, 12, 1, 2], level: "best", text: "Clear views and cool air." },
    ],
    usualDays: 2, nearby: ["bandarban"], names: ["sajek", "khagrachhari", "khagrachari", "cloud"], forVisitors: HILLS,
  },
  {
    id: "sylhet", name: "Sylhet", lat: 24.89, lon: 91.87, blurb: "Tea hills, a flooded forest, and clear rivers coming down from India's hills.",
    dayBudget: 3000, dayComfort: 8000, sights: ["Ratargul by boat", "Jaflong's stone river", "Bichanakandi", "Shah Jalal's shrine"],
    legs: [
      { mode: "Flight", how: "Dhaka to Sylhet", fare: 5000, hours: 1, kinds: ["easiest"] },
      { mode: "Train", how: "Parabat or Upaban Express through green country", fare: 900, hours: 7, kinds: ["fun"] },
      { mode: "Bus", how: "Coach from Sayedabad, 40 seats", fare: 740, hours: 6, checked: true, kinds: ["cheapest"] },
    ],
    notes: [
      { months: [6, 7, 8, 9], level: "best", text: "Ratargul stands in water and the rivers are full. Sudden floods can happen, so check locally." },
      { months: [11, 12, 1, 2], level: "caution", text: "Ratargul is mostly dry in winter, though the air is pleasant." },
    ],
    nearby: ["srimangal", "tanguar"], names: ["sylhet", "ratargul", "jaflong", "bichanakandi"],
  },
  {
    id: "srimangal", name: "Srimangal", lat: 24.31, lon: 91.73, blurb: "The tea capital, with rain forest and gibbons a short ride away.",
    dayBudget: 2800, dayComfort: 7000, sights: ["Tea garden walks", "Lawachara forest", "Seven-layer tea", "Hail Haor birds"],
    legs: [
      { mode: "Train", how: "Parabat or Upaban Express to Srimangal station", fare: 650, hours: 5, kinds: ["easiest", "fun", "cheapest"] },
      { mode: "Bus", how: "Coach from Dhaka", fare: 650, hours: 5, kinds: [] },
    ],
    notes: [{ months: [4, 5, 6, 7, 8, 9], level: "best", text: "Tea is in flush and the hills are bright green." }, { months: [11, 12, 1, 2], level: "best", text: "Dry paths for forest walks, and winter birds." }],
    nearby: ["sylhet", "tanguar"], names: ["srimangal", "sreemangal", "tea", "lawachara", "gibbon"],
  },
  {
    id: "tanguar", name: "Tanguar Haor", lat: 25.15, lon: 91.08, blurb: "A vast inland sea in the rains, a bird sanctuary in winter, under the Meghalaya hills.",
    dayBudget: 4500, dayComfort: 12000, sights: ["A night on a houseboat", "Niladri Lake", "Barikka Tila", "Winter ducks"],
    legs: [{ mode: "Boat", how: "Coach to Sunamganj, then a houseboat from Tahirpur", fare: 1000, hours: 8, kinds: ["cheapest", "easiest", "fun"] }],
    notes: [{ months: [6, 7, 8, 9, 10], level: "best", text: "High water, the houseboat season." }, { months: [12, 1, 2], level: "best", text: "Migrating birds, but boats reach less of the water." }, { months: [3, 4], level: "caution", text: "Low water and hot days, and the rice harvest is under way." }],
    nearby: ["sylhet", "srimangal"], names: ["tanguar", "haor", "sunamganj", "houseboat", "wetland"],
  },
  {
    id: "sundarbans", name: "The Sundarbans", lat: 22.0, lon: 89.5, blurb: "The largest mangrove forest on Earth, home of the Royal Bengal tiger. You see it by boat, with a licensed operator.",
    dayBudget: 5000, dayComfort: 14000, sights: ["A three-day boat tour", "Kotka and Kochikhali", "Deer, crocodiles and kingfishers", "Tiger prints in the mud"],
    legs: [
      { mode: "Bus", how: "Coach over the Padma Bridge to Khulna or Mongla, then the tour boat", fare: 1000, hours: 5, kinds: ["cheapest", "easiest"] },
      { mode: "Train", how: "Train via the Padma Bridge to Khulna, then the tour boat", fare: 1100, hours: 6, kinds: ["fun"] },
    ],
    notes: [
      { months: [11, 12, 1, 2], level: "best", text: "Cool and dry, the best time. Three-day tours cost about US$220 to US$380 for foreigners." },
      { months: [6, 7, 8], level: "closed", text: "Closed to visitors for three months so the animals can breed. It reopens on 1 September." },
      { months: [9, 10], level: "caution", text: "Open again, but it can be rainy and rough." },
      { months: [3, 4, 5], level: "caution", text: "Hot, and cyclones are possible from April." },
    ],
    usualDays: 3, nearby: ["barishal", "kuakata"], names: ["sundarban", "sundarbans", "tiger", "mangrove", "khulna", "mongla", "bagerhat"],
  },
  {
    id: "barishal", name: "Barishal and the rivers", lat: 22.7, lon: 90.37, blurb: "A land of rivers, floating markets and the great overnight launches from Dhaka.",
    dayBudget: 2500, dayComfort: 6000, sights: ["The overnight launch from Sadarghat", "Floating guava market", "Durga Sagar", "The Oxford Mission church"],
    legs: [
      { mode: "Flight", how: "Dhaka to Barishal", fare: 4200, hours: 1, kinds: ["easiest"] },
      { mode: "Launch", how: "Overnight launch from Sadarghat, single cabin", fare: 1200, hours: 8, checked: true, kinds: ["fun"] },
      { mode: "Bus", how: "Coach over the Padma Bridge", fare: 700, hours: 4, kinds: ["cheapest"] },
    ],
    notes: [{ months: [7, 8, 9], level: "best", text: "The guava floating markets are at their busiest." }, { months: [11, 12, 1, 2], level: "best", text: "Calm rivers for the launch trip." }, { months: [5, 6], level: "caution", text: "Storms on the big rivers. Check before sailing." }],
    nearby: ["kuakata", "sundarbans"], names: ["barishal", "barisal", "launch", "river", "rivers", "floating market", "guava"],
  },
  {
    id: "kuakata", name: "Kuakata", lat: 21.82, lon: 90.12, blurb: "One of the few beaches where you can watch the sun both rise and set over the water.",
    dayBudget: 2800, dayComfort: 6500, sights: ["Sunrise and sunset from one beach", "Fatrar Char forest", "Rakhine villages", "Fishing boats at dawn"],
    legs: [
      { mode: "Bus", how: "Coach over the Padma Bridge", fare: 1000, hours: 7, kinds: ["cheapest", "easiest"] },
      { mode: "Launch", how: "Overnight launch to Barishal or Patuakhali, then a coach", fare: 1600, hours: 12, kinds: ["fun"] },
    ],
    notes: [{ months: [11, 12, 1, 2], level: "best", text: "Clear skies for sunrise and sunset." }, { months: [5, 6, 7, 8, 10], level: "caution", text: "Rain and cyclone season on the coast." }],
    nearby: ["barishal", "sundarbans"], names: ["kuakata", "sunrise", "sunset"],
  },
  {
    id: "rajshahi", name: "Rajshahi and Paharpur", lat: 24.37, lon: 88.6, blurb: "Silk, mangoes, the old temples at Puthia, and the World Heritage ruins at Paharpur.",
    dayBudget: 2500, dayComfort: 6000, sights: ["Somapura Mahavihara", "Puthia's temples", "The Padma at sunset", "Mango orchards"],
    legs: [
      { mode: "Bus", how: "Coach from Gabtoli, 40 seats", fare: 991, hours: 6, checked: true, kinds: ["cheapest"] },
      { mode: "Train", how: "Banalata or Silk City Express", fare: 900, hours: 6, kinds: ["easiest", "fun"] },
    ],
    notes: [{ months: [5, 6], level: "best", text: "Mango season. It is hot, and worth it." }, { months: [11, 12, 1, 2], level: "best", text: "Cool days for walking the ruins." }],
    nearby: ["dinajpur"], names: ["rajshahi", "paharpur", "puthia", "mango", "silk", "ruins", "heritage"],
  },
  {
    id: "dinajpur", name: "Dinajpur and the north", lat: 25.63, lon: 88.64, blurb: "Kantajew Temple's terracotta, litchi orchards and yellow mustard fields.",
    dayBudget: 2500, dayComfort: 5500, sights: ["Kantajew Temple", "Ramsagar", "Litchi orchards in May", "Mustard in December"],
    legs: [{ mode: "Bus", how: "Coach from Gabtoli", fare: 1000, hours: 8, kinds: ["cheapest", "easiest"] }, { mode: "Train", how: "Ekota or Drutojan Express", fare: 1000, hours: 9, kinds: ["fun"] }],
    notes: [{ months: [12, 1], level: "best", text: "Mustard flowers and the Rash Mela fair." }, { months: [5], level: "best", text: "Litchis are in." }],
    nearby: ["rajshahi"], names: ["dinajpur", "kantajew", "kantaji", "terracotta", "litchi", "rangpur", "mustard"],
  },
  {
    id: "dhaka", name: "Old Dhaka", lat: 23.71, lon: 90.41, blurb: "Where every trip begins: Mughal forts, rickshaw lanes and the best street food in the country.",
    dayBudget: 3000, dayComfort: 9000, sights: ["Lalbagh Fort", "Ahsan Manzil", "A boat on the Buriganga", "Biryani in Old Dhaka", "Liberation War Museum"],
    legs: [{ mode: "Bus", how: "You are already here", fare: 0, hours: 0, kinds: ["cheapest", "easiest", "fun"] }],
    notes: [{ months: [11, 12, 1, 2], level: "best", text: "The coolest, driest months, and the most festivals." }, { months: [6, 7, 8], level: "caution", text: "Streets can flood after hard rain." }],
    nearby: ["sylhet", "rajshahi", "barishal"], names: ["dhaka", "old dhaka", "lalbagh", "capital"],
  },
];

/** How to get from one neighbour to the next without going back to Dhaka. */
export const LINKS: Record<string, { how: string; fare: number; hours: number }> = {
  "coxs-bazar|st-martin": { how: "Licensed ship from Cox's Bazar or Teknaf", fare: 2500, hours: 6 },
  "bandarban|coxs-bazar": { how: "Road via Chakaria", fare: 400, hours: 4 },
  "bandarban|sajek": { how: "Road via Rangamati and Khagrachhari", fare: 1200, hours: 9 },
  "srimangal|sylhet": { how: "Train or bus", fare: 300, hours: 3 },
  "sylhet|tanguar": { how: "Road to Sunamganj and Tahirpur", fare: 500, hours: 4 },
  "srimangal|tanguar": { how: "Road via Sylhet", fare: 700, hours: 6 },
  "barishal|kuakata": { how: "Road, about 4 hours", fare: 400, hours: 4 },
  "barishal|sundarbans": { how: "Road to Mongla", fare: 400, hours: 3 },
  "kuakata|sundarbans": { how: "Road to Mongla", fare: 700, hours: 6 },
  "dinajpur|rajshahi": { how: "Road", fare: 600, hours: 5 },
};

export const linkBetween = (a: string, b: string) => LINKS[[a, b].sort().join("|")];

export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** Ready-made plans a visitor can load with one tap. */
export const TOUR_PLANS: { id: string; title: string; text: string; regions: string[]; days: number; month: number }[] = [
  { id: "first-week", title: "First week in Bangladesh", text: "Old Dhaka, tea, and a river night.", regions: ["dhaka", "srimangal", "barishal"], days: 7, month: 12 },
  { id: "tiger-and-sea", title: "Tiger and sea", text: "The Sundarbans, then a beach where the sun rises and sets.", regions: ["sundarbans", "kuakata"], days: 7, month: 1 },
  { id: "south-coast", title: "Beach and coral", text: "Cox's Bazar and Saint Martin's in the dry months.", regions: ["coxs-bazar", "st-martin"], days: 6, month: 12 },
  { id: "monsoon", title: "The monsoon trip", text: "Flooded forest and a houseboat, when the country is at its greenest.", regions: ["sylhet", "tanguar"], days: 6, month: 8 },
  { id: "old-bengal", title: "Ancient Bengal", text: "Old Dhaka, Paharpur and Kantajew Temple.", regions: ["dhaka", "rajshahi", "dinajpur"], days: 8, month: 1 },
];

export const TRIP_SOURCES = [
  { name: "BRTA fare chart, October 2026", url: "https://www.thedailystar.net/news/bangladesh/transport/news/brta-publishes-new-bus-fare-chart-4160666" },
  { name: "Jago News, train fares", url: "https://www.jagonews24.com/en/national/news/88196" },
  { name: "Dhaka Tribune, launch fares", url: "https://www.dhakatribune.com/bangladesh/power-energy/408407/launch-fares-rise-without-official-order-sparking" },
  { name: "Prothom Alo, Saint Martin's guide 2026-27", url: "https://en.prothomalo.com/bangladesh/60dans0p0u" },
  { name: "Prothom Alo, Sundarbans trip", url: "https://en.prothomalo.com/lifestyle/travel/w98r1j51u3" },
  { name: "Bangladesh Railway tickets", url: "https://eticket.railway.gov.bd/" },
  { name: "US travel advisory for Bangladesh", url: "https://travel.state.gov/en/international-travel/travel-advisories/bangladesh.html" },
];
