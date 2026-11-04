/**
 * Arts & Culture: the living culture of Bangladesh, its calendar, its ghosts
 * and its stages. Dates marked "expected" follow the lunar calendars and move;
 * the page says so, and tickets always lead to the organiser or the venue.
 */
import { bangla, pic, place, wiki, type Block, type Src } from "./motherland-blocks.ts";
import { photo } from "./motherland-categories.ts";

const BAKER: Src = { name: "The Financial Express, on Baker Bhai", url: "https://thefinancialexpress.com.bd/views/why-baker-bhais-popularity-skyrocketed-1608377673" };
const BAND: Src = { name: "The Financial Express, band music", url: "https://thefinancialexpress.com.bd/views/reviews/evolution-of-band-music-in-bangladesh-1540221421" };
const BHOOT: Src = { name: "The Business Standard, Bangali bhoots", url: "https://www.tbsnews.net/splash/bhoot-chaturdoshi-meets-halloween-bangali-bhoots-981421" };
const BOLI: Src = { name: "Dhaka Tribune, 117th Boli Khela", url: "https://www.dhakatribune.com/sport/other-sports/408444/117th-jabbar%E2%80%99s-boli-khela-to-begin-saturday" };
const CANNES: Src = { name: "Dhaka Tribune, Ali at Cannes", url: "https://www.dhakatribune.com/showtime/382224/bangladesh-s-ali-makes-history-at-cannes" };
const MATIR: Src = { name: "The Business Standard, Cannes", url: "https://www.tbsnews.net/node/269374" };

