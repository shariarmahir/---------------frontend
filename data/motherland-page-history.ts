/**
 * History & Society: one story told in three acts. Bengal was rich, was broken,
 * and stood up again. Where historians disagree on a number, the text says so.
 */
import { bangla, pic, place, wiki, type Block, type Src } from "./motherland-blocks.ts";
import { commons } from "./motherland.ts";
import { photo } from "./motherland-categories.ts";

const FAMINE: Src = wiki("Great Bengal famine of 1770");
const CPP: Src = { name: "The Business Standard, 50 years of cyclone preparedness", url: "https://www.tbsnews.net/node/368398" };
const MUSLIN: Src = { name: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/smart-news/researchers-work-revive-beloved-dhaka-muslin-fabric-180977339/" };

export const HISTORY_BLOCKS: Block[] = [
  {
    kind: "chapters",
    id: "ancient-bengal",
    tone: "white",
    title: "Act one: the richest land",
    lede: "Long before anyone drew today's borders, the world came to this delta to trade.",
    chapters: [
      { title: "A town from 2,400 years ago", meta: "About 450 BCE, Wari-Bateshwar", text: "Farmers in Narsingdi kept turning up old coins and beads. Digs since 2000 have uncovered a fortified town with paved roads and silver punch-marked coins, part of a trade network reaching far beyond Bengal.", source: wiki("Wari-Bateshwar ruins"), picture: place("wari-bateshwar", "Excavations at Wari-Bateshwar in Narsingdi") },
      { title: "The walled city of Pundra", meta: "Third century BCE, Mahasthangarh", text: "In Bogura the brick walls of Pundranagara still stand. It is the oldest city found in Bangladesh, and people lived there for well over a thousand years.", source: wiki("Mahasthangarh"), picture: commons("mahasthan", "The brick ruins of Mahasthangarh in Bogura") },
      { title: "Where monks came to study", meta: "Eighth century, Paharpur and Mainamati", text: "The Pala kings built Somapura, one of the largest Buddhist monasteries south of the Himalayas. Students travelled here from across Asia. Atish Dipankar, born near Dhaka in the tenth century, went on to reshape Buddhism in Tibet.", source: { name: "UNESCO World Heritage Centre", url: "https://whc.unesco.org/en/list/322" }, picture: pic("mainamati", "The brick monastery of Shalban Vihara at Mainamati") ?? photo("paharpur_b") },
      { title: "The sultans and the traveller", meta: "1346 to 1576", text: "Ibn Battuta reached Bengal in 1346 to meet the saint Shah Jalal in Sylhet, and wrote about how plentiful and cheap everything was. Soon after, Bengal became an independent sultanate that built mosques such as Bagerhat's Sixty Dome Mosque and struck its own silver tankas.", source: bangla("Ibn Battuta"), picture: photo("sixty-dome-mosque") },
      { title: "The chiefs who said no", meta: "Late sixteenth century", text: "When the Mughal armies came, the landlords of Bengal, the Baro Bhuiyan, fought them for decades. Their leader Isa Khan held Sonargaon and is still remembered as a symbol of Bengali defiance.", source: wiki("Isa Khan"), picture: place("panam-nagar", "The old merchant houses of Panam Nagar in Sonargaon") },
      { title: "Woven air", meta: "Mughal Bengal", text: "Dhaka became a Mughal capital in 1610. Bengal grew so wealthy that Mughal writers called it the paradise of nations, and its weavers made muslin so fine that it was known as woven air. Rulers and fashionable women from Delhi to Paris wore it.", source: wiki("Bengal Subah"), picture: pic("sonargaon-museum", "The folk art and craft museum at Sonargaon, once a centre of the muslin trade")},
    ],
  },
  {
    kind: "chapters",
    id: "rich-then-robbed",
    tone: "navy",
    layout: "sideways",
    title: "Act two: the fall",
    lede: "In less than two centuries, one of the world's richest places became a byword for hunger.",
    chapters: [
      { title: "One afternoon at Plassey", meta: "23 June 1757", text: "The East India Company beat the Nawab of Bengal at Plassey, helped by a betrayal inside his own army. Within a decade the Company was collecting Bengal's taxes, and the money began to leave.", source: wiki("Battle of Plassey"), picture: pic("plassey", "A painting of Robert Clive meeting Mir Jafar after the Battle of Plassey") },
      { title: "The famine of 1770", meta: "1769 to 1770", text: "The rains failed while the Company kept up its tax demands. Estimates of the dead run from one million to ten million, and historians still argue over the number. Whichever is right, whole districts emptied.", source: FAMINE, picture: pic("famine-1770", "An old engraving of famine refugees on the road in India") },
      { title: "The looms go quiet", meta: "Into the 1800s", text: "Heavy duties on Indian cloth and cheap machine-made imports from Britain finished the weavers. The cotton plant behind Dhaka muslin, Phuti Karpas, died out. Dhaka itself shrank, and within a few generations nobody alive could make its most famous cloth.", source: MUSLIN, picture: photo("handloom") },
      { title: "A second famine", meta: "1943", text: "During the Second World War, millions died of hunger in Bengal, with estimates around three million. A young artist, Zainul Abedin, drew the dying in the streets of Calcutta on cheap paper. Those sketches are still among the strongest images of hunger ever made.", source: wiki("Bengal famine of 1943"), picture: pic("zainul-museum2", "The Zainul Abedin Museum in Mymensingh, which keeps his work") },
      { title: "Divided twice", meta: "1905 and 1947", text: "Bengal was split in 1905, reunited in 1911 and split again in 1947, when the eastern half became East Pakistan. Most of the country's jute money went west, and over a thousand miles of India lay between the two wings.", source: wiki("Partition of Bengal (1947)"), picture: pic("partition-bengal", "Map of Bengal as divided in 1905") },
      { title: "The night the sea came in", meta: "November 1970", text: "The Bhola cyclone killed somewhere between 300,000 and 500,000 people, the deadliest tropical storm on record. The slow relief effort hardened people's anger at the government in far-off West Pakistan.", source: { name: "PreventionWeb", url: "https://www.preventionweb.net/blog/whats-changed-1970-great-bhola-cyclone" }, picture: pic("bhola-1970", "The 1970 Bhola cyclone, seen from a weather satellite") },
    ],
  },
  { kind: "moment", id: "did-not-stay-down", title: "It did not stay down", text: "Everything that follows was done by people told they would never manage it.", picture: photo("martyrs-memorial") },
  {
    kind: "chapters",
    id: "road-to-freedom",
    tone: "white",
    title: "Act three: standing up",
    lede: "They defended a language, won a country, then rebuilt it with their own hands.",
    chapters: [
      { title: "Dying for an alphabet", meta: "21 February 1952", text: "When Pakistan named Urdu its only state language, students in Dhaka marched for Bangla and police opened fire. Salam, Barkat, Rafiq, Jabbar and others died. In 1999 UNESCO made the day International Mother Language Day, so the whole world now marks it.", source: { name: "UNESCO", url: "https://www.unesco.org/en/days/mother-language" }, picture: photo("shaheed-minar") },
      { title: "Nine months", meta: "26 March to 16 December 1971", text: "After an election result was refused and the army attacked Dhaka on the night of 25 March, independence was declared the next day. Farmers, students and soldiers fought for nine months, and millions fled to India. In August, George Harrison and Ravi Shankar played the Concert for Bangladesh at Madison Square Garden, one of the first great benefit concerts. The war ended with surrender in Dhaka on 16 December.", source: bangla("War of Liberation, The"), picture: pic("victory-day", "Soldiers on parade in Dhaka on Victory Day") },
      { title: "Written off", meta: "1972 to 1974", text: "The country began in ruins, its roads and bridges destroyed, and a famine struck in 1974. A US official called it a basket case, and the phrase followed Bangladesh for decades. In those same years, Fazle Hasan Abed started BRAC to help returning refugees. It became the largest development organisation in the world.", source: wiki("BRAC (organisation)"), picture: pic("statue-aparajeyo", "Aparajeyo Bangla, the sculpture of three freedom fighters at the University of Dhaka") },
      { title: "A hundred and thirty workers", meta: "1978", text: "Desh Garments sent 130 young workers to South Korea to train. They came home and started something much bigger than themselves. Bangladesh is now the second-largest clothing exporter in the world, and the work gave millions of women their own wages for the first time.", source: wiki("Textile industry in Bangladesh"), picture: pic("garment-floor", "Garment workers at sewing machines in Bangladesh") ?? photo("garments") },
      { title: "From 139,000 deaths to 26", meta: "1991 to 2020", text: "A cyclone in 1991 killed about 139,000 people. The country answered with shelters and a warning system run by tens of thousands of volunteers, half of them women. When the very strong Cyclone Amphan hit in 2020, 26 people died. Other countries now come to learn how it was done.", source: CPP, picture: pic("coast-dawn", "Dawn on the coast of Bangladesh, with small boats on the water") },
      { title: "Winning the sea, in court", meta: "2012 and 2014", text: "Bangladesh took its neighbours to international tribunals over the Bay of Bengal, and came away with about 118,813 square kilometres of water, without firing a shot.", source: wiki("Territorial disputes in the Bay of Bengal"), picture: photo("kuakata") },
      { title: "The worst day in the factories", meta: "24 April 2013", text: "The Rana Plaza building collapsed and killed more than 1,100 garment workers. It was the industry's lowest point, and it forced a change. Safety inspections followed, and by 2026 Bangladesh had 284 factories with LEED green certification, 121 of them Platinum.", source: { name: "Ittefaq, 2026", url: "https://en.ittefaq.com.bd/15918/5-more-rmg-factories-get-leed-certification" }, picture: pic("rana-aftermath", "The Rana Plaza site in Savar after the collapse")},
      { title: "Built with our own money", meta: "2022", text: "When the World Bank pulled out of the Padma Bridge, Bangladesh paid for it itself. It opened in June 2022, 6.15 km of road and rail over one of the hardest rivers on Earth to bridge. Dhaka's first metro line opened that December.", source: wiki("Padma Bridge"), picture: pic("padma-dusk", "The Padma Bridge lit up at dusk") ?? photo("padma-bridge") },
      { title: "Bringing back woven air", meta: "2017 to today", text: "Researchers went to London to study a muslin sari from 1710 at the Victoria and Albert Museum, found dried leaves of Phuti Karpas at Kew, and searched the riverbanks at home for its descendants. By 2021 two weavers had made muslin again, and in January 2026 scientists reported growing the plant experimentally.", source: { name: "Dhaka Tribune", url: "https://www.dhakatribune.com/bangladesh/nation/401617/scientists-revive-phuti-karpas-in-sreepur" }, picture: pic("jamdani-hands", "Hands weaving jamdani at a loom in Narayanganj, where the new muslin was woven") },
      { title: "Where the story stands", meta: "2024 to 2026", text: "A student-led uprising changed the government in August 2024, again with young people at the front. The UN has moved Bangladesh's graduation from the group of least developed countries to November 2029, at the government's request. Its economy has grown to about US$506 billion, and an IMF forecast in October 2026 put income per person ahead of India's.", source: { name: "Al Jazeera, October 2026", url: "https://www.aljazeera.com/news/2026/10/25/bangladesh-per-capita-gdp-forecast-to-outstrip-indias-what-does-it-mean" }, picture: photo("flag-mural") },
    ],
  },
  { kind: "part", part: "figures" },
  { kind: "part", part: "timeline" },
  { kind: "part", part: "rails" },
];
