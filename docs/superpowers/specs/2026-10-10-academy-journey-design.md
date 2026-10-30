# Academy as a university journey

Date: 2026-10-10 · Scope: `/media/academy/*` · Owner decisions: one checkout only (no admission test); academies may open many departments; the old home, departments page and academies list merge into one first view and redirect.

## Why

Users met "বিভাগ, কোর্স, ক্লাসরুম, ফাইনাল ও বোর্ড" in no order. Every Bangladeshi already knows one learning ritual: ভর্তি সার্কুলার → ভর্তি → রেজিস্ট্রেশন → ক্লাস রুটিন → ক্লাস → পরীক্ষা → রেজাল্ট → সমাবর্তন. The academy now follows it, so people recognise where they are without learning anything new.

## The journey (shown everywhere)

| # | Step | Where |
|---|---|---|
| ১ | একাডেমি খুঁজুন | `/media/academy` |
| ২ | একাডেমি চিনুন | `/media/academy/a/[id]` |
| ৩ | বিভাগ বাছুন | `/media/academy/dept/[id]` |
| ৪ | কোর্স বাছুন | `/media/academy/course/[id]` |
| ৫ | ভর্তি | `/media/academy/checkout` |
| ৬ | রুটিন | `/media/academy/routine` (new) |
| ৭ | ক্লাস | `/media/academy/classroom` |
| ৮ | পরীক্ষা | `/media/academy/exam` |
| ৯ | সমাবর্তন | `/media/academy/graduation` (new) |

Three phases: বাছাই (১–৪), ভর্তি (৫), পড়াশোনা (৬–৯). On desktop the sidebar *is* the journey (numbered, ticks on done steps, steps ২–৪ open the last academy, department and course seen). On phones and with the sidebar hidden, a slim journey bar sits under the header. Done is computed from the learner's own state (enrolled, attended, project, interview).

## Pages

- **একাডেমি খুঁজুন** — hero; a three-question finder (স্বপ্ন · কী ভালো লাগে · প্রতিভা) that ranks academies; field chips; academy cards like university cards; the nine steps drawn as a path; graduates; questions. Replaces the old home, `/departments` and `/teachers` (both redirect here).
- **একাডেমির পাতা** — hero with photo, logo, kind; tabs: পরিচিতি (who, why this skill matters, facts from the data only), শিক্ষক, বিভাগ ও কোর্স (each department with its three courses; level chooser highlights the right course), ভবিষ্যৎ (pick a course and a goal → today, week one, day 40 with real dates; a goal line kept on this device; "এখনই সময়" with the next batch), গল্প, প্রশ্ন.
- **রুটিন** — a weekly class routine table (day × time) across the learner's batches, the next classes with dates, and an `.ics` download for the phone calendar.
- **সমাবর্তন** — per course: what is left before graduating (attendance, homework, project, interview); the public graduates wall; certificates on the board.

## Data and rules

- `AcademyInfo` gains `id`. An academy opens one or more departments; each department still has exactly three courses; every department of an academy shares its kind. `academiesFrom(departments)` groups them (tested).
- Sample data: যন্ত্রঘর একাডেমি's department joins ষড়বিংশ একাডেমি (same two teachers), so the demo shows an academy with two departments.
- Departments carry finder tags (goals, likes, talents); `fitScore` ranks them (tested). No new claims or numbers are invented — impact shows graduates, ratings, stories and passes already in the data.
