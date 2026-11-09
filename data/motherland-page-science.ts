/**
 * Science & Tech: what Bangladesh has achieved at home and abroad, where the
 * next scientists learn, and how to join in. Checked November 2026.
 */
import { pic, wiki, type Block, type Src } from "./motherland-blocks.ts";
import { photo } from "./motherland-categories.ts";

const URC_2026: Src = { name: "The Daily Star, URC 2026", url: "https://www.thedailystar.net/campus/news/uiu-mars-rover-secures-third-position-worldwide-urc-2026-4187276" };
const ICPC: Src = { name: "BUET Computer Science", url: "https://cse.buet.ac.bd/home/news_detail/183" };
const QADRI: Src = { name: "Prothom Alo", url: "https://en.prothomalo.com/bangladesh/fitting-recognition-for-a-pioneering-lifes-work" };
const ROOPPUR: Src = { name: "World Nuclear Association", url: "https://www.world-nuclear.org/information-library/country-profiles/countries-a-f/bangladesh.aspx" };
const QS: Src = { name: "The Daily Star, QS 2027", url: "https://www.thedailystar.net/youth/education-0/news/qs-world-university-rankings-2027-where-did-bangladeshi-universities-rank-4201926" };
const QS26: Src = { name: "The Daily Star, QS 2026", url: "https://www.thedailystar.net/campus/education/news/qs-world-university-rankings-2026-where-did-bangladeshi-universities-rank" };
const PHARMA: Src = { name: "The Business Standard", url: "https://www.tbsnews.net/node/1271906" };
const LEED: Src = { name: "Ittefaq, May 2026", url: "https://en.ittefaq.com.bd/15918/5-more-rmg-factories-get-leed-certification" };

