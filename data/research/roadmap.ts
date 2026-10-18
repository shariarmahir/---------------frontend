/**
 * Genius's research roadmap: the steps from a question to a publication an
 * international journal or examiner will accept, each with the checks to
 * tick, the named standard reviewers apply, and the Genius tools that help
 * with it. It covers every content type the upload form takes: a thesis,
 * a research paper, an innovation, a project and an idea. Steps that do not
 * apply to a type are left out of its route (an idea collects no data; only
 * an innovation or a project is built and tested), and the upload step asks
 * for exactly what the form will ask for.
 * Pure data; the page is components/research/roadmap.tsx.
 */
import { LIMITS, SECTION_TEMPLATES, type ResearchKind } from "../../lib/research/core.ts";

export type RoadmapKind = ResearchKind;

export const ROADMAP_KINDS: Record<RoadmapKind, { label: string; icon: string; note: string }> = {
  paper: { label: "Research paper", icon: "article", note: "For a journal article: an original study, a review or a short report." },
  thesis: { label: "Thesis", icon: "school", note: "For an honours, master's or PhD thesis examined by your university." },
  innovation: { label: "Innovation", icon: "lightbulb", note: "For a new device, method or tool, built and tested against the problem it solves." },
  project: { label: "Project", icon: "construction", note: "For a field, software or engineering project that delivers and evaluates a solution." },
  idea: { label: "Idea", icon: "tips_and_updates", note: "For a proposal not yet tested: published to find a supervisor, collaborators or funding." },
};

export interface StandardLink {
  label: string;
  url: string;
}

/** A Genius page that helps with the step. */
export interface GeniusTool {
  label: string;
  url: string;
  icon: string;
}

export interface Check {
  id: string;
  text: string;
}

export interface RoadmapStep {
  id: string;
  title: string;
  icon: string;
  /** One line: what this step settles. */
  goal: string;
  /** The kinds whose route includes this step; every kind when absent. */
  for?: RoadmapKind[];
  /** The checks to tick; ids are stable so saved progress survives copy edits. */
  checks: Check[] | ((kind: RoadmapKind) => Check[]);
  /** The standard reviewers will hold the step to. */
  standard: string;
  links?: StandardLink[];
  /** Where Genius itself helps. */
  tools?: GeniusTool[];
}

const checksOf = (s: RoadmapStep, kind: RoadmapKind) => (typeof s.checks === "function" ? s.checks(kind) : s.checks);

const BUILT: RoadmapKind[] = ["innovation", "project"];
const TESTED: RoadmapKind[] = ["paper", "thesis", "innovation", "project"];

const STRUCTURE: Record<RoadmapKind, string> = {
  paper: "Title, structured abstract (about 250 words) and keywords; Introduction, Methods, Results and Discussion (IMRaD); limitations; conclusion",
  thesis: "Abstract; Introduction; Literature review; Methodology; Results; Discussion; Conclusion and recommendations; references; appendices (instruments, consent forms, extra tables)",
  innovation: "The problem and who has it; the design and the options rejected; the prototype and how it was tested; cost per unit; limitations and next steps",
  project: "Background and objectives; what was built or done; testing and validation against the objectives; cost; results, limitations and next steps",
  idea: "The problem, with evidence that it is real; the idea; how it could be tested, and what would prove it wrong; what it needs (people, money, permissions)",
};

const EXAMPLE = "/research/save-the-crow-and-falcon";

