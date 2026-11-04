/**
 * The small tables MOTHERLAND's interactive parts read in the browser: events,
 * the exchange rate, contacts. Kept apart from the page copy so those parts stay light.
 */

/** Mid-market, November 2026, from Wise and other converters: about ৳122 to ৳123. The converter lets you type the day's rate. */
export const TAKA_PER_USD = 122.5;
export const RATE_CHECKED = "November 2026";

export type EventKind = "Festival" | "National day" | "Theatre" | "Music" | "Books" | "Sport" | "Village";

export interface CultureEvent {
  id: string;
  title: string;
  kind: EventKind;
  venue: string;
  /** ISO dates. For a long event, the range. */
  start: string;
  end?: string;
  /** The dates follow a lunar calendar or an announcement, and may move. */
  expected?: boolean;
  about: string;
  /** Where to get a ticket or confirm. Null means walk in. */
  ticket: { label: string; url: string } | null;
}

const SHILPAKALA = { label: "See what is on at Shilpakala", url: "https://shilpakala.gov.bd/" };

export const EVENTS: CultureEvent[] = [
  { id: "rash-dublar", title: "Rash Mela at Dublar Char", kind: "Festival", venue: "Alorkol, Dublar Char, Sundarbans", start: "2026-11-23", end: "2026-11-25", expected: true, about: "Pilgrims and fishing boats gather on an island at the edge of the Sundarbans for the full moon of Rash.", ticket: null },
  { id: "rash-kantajew", title: "Kantajew Rash Mela", kind: "Festival", venue: "Kantajew Temple, Dinajpur", start: "2026-11-24", end: "2026-12-24", expected: true, about: "A month-long fair beside the most richly decorated terracotta temple in Bangladesh.", ticket: null },
  { id: "manipuri-rash", title: "Manipuri Rash Leela", kind: "Festival", venue: "Madhabpur and Adampur, Kamalganj, Moulvibazar", start: "2026-11-24", end: "2026-11-25", expected: true, about: "An all-night dance by the Manipuri community in the tea country of Sylhet.", ticket: null },
  { id: "nobanno", title: "Nobanno, the festival of new rice", kind: "Village", venue: "Villages across the country; Charukala, Dhaka", start: "2026-11-16", end: "2026-11-30", expected: true, about: "When the Aman rice comes in, families make payesh and rice cakes from the first grain and share them with neighbours.", ticket: null },
  { id: "mime", title: "International Mime Festival", kind: "Theatre", venue: "TSC Auditorium, University of Dhaka", start: "2026-12-02", expected: true, about: "Mime artists from home and abroad. This date comes from an events listing, so confirm with the organisers.", ticket: { label: "Check the event listing", url: "https://allevents.in/dhaka/festivals" } },
  { id: "victory", title: "Victory Day", kind: "National day", venue: "National Martyrs' Memorial, Savar, and all over Dhaka", start: "2026-12-16", about: "At dawn, flowers at Savar. Then a parade, flags from every rickshaw, and concerts until late.", ticket: null },
  { id: "poush-mela", title: "Pitha and Poush fairs", kind: "Village", venue: "Charukala, Dhaka, and towns everywhere", start: "2026-12-20", end: "2027-01-20", expected: true, about: "Rice cakes by the hundred, made with date palm molasses, at stalls and in family kitchens.", ticket: null },
  { id: "book-fair", title: "Amar Ekushey Book Fair", kind: "Books", venue: "Bangla Academy and Suhrawardy Udyan, Dhaka", start: "2027-01-07", end: "2027-02-06", about: "The country's huge book fair. In 2027 it moves earlier than the usual February. Hundreds of stalls, new books each day, and writers signing them for free.", ticket: { label: "Visit Bangla Academy", url: "https://banglaacademy.gov.bd/" } },
  { id: "shakrain", title: "Shakrain, the kite festival", kind: "Festival", venue: "Shankhari Bazar, Sutrapur and Gendaria, Old Dhaka", start: "2027-01-14", about: "Old Dhaka goes up on its roofs to fly kites all day, and breathes fire at sunset.", ticket: null },
  { id: "lit-fest", title: "Dhaka Lit Fest", kind: "Books", venue: "Bangla Academy, Dhaka", start: "2027-01-15", end: "2027-01-31", expected: true, about: "Writers from Bangladesh and the world for talks, readings and music. Listed for January 2027, with dates to be confirmed.", ticket: { label: "Passes at Dhaka Lit Fest", url: "https://www.dhakalitfest.com/" } },
  { id: "falgun", title: "Pohela Falgun", kind: "Festival", venue: "Bakultala, Charukala, University of Dhaka", start: "2027-02-14", about: "The first day of spring. Yellow saris, flowers in the hair, and songs under the trees.", ticket: null },
  { id: "ekushey", title: "Ekushey February, International Mother Language Day", kind: "National day", venue: "Central Shaheed Minar, Dhaka", start: "2027-02-21", about: "From midnight, people walk barefoot with flowers to the Shaheed Minar for those who died for Bangla in 1952.", ticket: null },
  { id: "lalon", title: "Lalon Mela", kind: "Music", venue: "Lalon Akhra, Cheuriya, Kushtia", start: "2027-03-22", end: "2027-03-24", expected: true, about: "Bauls come from all over to sing Lalon's songs through the night at his shrine.", ticket: null },
  { id: "independence", title: "Independence Day", kind: "National day", venue: "National Martyrs' Memorial, Savar, and Dhaka", start: "2027-03-26", about: "The day independence was declared in 1971, with flowers at dawn and a state parade.", ticket: null },
  { id: "boisabi", title: "Boisabi: Biju, Sangrai and Boisuk", kind: "Festival", venue: "Rangamati and Bandarban", start: "2027-04-12", end: "2027-04-16", expected: true, about: "The hill peoples' new year. Flowers on the water, water games, and a hundred-vegetable dish called pachon.", ticket: null },
  { id: "boishakh", title: "Pohela Boishakh", kind: "Festival", venue: "Ramna Batamul and the University of Dhaka", start: "2027-04-14", about: "The Bangla New Year. Chhayanaut greets dawn in song, then the Mangal Shobhajatra's giant masks go through the streets.", ticket: null },
  { id: "boli", title: "Jabbar's Boli Khela", kind: "Sport", venue: "Laldighi Maidan, Chattogram", start: "2027-04-25", expected: true, about: "A wrestling contest held since 1909, with a huge fair around it. Held around late April.", ticket: null },
  { id: "eid-adha", title: "Eid-ul-Adha", kind: "Festival", venue: "Nationwide", start: "2027-05-17", expected: true, about: "Sacrifice and sharing. Depends on the moon, and cities empty as people go home.", ticket: null },
  { id: "rath", title: "Dhamrai Rath Yatra", kind: "Festival", venue: "Dhamrai, Dhaka district", start: "2027-07-05", end: "2027-07-13", expected: true, about: "A giant wooden chariot pulled through the town, a tradition of several hundred years.", ticket: null },
  { id: "boat", title: "Nouka Baich, the boat races", kind: "Sport", venue: "Buriganga, Chitra river at Narail, and the haors", start: "2027-08-01", end: "2027-10-31", expected: true, about: "When the water is high, long narrow boats race to the beat of a drum, with whole villages on the banks.", ticket: null },
  { id: "durga", title: "Durga Puja", kind: "Festival", venue: "Dhakeshwari Temple and mandaps across Dhaka", start: "2027-10-05", end: "2027-10-10", expected: true, about: "The goddess comes home in thousands of painted pavilions, open to anyone.", ticket: null },
  { id: "theatre", title: "Theatre at Shilpakala", kind: "Theatre", venue: "National Theatre Hall and Experimental Theatre Hall, Segunbagicha, Dhaka", start: "2026-11-01", end: "2027-12-31", about: "Bangla theatre groups perform most weekends. Tickets are usually sold by the troupe and at the hall before the show.", ticket: SHILPAKALA },
];