export const CULTURE_BLOCKS: Block[] = [
  { kind: "part", part: "stack" },
  { kind: "tool", tool: "calendar" },
  {
    kind: "films",
    id: "culture-on-film",
    tone: "navy",
    title: "See it move",
    lede: "All filmed in Bangladesh by people who were there.",
    films: [
      { title: "Weaving jamdani", text: "Patterns are not printed or sewn. They grow thread by thread on a hand loom in Narayanganj. UNESCO listed the craft in 2013.", file: "jamdani-weaving", where: "Filmed at BSCIC Jamdani Palli, Narayanganj", credit: { author: "Wasiul Bahar", license: "CC BY-SA 4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Weaving_jamdani_at_BSCIC_Jamdani_palli,_Narayanganj_7.webm" } },
      { title: "A Baul song", text: "Wandering singers who hold that the divine lives inside every person.", file: "baul-ramna", where: "Filmed at Ramna Park, Dhaka", credit: { author: "Wasiul Bahar", license: "CC BY-SA 4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Baul_song_at_Ramna_Park.webm" } },
      { title: "Boat race", text: "The oars move to a drum, and the whole riverbank shouts.", file: "boat-race", where: "Filmed on the Kaliganga river", credit: { author: "Sufe", license: "CC BY-SA 4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Boat_Race_in_Bangladesh_at_Kaliganga_River.ogv" } },
      { title: "New Year fireworks", text: "At midnight the sky over the rooftops of Dhaka fills with light.", file: "new-year-dhaka", where: "Filmed in Dhaka", credit: { author: "MdsShakil", license: "CC BY-SA 4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:New_year_celebrations_in_Dhaka_02.webm" } },
    ],
  },
  {
    kind: "cards",
    id: "village-life",
    tone: "white",
    title: "The village still sets the rhythm",
    lede: "Most Bangladeshis are one generation from a village, and go back whenever they can.",
    columns: 3,
    cards: [
      { title: "Pitha", meta: "Winter", text: "Steamed, fried or filled rice cakes. Bhapa with date palm molasses and coconut is sold hot on winter street corners. There are dozens of kinds, and every grandmother has her own.", picture: pic("pitha", "Traditional rice cakes in Bangladesh") },
      { title: "Nobanno", meta: "New rice, November", text: "The first rice of the Aman harvest goes into sweet dishes for the family, the neighbours and the birds. In Dhaka, artists hold their own version with songs and dance at Charukala.", picture: pic("hemanta-harvest", "Farmers bringing in the new rice")},
      { title: "Mela", meta: "All year", text: "A fair of clay toys, bamboo flutes, sweets, circus tents and folk singers. There is one somewhere every week, and Boishakhi fairs fill April.", picture: pic("mela2", "Bright decorations at a Boishakhi mela") },
      { title: "Nakshi kantha", meta: "Embroidered quilts", text: "Women stitched old saris together and embroidered their lives on them. Jasimuddin's long poem about one such quilt is still taught in school.", picture: pic("nakshi-kantha", "A quilt embroidered in nakshi kantha style"), source: wiki("Nakshi kantha") },
      { title: "Jatra", meta: "Open-air theatre", text: "Loud, musical, all-night folk plays on a stage with the audience on every side. Troupes tour villages in the cool months, and they are still a big draw.", picture: pic("jatra", "A jatra performance in Bangladesh"), source: { name: "The Daily Star, jatra festival", url: "https://www.thedailystar.net/entertainment/theatre-arts/news/month-long-jatra-performance-festival-begins-december-4047101" } },
      { title: "Puthi and pala", meta: "Stories in song", text: "Storytellers once sang long tales to a village at night. Palagan is a contest of song in which two singers argue in verse.", picture: pic("old-pages", "A bundle of old pages tied with string") },
    ],
  },
  { kind: "part", part: "rails" },
  {
    kind: "cards",
    id: "banglar-bhoot",
    tone: "navy",
    title: "Banglar Bhoot",
    lede: "No childhood here is complete without a ghost story. Turn the lights down.",
    columns: 4,
    note: "On Bhoot Chaturdoshi, the night before Kali Puja, some Bengali homes light fourteen lamps to keep spirits away.",
    cards: [
      { title: "Mechho Bhoot", meta: "The fish ghost", text: "Loves fish above everything. Walk home from the market after dark with a fresh hilsa and it will follow you, whispering through its nose for a share.", source: BHOOT, picture: photo("fisher-mist") },
      { title: "Petni", meta: "Lives near the pond", text: "The ghost of a woman who died unmarried. Her feet point backwards, so check before you speak to a stranger near the water at night.", picture: pic("banyan", "An old banyan tree") },
      { title: "Shakchunni", meta: "Married, and jealous", text: "She wears a bride's conch-shell bangles and envies living wives. Some say she tries to take a woman's place in her own home.", picture: pic("fog-village", "A village in winter fog") },
      { title: "Nishi", meta: "The night caller", text: "It calls your name in the voice of someone you love. It can only call twice, so wait for a third call before you answer.", picture: pic("night-moon", "Still dark water in the last of the evening light") },
      { title: "Aleya", meta: "The marsh light", text: "Strange lights over the wetlands at night. Fishermen say they pull boats off course. Others say they lead you home.", picture: pic("marsh-dusk", "Dusk over a wetland in Bangladesh") ?? photo("sunamganj-haor") },
      { title: "Brahmadaitya", meta: "The gentle one", text: "The ghost of a Brahmin who sits up in a bel tree. He is the respectable sort of ghost, and sometimes helps.", picture: pic("banyan-roots", "An old banyan tree with hanging roots") ?? photo("swamp-forest") },
      { title: "Mamdo", meta: "A Muslim ghost", text: "In the stories, the spirit of a Muslim man who died an unnatural death.", picture: pic("ruin-dusk", "An old brick building overgrown with trees at sunset") },
      { title: "Ekanore", meta: "One leg", text: "A ghost that hops. You hear it before you see it, and you do not want to see it.", picture: pic("field-dusk", "Paddy fields in the evening") ?? photo("rice-planting") },
    ],
  },
  {
    kind: "chapters",
    id: "rock-and-the-nineties",
    tone: "white",
    title: "Rock, cassettes and the 90s",
    lede: "A newborn country started a rock scene, and one television set could stop the whole nation.",
    chapters: [
      { title: "The guru", meta: "1970s", text: "Azam Khan fought in the Liberation War and then came home to start a band, Uchcharon. People called him Pop Guru. He sang about Dhaka's streets and the people on them, and young Dhaka had never heard anything like it.", source: BAND, picture: pic("p-azam", "Azam Khan, the pop guru of Bangladesh") },
      { title: "The bands", meta: "1980 to 1991", text: "Souls released Super Souls in 1980, often called the first album by a Bangladeshi band. Miles followed in 1982 and Feedback in 1985. Warfaze formed in 1984 and brought hard rock in. Ayub Bachchu left Souls to start LRB, and his guitar became the sound of a generation. Bands were soon playing to crowds in India, the UK, the US and Canada.", source: BAND, picture: pic("p-bachchu", "Ayub Bachchu, guitar in hand, on stage")},
      { title: "The night a nation begged", meta: "1993", text: "Humayun Ahmed's serial Kothao Keu Nei gave Bangladesh Television a lovable gangster called Baker Bhai. When the story turned to his hanging, people marched in the streets and gathered outside the writer's house. Hundreds of people made appeals to him, including the prime minister of the day. Humayun Ahmed kept his ending, and Baker Bhai was hanged on screen. No other country has quite that story to tell.", source: BAKER, picture: pic("p-humayun", "The writer Humayun Ahmed") },
      { title: "When there was one channel", meta: "The 1990s", text: "BTV was the one channel, so on drama night the country watched the same thing. Ittadi, on air since 1989, made the whole family laugh. Then came cassettes of mixed songs from the corner shop, Eid fashions copied from the screen, and tea-stall arguments about the plot.", source: { name: "Prothom Alo, BTV's old plays", url: "https://en.prothomalo.com/entertainment/BTV%E2%80%99s-popular-old-plays-on-YouTube" }, picture: pic("btv", "The Bangladesh Television building") },
      { title: "Dressing like ourselves", meta: "Fashion", text: "Aarong opened in 1978 to sell village craft, and made handloom and nakshi kantha something to want in the city. Young designers followed. By the 90s, a good panjabi or a Tangail sari was a statement of who you were.", source: wiki("Aarong"), picture: photo("falgun") },
    ],
  },
  {
    kind: "cards",
    id: "cinema-and-drama",
    tone: "sun",
    title: "Films and plays worth finding",
    lede: "Start with these if you want to understand us.",
    columns: 3,
    cards: [
      { title: "Jibon Theke Neya", meta: "Zahir Raihan, 1970", text: "A family drama that was really about a nation under a dictator, released a year before the war. Its song 'Amar Bhaier Rokte Rangano' still breaks hearts.", source: wiki("Jibon Theke Neya"), picture: photo("shaheed-minar") },
      { title: "Titash Ekti Nadir Naam", meta: "Ritwik Ghatak, 1973", text: "A river, a fishing community and the end of a way of life, by one of South Asia's greatest directors.", source: wiki("Titash Ekti Nadir Naam"), picture: pic("river-boats", "Wooden boats on a wide river in Bangladesh") },
      { title: "Matir Moina", meta: "Tareque Masud, 2002", text: "A boy in a madrasa in the years before independence. It won the FIPRESCI critics' prize at Cannes.", source: MATIR, picture: pic("clay-toy", "Clay toys at a village fair") ?? photo("pottery") },
      { title: "Rehana Maryam Noor", meta: "Abdullah Mohammad Saad, 2021", text: "The first Bangladeshi film in Cannes' official selection, about a doctor who will not let a wrong go.", source: MATIR, picture: pic("dhaka-medical", "A medical college hospital in Dhaka") },
      { title: "Ali", meta: "Adnan Al Rajeev, 2025", text: "A short about a boy who sings in a coastal town. It received a Special Mention, the first official Cannes award for a Bangladeshi film.", source: CANNES, picture: photo("kuakata") },
      { title: "Nagorik and Dhaka Theatre", meta: "Since the 1970s", text: "After the war, young actors built a group theatre movement from nothing. Selim Al Deen's plays made a theatre that was truly Bengali. Groups still perform on Bailey Road and at Shilpakala.", source: bangla("Group Theatre"), picture: pic("natok", "Performers in silhouette on a stage") ?? pic("shilpakala", "The Shilpakala Academy in Dhaka") },
    ],
  },
  {
    kind: "cards",
    id: "sports",
    tone: "white",
    title: "Games we play",
    lede: "From a wrestling ring begun under British rule to a country stopped by a cricket match.",
    columns: 3,
    cards: [
      { title: "Kabaddi", meta: "National game", text: "Called ha-du-du in the villages. A raider crosses the line on one breath, chanting, tags opponents and runs back.", picture: pic("kabaddi2", "A kabaddi match before a crowd"), source: wiki("Kabaddi") },
      { title: "Boli Khela", meta: "Chattogram, since 1909", text: "A merchant called Abdul Jabbar started this wrestling contest in 1909 to build young men's strength against British rule. The 117th edition was held in April 2026 at Laldighi Maidan.", picture: pic("boli-khela", "Wrestlers ringed by a huge crowd at the Boli Khela in Chattogram"), source: BOLI },
      { title: "Nouka Baich", meta: "Boat races", text: "Long boats with dozens of oarsmen race in the monsoon and autumn while drums set the stroke.", picture: pic("boat-race-photo", "Traditional boat race in Bangladesh") },
      { title: "Lathi khela", meta: "Stick fighting", text: "A martial art that has become a dance of skill at village fairs and on Pohela Boishakh.", picture: pic("lathi-khela", "A lathi khela stick fight") },
      { title: "Gollachut and dariyabandha", meta: "Village yard games", text: "Running and tagging games played on any patch of ground, needing no equipment at all.", picture: pic("river-pyramid", "Boys making a human pyramid in a river in Bangladesh") },
      { title: "Cricket", meta: "The national passion", text: "Test status came in 2000. The under-19 team won the World Cup in 2020. Every tea stall has an opinion, and a match can bring a city to a stop.", picture: pic("cricket-fans", "Fans with the national flag at the cricket stadium in Mirpur"), source: wiki("Bangladesh national cricket team") },
      { title: "Women's football", meta: "South Asian champions", text: "Bangladesh's women won the SAFF Championship in 2022 and defended it in 2024, and were welcomed home on an open-top bus.", source: wiki("SAFF Women's Championship"), picture: pic("women-football", "Women playing football on a green pitch") },
    ],
  },
  {
    kind: "map",
    id: "culture-map",
    tone: "mint",
    title: "Where to find it",
    lede: "The academies, museums and homes of our art. Pick a pin.",
    pins: [
      { id: "bangla-academy", name: "Bangla Academy", place: "Dhaka", lat: 23.733, lon: 90.397, tag: "Language and books", text: "Founded in 1955 after the Language Movement, in an old mansion. It runs the great book fair and publishes the national dictionary.", link: { name: "Bangla Academy", url: "https://banglaacademy.gov.bd/" }, picture: pic("bangla-academy", "The old mansion of Bangla Academy in Dhaka") },
      { id: "shilpakala", name: "Bangladesh Shilpakala Academy", place: "Dhaka", lat: 23.74, lon: 90.408, tag: "Theatre, music, art", text: "The national academy of fine and performing arts, with the National Theatre Hall and the Experimental Theatre Hall, and art exhibitions all year.", link: { name: "Shilpakala Academy", url: "https://shilpakala.gov.bd/" }, picture: pic("shilpakala", "The Shilpakala Academy in Dhaka") },
      { id: "museum", name: "Bangladesh National Museum", place: "Shahbag, Dhaka", lat: 23.737, lon: 90.394, tag: "History and art", text: "Stone sculpture, coins, folk art and Liberation War history under one roof.", link: { name: "National Museum", url: "http://www.bangladeshmuseum.gov.bd/" }, picture: pic("national-museum", "The Bangladesh National Museum in Dhaka") },
      { id: "liberation", name: "Liberation War Museum", place: "Agargaon, Dhaka", lat: 23.777, lon: 90.378, tag: "History", text: "Built from objects given by the people who lived through 1971. Hard to walk through, and essential.", link: { name: "Liberation War Museum", url: "https://www.liberationwarmuseumbd.org/" }, picture: photo("martyrs-memorial") },
      { id: "chhayanaut", name: "Chhayanaut", place: "Dhanmondi, Dhaka", lat: 23.747, lon: 90.372, tag: "Music", text: "The music school whose dawn songs under the banyan at Ramna have welcomed each Bangla New Year since 1967.", link: wiki("Chhayanaut"), picture: pic("jatra", "A performer making up before a show") },
      { id: "natok", name: "Mahila Samity and Bailey Road", place: "Dhaka", lat: 23.743, lon: 90.408, tag: "Theatre", text: "Dhaka's theatre street, where the group theatre movement grew up. Check troupes' pages for what is on.", link: wiki("Bailey Road"), picture: pic("natok", "Performers in silhouette on a stage") },
      { id: "sonargaon", name: "Folk Art and Crafts Museum", place: "Sonargaon", lat: 23.647, lon: 90.6, tag: "Craft", text: "Founded by the artist Zainul Abedin to save the crafts of the villages. Panam Nagar's old merchant houses are nearby.", link: wiki("Sonargaon"), picture: pic("sonargaon-museum", "The Folk Art and Crafts Museum at Sonargaon") },
      { id: "zainul", name: "Zainul Abedin Museum", place: "Mymensingh", lat: 24.752, lon: 90.408, tag: "Painting", text: "The master's paintings on the bank of the Brahmaputra, where he grew up.", link: wiki("Zainul Abedin"), picture: pic("zainul-museum", "The Zainul Abedin Museum in Mymensingh") },
      { id: "lalon", name: "Lalon Akhra", place: "Kushtia", lat: 23.906, lon: 89.135, tag: "Baul music", text: "The shrine of Lalon Fakir, where Bauls gather and sing all night.", link: wiki("Lalon"), picture: pic("lalon-akhra", "The shrine of Lalon in Kushtia") },
      { id: "shilaidaha", name: "Rabindra Kuthibari", place: "Shilaidaha, Kushtia", lat: 23.925, lon: 89.222, tag: "Literature", text: "Tagore's riverside home, where he wrote much of Gitanjali.", link: wiki("Shilaidaha Kuthibadi"), picture: pic("shilaidaha", "Rabindra Kuthibari at Shilaidaha in Kushtia") },
      { id: "sultan", name: "S. M. Sultan Complex", place: "Narail", lat: 23.17, lon: 89.51, tag: "Painting", text: "The painter's home on the Chitra river, and a boat race on it every year.", link: wiki("S. M. Sultan"), picture: photo("rice-planting") },
      { id: "trishal", name: "Nazrul's Trishal", place: "Mymensingh", lat: 24.58, lon: 90.39, tag: "Literature", text: "The national poet spent part of his childhood here, and a university now carries his name.", link: wiki("Jatiya Kabi Kazi Nazrul Islam University"), picture: pic("fog-village", "Cyclists under an old banyan on a misty morning") },
      { id: "kantajew", name: "Kantajew Temple", place: "Dinajpur", lat: 25.79, lon: 88.67, tag: "Terracotta", text: "Every wall tells the epics in fired clay, finished in 1752.", link: wiki("Kantajew Temple"), picture: place("kantajew", "The terracotta walls of Kantajew Temple in Dinajpur") },
      { id: "hason", name: "Museum of Rajas", place: "Sylhet", lat: 24.9, lon: 91.87, tag: "Music", text: "Dedicated to Hason Raja, the landlord who became a mystic poet.", link: wiki("Hason Raja"), picture: photo("srimangal-tea") },
      { id: "rangamati", name: "Tribal Cultural Institute", place: "Rangamati", lat: 22.65, lon: 92.18, tag: "Hill cultures", text: "A small museum of the dress, weaving and history of the peoples of the Hill Tracts.", link: wiki("Rangamati"), picture: pic("sajek-mist", "Green hills in mist in the south-east") },
    ],
  },
  { kind: "part", part: "figures" },
  { kind: "part", part: "timeline" },
];
