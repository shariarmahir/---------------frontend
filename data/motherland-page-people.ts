/**
 * People: those who make Bangladesh proud through art, thought, science and
 * service. By Mahir's instruction this page holds no political biography.
 * The English of each line below is our own translation of the Bangla.
 */
import type { Picture } from "./motherland.ts";
import { pic, wiki, type Block, type Card, type Src } from "./motherland-blocks.ts";
import { photo } from "./motherland-categories.ts";

const person = (title: string, meta: string, text: string, source: Src, key?: string, alt?: string, instead?: Picture): Card => ({ title, meta, text, source, picture: (key ? pic(key, alt ?? `A portrait of ${title}`, "50% 20%") : undefined) ?? instead });

export const PEOPLE_BLOCKS: Block[] = [
  {
    kind: "lines",
    id: "best-lines",
    tone: "navy",
    title: "Lines that made us",
    lede: "Everyone here knows these by heart.",
    note: "English translations are ours.",
    lines: [
      { bangla: "বল বীর — বল উন্নত মম শির!", english: "Say, hero: say my head is held high!", who: "Kazi Nazrul Islam, Bidrohi, 1922", picture: photo("flag-mural") },
      { bangla: "সব লোকে কয় লালন কী জাত সংসারে", english: "Everyone asks: what is Lalon's caste in this world?", who: "Lalon Fakir", picture: pic("lalon-akhra", "The shrine of Lalon in Kushtia") },
      { bangla: "আবার আসিব ফিরে ধানসিড়িটির তীরে — এই বাংলায়", english: "I will come back to the banks of the Dhansiri, to this Bengal.", who: "Jibanananda Das, Rupasi Bangla", picture: photo("fisher-mist") },
      { bangla: "আগে কী সুন্দর দিন কাটাইতাম", english: "What beautiful days we used to pass.", who: "Shah Abdul Karim", picture: photo("sunamganj-haor") },
      { bangla: "লোকে বলে, বলে রে, ঘরবাড়ি ভালা নায় আমার", english: "People say, they say, my house is no good.", who: "Hason Raja", picture: photo("srimangal-tea") },
      { bangla: "আলোকিত মানুষ চাই", english: "We want enlightened people.", who: "Abdullah Abu Sayeed, Bishwo Shahitto Kendro", picture: pic("dhaka-book-fair", "A child with books at the Ekushe Book Fair") },
    ],
  },
  { kind: "part", part: "rails" },
  {
    kind: "people",
    id: "thinkers",
    tone: "white",
    title: "Thinkers",
    lede: "Some had universities behind them. One taught himself in a village.",
    cards: [
      person("Aroj Ali Matubbar", "1900 to 1985, Barishal", "A farmer's son with little schooling who taught himself philosophy, and wrote his questions about faith and reason into books. He is one of the country's most surprising minds.", wiki("Aroj Ali Matubbar"), "p-aroj"),
      person("Ahmed Sofa", "1943 to 2001, writer and thinker", "Sharp-tongued essayist and novelist, who asked hard questions of the educated class. Younger writers still argue with him.", wiki("Ahmed Sofa"), "p-sofa"),
      person("G. C. Dev", "1907 to 1971, philosopher", "A University of Dhaka philosopher who worked to bring together Eastern and Western thought. He was killed on the first night of the war in March 1971.", wiki("Govinda Chandra Dev"), "p-gcdev", "A memorial at the University of Dhaka"),
      person("Abdullah Abu Sayeed", "Born 1939, educator", "Living legend. He founded Bishwo Shahitto Kendro, whose book-reading programmes and mobile libraries reach many thousands of students. He received the Ramon Magsaysay Award in 2004.", wiki("Abdullah Abu Sayeed"), "p-abu-sayeed"),
    ],
  },
  {
    kind: "people",
    id: "artists",
    tone: "sun",
    title: "Artists",
    lede: "They drew the famine, the farmer and the freedom fighter.",
    cards: [
      person("Zainul Abedin", "1914 to 1976, Shilpacharya", "His sketches of the 1943 famine remain some of the strongest images of hunger. He founded the country's first art college and the folk art museum at Sonargaon.", wiki("Zainul Abedin"), "zainul-museum", "The Zainul Abedin Museum in Mymensingh"),
      person("S. M. Sultan", "1923 to 1994, painter", "He painted Bengali farmers with huge, powerful bodies, as heroes of the land. He lived among animals and children by the Chitra river.", wiki("S. M. Sultan"), "sultan-house", "The house of S. M. Sultan in Narail"),
      person("Quamrul Hassan", "1921 to 1988, Potua", "He brought folk art into modern painting, and his blunt posters during the war were carried by a whole people.", wiki("Quamrul Hassan"), "p-quamrul"),
      person("Novera Ahmed", "1939 to 2015, sculptor", "A pioneer of modern sculpture in Bangladesh, at a time when almost no woman in the region did this work.", wiki("Novera Ahmed"), "p-novera", "Composition, a sculpture by Novera Ahmed"),
      person("Rafiqun Nabi", "Born 1943, Ranabi", "Living legend. An artist and cartoonist whose street-smart boy Tokai became one of the best known characters in the country.", wiki("Rafiqun Nabi"), "p-rafiqun"),
    ],
  },
  {
    kind: "people",
    id: "music",
    tone: "white",
    title: "Voices",
    lede: "From a mystic landlord to a guitar hero.",
    cards: [
      person("Hason Raja", "1854 to 1922, Sylhet", "A rich landlord who gave up his wild life and wrote mystic songs that people still sing at weddings and at shrines.", wiki("Hason Raja"), "p-hason"),
      person("Shah Abdul Karim", "1916 to 2009, Baul Samrat", "A poor singer from the haors who wrote more than a thousand songs about love, the village and injustice. He received the Ekushey Padak in 2001.", wiki("Shah Abdul Karim"), "p-karim"),
      person("Firoza Begum", "1930 to 2014, Nazrul Sangeet", "The great voice of Nazrul's songs for more than half a century. Nazrul himself encouraged her when she was a girl.", wiki("Firoza Begum (singer)"), "p-firoza"),
      person("Runa Laila", "Born 1952, singer", "Living legend. Her voice filled films and stages across South Asia in many languages, and it still does.", wiki("Runa Laila"), "p-runa"),
      person("Sabina Yasmin", "Born 1954, singer", "Living legend. She has sung thousands of film songs and patriotic anthems that the country knows word for word.", wiki("Sabina Yasmin"), "p-sabina-y"),
      person("Azam Khan", "1950 to 2011, Pop Guru", "A freedom fighter who came home from the war and started Bangladeshi pop and rock.", wiki("Azam Khan (singer)"), "p-azam"),
      person("Ayub Bachchu", "1962 to 2018, LRB", "Guitarist and singer who taught a generation to pick up a guitar. His band LRB filled stadiums.", wiki("Ayub Bachchu"), "p-bachchu"),
    ],
  },
  {
    kind: "people",
    id: "builders",
    tone: "mint",
    title: "Scientists and builders",
    lede: "They changed how the world builds, heals and lifts people out of poverty.",
    cards: [
      person("Fazlur Rahman Khan", "1929 to 1982, engineer", "He invented the tube systems behind modern skyscrapers, including Chicago's Sears Tower and John Hancock Center.", wiki("Fazlur Rahman Khan"), "p-fazlur", "The John Hancock Center in Chicago, one of his towers"),
      person("Fazle Hasan Abed", "1936 to 2019, BRAC", "He left a career at Shell after the 1970 cyclone and built BRAC. Fortune magazine put him among the world's 50 greatest leaders.", { name: "The Daily Star", url: "https://www.thedailystar.net/backpage/fortune-magazine-abed-placed-greatest-leaders-list-1382401" }, "p-abed"),
      person("Muhammad Qudrat-i-Khuda", "1900 to 1977, chemist", "He held patents in jute and plant chemistry and built the national science research council.", wiki("Muhammad Qudrat-i-Khuda"), "vials", "Laboratory vials on a bench"),
      person("Maqsudul Alam", "1954 to 2014, genome scientist", "He led teams that decoded the genomes of papaya and rubber abroad, and jute at home.", wiki("Maqsudul Alam"), "p-alam-lab", "Maqsudul Alam with colleagues in his laboratory"),
      person("Humayun Ahmed", "1948 to 2012, storyteller", "A chemistry lecturer who became the best-loved writer of modern Bangladesh. His characters Himu and Misir Ali feel like people you know.", wiki("Humayun Ahmed"), "p-humayun"),
    ],
  },
  {
    kind: "people",
    id: "women-power",
    tone: "navy",
    title: "The power of our women",
    lede: "They opened schools, took up guns, climbed Everest and won the South Asian title.",
    cards: [
      person("Begum Rokeya", "1880 to 1932, writer and reformer", "She learned to read in secret, then opened a school for Muslim girls. In 1905 she imagined a country run by women in Sultana's Dream.", wiki("Begum Rokeya"), "p-rokeya"),
      person("Pritilata Waddedar", "1911 to 1932, revolutionary", "At 21 she led an attack on a European club in Chattogram during the fight against British rule, and took her own life rather than be captured.", wiki("Pritilata Waddedar"), "p-pritilata"),
      person("Sufia Kamal", "1911 to 1999, poet", "A poet and campaigner for women's rights. She was the first Bangladeshi woman given a state funeral.", { name: "Women in Bangladesh", url: "https://www.tbsnews.net/bangladesh/pioneering-women/first-bangalee-muslim-physician-zohra-kazi-inspired-many-served-everyone" }, "p-sufia"),
      person("Taramon Bibi", "1957 to 2018, Bir Protik", "A teenager from Kurigram who fought in the war of 1971 and received one of the country's highest honours for bravery, decades before most people heard of her.", wiki("Taramon Bibi"), undefined, undefined, { ...photo("martyrs-memorial"), alt: "The National Martyrs' Memorial at Savar" }),
      person("Dr Firdausi Qadri", "Born 1951, scientist", "Living legend. Her work on low-cost cholera and typhoid vaccines earned the Ramon Magsaysay Award in 2021.", { name: "Prothom Alo", url: "https://en.prothomalo.com/bangladesh/fitting-recognition-for-a-pioneering-lifes-work" }, "vials", "A laboratory worker handling samples"),
      person("Nishat Majumder", "Born 1981, mountaineer", "The first Bangladeshi woman on top of Everest, on 19 May 2012.", wiki("Nishat Majumdar"), "p-nishat", "Nishat Majumder"),
      person("Wasfia Nazreen", "Born 1982, mountaineer", "The second, a week later. In 2015 she finished the Seven Summits, the highest peak on every continent.", wiki("Wasfia Nazreen"), "p-wasfia"),
      person("Sabina Khatun", "Born 1993, footballer", "Captain of the team that won South Asia's title in 2022, and scored 13 goals doing it, then brought it home again in 2024.", wiki("Sabina Khatun"), "p-sabina-k"),
      { title: "The women of the garment floors", meta: "Millions, since 1978", text: "They left their villages for the factories and made Bangladesh the world's second-largest clothing exporter. They are the backbone of the economy.", source: wiki("Textile industry in Bangladesh"), picture: photo("garments") },
    ],
  },
  { kind: "part", part: "figures" },
];
