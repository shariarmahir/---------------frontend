/**
 * The problems chapter (/bangladesh/problems) in English: the ideas for each
 * of the 32 problems (what to do, what to avoid) and the rural photo captions.
 * components/desh/problem-pixels.tsx refuses to build if a problem has none.
 */

import type { EvidenceStatus, Urgency } from "./amar-bangladesh";

export interface Advice {
  text: string;
  why: string;
}

export interface ProblemIdeasEn {
  brief: string;
  fact?: { text: string; source: string };
  /** Proposals the dossier's evidence supports. */
  doThis: Advice[];
  /** Tempting moves the evidence rules out. */
  avoid: Advice[];
}

export const URGENCY: Record<Urgency, { label: string; short: string }> = {
  "very-high": { label: "Very high urgency", short: "Very high" },
  high: { label: "High urgency", short: "High" },
  "medium-high": { label: "Medium-high urgency", short: "Medium-high" },
  medium: { label: "Medium urgency", short: "Medium" },
};

/** How well a problem is proven, always shown as icon and words; red only for the unverified. */
export const EVIDENCE: Record<EvidenceStatus, { label: string; short: string; icon: string; tone: string }> = {
  verified: { label: "Verified problem", short: "Verified", icon: "verified", tone: "text-signal-orange" },
  plausible: { label: "Plausible, not yet measured", short: "Plausible", icon: "help", tone: "text-bdnavy-300" },
  unverified: { label: "Proposal, needs verification", short: "Unverified", icon: "error", tone: "text-crimson-bright" },
};

const REPORT = "National problems report";

