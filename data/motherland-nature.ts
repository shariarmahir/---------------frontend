/**
 * The native life of Bangladesh, for the Animals & Nature page: a plain,
 * sourced list of the animals, birds, trees, flowers and fruits a visitor
 * will meet, how the six seasons change the land, and why the country must
 * protect it. Facts are the kind a published source states plainly; national
 * symbols cite Banglapedia. Figures that move are rounded or left out.
 */

export interface LifeItem {
  name: string;
  /** The Bangla or local name, where it helps. */
  local?: string;
  note: string;
}

export interface LifeGroup {
  id: string;
  title: string;
  lede: string;
  photo: string;
  items: LifeItem[];
}

export interface SeasonNature {
  name: string;
  months: string;
  look: string;
}

export const NATURE_SOURCE = { name: "Banglapedia, National Encyclopedia of Bangladesh", url: "https://en.banglapedia.org/" };

export const NATIVE_LIFE: LifeGroup[] = [
  {
    id: "animals",
    title: "Animals",
    lede: "From the tiger of the mangroves to the dolphin of the rivers, the delta holds a surprising wealth of wildlife.",
    photo: "tiger",
    items: [
      { name: "Royal Bengal tiger", local: "Bagh", note: "The national animal, at home in the Sundarbans, where it swims between islands and hunts across tidal mud." },
      { name: "Spotted deer", local: "Chitra horin", note: "Herds of chital graze where the mangrove forest meets the mudflats; the tiger's main prey." },
      { name: "Ganges river dolphin", local: "Shushuk", note: "A nearly blind freshwater dolphin that finds its way by sound through the muddy rivers. Endangered." },
      { name: "Asian elephant", local: "Hati", note: "Wild herds still cross the hill forests of Chattogram and the south-east." },
      { name: "Hoolock gibbon", local: "Ulluk", note: "The country's only ape, swinging through the canopy of Lawachara and the eastern hill forests. Endangered." },
      { name: "Fishing cat", local: "Mecho biral", note: "A wetland cat that scoops fish from the water, found across the haors and marshes." },
      { name: "Gharial & mugger crocodile", note: "The long-snouted gharial and the broader mugger survive in a few rivers and the Sundarbans' creeks." },
      { name: "Saltwater crocodile", note: "The largest reptile of the mangroves, master of the tidal channels." },
    ],
  },
  {
    id: "birds",
    title: "Birds",
    lede: "More than six hundred bird species have been recorded, and winter brings great flocks to the wetlands.",
    photo: "doyel",
    items: [
      { name: "Oriental magpie-robin", local: "Doyel", note: "The national bird, singing from every village yard." },
      { name: "White-breasted kingfisher", local: "Machhranga", note: "A flash of blue along the delta's canals; several kingfisher species live here." },
      { name: "Common myna", local: "Shalik", note: "The bold, chattering bird of town and field, a favourite of folk rhymes." },
      { name: "Shamuk khol (openbill stork)", note: "A stork of the wetlands, named for the gap in its bill that grips snails." },
      { name: "Migratory wildfowl", note: "Each winter, ducks and waders fill Tanguar Haor and Hakaluki Haor, flying from as far as Siberia." },
    ],
  },
  {
    id: "trees",
    title: "Trees",
    lede: "The sundari that gives the Sundarbans its name, the banyan of the village, and the flame of the krishnachura.",
    photo: "mangroves",
    items: [
      { name: "Sundari", note: "The mangrove tree that gives the Sundarbans its name, standing in salt tidal water." },
      { name: "Banyan", local: "Bot", note: "The great spreading tree of the village meeting-place, sacred and shade-giving." },
      { name: "Krishnachura", note: "The flame tree, blazing red across the city in early summer." },
      { name: "Shimul", note: "The silk-cotton tree, whose red blooms open before the leaves in spring." },
      { name: "Mango & jackfruit", note: "The orchard trees of every homestead; the jackfruit is the national tree's rival for the nation's heart." },
    ],
  },
  {
    id: "flowers",
    title: "Flowers & fruits",
    lede: "The water lily on every pond, the kash grass of autumn, and the fruits that mark the seasons.",
    photo: "shapla",
    items: [
      { name: "Shapla", note: "The white water lily, the national flower, opening on ponds and paddy ditches." },
      { name: "Kodom", note: "The round, scented monsoon flower, the bloom of the rains in song and poem." },
      { name: "Kash phul", note: "The silver plumes of kash grass that cover the riverbanks in autumn." },
      { name: "Jackfruit", local: "Kanthal", note: "The national fruit, the largest tree-fruit in the world, ripe in the early summer." },
      { name: "Mango & litchi", note: "Rajshahi's mangoes and Dinajpur's litchis are the taste of a Bangladeshi summer." },
    ],
  },
];

export const SEASON_NATURE: SeasonNature[] = [
  { name: "Grishmo — Summer", months: "mid-Apr to mid-Jun", look: "The krishnachura flames red, mangoes and jackfruit ripen, and the land waits, dry and hot, for the rains." },
  { name: "Borsha — Monsoon", months: "mid-Jun to mid-Aug", look: "Rivers rise and spill, fields flood, the kodom flowers, and the whole delta turns to water and green." },
  { name: "Sharat — Autumn", months: "mid-Aug to mid-Oct", look: "The rains ease, white clouds pile in a blue sky, and kash grass silvers the riverbanks." },
  { name: "Hemanta — Late autumn", months: "mid-Oct to mid-Dec", look: "The Aman rice ripens gold and comes in; Nobanno, the harvest festival, fills the villages." },
  { name: "Sheet — Winter", months: "mid-Dec to mid-Feb", look: "Cool and misty mornings, mustard fields in flower, date-palm sap and pithas, and migratory birds on the haors." },
  { name: "Bosonto — Spring", months: "mid-Feb to mid-Apr", look: "The shimul and palash bloom, the koel calls, and Pohela Falgun and Pohela Boishakh welcome colour back to the land." },
];

export interface Care {
  title: string;
  text: string;
}

export const WHY_CARE: Care[] = [
  { title: "The forest is our shield", text: "The Sundarbans takes the first blow of every cyclone off the Bay of Bengal. Each time its trees are cut or poisoned, the coast behind it loses its best defence against the storms a warming sea is making stronger." },
  { title: "Water is the whole country", text: "Rivers, haors and floodplains feed one of the world's great freshwater fisheries and water the rice three times a year. Pollution, silt and the loss of wetlands take food straight from the table." },
  { title: "What is lost does not return", text: "The tiger, the gibbon, the river dolphin and the gharial are all endangered. A delta this crowded gives wildlife little room, so every protected forest and clean river is a place life can hold on." },
  { title: "How we can help", text: "Support the national parks and the rangers who guard them, say no to wildlife products and single-use plastic, keep the rivers clean, and plant native trees. The country's future rests on the land staying alive." },
];
