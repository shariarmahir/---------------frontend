/**
 * Cultural events and venues for the Arts & Culture page, and the folklore
 * ghosts of Banglar Bhoot. Events are the country's real, recurring cultural
 * occasions; a `ticket` is either the official outbound page or null, which
 * the page shows as "Tickets at the venue". No checkout is ever handled here.
 * Folklore is clearly marked as folklore, not fact.
 */

export type EventKind = "Festival" | "Theatre" | "Music" | "Books" | "Film";

export interface CultureEvent {
  id: string;
  title: string;
  kind: EventKind;
  venue: string;
  city: string;
  /** When it falls, in plain words — these are recurring, not one dated night. */
  when: string;
  about: string;
  /** The official page to learn more or get tickets, or null for "at the venue". */
  ticket: string | null;
}

export const EVENTS: CultureEvent[] = [
  {
    id: "boishakh",
    title: "Pohela Boishakh & Mangal Shobhajatra",
    kind: "Festival",
    venue: "Ramna Park & the University of Dhaka",
    city: "Dhaka",
    when: "14 April, every year",
    about: "The Bangla New Year. Chhayanaut greets the dawn in song under the Ramna banyan, and the Faculty of Fine Arts leads the Mangal Shobhajatra, the UNESCO-listed procession of giant masks. Free and open to all.",
    ticket: null,
  },
  {
    id: "ekushey-book-fair",
    title: "Amar Ekushey Book Fair",
    kind: "Books",
    venue: "Bangla Academy & Suhrawardy Udyan",
    city: "Dhaka",
    when: "All of February",
    about: "The country's great month-long book fair, held around International Mother Language Day. Hundreds of publishers, new books launched daily, and the heart of Bangla literary life. Entry is free.",
    ticket: "https://www.banglaacademy.org.bd/",
  },
  {
    id: "shilpakala-theatre",
    title: "Theatre nights at Shilpakala",
    kind: "Theatre",
    venue: "Bangladesh Shilpakala Academy",
    city: "Dhaka",
    when: "Through the year, mostly weekends",
    about: "The national academy of fine and performing arts stages Bangla drama, dance and music in its theatre halls at Segunbagicha. Groups such as the long-running repertory companies perform here.",
    ticket: "https://shilpakala.gov.bd/",
  },
  {
    id: "dhaka-lit-fest",
    title: "Dhaka Lit Fest",
    kind: "Books",
    venue: "Bangla Academy grounds",
    city: "Dhaka",
    when: "Usually January",
    about: "A gathering of writers from Bangladesh and the world for talks, readings and music over a long weekend. Day passes are released each year on the festival's site.",
    ticket: "https://www.dhakalitfest.com/",
  },
  {
    id: "classical-night",
    title: "Bengal Classical Music Festival",
    kind: "Music",
    venue: "Held in Dhaka",
    city: "Dhaka",
    when: "When announced, usually winter",
    about: "An all-night celebration of South Asian classical music that has drawn some of the subcontinent's finest performers. Watch the organisers' announcements for the next edition and passes.",
    ticket: null,
  },
  {
    id: "durga-puja",
    title: "Durga Puja",
    kind: "Festival",
    venue: "Dhakeshwari Temple & pandals citywide",
    city: "Dhaka & nationwide",
    when: "Autumn, on the Hindu calendar",
    about: "The largest festival of the Hindu community, when neighbourhoods raise decorated pandals and the city comes out to see them. Open to all; no ticket.",
    ticket: null,
  },
];

export interface Ghost {
  name: string;
  about: string;
}

/** Banglar Bhoot: the ghosts of Bengali folklore. Stories told on dark nights, not claims of fact. */
export const GHOSTS: Ghost[] = [
  { name: "Petni / Shakchunni", about: "Female spirits of folklore said to haunt tamarind and bel trees; the Shakchunni is known for the conch-shell bangles she covets." },
  { name: "Mechho Bhoot", about: "The 'fish ghost', a spirit with a weakness for fish, blamed with a laugh whenever the kitchen's catch goes missing." },
  { name: "Aleya", about: "The marsh lights over the haors and paddy, the will-o'-the-wisp that fishermen say leads boats astray at night." },
  { name: "Brahmadaitya", about: "The ghost of a Brahmin, held in folklore to be the most dignified of spirits, living high in a banyan tree." },
  { name: "Skondhokata", about: "The headless ghost of tales, said to search the dark for the head it lost to a train or a sword." },
];