export const PROBLEM_IDEAS: Record<number, ProblemIdeasEn> = {
  1: {
    brief: "Distance, cost and quality gaps stand between people and care. Patients pay out of pocket, treat themselves or reach hospital late.",
    fact: { text: "Primary care is scattered across public, private, NGO, pharmacy and informal channels.", source: REPORT },
    doThis: [
      { text: "Track referrals: did the patient actually reach the next-level hospital?", why: "A completed referral is a core health indicator; unmeasured, the gap never shows." },
      { text: "Run an independent patient-safety audit before the pilot starts", why: "The report names the absence of an independent audit as a red flag." },
    ],
    avoid: [
      { text: "Asking for a budget on the claim that “everyone in the country is sick”", why: "No population, no method of measurement; the report calls this claim unsupported." },
      { text: "Launching nationwide at once without measuring medicine stock-outs and out-of-pocket costs", why: "Measure first, then pilot; scale only when criteria set in advance are met." },
    ],
  },
  2: {
    brief: "Why prices rise and where goods are fake are two different questions. Mix them up and the cure treats the wrong disease.",
    doThis: [
      { text: "Measure the causes of price rises separately from counterfeiting and adulteration", why: "The report's condition: price causes must be separated from counterfeit and adulteration." },
      { text: "Publish the price gap at every step from farm to market", why: "The cost gap is a logistics monitoring indicator; published, it shows where goods get stuck." },
    ],
    avoid: [
      { text: "Declaring every trader guilty without product- and market-level data", why: "Collective blame is not evidence; measure by product and by market." },
      { text: "Calling it a success when the national average price falls, without looking at village markets", why: "“Average better, villages worse” is a red flag the report lists." },
    ],
  },
  3: {
    brief: "On paper unemployment is low, but many are stuck in informal, insecure work, and a large share of young people are left out.",
    fact: { text: "Unemployment is 3.8%, a figure that hides informal work and the exclusion of young people.", source: "World Bank, 2025" },
    doThis: [
      { text: "Measure separately the young people who are not in education, employment or training (NEET)", why: "The youth NEET rate is the first baseline indicator for jobs." },
      { text: "Check whether the person is still in the job 12 months after placement", why: "Placement and 12-month retention are the goal." },
    ],
    avoid: [
      { text: "Calling the problem small because the rate is 3.8%", why: "The headline rate alone understates underemployment." },
      { text: "Making the number of people trained the measure of success", why: "“Training rises, incomes do not” is a red flag in the report." },
    ],
  },
  4: {
    brief: "A factory closing does not only cost its workers their jobs; suppliers and households lose income too.",
    fact: { text: "Annual income at risk = displaced workers × median annual income × months without work ÷ 12", source: "The report's calculation rule" },
    doThis: [
      { text: "Record every closed factory with its sector, date and source", why: "The report says closure counts need sector, date and source." },
      { text: "Count supplier and household income in the losses", why: "Supplier and household losses are part of this problem, alongside the direct job losses." },
    ],
    avoid: [
      { text: "Giving every factory the same subsidy without any data", why: "Money without a target is weak targeting, the second step of the problem cycle." },
      { text: "Planning to save factories without measuring outage hours in industrial zones", why: "Outage hours and factory survival are indicators of economic resilience." },
    ],
  },
  5: {
    brief: "Justice information sits in separate ledgers; records do not match, and there is no clear way to correct an error.",
    doThis: [
      { text: "Connect the justice information systems to each other", why: "The report proposes interoperable justice information, with due-process safeguards." },
      { text: "Give citizens a way to appeal when they find an error in their own record", why: "Institutionalising citizen appeals is a 3–5 year reform task." },
    ],
    avoid: [
      { text: "Dropping privacy and due process from criminal-record checks for the sake of speed", why: "Due process and privacy are mandatory conditions for criminal records." },
      { text: "Publishing an accused person's name before the verdict", why: "Publishing before a verdict breaks due process and destroys trust." },
    ],
  },
  6: {
    brief: "Complaints go in and then vanish; nobody can track them from start to finish.",
    fact: { text: "Cases cannot be tracked end to end, a verified gap in governance design.", source: REPORT },
    doThis: [
      { text: "Give every complaint a receipt number and show its current status", why: "A first-100-days task: complaint receipts and status tracking." },
      { text: "Keep a log whenever a complaint is deleted", why: "Cases disappearing without explanation is a red flag; a log catches it." },
    ],
    avoid: [
      { text: "Taking complaints without protecting the complainant's identity", why: "When people fear retaliation they stop complaining at all. This is a red flag." },
      { text: "Launching in every office at once from the start", why: "The report's path: start with the five busiest services." },
    ],
  },
  7: {
    brief: "Opaque processes, personal discretion and weak audits make bribery look “reasonable”.",
    fact: { text: "24% of service users paid a bribe in the last 12 months; the Corruption Perceptions Index score is 24/100, rank 150 of 182.", source: "Transparency International" },
    doThis: [
      { text: "Take applications online and publish the time limit for every step", why: "Personal discretion and opaque processes are the source of bribery; public time limits reduce it." },
      { text: "Introduce open contracting and random audits", why: "A 0–2 year task: open contracting and random audits." },
    ],
    avoid: [
      { text: "Running a campaign that says “everyone takes bribes”", why: "24% is not everyone; collective blame does not stand up to evidence." },
      { text: "Measuring success only by a better Corruption Perceptions Index score", why: "The goal is fewer unresolved cases and unauthorised payments, without more retaliation." },
    ],
  },
  8: {
    brief: "School, training, employer and migration data sit in separate ledgers; policymakers plan for a workforce that does not match the records.",
    doThis: [
      { text: "Connect school, training, employment and migration data while protecting privacy", why: "An interoperable registry with privacy controls is a 0–2 year task." },
      { text: "Publish each indicator's definition, responsible office and update schedule", why: "A national indicator registry is the first task of the first 100 days." },
    ],
    avoid: [
      { text: "Planning without knowing what share of people the registry covers", why: "Registry coverage must be measured first; without a denominator, “all” and “many” cannot make policy." },
      { text: "Letting the same person be counted twice in two ledgers", why: "Unique IDs and audit exceptions are indicators of data integrity." },
    ],
  },
  9: {
    brief: "Professional services in every union: a good proposal, but not yet an established fact.",
    doThis: [
      { text: "Cost it first, then run one pilot under professional supervision", why: "The report's reading: a costed pilot, not a national commitment." },
      { text: "Expand only where demand is proven", why: "A 3–5 year task: scale local support on proven demand." },
    ],
    avoid: [
      { text: "Planning on the assumption that “the country has too many engineers”", why: "Engineer supply has not been measured; this is an unsupported claim." },
      { text: "Announcing it nationwide before the pilot results are in", why: "Only initiatives that meet criteria set in advance should grow." },
    ],
  },
  10: {
    brief: "How many people are homeless or hungry? There is still no reliable answer.",
    fact: { text: "Poverty at the $3.00-a-day line is 5.9%, but that is not a measure of homelessness.", source: "World Bank" },
    doThis: [
      { text: "Run a dedicated census to learn the extent of homelessness in Dhaka", why: "The specific claim about Dhaka's homelessness needs a census to verify." },
      { text: "Measure food insecurity separately", why: "A 0–2 year task: measure homelessness and food insecurity." },
    ],
    avoid: [
      { text: "Treating the poverty rate as the number of homeless people", why: "The poverty rate does not measure homelessness; they are two different indicators." },
      { text: "Handing out support through acquaintances, without registration", why: "Distribution by connection weakens universal rules and leaves the people in real need out." },
    ],
  },
  11: {
    brief: "Access grew faster than quality. People hold certificates, but a certificate no longer says what its holder can actually do.",
    fact: { text: "43% of ten-year-olds read proficiently; 25% of secondary graduates have basic competency.", source: "UNICEF Bangladesh" },
    doThis: [
      { text: "Open several pathways once the foundations of reading and arithmetic are secure", why: "The report's reading: multiple pathways after foundational literacy and numeracy." },
      { text: "Measure each cohort's reading and maths skills, split by rich and poor, girls and boys", why: "The goal: cohort gains, with equity accounted for." },
    ],
    avoid: [
      { text: "Calling education a success when enrolment rises", why: "“Enrolment rises, learning stalls” is a red flag in the report." },
      { text: "Locking students into one track very young, with no way back", why: "Proposals to specialise need safeguards; this is the report's condition." },
    ],
  },
  12: {
    brief: "Outdated institutional structures, an ethics crisis and staff under strain: it feels real, but little of it has been measured.",
    doThis: [
      { text: "Survey institutional performance and staff stress", why: "This problem needs survey and institutional-performance data." },
      { text: "Make honest behaviour faster, safer and more rewarding than bribery", why: "That is the credible route: clear rules, visible case handling, fair enforcement." },
    ],
    avoid: [
      { text: "Trying to solve it with lectures on ethics", why: "The report's conclusion: moral pressure does not change mentality." },
      { text: "Opening new offices without changing the old rules", why: "Moving from project to permanent institution means changing rules; a new office alone is not enough." },
    ],
  },
  13: {
    brief: "Rubbish, waterlogging and stench: this is a problem of waste, drainage and enforcement systems.",
    doThis: [
      { text: "Treat waste collection, drainage and enforcement as one system", why: "The report's reading: a systems problem of waste, drainage and enforcement." },
      { text: "Publish collection times and rates neighbourhood by neighbourhood", why: "Area-level data is needed to put national averages to local use." },
    ],
    avoid: [
      { text: "Blaming it on “people's bad habits”", why: "Moral language cannot replace service analysis." },
      { text: "Campaigning that “Dhaka is the worst city” without an index or a date", why: "Without a defined index, date and source, the claim is unsupported." },
    ],
  },
  14: {
    brief: "Fake medicine, adulterated food, substandard goods: measuring how far they have spread takes seizures, lab tests and sample surveys.",
    doThis: [
      { text: "Trace products to their source with an ID on every batch", why: "The report's path: batch IDs, lab tests, risk-based inspection, recalls." },
      { text: "Start sample testing with high-risk products", why: "A 0–2 year task: high-risk sample testing across 20 product lines." },
    ],
    avoid: [
      { text: "Raiding every shop at the same rate, regardless of risk", why: "Inspection should be risk-based: limited staff go where the harm is greatest." },
      { text: "Only fining when fakes are found, with no way to recall them from the market", why: "Without recall capacity the fake goods stay in people's hands." },
    ],
  },
  15: {
    brief: "Late deliveries, waiting at ports, goods spoiled on the way: costs rise and exports fall behind.",
    doThis: [
      { text: "Measure shipment time, waiting time, truck speed and warehouse losses", why: "Logistics problems show up in these four numbers." },
      { text: "Upgrade logistics nodes and the cold chain", why: "A 3–5 year task: upgrade logistics nodes and the cold chain." },
    ],
    avoid: [
      { text: "Calling it a national success because the capital's average improved", why: "“Average better, villages worse” is a red flag that belongs to logistics." },
      { text: "Relying only on international indices published once every few years", why: "Indices like the LPI are periodic; the country needs its own regular measures." },
    ],
  },
  16: {
    brief: "Air, water, sanitation and lead: pollution is a measurable path to illness, death and lost productivity.",
    fact: { text: "Pollution costs 17.6% of GDP a year; more than 272,000 premature deaths (2019).", source: "World Bank Country Environmental Analysis" },
    doThis: [
      { text: "Enforce the law at pollution hotspots as soon as they are measured", why: "A 0–2 year task: enforcement at environmental hotspots." },
      { text: "Publish PM2.5, lead and water quality regularly", why: "These are the baseline indicators for pollution." },
    ],
    avoid: [
      { text: "Considering the job done once monitoring equipment is installed", why: "“Monitoring, no enforcement” is a red flag in the report." },
      { text: "Treating pollution as a problem that only “looks bad”", why: "It is a measured path of harm, not a matter of appearance." },
    ],
  },
  17: {
    brief: "Weak land-use control and climate pressure: at some point the damage to land and rivers costs more to repair than it would have cost to prevent.",
    fact: { text: "Climate change risks the loss of one-third of agricultural GDP by 2050.", source: "World Bank Climate and Development Report" },
    doThis: [
      { text: "Build an inventory of each area's natural resources", why: "The report says local resource inventories are needed." },
      { text: "Plan land use for climate resilience", why: "A 5–10 year task: climate-resilient spatial planning." },
    ],
    avoid: [
      { text: "Growing industry while land-use control stays weak", why: "Weak land-use control is one of the sources of pollution." },
      { text: "Waiting until repairing river and land damage costs more than preventing it", why: "Delay pushes the damage to where repair costs more than prevention." },
    ],
  },
  18: {
    brief: "Untreated industrial waste flows into rivers; rivers are dying and water security is at risk.",
    doThis: [
      { text: "Enforce strictly against dumping untreated industrial waste into rivers", why: "Untreated industrial effluent is the main reason river quality is falling." },
      { text: "Take complaints about river grabbing and pollution with a tracking number", why: "Tracked complaints turn public voice into institutional learning." },
    ],
    avoid: [
      { text: "Keeping water-quality data secret", why: "Measuring and publishing openly is the first condition of a solution." },
      { text: "Fixing city pipelines while leaving village water sources out", why: "Average gains can hide rural decline; this is a red flag." },
    ],
  },
  19: {
    brief: "Pay stays flat while prices climb, and the capacity to absorb shocks in food, health care and transport shrinks.",
    fact: { text: "Average inflation was 10.0% in fiscal year 2024–25.", source: "IMF Article IV" },
    doThis: [
      { text: "Collect wage and productivity data by sector", why: "The report says sector wage and productivity data are needed." },
      { text: "Measure real wages, net of inflation", why: "The real wage is a baseline indicator for jobs." },
    ],
    avoid: [
      { text: "Calling it a success when wages rise on paper while inflation stays at 10%", why: "When prices rise faster, a raise on paper is really a cut." },
      { text: "Setting wages on the employers' figures alone, without hearing the workers", why: "One-sided decisions erode trust, and trust is the raw material of every reform." },
    ],
  },
  20: {
    brief: "People are drifting apart from each other and from justice: a plausible problem, but it needs a survey.",
    doThis: [
      { text: "Measure social trust with a representative survey", why: "The report says this needs a representative survey." },
      { text: "Organise volunteer work with citizens on local problems", why: "Working together builds social capital; the 100-fold fall in cyclone deaths is the proof." },
    ],
    avoid: [
      { text: "Assuming without a survey that people do not care about society", why: "Saying “nobody cares” without measuring is a claim without evidence." },
      { text: "Giving benefits only through the powerful or the well connected", why: "Unfair treatment reduces reporting, compliance and cooperation, all three." },
    ],
  },
  21: {
    brief: "An invention does not become a product on its own; it needs money, a first buyer and a path to market.",
    doThis: [
      { text: "Test local products with small pilot orders through public procurement", why: "Procurement pilots are a baseline innovation indicator; a first buyer makes a product real." },
      { text: "Measure how long startups survive and whether they win follow-on investment", why: "Survival and follow-on capital are the core measures of innovation." },
    ],
    avoid: [
      { text: "Counting more grants as more success", why: "“Grants rise, commercialisation does not” is a red flag in the report." },
      { text: "Only handing out awards without measuring time to market", why: "The goal is more products reaching real buyers." },
    ],
  },
  22: {
    brief: "Flood maps, crop monitoring, maritime safety, disaster response: this is not a crisis but an opportunity.",
    doThis: [
      { text: "Use satellite data for flood mapping and disaster response", why: "Flood mapping and disaster response come first in the report's list of uses." },
      { text: "Put it to work for crop monitoring and safety at sea", why: "Crop monitoring and maritime safety are part of the same opportunity." },
    ],
    avoid: [
      { text: "Declaring it a national crisis and asking for an emergency budget", why: "The report calls it an opportunity, not a crisis; the wrong label erodes trust." },
      { text: "Keeping satellite data locked inside one office", why: "Fragmented responsibility and incompatible records are the first step of the problem cycle." },
    ],
  },
  23: {
    brief: "Cases hang for years. How large the backlog is cannot be said without official case-flow data.",
    doThis: [
      { text: "Publish a case-flow dashboard", why: "A 0–2 year task: a case-flow dashboard for the courts." },
      { text: "Institutionalise citizen appeals and independent evaluation", why: "A 3–5 year task: independent evaluation and citizen appeal." },
    ],
    avoid: [
      { text: "Announcing “the backlog has fallen” without case-flow data", why: "The report says this needs official case-flow data." },
      { text: "Cutting the right to a hearing to settle cases faster", why: "Speed cannot be bought with due process; accountable justice information is the goal." },
    ],
  },
  24: {
    brief: "Technology can make policing faster, and without oversight it also raises the risk of abuse.",
    doThis: [
      { text: "Have a person check what an algorithm says before any final decision", why: "The report's condition: transparent, auditable use under human oversight." },
      { text: "Publish reported incidents and response times", why: "Reported incidents and response time are baseline safety indicators." },
    ],
    avoid: [
      { text: "Using surveillance data without independent oversight", why: "The risk of abuse makes oversight and data protection mandatory." },
      { text: "Assuming crime has fallen because reports have fallen", why: "“Reporting falls as trust falls” is a red flag in the report." },
    ],
  },
  25: {
    brief: "There are talented students, but little research money, few labs and little freedom to follow their chosen path.",
    doThis: [
      { text: "Measure both research funding and its results", why: "The report says research funding and outputs must be measured." },
      { text: "Connect university labs with industry and local problems", why: "Invention becomes a product only when there is a path between the lab and a buyer." },
    ],
    avoid: [
      { text: "Judging research quality by the number of publications alone", why: "Measure outcomes; a rising count is not progress in itself." },
      { text: "Narrowing talented students' freedom to choose their subject or sector", why: "Freedom to choose a sector is the core demand of this problem." },
    ],
  },
  26: {
    brief: "Employers cannot find skilled people and skilled people cannot find the right jobs; the mismatch can be measured.",
    doThis: [
      { text: "Measure the mismatch by matching vacancy, graduate and wage data", why: "The report says vacancy, graduate and wage data can measure it." },
      { text: "Run skills pilots with employers involved", why: "A 0–2 year task: employer-linked skills pilots." },
    ],
    avoid: [
      { text: "Assuming skill from a certificate alone", why: "A certificate no longer carries information about real capability; that is the root of the problem." },
      { text: "Keeping labour, education and training data apart", why: "A 3–5 year task: integrate labour, education and training data." },
    ],
  },
  27: {
    brief: "Without a fresh start after a failed business, protection for investors and a sound banking sector, new ventures do not stand.",
    fact: { text: "Delaying reform amid weak revenue, banking-sector risk and high inflation raises the macroeconomic cost.", source: "IMF Article IV" },
    doThis: [
      { text: "Simplify insolvency law so a failed entrepreneur can start again", why: "The report says insolvency, finance and investor-protection analysis is needed." },
      { text: "Strengthen investor protection", why: "Without protection, capital does not come to new ventures." },
    ],
    avoid: [
      { text: "Expanding credit while ignoring the weakness of the banking sector", why: "The IMF warns that ignoring banking-sector risk lets losses build up." },
      { text: "Putting off reform while revenue collection stays weak", why: "Delay has a macroeconomic cost; without revenue no reform lasts." },
    ],
  },
  28: {
    brief: "Almost every home is connected; the real question is how many hours the power stays on, and at what price.",
    fact: { text: "Electricity access is 99.5%, but access does not mean reliable or affordable supply.", source: "World Bank, 2025" },
    doThis: [
      { text: "Plan from measured hourly demand, dispatch and system losses", why: "Load planning needs hourly demand, dispatch, loss and industrial-load data." },
      { text: "Raise reliability first in productive regions", why: "A 3–5 year task: energy reliability in productive regions." },
    ],
    avoid: [
      { text: "Considering the problem solved because access is 99.5%", why: "“Access headlines hide service decline” is a red flag in the report." },
      { text: "Buying fast reliability while keeping its cost hidden", why: "The goal: more reliability at a transparent cost." },
    ],
  },
  29: {
    brief: "A link between idle political workers and crime is claimed, but there is no neutral evidence for it.",
    doThis: [
      { text: "Collect neutral crime and political-finance data first", why: "The report says this needs neutral evidence on crime and political finance." },
      { text: "Run a small internship pilot on public criteria", why: "An internship scheme can be piloted; it cannot be assumed." },
    ],
    avoid: [
      { text: "Giving jobs or benefits by party affiliation", why: "Public criteria and independent evaluation are needed to protect the pilot from political capture." },
      { text: "Labelling a group as criminal without evidence", why: "Collective blame is not evidence, and it breaks trust." },
    ],
  },
  30: {
    brief: "Streets, transport, workplaces and homes: safety is not one layer of work but many.",
    doThis: [
      { text: "Ensure street lighting and safe public transport", why: "Layered action: lighting, transport, reporting, survivor services, enforcement." },
      { text: "Provide safe, confidential reporting and support services for survivors", why: "Survivor services and a fast, safe response are the measure of success here." },
    ],
    avoid: [
      { text: "Considering the duty done once an app is built", why: "The report says technology is only one layer." },
      { text: "Making a survivor's identity public", why: "Exposing identities reduces reporting, and as trust falls, reports fall too." },
    ],
  },
  31: {
    brief: "Skilled people move abroad. The goal is not to hold them back but to bring their knowledge and networks home.",
    doThis: [
      { text: "Connect diaspora experts in a network and give them ways to work remotely", why: "Diaspora links can turn a loss into a network." },
      { text: "Improve research and working conditions for those who come back", why: "Without reasons to return, talent does not circulate." },
    ],
    avoid: [
      { text: "Imposing strict bans to stop people leaving", why: "The goal is talent circulation, not just retention." },
      { text: "Pushing the diaspora away because “they have left anyway”", why: "The diaspora is the greatest asset for talent circulation." },
    ],
  },
  32: {
    brief: "Slogans do not bring trust back. Trust returns when rules apply equally to everyone and mistakes are corrected in public.",
    doThis: [
      { text: "Build institutions such as appeals, audits and published results, instead of slogans", why: "The report says this needs institutional mechanisms, not slogans." },
      { text: "Leaders accept independent oversight", why: "The report's conclusion: leadership that accepts independent scrutiny is part of the credible route." },
    ],
    avoid: [
      { text: "Calling it a success when surveyed trust rises, without checking administrative data", why: "“Perception better, outcomes worse” is a red flag in the report." },
      { text: "Trying to change citizens' behaviour with advice alone", why: "Honest behaviour has to be made safe, fast and rewarding; advice does not do it." },
    ],
  },
};