export const ROADMAP: RoadmapStep[] = [
  {
    id: "question",
    title: "Find a real problem and sharpen the question",
    icon: "help_center",
    goal: "One answerable question, worth answering, that you can finish with the time and money you have.",
    checks: [
      { id: "problem", text: "Name the problem in one sentence, with who it hurts and where (a district, a city, a sector)." },
      { id: "gap", text: "Show the gap: what is already known, and what is not." },
      { id: "finer", text: "Test the question against FINER: Feasible, Interesting, Novel, Ethical, Relevant." },
      { id: "pico", text: "For health and intervention questions, write it as PICO: Population, Intervention, Comparison, Outcome." },
      { id: "aims", text: "Write one main aim and at most three specific objectives, each measurable." },
    ],
    standard: "Reviewers reject vague or unanswerable questions first. A sharp question decides your design, your sample and your analysis.",
    tools: [
      { label: "The 32 national problems", url: "/research/collections/bd-live", icon: "crisis_alert" },
      { label: "Bangladesh Real Issues & Solutions", url: "/research/collections/bd-solutions", icon: "emoji_objects" },
    ],
  },
  {
    id: "literature",
    title: "Review the literature properly",
    icon: "travel_explore",
    goal: "Know what the world and Bangladesh already know, and cite it.",
    checks: [
      { id: "databases", text: "Search at least two databases (Google Scholar, plus PubMed, Scopus, Web of Science or BanglaJOL for your field), and Genius for work done in Bangladesh." },
      { id: "log", text: "Keep a search log: the words, the databases, the dates and how many results each search gave." },
      { id: "manager", text: "Store every source in a reference manager (Zotero or Mendeley) from day one." },
      { id: "primary", text: "Read and cite primary sources, not someone else's summary of them." },
      { id: "matrix", text: "Build a literature matrix: for each study, its method, sample, findings and weaknesses." },
    ],
    standard: "A systematic review or meta-analysis must follow PRISMA 2020 and is best registered in PROSPERO before you start screening.",
    links: [
      { label: "PRISMA 2020", url: "https://www.prisma-statement.org" },
      { label: "PROSPERO", url: "https://www.crd.york.ac.uk/prospero/" },
      { label: "Zotero", url: "https://www.zotero.org" },
      { label: "BanglaJOL", url: "https://www.banglajol.info" },
    ],
    tools: [
      { label: "Advanced Search", url: "/research/advanced-search", icon: "manage_search" },
      { label: "Browse by subject", url: "/research/subjects", icon: "category" },
      { label: "Save and export BibTeX or RIS in your Workspace", url: "/research/workspace", icon: "bookmark" },
    ],
  },
  {
    id: "design",
    title: "Design the study and write a protocol",
    icon: "architecture",
    goal: "A plan someone else could follow and get the same kind of answer.",
    checks: (kind) =>
      kind === "idea"
        ? [
            { id: "test", text: "Say how the idea could be tested: on whom or what, where, and for how long." },
            { id: "variables", text: "Name what you would measure to know whether it works, and how." },
            { id: "falsify", text: "Write down the result that would prove the idea wrong." },
            { id: "guideline", text: "Find the reporting guideline the full study would follow, on the EQUATOR Network." },
          ]
        : [
            { id: "type", text: "Choose the design that fits the question: experiment or trial, observational, qualitative, mixed methods, or build-and-test." },
            { id: "sample", text: "Calculate the sample size (a power calculation, or a saturation rule for qualitative work) and how you will select it." },
            { id: "variables", text: "Define every variable or outcome, and how and when each one is measured." },
            { id: "plan", text: "Write the analysis plan before you collect any data." },
            { id: "guideline", text: "Pick your reporting guideline now, from the EQUATOR Network, and follow it from the start." },
            { id: "register", text: "Register the protocol where your field expects it: a trial registry for clinical trials, OSF Registries for other studies." },
          ],
    standard: "The EQUATOR Network lists the reporting guideline for each design: CONSORT for randomised trials, STROBE for observational studies, STARD for diagnostic accuracy, COREQ or SRQR for qualitative research, ARRIVE for animal studies, CHEERS for economic evaluations.",
    links: [
      { label: "EQUATOR Network", url: "https://www.equator-network.org" },
      { label: "OSF Registries", url: "https://osf.io" },
      { label: "ClinicalTrials.gov", url: "https://clinicaltrials.gov" },
    ],
    tools: [{ label: "A worked plan: Save the Crow & Falcon", url: EXAMPLE, icon: "menu_book" }],
  },
  {
    id: "ethics",
    title: "Get ethics approval and permissions",
    icon: "verified_user",
    goal: "Nobody is harmed, everyone agreed, and the paperwork proves it.",
    checks: (kind) =>
      kind === "idea"
        ? [
            { id: "committee", text: "List the approvals testing the idea would need: an ethics committee for work with people, permits for animals, protected areas or institutions." },
            { id: "privacy", text: "Keep names, phone numbers and addresses of anyone you spoke to out of what you publish." },
            { id: "coi", text: "Write down any conflict of interest and any funding you already have." },
          ]
        : [
            { id: "committee", text: "Get approval from an ethics committee before any data collection: your university's, or the BMRC National Research Ethics Committee for health research." },
            { id: "consent", text: "Prepare informed consent in plain Bangla, and parental consent plus the child's assent for anyone under 18." },
            { id: "privacy", text: "Plan how you will anonymise data and keep names, phone numbers and addresses out of anything you publish." },
            { id: "permits", text: "Get any permits the work needs: wildlife, protected areas, hospitals, factories or schools." },
            { id: "coi", text: "Write down any conflict of interest and every source of funding." },
          ],
    standard: "Research with people follows the World Medical Association's Declaration of Helsinki. Journals ask for the approval number and the committee's name in the Methods.",
    links: [
      { label: "Declaration of Helsinki", url: "https://www.wma.net/policies-post/wma-declaration-of-helsinki/" },
      { label: "BMRC", url: "https://bmrcbd.org" },
    ],
    tools: [{ label: "Genius publishing rules", url: "/research/submit#rules", icon: "gavel" }],
  },
  {
    id: "data",
    title: "Collect the data carefully",
    icon: "fact_check",
    goal: "Clean, traceable data that you could hand to a reviewer tomorrow.",
    for: TESTED,
    checks: [
      { id: "pilot", text: "Pilot every questionnaire, instrument or sensor on a small group first, and fix what fails." },
      { id: "dmp", text: "Write a data management plan: file names, versions, backups and who can see what." },
      { id: "calibrate", text: "Calibrate instruments and sensors, and record the calibration." },
      { id: "fieldnotes", text: "Keep dated field notes of every deviation from the protocol." },
      { id: "raw", text: "Keep the raw data untouched; clean a copy, and record every cleaning step." },
      { id: "photos", text: "Photograph the work as it happens (the site, the set-up, the prototype), with consent from anyone who appears." },
    ],
    standard: "Make data FAIR: Findable, Accessible, Interoperable and Reusable. Many journals now require a data availability statement and a public deposit.",
    links: [
      { label: "FAIR principles", url: "https://www.go-fair.org/fair-principles/" },
      { label: "Zenodo (free DOI for data)", url: "https://zenodo.org" },
    ],
    tools: [{ label: "How others caption their figures", url: "/research/images", icon: "image" }],
  },
  {
    id: "build",
    title: "Build, test and cost the solution",
    icon: "precision_manufacturing",
    goal: "A working prototype, tested where it will be used, with an honest cost.",
    for: BUILT,
    checks: [
      { id: "requirements", text: "Write the requirements first: what it must do, for whom, in what conditions (heat, damp, power cuts, low-end phones)." },
      { id: "options", text: "Compare at least two designs and record why you rejected the others." },
      { id: "prototype", text: "Build the smallest prototype that can be tested, and keep a build log with versions." },
      { id: "fieldtest", text: "Test it in real conditions with the people who will use it, against each requirement." },
      { id: "cost", text: "Work out the cost per unit (or per user) and what it would take to maintain." },
      { id: "safety", text: "Check the safety and standards it must meet (BSTI, electrical, medical device or data rules)." },
      { id: "patent", text: "If it might be patented, search Google Patents or WIPO PATENTSCOPE and talk to Bangladesh's Department of Patents, Designs and Trademarks before publishing: in most countries, publishing first can block a patent." },
    ],
    standard: "A build-and-test study is judged like any other: stated requirements, a fair test against them, and every failure reported. Engineering venues (IEEE, ACM) expect the test set-up described well enough to repeat.",
    links: [
      { label: "WIPO PATENTSCOPE", url: "https://patentscope.wipo.int" },
      { label: "Google Patents", url: "https://patents.google.com" },
    ],
    tools: [{ label: "Bangladesh Real Issues & Solutions", url: "/research/collections/bd-solutions", icon: "emoji_objects" }],
  },
  {
    id: "analysis",
    title: "Analyse honestly and reproducibly",
    icon: "query_stats",
    goal: "Results anyone can recompute, reported with their uncertainty.",
    for: TESTED,
    checks: [
      { id: "script", text: "Analyse in a script (R, Python or Stata) so every number can be recomputed, not by hand in a spreadsheet." },
      { id: "effect", text: "Report effect sizes with 95% confidence intervals, not only p-values." },
      { id: "missing", text: "Say how much data is missing and how you handled it." },
      { id: "planned", text: "Keep pre-planned analyses apart from exploratory ones, and label which is which." },
      { id: "negative", text: "Report what did not work or did not reach significance, as well as what did." },
    ],
    standard: "Selective reporting and p-hacking are research misconduct in the eyes of journals. The analysis plan from the design step is your defence.",
  },
  {
    id: "write",
    title: "Write it up in the expected structure",
    icon: "edit_document",
    goal: "A manuscript a reviewer can read in the order they expect.",
    checks: (kind) => [
      { id: "structure", text: `Use the expected structure. ${STRUCTURE[kind]}.` },
      ...(kind === "idea"
        ? [{ id: "untested", text: "Say plainly that the idea is untested, and what is known so far." }]
        : [
            { id: "checklist", text: "Fill in your reporting guideline's checklist and attach it on submission." },
            { id: "figures", text: "Make every figure and table readable on its own: a title, labelled axes with units, and the sample size." },
          ]),
      { id: "limits", text: "State the limitations plainly, before a reviewer does." },
      { id: "statements", text: "Add the statements journals require: ethics approval, consent, funding, conflicts of interest, data availability." },
      ...(kind === "thesis"
        ? [{ id: "format", text: "Follow your university's thesis format and length rules exactly, and agree each chapter with your supervisor." }]
        : [{ id: "authors", text: "Agree authorship by the ICMJE criteria, and list each person's role with the CRediT taxonomy." }]),
    ],
    standard: "ICMJE sets who qualifies as an author (a substantial contribution, drafting or revising, approving the final version, and accountability). CRediT names fourteen contributor roles.",
    links: [
      { label: "ICMJE recommendations", url: "https://www.icmje.org" },
      { label: "CRediT taxonomy", url: "https://credit.niso.org" },
    ],
    tools: [{ label: "The upload form starts you with these sections", url: "/research/submit", icon: "view_agenda" }],
  },
  {
    id: "integrity",
    title: "Cite correctly and check integrity",
    icon: "policy",
    goal: "Every claim traceable to its source; nothing copied, invented or altered.",
    checks: [
      { id: "style", text: "Use one citation style throughout (APA, Vancouver or IEEE, as your target requires)." },
      { id: "every", text: "Check that every in-text citation is in the reference list, and every reference is cited." },
      { id: "similarity", text: "Run a similarity check (iThenticate or Turnitin) and rewrite anything too close to a source." },
      { id: "ai", text: "Disclose any AI tool you used and how; an AI tool can never be an author." },
      { id: "images", text: "Use only images you made or have permission for, each with its credit and licence." },
    ],
    standard: "COPE (the Committee on Publication Ethics) defines misconduct: fabrication, falsification and plagiarism. Most reputable journals are COPE members and follow its flowcharts.",
    links: [{ label: "COPE", url: "https://publicationethics.org" }],
    tools: [{ label: "Try Cite on a Genius item: APA, MLA, Chicago, BibTeX, RIS", url: EXAMPLE, icon: "format_quote" }],
  },
  {
    id: "upload",
    title: "Prepare your Genius upload",
    icon: "upload_file",
    goal: "Everything the upload form asks for, ready before you open it.",
    checks: (kind) => [
      { id: "details", text: `A title of ${LIMITS.title[0]} to ${LIMITS.title[1]} characters, the content type (${ROADMAP_KINDS[kind].label}), the subject and the level.` },
      { id: "people", text: `The authors (up to ${LIMITS.authors}, each of whom agreed), the institution and department, the supervisor, the year and the district where the work was done.` },
      { id: "context", text: "The scope (Bangladesh or global) and, if it speaks to one, the national problem it addresses (BD-001 to BD-032)." },
      { id: "abstract", text: `An abstract of ${LIMITS.summary[0]} to ${LIMITS.summary[1].toLocaleString("en-US")} characters: the question, the method and what you found${kind === "idea" ? " (for an idea, what you propose and how it could be tested)" : ""}.` },
      { id: "sections", text: `The text in sections, with references marked [1], [2]. The form starts you with: ${SECTION_TEMPLATES[kind].join(", ")}.` },
      { id: "references", text: `References one per line with their links (up to ${LIMITS.references}), and up to ${LIMITS.keywords} keywords.` },
      { id: "thumbnail", text: "A thumbnail photo of your own (the device, the site, the team at work), with a caption and its credit. It is required: it is the cover readers see first." },
      {
        id: "images",
        text: BUILT.includes(kind)
          ? `Project images (up to ${LIMITS.gallery}): the prototype, the test set-up, the field site and the results, each with a caption.`
          : `Any images that help (up to ${LIMITS.gallery}): a field site, an instrument, a poster, each with a caption.`,
      },
      { id: "pdf", text: "The full text as a PDF of up to 1.5 MB, if you have one." },
    ],
    standard: "Genius publishes after review. A reviewer checks that the work is the authors' own, the data are not invented, borrowed text and images are credited, and no participant can be identified.",
    tools: [
      { label: "Upload research", url: "/research/submit", icon: "upload" },
      { label: "Publishing rules", url: "/research/submit#rules", icon: "gavel" },
    ],
  },
  {
    id: "submit",
    title: "Choose where to publish and submit",
    icon: "send",
    goal: "The right venue, chosen on purpose, and a complete submission.",
    checks: (kind) =>
      kind === "thesis"
        ? [
            { id: "defend", text: "Submit to your university and prepare the defence (viva) with your supervisor." },
            { id: "papers", text: "Plan one or two journal papers from the thesis chapters." },
            { id: "orcid", text: "Get an ORCID iD, so all your work stays linked to you." },
            { id: "deposit", text: "Deposit the final thesis in your university repository, and on Genius." },
          ]
        : kind === "idea"
          ? [
              { id: "supervisor", text: "Name the kind of partner the idea needs (a supervisor, a lab, a field team, a funder) and approach two of them." },
              { id: "funding", text: "Look for a grant or competition that fits, and note its deadline." },
              { id: "orcid", text: "Get an ORCID iD, so all your work stays linked to you." },
              { id: "preprint", text: "Publish the idea on Genius so it is dated and on record, and share it where your partners will see it." },
            ]
          : [
              { id: "scope", text: "Shortlist three journals or conferences whose scope matches the work and whose recent papers resemble yours." },
              { id: "indexed", text: "Check the indexing (Scopus, Web of Science, or DOAJ for open access) and the fees." },
              { id: "predatory", text: "Rule out predatory journals with the Think. Check. Submit. checklist." },
              { id: "orcid", text: "Get an ORCID iD, so all your work stays linked to you." },
              { id: "cover", text: "Write a cover letter: what you found, why it matters, why this journal." },
            ],
    standard: "A predatory journal takes a fee and publishes without real peer review; it can cost you the work. Before you submit, a preprint (arXiv, bioRxiv, medRxiv, SSRN or OSF Preprints) puts a dated public copy on record.",
    links: [
      { label: "Think. Check. Submit.", url: "https://thinkchecksubmit.org" },
      { label: "DOAJ", url: "https://doaj.org" },
      { label: "ORCID", url: "https://orcid.org" },
    ],
  },
  {
    id: "review",
    title: "Answer peer review and share the work",
    icon: "rate_review",
    goal: "A published, open, citable work that reaches the people it is about.",
    checks: [
      { id: "point", text: "Answer every reviewer comment point by point, saying what you changed and where, politely even when you disagree." },
      { id: "revise", text: "Revise within the deadline, and mark the changes in the manuscript." },
      { id: "licence", text: "Publish under an open licence (CC BY) where the journal allows it." },
      { id: "genius", text: "Share the published work from its Genius page to the Kandari feed and social media, and answer readers' comments." },
      { id: "plain", text: "Write a plain-language summary for the people and the officials the findings affect." },
    ],
    standard: "Peer review is a conversation, not a verdict: most accepted papers go through at least one round of revision.",
    tools: [{ label: "Follow your uploads in your Workspace", url: "/research/workspace", icon: "dashboard" }],
  },
];

/** The steps on a kind's route, in order. */
export const stepsFor = (kind: RoadmapKind) => ROADMAP.filter((s) => !s.for || s.for.includes(kind));

/** Every check id on a kind's route, as "step:check", in reading order. */
export const allChecks = (kind: RoadmapKind) => stepsFor(kind).flatMap((s) => checksOf(s, kind).map((c) => `${s.id}:${c.id}`));

export { checksOf };
