/**
 * Taka: a working guide for a visitor. Rules, fares and helplines were checked
 * in November 2026 against the sources named beside them. They change, so the
 * page says when it was checked and where to confirm.
 */
import { pic, wiki, type Block, type Src } from "./motherland-blocks.ts";
import { photo } from "./motherland-categories.ts";

const CUSTOMS: Src = { name: "Bangladesh Customs, currency regulations", url: "https://bangladeshcustoms.gov.bd/trade_info/currency_regulations" };
const TK_CARRY: Src = { name: "Dhaka Tribune, February 2026", url: "https://www.dhakatribune.com/business/403099/bb-no-limit-on-carrying-cash-inside-the-country" };
const WISE: Src = { name: "Wise, ATMs in Bangladesh", url: "https://wise.com/gb/blog/atms-in-bangladesh" };
const BKASH_LIMITS: Src = { name: "bKash, limits", url: "https://www.bkash.com/en/help/limits" };
const EN_999: Src = { name: "UNB, 999 in English", url: "https://unb.com.bd/category/Bangladesh/foreigners-in-bangladesh-can-now-access-emergency-help-via-999-in-english-igp/153428" };
const TOURIST_POLICE: Src = { name: "Bangladesh Monitor, Tourist Police helpline", url: "https://bangladeshmonitor.com.bd/en/bangladesh-tourist-police-launches-247-helpline-for-travellers" };
const BB_HOTLINE: Src = { name: "UNB, Bangladesh Bank hotline", url: "https://unb.com.bd/category/Business/display-bb-hotline-number16236in-a-visible-place-for-banking-related-complaints/115030" };
const BRTA: Src = { name: "BRTA fare chart, October 2026", url: "https://www.thedailystar.net/news/bangladesh/transport/news/brta-publishes-new-bus-fare-chart-4160666" };
const TRAIN: Src = { name: "Jago News, train fares", url: "https://www.jagonews24.com/en/national/news/88196" };
const LAUNCH: Src = { name: "Dhaka Tribune, launch fares", url: "https://www.dhakatribune.com/bangladesh/power-energy/408407/launch-fares-rise-without-official-order-sparking" };
const SUNDARBANS: Src = { name: "Prothom Alo, Sundarbans trip", url: "https://en.prothomalo.com/lifestyle/travel/w98r1j51u3" };
const STMARTIN: Src = { name: "Prothom Alo, Saint Martin's guide 2026-27", url: "https://en.prothomalo.com/bangladesh/60dans0p0u" };