export interface RuralCaption {
  /** English alt text for the photograph. */
  alt: string;
  place: string;
  pain: string;
}

/** English captions for data/rural-life.ts `ruralStories`, by story id. */
export const RURAL_CAPTIONS: Record<string, RuralCaption> = {
  "paddy-bales": {
    alt: "After the harvest, farmers carry paddy bales on their heads along the ridge of a field",
    place: "Paddy fields, harvest season",
    pain: "A whole season's toil, yet someone else sets the price of paddy at the market.",
  },
  "teesta-fisher": {
    alt: "A fisher readies his net from a small boat on the Teesta river in Rangpur",
    place: "Teesta river, Rangpur",
    pain: "When the river dries the net comes up empty; when it swells the house floods. Risk on both sides.",
  },
  "char-flood": {
    alt: "A settlement on a Jamuna char under floodwater, tin houses standing in the water",
    place: "Char land, Sariakandi",
    pain: "Every monsoon, homes, cattle and the school go under water together.",
  },
  "teesta-erosion": {
    alt: "A riverbank collapsed by Teesta erosion, land sliding into the river",
    place: "River erosion, Sundarganj",
    pain: "Ancestral land gone to the river in one night: the deed remains, the soil does not.",
  },
  "brick-kiln-family": {
    alt: "Women and men sit on the ground at a brick kiln, moulding raw bricks",
    place: "Brick kiln",
    pain: "Work from dawn to dusk in sun and dust, paid by the day: no leave, no contract.",
  },
  "brick-hands": {
    alt: "A worker's hands packing mud into a brick mould",
    place: "Hands at work",
    pain: "The bricks that build the country are made by these hands, yet their owner's name is in no database.",
  },
  "rickshaw-rain": {
    alt: "A rickshaw puller pulls his rickshaw along a rain-soaked city street",
    place: "From village to city",
    pain: "No work in the village, so a rickshaw in the city: rain, waterlogging and the daily rent to pay.",
  },
  "tea-worker": {
    alt: "A tea worker in a conical hat plucks leaves in a tea garden in Sreemangal",
    place: "Tea garden, Sreemangal",
    pain: "The country's tea goes to the world, but the woman who plucks it still fights for her wage and her health care.",
  },
  "garment-machine": {
    alt: "Workers at their machines in a garment factory",
    place: "Garment factory",
    pain: "The young woman from the village keeps exports alive in the city; if the factory shuts, she is jobless in a day.",
  },
  "cyclone-shelter": {
    alt: "Villagers meeting inside a cyclone shelter on the southern coast",
    place: "Cyclone shelter, coast",
    pain: "The shelter saves lives; when the storm ends, life starts again from nothing.",
  },
  "rural-kitchen": {
    alt: "A village kitchen with a clay stove and cooking pots",
    place: "Village kitchen",
    pain: "When the price of rice, lentils and oil rises, this pot is the first to feel it.",
  },
  "sowing-paddy": {
    alt: "A farmer bends in the muddy water to plant paddy seedlings",
    place: "Planting seedlings",
    pain: "Fertiliser, seed, irrigation: every cost rises, and few agriculture officers are in the field to advise.",
  },
};
