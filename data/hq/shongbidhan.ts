import type { Article } from "../../lib/hq/types.ts";

/**
 * The Kandari Shongbidhan — the company's constitution. A first draft of
 * Mahir's rules for him (and the judges) to edit on /hq/shongbidhan; not
 * sample data. Numbered like his example "Part Ka, Article 3, Section 104".
 * Penalties are mostly playful but fair; fines are capped by law at a tenth
 * of the month's wage (lib/hq/scoring.ts fineAllowed).
 */
const A = (
  id: string,
  part: string,
  article: string,
  section: string,
  title: string,
  text: string,
  penalty: Article["penalty"],
  crimePoints: number,
): Article => ({ id, part, article, section, title, text, penalty, crimePoints });

export function seedArticles(): Article[] {
  return [
    // Part Ka — Time and attendance
    A("art-ka-1-101", "Ka", "1", "101", "Check in on time", "Every member checks in at HQ by the office start time plus the grace minutes on working days. Three late arrivals in a week count as one offence.", { kind: "warning", text: "A friendly warning in #general" }, 1),
    A("art-ka-2-102", "Ka", "2", "102", "No silent absence", "Absence without a leave request or a message to your team leader before the office starts.", { kind: "duty", text: "Takes the next team meeting's notes" }, 3),
    A("art-ka-3-104", "Ka", "3", "104", "Respect the team's lunch hour", "Missing a planned team lunch or meeting without telling anyone, leaving people waiting.", { kind: "treat", text: "Treats the team to lunch today" }, 2),
    // Part Kha — Tasks and responsibility
    A("art-kha-1-201", "Kha", "1", "201", "A taken task is a promise", "Taking a ticket and then abandoning it without releasing it back to the board or telling the creator.", { kind: "points", text: "15 points deducted", amount: 15 }, 4),
    A("art-kha-2-202", "Kha", "2", "202", "Honest submissions", "Submitting work as done when it isn't, or hiding a known problem from the reviewer.", { kind: "points", text: "25 points deducted", amount: 25 }, 6),
    A("art-kha-3-203", "Kha", "3", "203", "Daily report", "Skipping the daily report three working days in a row.", { kind: "duty", text: "Writes the team's weekly summary" }, 2),
    A("art-kha-4-204", "Kha", "4", "204", "Client trust", "Sharing client information outside the project's people, or promising a client something without the team leader.", { kind: "fine", text: "A small fine (capped by law)", amount: 500 }, 8),
    // Part Ga — Teamwork and help
    A("art-help", "Ga", "1", "301", "Answer the call for help", "A capable member who saw a help request matching their skills and did not help, or say why, before its deadline.", { kind: "points", text: "10 points deducted", amount: 10 }, 3),
    A("art-ga-2-302", "Ga", "2", "302", "Credit where it's due", "Presenting a teammate's work, idea or solution as your own.", { kind: "points", text: "20 points deducted", amount: 20 }, 5),
    A("art-ga-3-303", "Ga", "3", "303", "No team left behind", "Refusing a team invitation without the reasoned note the TaskBook asks for, or leaving a team mid-delivery without a handover.", { kind: "duty", text: "Materials management for a week" }, 3),
    // Part Gha — Communication and meetings
    A("art-gha-1-401", "Gha", "1", "401", "Urgent means urgent", "Using @urgent for something that is not urgent, or ignoring an urgent alert addressed to you.", { kind: "warning", text: "A warning and a quick chat with the team leader" }, 1),
    A("art-gha-2-402", "Gha", "2", "402", "Be there for meetings", "Missing a scheduled meeting you accepted, without a message beforehand.", { kind: "treat", text: "Brings tea and snacks to the next meeting" }, 2),
    A("art-gha-3-403", "Gha", "3", "403", "Keep the client posted", "A team leader going more than a week without a client update on an active project.", { kind: "duty", text: "Writes the client a full progress report" }, 3),
    // Part Uma — Conduct and respect
    A("art-uma-1-501", "Uma", "1", "501", "Respect everyone", "Insulting, mocking or belittling a colleague, a client or anyone in the community.", { kind: "fine", text: "A fine (capped by law) and a personal apology", amount: 1000 }, 10),
    A("art-uma-2-502", "Uma", "2", "502", "Care for the lab", "Damaging or losing lab equipment through carelessness, or leaving the workspace in a mess.", { kind: "duty", text: "Lab clean-up and inventory for a week" }, 3),
    A("art-uma-3-503", "Uma", "3", "503", "Protect our data", "Sharing passwords, signing in as someone else, or taking company data outside HQ.", { kind: "points", text: "40 points deducted", amount: 40 }, 10),
  ];
}
