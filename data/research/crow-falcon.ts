import type { Credit } from "@/data/bangladesh";
import type { Article } from "@/lib/research/core";

/** House crow in Shantinagar, Dhaka, 17 March 2015 (Wikimedia Commons, saved as public/research/house-crow-dhaka.jpg). */
export const HOUSE_CROW_CREDIT: Credit = {
  author: "TawsifSalam",
  license: "CC BY-SA 4.0",
  licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  sourceUrl: "https://commons.wikimedia.org/wiki/File:House_Crow_(Corvus_splendens)_in_Shantinagar,_Dhaka,_Bangladesh,_17_March_2015.JPG",
};

/**
 * Mahir Shariar Mahin's research and action proposal "Save the Crow &
 * Falcon" (June 2026, to the Ministry of Environment, Forest & Climate
 * Change), set from the author's PDF and published on Genius at his request
 * (2026-10-19). Not a sample: the text, tables and figures are the
 * proposal's own. Only the layout changed: list and reference numbering
 * restart at 1, the signature block is left out, and so is the PDF's
 * "confidential" line, since the author chose to publish it openly. Money
 * follows Bangladeshi usage (lakh = 100,000, crore = 10 million). It is a
 * proposal for a pilot, so it is marked as ongoing research.
 */
export const crowFalconProposal: Article = {
  slug: "save-the-crow-and-falcon",
  title: "Save the Crow & Falcon: An Urban Corvid & Raptor Conservation Strategy for Bangladesh",
  kind: "project",
  field: "solutions",
  level: "independent",
  status: "published",
  ongoing: true,
  problems: [16, 13],
  authors: [{ name: "Mahir Shariar Mahin", affiliation: "Researcher & Engineer, B.Sc. (EEE)" }],
  institution: "Kandari-Lab, Dhaka",
  year: 2026,
  district: "Dhaka",
  published: "2026-10-19",
  summary:
    "Bangladesh is losing the House Crow (Corvus splendens) and several resident falcon species to addressable urban failures: tree removal, sealed waste systems, toxic food contamination and habitat destruction. This research and action proposal uses the two species as biosensors for the health of urban and peri-urban Bangladesh. Bicycle-patrol area teams in Dhaka and Bogura run weekly point counts and daily incident reports into a live GIS dashboard, alongside dead-bird H5N1 surveillance, market contamination testing, native tree planting and a national falcon nest registry. The three-year pilot costs BDT 5.33 crore; the six-year national vision BDT 11 crore.",
  keywords: ["House crow", "Falcons", "Urban wildlife", "Biosurveillance", "H5N1", "Food contamination", "Citizen science", "Bicycle patrol"],
  facts: [
    { label: "Type", value: "Research & action proposal" },
    { label: "Submitted to", value: "Ministry of Environment, Forest & Climate Change, Forest Department (Wildlife & Nature Conservation Division), June 2026" },
    { label: "Pilot cities", value: "Dhaka and Bogura (Phase 1); national rollout from Year 3" },
    { label: "Duration", value: "3-year pilot (2026–2028); 6-year full vision (to 2031)" },
    { label: "Budget", value: "BDT 5.33 crore pilot; BDT 11 crore full vision" },
    { label: "Status", value: "Ongoing research" },
  ],
  image: {
    src: "/research/house-crow-dhaka.jpg",
    caption: "A house crow (Corvus splendens) in Shantinagar, Dhaka, 17 March 2015",
    credit: `Photo: ${HOUSE_CROW_CREDIT.author}, ${HOUSE_CROW_CREDIT.license}, via Wikimedia Commons`,
  },
  dyk: "Bangladesh was the first country to ban vulture-toxic veterinary NSAIDs, driving ketoprofen availability to under 1% by 2024? This proposal extends that government-owned model to crows and falcons.",
  sections: [
    {
      id: "summary",
      heading: "Executive Summary",
      body: "Bangladesh is losing two of its most important urban wildlife assets, the House Crow (Corvus splendens) and several resident falcon species, not to some distant, uncontrollable force but to a specific set of addressable urban failures: tree removal, sealed waste systems, toxic food contamination and habitat destruction. The crow population in major cities has declined by an estimated 60% since 2010[5], while falcon species face mounting pressure from pesticide bioaccumulation, nest-site loss and hunting pressure during migration.\n\nThis proposal is not a sentimental call to protect birds. It is a precision-targeted, evidence-driven programme that uses these two species as biosensors for the health of Bangladesh's urban and peri-urban environment, and solves a concrete public-health problem in the process. The crows and falcons are the data collectors nature already deployed across every neighbourhood in Dhaka and Bogura. This programme simply starts listening to them properly.\n\nThe pilot begins in Dhaka and Bogura simultaneously: a deliberate dual-context design that tests whether the model works in a dense megacity and in a mid-sized agricultural town in the same Phase 1. Area teams on bicycles conduct weekly surveys and daily incident reporting, feeding a live GIS dashboard. The three-year pilot budget is BDT 5.33 crore. The six-year national vision, covering all divisions, comes to BDT 11 crore: comparable to the annual cost of a modest road repair contract, but producing a permanent, nationwide wildlife monitoring infrastructure.",
      callout: {
        title: "Strategic advantage: Bangladesh already owns this playbook",
        body: "Bangladesh made global conservation history by becoming the first country to ban vulture-toxic veterinary NSAIDs, driving ketoprofen availability to under 1% by 2024[2][3]. The Forest Department, IUCN Bangladesh and the institutional memory of that campaign already exist. This proposal extends a proven, government-owned model to two new species, at a fraction of the start-up cost, rather than building from zero.",
      },
    },
    {
      id: "problem",
      heading: "The Problem: What Is Happening, and Who Suffers",
      body: "Three independent bodies of evidence converge on the same picture:\n\n- Data: Jahangirnagar University's Department of Zoology estimates a decline of more than 60% in urban crow populations across major cities since 2010.\n- Expert consensus: senior ornithologists (Prof. Anwarul Islam Bhuiyan, Dhaka University; Dr. Mahzabin Akter, IUCN Bangladesh) confirm the decline is real and rapid, while also confirming that no formal, systematic census has ever been conducted in Bangladesh[5][6]. The gap between what experts know and what the data proves is itself a problem this programme fixes.\n- Media documentation: The Business Standard (February 2026), The Daily Star (July 2025), Dhaka Tribune (March 2024) and The Asian Age (October 2025) all independently document the same phenomenon across Ramna Park, Suhrawardy Udyan, the Dhaka University campus and Dhanmondi Lake[4][5][6][7].\n\nBut the most diagnostic finding is not the decline itself; it is the pattern. Crows still persist where trees remain, where waste is accessible and where human disturbance is low[4]. The decline is therefore not inevitable. It is caused by specific changes, and those changes can be reversed.\n\nWho suffers, and why it matters beyond the bird:\n\n- City waste systems: Dhaka North City Corporation waste collectors report that open bins that crows pre-cleaned by morning now overflow and rot by noon, adding load to an already strained public sanitation system.\n- Public health: crow decline removes one of the urban food web's primary disease-containment mechanisms, the scavenging of small carcasses that would otherwise spread anthrax, botulism and vector-borne diseases.\n- Ecological cascade: Bangladesh has 827 bird species, 51 of them globally threatened[1]. Urban crow and falcon decline is an early signal of broader ecosystem stress; the same contamination and habitat pressures affect dozens of other species.\n- National reporting: Bangladesh reports to the Convention on Biological Diversity (CBD) and on SDG 15 (life on land). Having no urban wildlife monitoring data undermines credibility in international reporting and donor engagement.",
    },
    {
      id: "causes",
      heading: "Cause Analysis, With the Quality of Evidence Rated",
      body: "Each threat driver is rated by the strength of its evidence in Bangladesh (four stars: strong; one star: weak or contested), and matched with the technical fix this programme proposes. The weakest driver, electromagnetic fields from mobile towers, is kept only as a secondary variable to monitor, not as a cause to act on.",
      tables: [
        {
          title: "Threat drivers, evidence and proposed fixes",
          head: ["Threat driver", "Evidence in Bangladesh", "Weight", "Technical fix proposed"],
          rows: [
            ["Tree loss and habitat destruction", "Confirmed across Ramna, Suhrawardy, the DU campus and Dhanmondi", "★★★★", "Native canopy replanting and a nesting-box programme"],
            ["Sealed waste containers (food loss)", "DNCC compactor trucks correlated with crow disappearance", "★★★★", "Open composting zones in parks; supplemental feeding pilot"],
            ["Toxic food: formalin, pesticides", "Documented by BFSA; GC-MS analysis shows crop residues", "★★★☆", "Vendor enforcement and a chemical surveillance network"],
            ["Urban heat island and PM2.5 pollution", "Dhaka 4–6 °C above its surroundings; IUCN confirms nest failure", "★★★☆", "Microclimate planting; air-quality sensor grid"],
            ["H5N1 avian influenza", "Crows feeding on poultry carcasses; IEDCR sentinel risk", "★★★☆", "Dead-bird biosurveillance feeding IEDCR"],
            ["Direct poisoning and nest destruction", "Reported near hospitals and airports; not officially confirmed", "★★☆☆", "Regulatory audit; wildlife-law enforcement"],
            ["EMF from mobile towers", "Weak and contested evidence globally; exploratory only", "★☆☆☆", "EMF monitoring as a secondary variable only"],
          ],
        },
      ],
    },
    {
      id: "falcons",
      heading: "The Falcon Dimension: Why This Proposal Covers Both Species",
      body: "The original Save the Crow mandate focuses on corvids. This proposal expands coverage to Bangladesh's resident and migratory falcon species, for three reasons that are strategic, not merely zoological:\n\n- Falcons occupy the apex of the same food chain that crows inhabit at the base. Pesticide and heavy-metal contamination bioaccumulates up the chain, so falcon tissue contamination is the most sensitive indicator of systemic toxin loading across the urban ecosystem.\n- Falcon nest sites are concrete, GPS-able, protectable assets. Unlike crow roost sites, which shift, a Shaheen Falcon ledge nest on a Dhaka high-rise or a Red-necked Falcon nest in a Bogura palm grove can be registered with the Forest Department today and protected under the Wildlife Conservation Act 2012. This is a fast, low-cost win.\n- The Amur Falcon's October–November passage through north-east Bangladesh creates an annual, predictable, high-visibility conservation moment, and a hunting-pressure spike that patrol presence can counter. This gives the programme a media-ready annual event.\n\nBogura as the falcon pilot city. Bogura is not an arbitrary choice. The Bogura–Rajshahi corridor contains Bangladesh's best remaining habitat for the Red-necked Falcon (Falco chicquera), a Near Threatened species[11] that depends on palm-tree savannah now being cleared for agriculture and construction. The Bogura area team works on bicycles through this agricultural-fringe habitat, mapping nests and the status of nest trees every week. This is the first structured monitoring of this population in Bangladesh.",
      tables: [
        {
          title: "Bangladesh's falcon species: a field reference",
          head: ["Species", "Distribution and habitat", "IUCN status", "Key threat in Bangladesh"],
          rows: [
            ["Shaheen Falcon (Falco peregrinus peregrinator)", "Sundarbans coast, Chittagong Hill Tracts, tall buildings in Dhaka", "Least Concern (declining)", "Prey decline; pesticide bioaccumulation"],
            ["Amur Falcon (Falco amurensis)", "Passage migrant: Sylhet, north-east Bangladesh (October–November)", "Least Concern", "Hunting pressure during migration"],
            ["Eurasian Kestrel (Falco tinnunculus)", "Rajshahi, Bogura, open farmland", "Least Concern", "Agricultural pesticides; habitat loss"],
            ["Oriental Hobby (Falco severus)", "Forest edges: Chittagong Hill Tracts, Sylhet", "Least Concern", "Forest clearance; loss of nest sites"],
            ["Red-necked Falcon (Falco chicquera)", "Palm-tree savannah, Bogura region", "Near Threatened", "Palm grove removal; egg collection"],
          ],
        },
      ],
    },
    {
      id: "technology",
      heading: "The Solution: Technology Stack",
      body: "Every tool in the stack is low-cost or free, so the money goes to people in the field and to Bangladeshi laboratories rather than to licences.",
      tables: [
        {
          title: "Technology, purpose and outcome",
          head: ["Technology", "Purpose", "Deployed by", "Outcome"],
          rows: [
            ["BirdAlert mobile app and SMS hotline", "Citizen and field-team reporting of dead or sick birds, with GPS and a photo", "Area teams (bicycle patrol) and the public", "Real-time incident map; H5N1 early warning"],
            ["IoT air and temperature sensor grid (Plantower PMS5003 and iButton loggers)", "PM2.5, PM10, temperature and humidity, 24/7 at survey stations", "Field team: deployed and maintained by bicycle", "A dataset correlating pollution with crow density"],
            ["Satellite NDVI analysis (Sentinel-2, free)", "Tree-cover change mapping from 2015 to the present; GIS priority zones", "GIS analyst (central)", "Heatmap of nesting-habitat loss"],
            ["GC-MS, HPLC and AAS laboratory panels (BCSIR and JU Chemistry)", "Formalin, organophosphates and heavy metals in market waste", "Laboratory partner", "Identification of toxic hotspots"],
            ["eBird Bangladesh integration", "Aggregating long-term citizen-science trend data", "Volunteers nationwide", "A free baseline data layer"],
            ["DISTANCE 7.5, R and TRIM software", "Population density estimation and trend analysis", "Lead researcher", "Statistical results fit for peer review"],
            ["WhatsApp-based field data entry", "Real-time sync from bicycle patrols to the central database", "8 area surveyors (Dhaka) and 4 (Bogura)", "No paper; daily updates"],
            ["OpenStreetMap GIS dashboard", "A live crow and falcon density map visible to city corporations", "Researcher and a government portal", "Spatial data that policy can act on"],
          ],
        },
      ],
    },
    {
      id: "area-teams",
      heading: "Area Teams: The Bicycle Patrol Model",
      body: "The operational core of the programme is a network of trained field surveyors on pedal bicycles. This is not a cost-cutting compromise; it is the right tool for the problem:\n\n- Bicycles reach narrow lanes, park interiors, canal banks and rooftop-adjacent vantage points that vehicles cannot. Crow roosting and nesting happen precisely in these spaces.\n- A weekly bicycle route generates 52 data-collection events per surveyor per year, a far higher frequency than vehicle-based or seasonal surveys.\n- Cyclists are quiet. Point-count bird surveys need low ambient noise, and a silent approach gives more accurate counts than a vehicle arriving.\n- Bicycle patrols are visible to communities. Residents engage, report sightings and become informal co-observers, extending the network at no additional cost.",
      tables: [
        {
          title: "Team deployment",
          head: ["Location", "Team size", "Transport", "Coverage zone", "Reporting cycle"],
          rows: [
            ["Dhaka pilot (Phase 1)", "8 field surveyors and 1 supervisor", "Bicycle (pedal cycle)", "Ramna, Suhrawardy, DU campus, Dhanmondi Lake, Mirpur, Gulshan, Banani, Mohakhali", "Weekly point count; daily incident report"],
            ["Bogura pilot (Phase 1)", "4 field surveyors and 1 supervisor", "Bicycle (pedal cycle)", "Bogura town, the Mahasthangarh area, agricultural-fringe zones (kestrel and Red-necked Falcon habitat)", "Weekly point count; daily incident report"],
            ["National scale (Phase 3, Year 3)", "30 more surveyors across 6 divisions", "Bicycle and CNG", "Chittagong, Rajshahi, Sylhet, Khulna, Barishal and Mymensingh zones", "Census every two weeks"],
          ],
        },
      ],
    },
    {
      id: "process",
      heading: "How It Works: The End-to-End Process",
      body: "Six components run together, each with a defined route from the field to the people who must act on its findings.",
      tables: [
        {
          title: "Components, working process and real-world impact",
          head: ["Component", "How it works", "Real-world impact"],
          rows: [
            ["1. Bicycle patrol census (area teams)", "Surveyors ride fixed routes every week. A 5-minute point count at GPS-marked stations; photographs of nests, roosting sites and dead birds. All data entered through a WhatsApp form, into a central spreadsheet, and onto the GIS dashboard within 24 hours.", "The first systematic, real-time crow and falcon density dataset in Bangladesh's history. Repeated every week, so a trend is visible within 3 months."],
            ["2. Dead-bird biosurveillance (sentinel network)", "A BirdAlert app or SMS report; the field team collects the carcass in PPE; cold chain to the BCSIR or JU laboratory; necropsy, H5N1 PCR and toxicology within 7 days; results sent to IEDCR and the city corporation.", "Crows become a city-wide disease detector, catching an H5N1 outbreak weeks before human cases. Chemical hotspots are mapped for BFSA enforcement."],
            ["3. Toxic-contaminant surveillance", "Six Dhaka markets (Karwan Bazar, Jatrabari, Mohammadpur, Shyambazar, Tongi, Narayanganj) sampled every quarter: GC-MS for formalin, HPLC for pesticides, AAS for heavy metals. Results published on a public portal.", "Direct evidence for BFSA prosecutions, and vendor behaviour change measurable across survey cycles. Linking crow decline to food-safety failure unlocks cross-ministry funding."],
            ["4. Native tree and nesting restoration", "Priority zones identified by NDVI gap analysis. Planting neem (Azadirachta indica), banyan (Ficus benghalensis), fig (Ficus racemosa) and rain tree (Samanea saman), at least 3,000 trees in Year 1, and 200 artificial nesting boxes for falcons above 8 m.", "A measurable canopy increase within two growing seasons. Crow and falcon nest-site density is tracked in the same point-count cycle, so the effect can be attributed directly."],
            ["5. Falcon-specific nest protection", "Red-necked Falcon nests in Bogura palm groves GPS-tagged and registered with the Forest Department; Amur Falcon roost sites in Sylhet mapped for anti-hunting patrols in the October–November passage; Shaheen nest ledges on Dhaka buildings catalogued.", "The first national falcon nest registry, with legal protection activated under the Wildlife Act 2012, and anti-poaching patrols linked to the ranger schedule."],
            ["6. Quarterly policy feedback loop", "A quarterly report to the Forest Department, DNCC and BFSA: data in plain language with maps, and specific asks each cycle, such as a tree-felling ban in priority wards, approval of composting zones, or market formalin tests.", "Government acts on evidence, not anecdote. Each quarter builds the case for the next ask, and any city can copy the model."],
          ],
        },
      ],
    },
    {
      id: "unique",
      heading: "What Makes This Unique",
      body: "Seven features set this programme apart from earlier efforts, each tied to why it matters for Bangladesh.",
      tables: [
        {
          title: "Distinctive features",
          head: ["What makes it unique", "Why it matters"],
          rows: [
            ["The first systematic, city-wide crow and falcon census in Bangladesh's history", "All earlier data are expert estimates; this creates the official baseline that future policy must reference."],
            ["Two species in scope: corvids and raptors under one field infrastructure", "Crows and falcons share overlapping threats (food-chain toxins, habitat loss); joint monitoring doubles the impact of every taka spent."],
            ["Bicycle-patrol area teams: low cost, hyper-local, repeatable", "Cyclists reach the narrow lanes, parks and rooftop zones that cars cannot, and the patrol cycle produces data every week, not every season."],
            ["The vulture programme as an institutional lever", "Extends Bangladesh's own proven model, as the first country to ban vulture-toxic NSAIDs, to new species; no new apparatus is needed."],
            ["A technology stack that is low-cost or free", "Sentinel-2 imagery (free), R (free), open-source GIS and WhatsApp data entry: no expensive proprietary lock-in."],
            ["Crows as a public-health biosensor", "Dead-crow H5N1 detection feeds IEDCR and contamination maps feed BFSA, so the conservation programme earns its budget from the health ministry too."],
            ["A dual Dhaka and Bogura pilot", "A megacity (Dhaka) beside a mid-sized agricultural town (Bogura) tests in Year 1 whether the model scales across very different contexts."],
          ],
        },
      ],
    },
    {
      id: "impact",
      heading: "Impact: Who Benefits, Value Created, Real-World Change",
      body: "The programme's benefits reach well beyond conservation: city services, public health, food safety, local employment and Bangladesh's standing in international reporting.",
      tables: [
        {
          title: "Who benefits",
          head: ["Who benefits", "Value created", "Real-world change"],
          rows: [
            ["City residents of Dhaka and Bogura", "Cleaner informal waste removal; early disease warning (H5N1)", "Fewer open, rotting waste piles; lead time before a pandemic"],
            ["City corporations (DNCC, Bogura)", "A free biodiversity monitoring layer; evidence for tree policy", "Policy decisions backed by data, not anecdote"],
            ["Bangladesh Forest Department", "A national falcon registry; an urban wildlife monitoring framework", "A Wildlife Act enforcement tool; an NBSAP deliverable"],
            ["BFSA and the Ministry of Public Health", "Chemical contamination maps from market surveys", "Targeted formalin and pesticide enforcement; food-safety wins"],
            ["IEDCR", "A live dead-bird H5N1 sentinel network across two cities", "Avian flu outbreaks detected 4–6 weeks earlier"],
            ["Field surveyors and local communities", "Paid employment; bicycle-patrol jobs; training", "19 or more sustained local jobs; community ownership of the environment"],
            ["The global conservation community", "The first rigorous urban corvid dataset from South Asia", "Peer-reviewed science; a model for other megacities"],
            ["Bangladesh as a nation", "Biodiversity indicators for international reporting (CBD, SDG 15)", "Credible national reporting; eligibility for donor and climate funds"],
          ],
        },
      ],
      callout: {
        title: "The 40–55 second pitch for a minister",
        body: "Bangladesh's crows are disappearing from Dhaka, not because of some distant environmental force, but because we removed their trees, sealed their food, and poisoned their diet with formalin and pesticides. For BDT 11 crore over six years, the cost of a small road, we can put bicycle-riding surveyors into every Dhaka ward and Bogura district each week, build the country's first real urban wildlife database, give IEDCR a live bird-flu early-warning system, give BFSA a contamination map for formalin enforcement, and protect Bangladesh's falcon nesting sites for the first time. We are not asking government to save a bird. We are asking government to use a bird to save money on public health, sanitation and international reporting, and to get a world-first dataset out of it.",
      },
    },
    {
      id: "vision",
      heading: "Future Vision: From Dhaka and Bogura to All of Bangladesh",
      body: "The vision in three sentences. By 2031, every division of Bangladesh has a trained bicycle-patrol monitoring team feeding live bird-density and contamination data to a public GIS dashboard. The Forest Department manages a national falcon nest registry with legal protection for every documented site. Bangladesh publishes the world's first long-term urban corvid and raptor dataset from South Asia, making it a reference country for urban biodiversity monitoring.\n\nWhy start in Dhaka and Bogura. A programme that starts everywhere starts nowhere. Dhaka provides the high-density urban stress test; Bogura provides the mid-sized city with an agricultural fringe. If the bicycle-patrol model produces clean, repeatable data in both within 12 months, the argument for national scale becomes unanswerable. If it fails in one, we learn why before spending the national rollout budget. That is the difference between a programme designed to prove itself and one designed to look impressive on paper.\n\nThe scale pathway:\n\n- Months 1–24, pilot in Dhaka and Bogura: prove the method, generate the baseline, fix what breaks.\n- Year 3: add Chittagong, Rajshahi and Sylhet, with three more 4-person bicycle teams. The falcon nest registry goes national.\n- Years 4–5: add Khulna (Shaheen Falcon monitoring on the Sundarbans fringe), Barishal and Mymensingh. BirdAlert reaches national scale and the citizen-science layer goes live.\n- Year 6: the full national framework is handed to the Forest Department as a permanent monitoring programme. All data in eBird Bangladesh; three peer-reviewed papers published; policy recommendations integrated into the NBSAP and an update of the Wildlife Conservation Rules.\n\nWhat changes permanently:\n\n- Institutional: Bangladesh has never had a systematic urban bird monitoring programme. This creates one, and makes urban wildlife decline impossible to ignore in future Environmental Impact Assessments.\n- Workforce: 16 bicycle-patrol jobs in Phase 1, growing to more than 50 by Year 6, all trained in field ecology, GIS data entry and basic laboratory sample handling: a new category of local environmental technician.\n- Cross-sector: the contamination data directly support BFSA enforcement that protects human food safety, not just crows.\n- Cultural: falcons nesting on Dhaka buildings become a celebrated part of the city's identity, as they are in New York, London and Sydney, rather than an unknown and unprotected accident.",
    },
    {
      id: "timeline",
      heading: "Implementation Timeline",
      body: "The programme runs in six phases. Phases overlap by design, so that laboratory results and the first interventions start while the baseline census is still being completed.",
      tables: [
        {
          title: "Phases, activities and deliverables",
          head: ["Phase", "Period", "Key activities", "Deliverables"],
          rows: [
            ["1. Pilot setup", "Months 1–3 (Dhaka and Bogura)", "Recruit and train 16 area-team cyclists; deploy IoT sensors; build the BirdAlert app; finalise survey stations; ethics clearance (JU-IEC); sign laboratory agreements.", "Trained teams on bicycles; a live app; 28 GPS-marked stations (Dhaka 20, Bogura 8)"],
            ["2. Baseline census", "Months 4–9", "Breeding-season point counts (April–June); nest mapping; waste samples from 6 markets; falcon nest GPS-tagging in Bogura; H5N1 biosurveillance protocol goes live.", "The first systematic crow and falcon density baseline for Dhaka and Bogura; contamination map, version 1"],
            ["3. Cause analysis", "Months 7–12", "Laboratory results (GC-MS, HPLC, AAS); NDVI gap analysis; occupancy modelling in R; a repeat census in the non-breeding season (October–December); interim report to the Ministry.", "A ranked cause-of-decline table with statistical confidence; a policy memo to the Forest Department"],
            ["4. Intervention", "Months 10–18", "Native tree planting (3,000 trees); falcon nesting boxes installed; vendor outreach on formalin; DNCC composting-zone proposal; anti-hunting patrol during the Amur Falcon migration.", "3,000 trees planted; 200 nesting boxes; a vendor compliance audit; a patrol schedule"],
            ["5. Re-survey", "Months 18–24", "A repeat full census; trend analysis (TRIM); cost-per-outcome accounting; a second contamination survey; comparison with the baseline.", "A statistically attributed trend report; a before-and-after comparison; cost-effectiveness data"],
            ["6. National rollout", "Years 3–6", "Scale the model to the 6 remaining divisions; 30 more cyclists; a national falcon registry with the Forest Department; 3 or more peer-reviewed papers; a national policy framework.", "A National Urban Corvid & Raptor Monitoring Framework; input to the NBSAP; journal publications"],
          ],
        },
      ],
    },
    {
      id: "budget",
      heading: "Budget: BDT 11 Crore for the Phased National Vision",
      body: "The three-year pilot costs BDT 5.33 crore. The remaining BDT 5.67 crore funds the national rollout in Years 4–6. The figures are planning estimates, to be confirmed against procurement and partner-laboratory rates. About 55% of spending goes directly to local employment and to work by Bangladeshi laboratories.\n\nThe national scale-up balance (BDT 5.67 crore, Years 4–6) covers 30 more surveyors, 4 more city deployments, expanded laboratory panels and national GIS infrastructure. A detailed breakdown for Years 4–6 is available from the author on request.",
      figures: [
        {
          kind: "bars",
          title: "Pilot budget by year (BDT lakh)",
          unit: " lakh",
          rows: [
            { label: "Year 1", value: 204.09 },
            { label: "Year 2", value: 165.34 },
            { label: "Year 3", value: 163.13 },
            { label: "Three-year pilot", value: 532.56, total: true },
          ],
          caption: "Year 1 carries the one-time costs of equipment, the BirdAlert app and the largest tree planting; the three-year pilot totals BDT 5,32,56,000 (about 5.33 crore). One lakh is BDT 100,000.",
        },
      ],
      tables: [
        {
          title: "Three-year pilot budget (BDT)",
          head: ["Budget component", "Year 1", "Year 2", "Year 3", "Notes"],
          rows: [
            ["Research personnel (PI ×1, RA ×3, field surveyors ×12, lab technicians ×2, GIS analyst ×1)", "1,02,00,000", "1,02,00,000", "1,02,00,000", "BDT 15,000–50,000 a month by role; 19 staff"],
            ["Area-team bicycles and maintenance (16 cycles: Dhaka ×10, Bogura ×6)", "3,20,000", "80,000", "80,000", "BDT 20,000 a cycle; replacements in Years 2–3"],
            ["Field equipment (binoculars, GPS, iButton loggers, air-quality monitors, PPE, cold chain)", "18,50,000", "3,50,000", "3,50,000", "One-time hardware; annual consumables"],
            ["BirdAlert app development, SMS gateway and GIS dashboard", "12,00,000", "3,00,000", "2,00,000", "Built in Year 1; hosting and upgrades in Years 2–3"],
            ["Chemical laboratory analysis (BCSIR/JU: GC-MS, HPLC, AAS, H5N1 PCR panels)", "24,00,000", "24,00,000", "24,00,000", "6 markets × 4 seasons × 3 years, plus necropsies"],
            ["Native tree planting and nesting boxes (3,000 trees in Year 1, 2,000 a year after; 200 falcon boxes in Year 1)", "22,00,000", "15,00,000", "12,00,000", "Nursery, planting and survival monitoring"],
            ["Field transport (Dhaka and Bogura; CNG and bus for samples)", "4,20,000", "4,20,000", "4,20,000", "Bicycles cover the census; CNG for sample runs"],
            ["Satellite imagery (Sentinel-2 free; ArcGIS licence; R server)", "4,00,000", "2,00,000", "2,00,000", "ArcGIS annual licence; computing costs"],
            ["Workshops, training and stakeholder engagement (DNCC, BFSA, IEDCR)", "5,00,000", "4,00,000", "4,00,000", "Quarterly policy briefings and public drives"],
            ["Publications, journal fees and final policy report", "1,50,000", "2,00,000", "4,00,000", "Target of 3 or more peer-reviewed papers"],
            ["Contingency (about 8%)", "7,69,000", "4,84,000", "4,63,000", "Reserve for surveillance of substitute toxins"],
            ["Total per year", "2,04,09,000", "1,65,34,000", "1,63,13,000", "Three-year pilot total: BDT 5,32,56,000 (about 5.33 crore)"],
          ],
          caption: "Full six-year vision (pilot plus national scale): BDT 11,00,00,000 (11 crore), phased over the national rollout.",
        },
      ],
    },
    {
      id: "metrics",
      heading: "Success Metrics",
      body: "Every target is measured at the end of Phase 5 by a record the programme already keeps, so success can be checked by someone outside the team.",
      tables: [
        {
          title: "Indicators and targets",
          head: ["Indicator", "Target (end of Phase 5)", "Measured by"],
          rows: [
            ["Crow density trend in pilot zones", "At least stable against the baseline; a target of +15% in 3 years", "Repeat point-count surveys (TRIM)"],
            ["Falcon nest sites catalogued and protected", "At least 30 nest sites registered with the Forest Department", "GPS field records and the Forest Department registry"],
            ["Dead-bird biosurveillance", "100% of reported carcasses necropsied within 7 days", "Laboratory turnaround records"],
            ["Toxic-drug and formalin vendor compliance", "At least a 40% reduction in vendors testing positive per cycle", "Quarterly market surveys"],
            ["Native trees established and surviving", "At least 80% survival of planted stock", "Annual survival audit"],
            ["H5N1 early-warning detections", "Any detection reported to IEDCR within 48 hours", "Incident log"],
            ["Peer-reviewed publications", "At least 3 papers submitted by the end of the project", "Journal submission records"],
            ["Local jobs created", "At least 19 direct staff and 16 cyclists sustained for 3 years", "Payroll records"],
          ],
        },
      ],
    },
    {
      id: "risks",
      heading: "Risks and How They Are Mitigated",
      body: "- Premise challenge: crows are globally Least Concern[10], so a reviewer may reject the premise. Mitigation: lead with the precise framing of a localised decline; the public-health and sanitation value justifies the programme even if the population recovers on its own. Ecological insurance has a valid price.\n- Substitution effect: bans get evaded by substitution, as the formalin ban shows; new toxins emerge as old ones are suppressed. Mitigation: quarterly market surveillance is a permanent part of the programme, not a Year 1 activity.\n- Attribution gap: with no historical baseline, Year 1 trend analysis cannot attribute causes. Mitigation: an explicit control zone in each city, a transparent baseline-first framing, and first results presented as the baseline itself, which is valuable.\n- Cyclist safety: bicycle patrols in Dhaka traffic are a safety issue. Mitigation: routes avoid major roads; surveyors are assigned park-interior and residential-lane routes; PPE and a traffic-safety protocol are part of training.\n- Institutional resistance: possible pushback from authorities that have used nest destruction near hospitals and airports. Mitigation: the programme is diagnostic, not accusatory; forensic findings are presented as environmental data, not blame.",
    },
    {
      id: "methodology",
      heading: "Scientific Methodology",
      body: "Survey design. A before-and-after comparison with matched control zones. In Dhaka, 20 point-count stations (4 intervention zones and 1 control zone); in Bogura, 8 stations (2 intervention zones and 1 control zone). Stratified random sampling keeps residential, commercial, industrial and green-space zones proportionally represented.\n\nBird survey methods:\n\n- A 5-minute IPA point count at GPS-marked stations (sunrise to 4 hours after), in both the breeding and the non-breeding season.\n- Distance sampling (DISTANCE 7.5) for population density estimates (birds per km²), correcting for detectability.\n- Road transects (2 km routes by bicycle) run in parallel with the point counts.\n- eBird Bangladesh citizen-science data aggregated as a free supplementary layer[9].\n\nEnvironmental parameters:\n\n- NDVI from Sentinel-2 (free ESA data) for tree-cover change mapping from 2015 to the present.\n- PM2.5 and PM10 from Plantower PMS5003 portable monitors carried by bicycle.\n- Temperature and humidity from iButton data loggers at each station, 24/7.\n- A waste-management index: the ratio of open to sealed bins, and the collection schedule, ward by ward.\n\nChemical analysis:\n\n- Six Dhaka markets sampled every quarter. BCSIR and the JU Chemistry laboratory perform GC-MS (formalin), HPLC (organophosphates) and AAS (heavy metals: Pb, Cd, As).\n- Dead-bird necropsies include an H5N1 PCR panel (icddr,b or an IEDCR partner laboratory) and a toxicology screen.\n\nStatistics:\n\n- GLM and GLMM in R: crow and falcon density against environmental variables.\n- Occupancy modelling (PRESENCE software): maps of habitat suitability probability.\n- TRIM software: population trend analysis across the three-year time series.",
    },
    {
      id: "ethics",
      heading: "Ethics and Limitations",
      body: "Ethical commitments:\n\n- All surveys are non-invasive: no capture, banding or disturbance of nesting birds.\n- Chemical samples come from market waste only; no tissue is sampled from live birds.\n- Full ethics clearance from the Jahangirnagar University IEC before field work begins.\n- Full compliance with the Wildlife Conservation Act 2012 and CITES.\n\nStated limitations:\n\n- No historical baseline exists for Dhaka or Bogura; this programme creates the first one. Year 1 findings are therefore diagnostic, and trend attribution strengthens in Year 2. This limitation is stated openly.\n- Double counting is a risk in dense urban environments; distance sampling partly corrects for it.\n- Three years is not ideal for long-term trend analysis, so results are presented as the start of a trend, not its confirmation.",
    },
    {
      id: "team",
      heading: "Research Team and Institutional Partners",
      body: "The team joins a principal investigator with university, conservation, laboratory, public-health and food-safety partners, and two locally recruited area-team leads.",
      tables: [
        {
          title: "Roles and responsibilities",
          head: ["Role", "Institution", "Responsibility"],
          rows: [
            ["Principal investigator", "Mahir Shariar Mahin, B.Sc. (EEE)", "Overall programme design, methodology, data analysis, government liaison, publications"],
            ["Co-investigator", "JU, Department of Zoology", "Bird survey protocol design, occupancy modelling, academic oversight"],
            ["Co-investigator", "IUCN Bangladesh", "Translating conservation policy, international standards, falcon registry"],
            ["Environmental chemist", "BCSIR / JU Chemistry Department", "GC-MS, HPLC and AAS sample analysis"],
            ["Epidemiology liaison", "IEDCR", "H5N1 biosurveillance protocol and notification system"],
            ["Food safety liaison", "BFSA", "Sharing market contamination data; coordinating enforcement"],
            ["GIS and data analyst", "Forest Department or a university", "Satellite NDVI analysis, GIS dashboard, occupancy mapping"],
            ["Area team lead, Dhaka", "Recruited locally", "Supervises 8 bicycle surveyors; data quality control"],
            ["Area team lead, Bogura", "Recruited locally", "Supervises 4 bicycle surveyors; falcon nest patrol"],
            ["Field surveyors", "16 (Dhaka ×10, Bogura ×6)", "Weekly bicycle census; daily incident reports; sample collection"],
          ],
        },
      ],
    },
    {
      id: "policy",
      heading: "Preliminary Policy Recommendations",
      body: "At city corporation level, in Dhaka and Bogura:\n\n- A mandatory environmental assessment before removing any mature canopy tree (trunk diameter at breast height above 30 cm) in any city development project.\n- Open composting zones in Ramna Park, Suhrawardy Udyan and around Dhanmondi Lake, giving a clean, non-toxic food source beside key crow habitat.\n- Designating the five pilot survey zones as Urban Wildlife Priority Areas in the city master plan, blocking high-rise construction within 100 m of mapped crow roost trees.\n\nAt ministry level:\n\n- Formalise urban bird monitoring as a standing sub-programme of the National Biodiversity Strategy and Action Plan (NBSAP).\n- Register every GPS-confirmed falcon nest site under the Wildlife Conservation Act 2012, giving immediate legal protection at no additional cost.\n- Direct BFSA to use the market contamination maps from this programme to target formalin and pesticide enforcement sweeps.\n- Integrate BirdAlert dead-bird reporting into IEDCR's early-warning protocol for avian influenza, a free addition to the national biosurveillance architecture[12].",
    },
  ],
  references: [
    { text: "Clements, J.F. et al. (2022). The eBird/Clements Checklist of Birds of the World: v2022. Cornell Lab of Ornithology. [827 species for Bangladesh]" },
    { text: "Galligan, T.H. et al. (2025). The continued threat of toxic NSAIDs to Critically Endangered Gyps vultures in South Asia. Bird Conservation International, 35. Cambridge Core. [Ketoprofen under 1% in Bangladesh in 2024; flunixin warning]" },
    { text: "Mongabay (May 2022). Conservation win for Bangladesh as efforts to halt vulture decline pay off. [Bangladesh the first country to ban vulture-toxic NSAIDs in zones]" },
    { text: "The Business Standard (February 2026). Where have Dhaka's crows gone? [Uneven distribution as a diagnostic; analysis of the collapse in food supply]" },
    { text: "The Daily Star (July 2025). The vanishing crows of our cities. [Estimate of a 60% decline; IUCN Bangladesh; Dr. Mahzabin Akter]" },
    { text: "Dhaka Tribune (March 2024). Is the crow population declining in Dhaka? [Prof. Anwarul Islam Bhuiyan confirms that no formal survey exists]" },
    { text: "The Asian Age Bangladesh (October 2025). Silent Vanishing Crows of Dhaka: A Warning from the Skies. [H5N1 link; formalin and pesticide mechanism]" },
    { text: "Rahman, K.M.M. & Midzhanur (2017). Adaptation Assessment of Two Sympatric Crow Species in Anthropogenic Ecosystems of Urban Bangladesh. ResearchGate." },
    { text: "Chowdhury, S. et al. (2023). Insights from citizen science reveal priority areas for conserving biodiversity in Bangladesh. One Earth, 6(10), 1315–1325." },
    { text: "BirdLife International (2024). Corvus splendens. The IUCN Red List of Threatened Species, version 2024." },
    { text: "BirdLife International (2024). Falco chicquera. The IUCN Red List of Threatened Species. [Near Threatened]" },
    { text: "Government of Bangladesh (2023). National Vulture Conservation Action Plan 2016–2025. Ministry of Environment, Forest & Climate Change." },
  ],
  revisions: [{ at: "2026-10-19T03:00:00Z", by: "Mahir Shariar Mahin", note: "Proposal published on Genius (June 2026 edition, submitted to the Ministry of Environment, Forest & Climate Change)" }],
};