export const TAKA_BLOCKS: Block[] = [
  { kind: "tool", tool: "converter" },
  {
    kind: "steps",
    id: "changing-money",
    tone: "white",
    title: "How to change your money",
    lede: "Six steps, from packing your bag to flying home.",
    steps: [
      { title: "Before you land", text: "Bring clean US dollars, euros or pounds. You may bring in any amount, but anything above US$5,000 must be declared to customs on Form FMJ. Some news reports give US$10,000 as the limit, so if you carry more than US$5,000, declare it.", source: CUSTOMS, picture: pic("plane-biman", "A Biman Bangladesh Airlines plane on the runway in Dhaka") },
      { title: "At the airport", text: "Bank counters at Dhaka's Hazrat Shahjalal airport change money after immigration. Change enough for the ride to your hotel and your first day, then look for a better rate in town.", picture: pic("plane-dhaka", "A passenger plane on the runway at Dhaka airport") },
      { title: "In the city", text: "Use a bank or an authorised money changer. Show your passport, count your notes at the counter and keep the receipt. Never change with someone who approaches you on the street.", picture: pic("money-exchange", "Banknotes from many countries") ?? photo("taka-notes") },
      { title: "From a cash machine", text: "Most machines take Visa and Mastercard and give up to ৳20,000 per withdrawal, and you can withdraw more than once. If the screen offers your home currency, choose taka: the machine's own conversion usually costs more. Fees vary, so ask your bank before you travel.", source: WISE, picture: pic("atm-bd", "A hand taking cash from a machine") },
      { title: "With a card", text: "Good hotels, airlines, supermarkets and larger shops take cards. Markets, rickshaws, tea stalls and small restaurants take cash. Carry both, and keep some notes under ৳100 for small purchases.", picture: pic("shopping-mall", "Inside a large shopping mall") ?? photo("taka-notes") },
      { title: "When you leave", text: "A passenger may carry up to ৳10,000 out of the country. Change anything above that before departure, with your exchange receipts in hand.", source: TK_CARRY, picture: pic("plane-biman", "A Biman Bangladesh plane on the runway at Dhaka") ?? photo("taka-notes") },
    ],
  },
  {
    kind: "table",
    id: "what-it-buys",
    hideLastColumn: true,
    picture: pic("launch-sadarghat", "River launches moored at Sadarghat in Dhaka") ?? photo("rickshaw-art"),
    tone: "sun",
    title: "What your money buys",
    lede: "Real fares from published charts, checked November 2026. Confirm before you pay.",
    head: ["What", "Price", "Where this comes from"],
    rows: [
      ["Dhaka to Cox's Bazar by train, AC chair", "৳1,449", "Bangladesh Railway, reported fare"],
      ["Dhaka to Cox's Bazar by coach, 40 seats", "৳1,147", "BRTA chart, October 2026"],
      ["Dhaka to Sylhet by coach, 40 seats", "৳740", "BRTA chart, October 2026"],
      ["Dhaka to Rajshahi by coach, 40 seats", "৳991", "BRTA chart, October 2026"],
      ["Overnight river launch from Dhaka, single cabin", "৳1,200", "Reported at Dhaka port, April 2026"],
      ["Overnight river launch from Dhaka, double cabin", "৳2,400", "Reported at Dhaka port, April 2026"],
      ["Saint Martin's Island conservation fee", "৳100", "Government rules for 2026-27"],
      ["Three days in the Sundarbans, foreign visitor", "$220 to $380", "Tour operators' published prices"],
      ["A cup of street tea", "৳10 to ৳30", "Our rough guide"],
      ["A short rickshaw ride", "৳30 to ৳100", "Our rough guide, agree before you sit"],
      ["A good local meal", "৳150 to ৳500", "Our rough guide"],
    ],
    note: "Checked November 2026. Fares rose twice in 2026 with fuel prices, so confirm before you pay.",
    sources: [TRAIN, BRTA, LAUNCH, STMARTIN, SUNDARBANS],
  },
  {
    kind: "tool",
    tool: "money-brands",
  },
  {
    kind: "cards",
    id: "phone-money",
    tone: "navy",
    title: "Money on the phone",
    lede: "Why everyone here pays with a phone, and what a visitor can do about it.",
    columns: 3,
    cards: [
      { title: "bKash", meta: "Helpline 16247", text: "The best known wallet. Money moves by phone number, and agents on almost every street turn cash into balance and back. An account holder can take out up to ৳30,000 a day. Accounts are built around a Bangladeshi number and ID.", source: BKASH_LIMITS, picture: pic("kiosk", "A small roadside shop") ?? photo("mobile-money") },
      { title: "Nagad", meta: "Helpline 16167", text: "A large wallet run with Bangladesh Post Office. It works the same way: send, pay, and cash out at an agent.", source: { name: "Nagad", url: "https://nagad.com.bd/" }, picture: photo("mobile-money") },
      { title: "Rocket", meta: "Helpline 16216", text: "Dutch-Bangla Bank's mobile banking service, one of the first in the country.", source: { name: "Dutch-Bangla Bank", url: "https://www.dutchbanglabank.com/" }, picture: pic("dbbl", "A Dutch-Bangla Bank branch") ?? pic("kiosk", "A small roadside shop") },
      { title: "Can a visitor use them?", text: "We could not find an official rule that lets a tourist open a wallet on a passport alone, though one travel app says it can be done. Call the helpline before you count on it. In practice, your hotel, host or guide can receive and send for you.", picture: pic("phone-field", "A traveller using his phone beside a green field") ?? photo("mobile-money") },
      { title: "A local SIM", text: "Grameenphone, Robi, Banglalink and Teletalk sell SIMs at the airport and in their shops. Bring your passport. A local number also makes ride apps and hotel calls easier.", picture: pic("dhaka-street", "A busy Dhaka street with shops on both sides") ?? photo("mobile-money") },
      { title: "Ride apps", text: "Uber and Pathao show the price before you ride, and work in the big cities. You can pay in cash, which removes the need to bargain.", picture: pic("pathao", "A motorbike rider in Dhaka") ?? pic("cng", "A green auto-rickshaw in Dhaka") },
    ],
  },
  {
    kind: "cards",
    id: "banks",
    tone: "white",
    title: "Banks and bank transfers",
    columns: 3,
    cards: [
      { title: "Sending money in", text: "An international SWIFT transfer reaches any Bangladeshi bank account. You need the bank's name, branch, SWIFT code, and the holder's full name and account number. Money transfer apps also pay out straight to bKash and Nagad wallets.", picture: pic("bank-hq", "A bank head office in Dhaka") },
      { title: "Moving money inside the country", text: "Local banks settle through BEFTN for ordinary transfers, RTGS for large urgent ones, and NPSB between cards and accounts. Your hotel or partner will know which one to use.", source: { name: "Bangladesh Bank", url: "https://www.bb.org.bd/" }, picture: pic("dhaka-air", "Dhaka from the air") },
      { title: "Staying longer?", text: "Students, workers and investors can open accounts, including foreign currency accounts, with their passport and visa papers. Rules differ by bank and purpose, so go to a large branch and ask for the foreign exchange desk.", picture: pic("bank-hq2", "A bank head office in Dhaka") },
    ],
  },
  {
    kind: "table",
    id: "stay-safe",
    picture: pic("dhaka-medical", "Mugda Medical College Hospital, Dhaka") ?? photo("rickshaw-art"),
    tone: "mint",
    title: "Numbers to save now",
    lede: "Put these in your phone before you land.",
    head: ["Who", "Number", "What for"],
    rows: [
      ["National emergency", "999, then press 2", "Police, fire or ambulance, in English"],
      ["Tourist Police", "01320-222222 or 01887-878787", "24-hour help for travellers"],
      ["Police help desk for foreigners", "01320-001372", "Non-urgent help, from the Australian embassy's list"],
      ["Bangladesh Bank", "16236", "Complaints against a bank"],
      ["bKash", "16247", "Wallet help, all day"],
      ["Nagad", "16167", "Wallet help"],
      ["Rocket", "16216", "Wallet help"],
    ],
    note: "Lost card? Call your own bank's international number and freeze the card in its app first.",
    sources: [EN_999, TOURIST_POLICE, BB_HOTLINE, { name: "Australian High Commission, Dhaka", url: "https://bangladesh.embassy.gov.au/files/daca/Information%20for%20Australians%20in%20Bangladesh.pdf" }],
  },
  {
    kind: "cards",
    id: "simple-rules",
    tone: "white",
    title: "Five habits that save money",
    columns: 3,
    cards: [
      { title: "Keep small notes", text: "Few street sellers can break ৳1,000. Change big notes at shops and hotels whenever you can.", picture: pic("taka-small", "A fan of 1,000 taka notes") ?? photo("taka-notes") },
      { title: "Agree the fare first", text: "Rickshaws and CNG auto-rickshaws run without meters. Say the price before you sit down, or use a ride app.", picture: pic("rickshaw-rain", "A cycle rickshaw in the rain") ?? photo("rickshaw-art") },
      { title: "Bargain with a smile", text: "Markets expect it. Shops with printed prices do not.", picture: pic("fish-market", "A fish seller's stall in Dhaka at night") ?? photo("handloom") },
      { title: "Count before you leave", text: "Count your notes at the counter and refuse badly torn ones, since shops may not take them later.", picture: photo("taka-notes") },
      { title: "Use machines inside banks", text: "They are safer, and if the machine keeps your card there is someone to ask.", picture: pic("atm-bd", "A hand taking cash from a machine") },
    ],
  },
  {
    kind: "chapters",
    id: "the-money",
    tone: "paper",
    title: "The full story of the taka",
    lede: "From medieval silver to notes printed with the nation's monuments.",
    chapters: [
      { title: "A name older than the country", meta: "Medieval Bengal", text: "Taka comes from the Sanskrit tanka, a silver coin. Bengal's sultans struck silver tankas centuries before any modern border existed, and people across the region have called their money taka ever since.", source: wiki("Bangladeshi taka"), picture: pic("old-coin", "A silver tanka of Sikandar Shah, a sultan of Bengal") },
      { title: "Rubber stamps and a map", meta: "1971 to 1974", text: "A new country needed money quickly. Pakistani rupee notes were first used with and without rubber stamps. On 4 March 1972 the first taka notes arrived, printed with a map of Bangladesh. These first notes stopped being legal tender on 30 March 1974.", source: wiki("Banknotes of the Bangladeshi taka"), picture: pic("bank-hq", "Bangladesh Bank, which issues the taka") ?? photo("taka-notes") },
      { title: "A currency finds its feet", meta: "1976 onward", text: "A new series in 1976 replaced almost every note. The money kept pace with the economy: the ৳500 note arrived in 1976 and the ৳1,000 in 2008, as garments and money from workers abroad grew.", source: { name: "The Business Standard", url: "https://www.tbsnews.net/node/322393" }, picture: photo("garments") },
      { title: "Monuments on the money", meta: "June 2025", text: "From 1 June 2025 Bangladesh Bank began issuing notes that show no person at all. They carry places instead: Kantajew Temple, Paharpur, the National Martyrs' Memorial and the land itself. Older notes remain legal tender, so you will see both in your change.", source: { name: "Malay Mail", url: "https://www.malaymail.com/news/money/2025/06/01/bangladesh-drops-founding-father-mujibur-rahman-from-currency-as-daughter-hasina-faces-trial/178943" }, picture: photo("martyrs-memorial") },
    ],
  },
  { kind: "part", part: "figures" },
  { kind: "part", part: "timeline" },
];