export const CALENDAR_SOURCE = { name: "Evergreen BD Tours, events calendar 2026-27", url: "https://evergreenbdtours.com/events/" };

export interface ScienceEvent {
  id: string;
  title: string;
  who: string;
  when: string;
  text: string;
  url: string;
}

/** Where a student, a founder or a curious parent can actually sign up. Dates move, so each links to its organiser. */
export const SCIENCE_EVENTS: ScienceEvent[] = [
  { id: "space-apps", title: "NASA Space Apps Challenge", who: "Anyone, in teams", when: "Every October", text: "A global hackathon with local events in Bangladesh, solving real problems with NASA's open data.", url: "https://www.spaceappschallenge.org/" },
  { id: "math", title: "Bangladesh Mathematical Olympiad", who: "School and college students", when: "Regional rounds from late in the year", text: "The route to the international team, with regional rounds around the country.", url: "https://matholympiad.org.bd/" },
  { id: "urc", title: "University Rover Challenge", who: "University teams", when: "Finals in Utah each spring", text: "Build a Mars rover. Bangladeshi teams have won it and regularly reach the finals.", url: "https://urc.marssociety.org/" },
  { id: "icpc", title: "ICPC Asia Dhaka Regional", who: "University programmers", when: "Yearly", text: "The programming contest that feeds the World Finals, with hundreds of teams from across the country.", url: "https://icpc.global/" },
  { id: "bcsir", title: "National Science and Technology Museum programmes", who: "Students and families", when: "Through the year", text: "Science fairs and a planetarium-style introduction for school students, in Agargaon, Dhaka.", url: "https://nmst.gov.bd/" },
];

export const INVEST_CONTACT = "mahir@kandari-lab.com";

export const INVEST_LINKS = [
  { name: "Bangladesh Investment Development Authority", url: "https://bida.gov.bd/" },
  { name: "Bangladesh Economic Zones Authority", url: "https://beza.gov.bd/" },
  { name: "BEPZA, export processing zones", url: "https://www.bepza.gov.bd/" },
];