export const SCIENCE_BLOCKS: Block[] = [
  { kind: "part", part: "stack" },
  { kind: "tool", tool: "launch" },
  { kind: "part", part: "figures" },
  {
    kind: "chapters",
    id: "beat-the-world",
    tone: "white",
    title: "Where we beat the world",
    lede: "Achievements measured against everyone else on Earth.",
    chapters: [
      { title: "The drink that saved millions", meta: "Oral rehydration, Dhaka, 1960s", text: "Researchers at the cholera lab that became icddr,b helped prove that salt, sugar and clean water could keep a dying child alive. BRAC workers then taught millions of mothers in their villages to make it at home. Few medical advances anywhere have saved as many lives for so little money.", source: wiki("Oral rehydration therapy"), picture: photo("children") },
      { title: "Almost champions on Mars", meta: "University Rover Challenge", text: "MIST's Mongol Barota team won the global championship in the virtual final of 2021. In 2026, UIU's team finished third in the Utah desert, the first from Asia to reach the top three, and five Bangladeshi universities made the finals.", source: URC_2026, picture: pic("rover-urc", "A competing rover on the Utah desert course of the University Rover Challenge")},
      { title: "On the world coding stage", meta: "ICPC World Finals", text: "BUET has qualified every year since 1998. It placed 11th in the world in 2000, ahead of many famous names, and has twice been champion of Asia West.", source: ICPC, picture: pic("laptop", "Code on a laptop screen")},
      { title: "Vaccines the poor can afford", meta: "Dr Firdausi Qadri, 2021", text: "She spent decades at icddr,b on cholera and typhoid vaccines that cost little and reach people who need them. In 2021 she received the Ramon Magsaysay Award, often called Asia's Nobel Prize.", source: QADRI, picture: pic("vials", "A laboratory worker handling samples") },
      { title: "The genome of the golden fibre", meta: "Jute, 2010", text: "A team led by Maqsudul Alam, working with Bangladeshi software engineers and researchers, decoded the jute genome. Bangladesh then had its own map of the plant it knows best.", source: wiki("Maqsudul Alam"), picture: pic("jute-field", "Jute stems being washed in water in Bangladesh") },
      { title: "The physics of every boson", meta: "Dhaka, 1924", text: "S. N. Bose, teaching at the University of Dhaka, sent a short paper to Einstein, who translated and published it. Half of the particles in the universe are now named bosons after him.", source: wiki("Satyendra Nath Bose"), picture: photo("snbose") },
      { title: "The skyscraper's tube", meta: "Fazlur Rahman Khan", text: "Born in Dhaka and educated at what is now BUET, he invented the tube structure that made modern skyscrapers possible, including Chicago's Sears Tower.", source: wiki("Fazlur Rahman Khan"), picture: pic("p-fazlur", "The John Hancock Center in Chicago, one of his towers") },
    ],
  },
  {
    kind: "cards",
    id: "national-projects",
    tone: "navy",
    title: "What we have built at home",
    lede: "Each of these was called too hard or too expensive.",
    columns: 3,
    cards: [
      { title: "Padma Bridge", meta: "June 2022", text: "6.15 km of road and rail, on some of the deepest piles ever driven, paid for from the national budget.", picture: pic("padma-dusk", "The Padma Bridge lit up at dusk"), source: wiki("Padma Bridge") },
      { title: "Dhaka Metro", meta: "December 2022", text: "The first metro line in the country carries people above the traffic of one of the world's densest cities.", picture: photo("metro-rail"), source: wiki("Dhaka Metro Rail") },
      { title: "Our own satellite", meta: "May 2018", text: "Launched on the first Falcon 9 Block 5 from Kennedy Space Center, and now used for television and communications.", picture: pic("falcon9-bd", "A Falcon 9 rocket lifting off"), source: wiki("Bangabandhu-1") },
      { title: "Rooppur nuclear plant", meta: "First criticality, October 2026", text: "The country's first reactor has reached criticality and is moving toward the grid. Late in 2026 it was in power start-up and waiting on a final certification.", picture: pic("rooppur", "The Rooppur Nuclear Power Plant under construction"), source: ROOPPUR },
      { title: "Karnaphuli Tunnel", meta: "October 2023", text: "A road tunnel under the Karnaphuli river at Chattogram, the first of its kind in South Asia.", picture: pic("karnaphuli-river", "The Karnaphuli River at night in Chattogram, which the tunnel runs beneath"), source: wiki("Bangabandhu Sheikh Mujibur Rahman Tunnel") },
      { title: "Rice for a changing climate", meta: "BRRI", text: "The Bangladesh Rice Research Institute has released more than a hundred varieties, including ones that survive floods, salt and drought.", picture: pic("hemanta-harvest", "Farmers harvesting rice in late autumn") ?? photo("rice-planting"), source: { name: "Bangladesh Rice Research Institute", url: "https://brri.gov.bd/" } },
      { title: "Medicine for 160 countries", meta: "Pharmaceuticals", text: "Local companies make about 98 percent of the medicine the country uses, and export to more than 160 countries.", picture: pic("pharma", "A scientist at work in a laboratory"), source: PHARMA },
      { title: "Green factories", meta: "284 LEED certified, May 2026", text: "Few countries have as many certified green garment factories. 121 of them hold Platinum, the top rating.", picture: photo("garments") ?? photo("garments"), source: LEED },
      { title: "Money by phone", meta: "Since 2011", text: "Mobile wallets reached people no bank branch ever served, and other countries now study the model.", picture: photo("mobile-money") },
    ],
  },
  {
    kind: "cards",
    id: "where-science-grows",
    tone: "white",
    title: "From school to the lab",
    lede: "A child in a village school can get to any of these. That is what we are working for.",
    columns: 4,
    note: "Global rankings are one measure, and Bangladesh's universities still have far to climb. We publish them so that progress can be checked.",
    cards: [
      { title: "University of Dhaka", meta: "Founded 1921", text: "The top-ranked university in the country in QS, placed 584th in the 2026 list. Bose taught physics here.", picture: pic("red-hall", "A red-brick hall on the University of Dhaka campus"), source: QS26 },
      { title: "BUET", meta: "Engineering, Dhaka", text: "The country's leading engineering university, and a regular at the ICPC World Finals.", picture: pic("buet", "The West Palashy campus of BUET in Dhaka"), source: ICPC },
      { title: "North South University", meta: "Top private university", text: "Ranked 149th in QS Asia 2026. In all, 13 Bangladeshi universities made QS 2027.", source: QS, picture: pic("campus-green", "A university campus in Dhaka from above") },
      { title: "RUET, KUET, CUET, SUST", meta: "Rajshahi, Khulna, Chattogram, Sylhet", text: "Regional engineering and science universities that train many of the people who build the country.", picture: pic("campus-modern", "A university building in Chittagong") },
      { title: "icddr,b", meta: "Health research, Dhaka", text: "An international centre known around the world for diarrhoeal disease and public health research.", source: { name: "icddr,b", url: "https://www.icddrb.org/" }, picture: pic("vials", "A laboratory worker handling samples") },
      { title: "BCSIR", meta: "Founded 1955", text: "The national council for scientific and industrial research, working on food, materials and energy.", source: wiki("Bangladesh Council of Scientific and Industrial Research"), picture: pic("lab-bd", "A researcher at a microscope") },
      { title: "BRRI and BARI", meta: "Rice and agriculture", text: "Institutes that took the country from famine to growing almost all its own rice.", picture: pic("field-dusk", "A farmer crossing a green rice field at sunset") ?? photo("rice-planting") },
      { title: "School olympiads", meta: "Math, physics, informatics", text: "Volunteers built olympiad programmes that take school students from local rounds to world contests.", source: { name: "Bangladesh Mathematical Olympiad", url: "https://matholympiad.org.bd/" }, picture: pic("girl-books", "A schoolgirl holding her books in a green field")},
    ],
  },
  { kind: "part", part: "rails" },
  { kind: "part", part: "timeline" },
  {
    kind: "statement",
    id: "on-the-way",
    tone: "gold",
    title: "We are on the way",
    text: ["A country that was told it could not feed itself now sends vaccines, medicine and engineers to the world. There is much still to do in our labs, schools and universities. We know where we are going, and we are on the way."],
  },
];
