/**
 * Animals & Nature. Species counts come from the national Red Lists (animals
 * 2015, plants 2024). Films say where they were really filmed: only some of
 * them are from Bangladesh, and the page never suggests otherwise.
 */
import { bangla, pic, place, wiki, type Block, type Src } from "./motherland-blocks.ts";
import { photo } from "./motherland-categories.ts";

const RED_ANIMALS: Src = { name: "Forest Department, Red List 2015", url: "https://bforest.gov.bd/pages/static-pages/6922dcc4933eb65569e11f15" };
const RED_PLANTS: Src = { name: "IUCN, Plant Red List 2024", url: "https://iucn.org/story/202411/bangladesh-launches-its-first-plant-red-list" };
const UNESCO: Src = { name: "UNESCO World Heritage Centre", url: "https://whc.unesco.org/en/list/798" };
const WCS: Src = { name: "Wildlife Conservation Society", url: "https://measures.wcs.org/Metric-Details/m/6" };
const TIGERS: Src = { name: "Dhaka Tribune, tiger census", url: "https://www.dhakatribune.com/bangladesh/361154/tiger-population-in-sundarbans-rises-to-125" };
const SEA: Src = { name: "Arab News / AFP", url: "https://www.arabnews.com/node/2530331/amp" };
const LAND: Src = { name: "The Business Standard, IMF", url: "https://www.tbsnews.net/node/12793" };
const MINERALS: Src = bangla("Mineral Resources");
const SYMBOLS: Src = wiki("National symbols of Bangladesh");

const commonsFilm = (file: string) => `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file.replace(/ /g, "_"))}`;

export const NATURE_BLOCKS: Block[] = [
  {
    kind: "films",
    id: "into-the-wild",
    tone: "navy",
    title: "Into the wild",
    lede: "Cloud over the Bandarban hills and tide through the largest mangrove forest on Earth, 10,000 square kilometres of it, more than half in Bangladesh.",
    films: [
      { title: "Morning over Bandarban", text: "Sunrise at Lama in the Bandarban hills, with the valleys still full of cloud and birds crossing below the ridge. Winter mornings here are worth the early start.", file: "bandarban-sunrise", ext: "mp4", where: "Filmed in Lama, Bandarban, Bangladesh", credit: { author: "Pixabay contributor", license: "Pixabay Content License", sourceUrl: "https://pixabay.com/videos/bangladesh-lama-bandarban-mountains-294187/", source: "Pixabay" } },
      { title: "Kochikhali, the Sundarbans", text: "Filmed in the forest itself, on the wild southern shore where deer come out to graze and tigers leave their prints in the mud.", file: "sundarbans-kochikhali", where: "Filmed in the Sundarbans, Bangladesh", credit: { author: "Yahya", license: "CC BY-SA 4.0", sourceUrl: commonsFilm("Kochikhali point, Sundarbans.webm") } },
      { title: "Spotted deer", text: "Chital are what tigers here mostly hunt. Herds feed on the leaves that monkeys drop from the keora trees, and the two warn each other of danger.", file: "chital-herd", where: "The same species, filmed in Maui, Hawaii", credit: { author: "Forest and Kim Starr", license: "CC BY 2.0", sourceUrl: commonsFilm("Axis Deer Herd - Maui.webm") } },
      { title: "Kingfisher", text: "Bangladesh has about a dozen kingfishers, and the mangrove creeks are one of the best places to see them. Boats often drift past one on a low branch.", file: "kingfisher", where: "The same species, filmed in Europe", credit: { author: "Lennart Hessel", license: "CC BY 3.0", sourceUrl: commonsFilm("Common Kingfisher eating a fish.webm") } },
    ],
  },
  { kind: "part", part: "stack" },
  { kind: "part", part: "figures" },
  {
    kind: "cards",
    id: "native-animals",
    tone: "white",
    title: "Native animals",
    lede: "A national Red List assessed 1,619 kinds of animal here. These are the ones people cross the world to see.",
    note: "Status is the global category on the IUCN Red List. Bangla names are given where they are in common use.",
    cards: [
      { title: "Royal Bengal tiger", meta: "Bagh. National animal", text: "A census counted 125 in the Bangladesh Sundarbans in 2024, up from 106 in 2015. These are the only tigers that live in mangroves, and they swim well.", picture: photo("tiger"), source: TIGERS, facts: [{ label: "Status", value: "Endangered" }, { label: "Where to see it", value: "The Sundarbans, from a boat" }] },
      { title: "Spotted deer", meta: "Chitra horin", text: "The tiger's main prey, and the animal you are most likely to see from a boat.", picture: photo("spotted-deer"), facts: [{ label: "Status", value: "Least concern" }, { label: "Where to see it", value: "Katka and Kochikhali" }] },
      { title: "Hoolock gibbon", meta: "Ulluk. Our only ape", text: "Only about 200 to 300 remain, around Lawachara and the eastern forests. You hear their morning song long before you spot them.", picture: pic("hoolock-gibbon", "A western hoolock gibbon in the trees"), source: { name: "Remote Lands", url: "https://www.remotelands.com/travelogues/5-rare-animals-to-look-for-in-bangladesh/" }, facts: [{ label: "Status", value: "Endangered" }, { label: "Where to see it", value: "Lawachara National Park" }] },
      { title: "Ganges river dolphin", meta: "Shushuk", text: "Almost blind, it finds its way in muddy water by sound. Sailors have watched for it in these rivers for centuries.", picture: pic("river-dolphin", "A Ganges river dolphin"), source: WCS, facts: [{ label: "Status", value: "Endangered" }, { label: "Where to see it", value: "Sundarbans channels and the big rivers" }] },
      { title: "Irrawaddy dolphin", meta: "Irabati", text: "Researchers counted nearly 6,000 in the Sundarbans and the waters beside it, one of the largest groups anywhere.", picture: pic("irrawaddy-dolphin", "An Irrawaddy dolphin at the surface"), source: WCS, facts: [{ label: "Status", value: "Endangered" }, { label: "Where to see it", value: "Sundarbans waterways" }] },
      { title: "Asian elephant", meta: "Hati", text: "Small wild herds still walk the old forest paths in the south-east hills.", picture: pic("elephant-bd", "An Asian elephant on a forest path"), facts: [{ label: "Status", value: "Endangered" }, { label: "Where to see it", value: "Chunati and the south-east hills" }] },
      { title: "Fishing cat", meta: "Mecho biral", text: "It dives for its dinner. A wetland cat that lives closer to people than most know.", picture: pic("fishing-cat", "A fishing cat"), facts: [{ label: "Status", value: "Vulnerable" }, { label: "Where to see it", value: "Wetlands, seldom seen" }] },
      { title: "Saltwater crocodile", meta: "Lona panir kumir", text: "The largest reptile on Earth patrols the Sundarbans' tidal creeks.", picture: pic("saltwater-croc", "A saltwater crocodile on a muddy bank"), facts: [{ label: "Status", value: "Least concern" }, { label: "Where to see it", value: "Karamjal, the Sundarbans" }] },
    ],
  },
  { kind: "moment", id: "a-forest-by-boat", title: "A forest you enter by boat", text: "At Ratargul the trees stand in the water for months of the year, and the only road is the one you row.", picture: photo("swamp-forest") },
  {
    kind: "cards",
    id: "rarest",
    tone: "gold",
    title: "The rarest things we have",
    lede: "Some of these live almost nowhere else. Some are one bad season away from being gone.",
    columns: 3,
    cards: [
      { title: "Spoon-billed sandpiper", meta: "Sonadia Island", text: "One of the rarest birds on Earth, with a bill shaped like a spoon. It winters on the mudflats of the Bangladesh coast after flying from Siberia.", picture: pic("spoonbill-sandpiper", "A spoon-billed sandpiper"), source: wiki("Spoon-billed sandpiper"), facts: [{ label: "Status", value: "Critically endangered" }, { label: "Where to see it", value: "Sonadia, in winter" }] },
      { title: "Masked finfoot", meta: "Sundarbans", text: "A shy, secretive water bird. The Sundarbans is one of its last strongholds.", picture: pic("masked-finfoot", "A masked finfoot"), source: wiki("Masked finfoot") },
      { title: "Gharial", meta: "Northern rivers", text: "A fish-eating crocodilian with a long thin snout. It is close to vanishing from Bangladesh.", picture: pic("gharial", "A gharial on a riverbank"), source: wiki("Gharial"), facts: [{ label: "Status", value: "Critically endangered" }, { label: "Where to see it", value: "The Padma and Jamuna, rarely" }] },
      { title: "Bostami turtle", meta: "Chattogram", text: "The black softshell turtle was declared extinct in the wild in 2002. A population survives in the pond of the Bayazid Bostami shrine, looked after by its visitors.", source: wiki("Black softshell turtle"), picture: pic("bostami", "A black softshell turtle in the shrine pond at Chattogram"), facts: [{ label: "Status", value: "Extinct in the wild" }, { label: "Where to see it", value: "Bayazid Bostami shrine pond" }] },
      { title: "A coral island", meta: "Saint Martin's", text: "The country's only coral island sits 9 km off the southern tip. Visits are limited to 3,500 people a day to protect it.", picture: pic("coral-st-martin", "The rocky coral shore of Saint Martin's Island") ?? photo("coxs-bazar"), source: { name: "Prothom Alo", url: "https://en.prothomalo.com/bangladesh/60dans0p0u" } },
      { title: "The Swatch of No Ground", meta: "Bay of Bengal", text: "A deep undersea canyon that begins close to the shore, home to dolphins and Bryde's whales. In 2014 it became the country's first marine protected area.", picture: pic("whale-bd", "A Bryde's whale at the surface") ?? photo("kuakata"), source: WCS },
    ],
  },
  {
    kind: "cards",
    id: "six-seasons",
    tone: "navy",
    title: "Six seasons, six countries",
    lede: "Bengali has a name for each of them. Come at a different time and you will find a different country.",
    layout: "sideways",
    cards: [
      { title: "Grishmo, summer", meta: "Mid-April to mid-June", text: "Hot and heavy. Flame trees flower, mangoes and jackfruit ripen, and storms called Kalboishakhi blow in during the late afternoon.", picture: pic("summer-field", "A field and trees under a clear summer sky") ?? pic("krishnachura", "Red flame trees in summer") },
      { title: "Borsha, monsoon", meta: "Mid-June to mid-August", text: "The rivers rise and spread, villages become islands, and people get around by boat. The Sundarbans closes for these months so that its animals can breed.", picture: pic("flood-boat", "Wooden boats on the wide brown water at Dhaka") ?? photo("sunamganj-haor") },
      { title: "Sharat, early autumn", meta: "Mid-August to mid-October", text: "Blue skies and white clouds over green fields, kash in flower, and Durga Puja in the cities.", picture: pic("kash2", "Tall kash grass bending in the wind") },
      { title: "Hemanta, late autumn", meta: "Mid-October to mid-December", text: "Rice turns gold, the air cools, and Nobanno, the festival of new rice, begins in the villages.", picture: pic("hemanta-harvest", "Farmers harvesting golden rice") ?? photo("rice-planting") },
      { title: "Sheet, winter", meta: "Mid-December to mid-February", text: "Morning fog, yellow mustard, fresh date juice and rice cakes, and thousands of ducks arrive on the haors from the north.", picture: pic("mustard-winter", "A yellow field of mustard in winter") ?? place("hakaluki", "Hakaluki Haor, one of the largest wetlands in the country") },
      { title: "Bosonto, spring", meta: "Mid-February to mid-April", text: "Palash and shimul flower on bare branches, the koel calls, and women wear yellow on the first day of Falgun.", picture: pic("spring-palash", "Orange palash flowers in spring") ?? photo("falgun") },
    ],
  },
  {
    kind: "cards",
    id: "trees-and-forests",
    tone: "white",
    title: "Trees and forests",
    lede: "Mangrove on the coast, swamp in the north-east, rain forest in the hills and old sal in the middle of the country.",
    columns: 3,
    cards: [
      { title: "Sundari", meta: "Mangrove", text: "The tree that gave the Sundarbans its name. Its roots push up through the mud to breathe. UNESCO counts 334 plant species in the forest.", picture: pic("sundarbans-forest", "Mangrove forest in the Sundarbans") ?? photo("mangroves"), source: UNESCO },
      { title: "Mango", meta: "National tree", text: "A mango tree stands in almost every village yard, and Rajshahi's orchards are famous across South Asia.", picture: pic("mango-tree", "Mangoes hanging on a tree") ?? photo("rice-planting"), source: SYMBOLS },
      { title: "Krishnachura", meta: "Flame tree", text: "In April and May it sets the streets on fire with red flowers.", picture: pic("krishnachura", "A krishnachura tree in full red bloom") },
      { title: "Shimul", meta: "Silk cotton", text: "Huge red flowers open on bare branches at the end of winter, and silky cotton follows them.", picture: pic("shimul", "Red shimul flowers on a bare branch") },
      { title: "Ratargul", meta: "Swamp forest, Sylhet", text: "A freshwater forest where you row between the trunks for months of the year.", picture: photo("swamp-forest") },
      { title: "Lawachara", meta: "Rain forest, Moulvibazar", text: "A small, thick forest where gibbons sing above a railway line.", picture: pic("lawachara", "The green canopy of Lawachara National Park") },
    ],
  },
  {
    kind: "cards",
    id: "flowers-and-fruits",
    tone: "paper",
    title: "Flowers and fruits",
    columns: 4,
    cards: [
      { title: "Shapla", meta: "National flower", text: "The white water lily opens on ponds and paddy ditches, and it is on the national emblem.", picture: photo("shapla"), source: SYMBOLS },
      { title: "Kadam", meta: "The flower of the rains", text: "Round, scented and yellow. Poets and songwriters cannot write about the monsoon without it.", picture: pic("kadam-flower", "A round kadam flower") },
      { title: "Kash", meta: "The flower of autumn", text: "Fields of white plumes on the riverbanks mean the rains are over.", picture: pic("autumn-kash", "White kash flowers in Bangladesh") },
      { title: "Jackfruit", meta: "National fruit", text: "It grows straight from the trunk and can be bigger than a small child. You eat it ripe, or cook it green as a vegetable.", picture: pic("jackfruit", "Jackfruit hanging from a tree trunk"), source: SYMBOLS },
      { title: "Litchi", meta: "Dinajpur, May and June", text: "A few short weeks of sweet red fruit from the northern orchards.", picture: pic("litchi", "Red litchis") },
      { title: "Ilish", meta: "National fish", text: "The silver hilsa swims up the rivers to spawn. Every family has an opinion about how to cook it.", picture: photo("hilsa"), source: SYMBOLS },
      { title: "Doyel", meta: "National bird", text: "The magpie-robin sings from every village yard, and you will see it on the banknotes.", picture: photo("doyel"), source: SYMBOLS },
      { title: "Kingfisher", meta: "Machhranga", text: "A flash of blue along the canals.", picture: photo("kingfisher") },
    ],
  },
  {
    kind: "cards",
    id: "natural-materials",
    tone: "white",
    title: "What the land gives us to work with",
    lede: "People here have built and traded with these materials for thousands of years.",
    columns: 3,
    cards: [
      { title: "Jute", meta: "The golden fibre", text: "Bangladesh is the second-largest grower. Jute once filled the world's sacks and now competes with plastic.", picture: pic("jute-field", "Jute stems being washed in water in Bangladesh") },
      { title: "Bamboo and cane", meta: "Hills and homesteads", text: "They make houses, bridges, baskets and furniture, and the hill communities use them for almost everything.", picture: pic("bamboo-craft", "Bamboo craft from Bangladesh") },
      { title: "River clay", meta: "Across the delta", text: "From the terracotta of Kantajew Temple to the potter's wheel today, this land built with clay because it has almost no stone.", picture: photo("terracotta") },
      { title: "Natural gas", meta: "Under the east", text: "Banglapedia lists 23 gas fields, with about 21 trillion cubic feet of proven and probable gas when counted.", source: MINERALS, picture: pic("gas-pipe", "A gas pipeline running through forest") },
      { title: "Hard rock and coal", meta: "Dinajpur", text: "Maddhapara mines granite-like rock from below the plains, one of the few hard stones in the country. Barapukuria has mined coal since 2003.", source: { name: "Banglapedia, Hardrock", url: "https://en.banglapedia.org/index.php?title=Hardrock" }, picture: pic("maddhapara", "Hard rock and coal mining in Dinajpur") ?? pic("quarry", "A stone quarry cut into hard rock") },
      { title: "Silica sand and white clay", meta: "The north", text: "Glass sand and china clay feed local factories, and Birishiri's blue-green lakes are old china clay pits.", source: MINERALS, picture: place("birishiri", "The china-clay hills and green pools of Birishiri") },
    ],
  },
  {
    kind: "chapters",
    id: "why-save-it",
    tone: "white",
    title: "Why we must save it",
    lede: "This is about whether the country survives. The numbers are plain.",
    chapters: [
      { title: "The sea is coming", meta: "4.2 to 5.8 mm a year", text: "A government study puts sea level rise on our coast at 4.2 to 5.8 millimetres a year, higher than the world average. A rise of one metre would take about 17 percent of the land, and many millions of people live on it.", source: SEA, picture: photo("kuakata") },
      { title: "The forest is our sea wall", meta: "The Sundarbans", text: "Storm surges lose much of their force crossing the mangroves. Every tree that is lost makes the next cyclone worse for the villages behind it.", source: UNESCO, picture: pic("mangrove-root", "Mangrove roots rising from tidal water") ?? photo("mangroves") },
      { title: "We are already losing species", meta: "390 animals, 395 plants threatened", text: "The Red List of 2015 found 31 animal species already gone from Bangladesh and 390 under threat. The first Plant Red List in 2024 looked at 1,000 plants and found 395 threatened.", source: RED_PLANTS, picture: pic("duck-haor", "Ducks and shorebirds in shallow water") ?? place("hakaluki", "Hakaluki Haor, one of the largest wetlands in the country") },
      { title: "Dirty rivers mean hungry people", meta: "Food and water", text: "Fish is the main animal protein for most families, and rivers carry the country's water and trade. When the Buriganga turns black, people pay for it in food, health and work.", source: LAND, picture: pic("plastic-river", "A polluted stretch of the Buriganga river") },
    ],
  },
  {
    kind: "cards",
    id: "how-to-save",
    tone: "gold",
    title: "What you can do",
    lede: "Small, specific things that work, whether you live here or are visiting.",
    columns: 3,
    cards: [
      { title: "On a visit", text: "Book Sundarbans trips with operators licensed by the Forest Department, respect the June to August closure, and keep to the Saint Martin's rules. Take your rubbish home.", source: { name: "Sundarbans Tourism, Forest Department", url: "https://sundarbantourism.bforest.gov.bd/en/package/178" }, picture: photo("mangroves") },
      { title: "At the market", text: "Never buy deer meat, tiger parts, turtle or wild bird. Choose jute and cloth bags over plastic, and leave jatka, the young hilsa, in the river.", picture: photo("handloom") },
      { title: "At home", text: "Plant native trees such as mango, jackfruit, neem and kadam, not fast-growing foreign ones. Keep ponds and wetlands from being filled in.", picture: pic("sapling", "A woman tending a young tree in an orchard") ?? photo("rice-planting") },
      { title: "In your village or town", text: "Join the people who clean a canal or river near you. Report wildlife crime to the Forest Department or the national helpline, 999.", picture: pic("plastic-river", "A polluted stretch of the Buriganga river") },
      { title: "At work", text: "Treat waste water before it reaches a river, buy from certified factories, and put your solar panels on the roof you already have.", picture: photo("garments") },
      { title: "With your voice", text: "Ask the people who represent you what they are doing about rivers, forests and the coast. Teach your children the names of the birds near your home.", picture: photo("children") },
    ],
  },
  { kind: "part", part: "rails" },
];
