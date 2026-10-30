# Academy classroom — batches, the room, and live classes

Date: 2026-10-08 · Scope: `/media/academy/*` only · Owner decisions: real calls via Jitsi; the teacher desk's tools move into the classroom.

## What changes

1. **Batches.** A course can run several batches, each with a start date, one weekly class slot (day + Dhaka time) and its own seats (BATCH_MAX: 5 solo, 15 team). The first batch of every sample course has the course code as its id, so attendance kept under the course code carries over. Academies open more batches; they live in the academy store (`batches`).
2. **Opening a classroom.** "শিক্ষক ডেস্ক" is gone. An approved academy opens a classroom per batch at `/media/academy/classroom/open` (course, start date, weekday, time). Rules (tested): start today or later, a valid slot, no clash with the same teacher's other running batch on the same day and time.
3. **Checkout picks a batch.** Each cart course shows its open batches; the learner chooses one (default: the soonest with seats). The enrolment keeps `batch`. The congratulations screen sends them into that classroom.
4. **The classroom** (`/media/academy/classroom/[batch]`), after the reference: syllabus rail (greeting, search, chips, course card, week cards) · player with the next-live banner · batch chat (text, files, images, audio up to 1.5 MB) · right panel with files / videos / homework. Teachers of the course see a toolbar for roll call, materials and earnings — the desk's tools, now per batch.
5. **Live class** (`/media/academy/classroom/[batch]/live`): a lobby, then a Jitsi Meet room (domain from `NEXT_PUBLIC_JITSI_DOMAIN`, default `meet.jit.si`) under our own dark control bar — mic, camera, screen, hand, tile view, chat (our batch chat), people, 40-minute timer, leave. Joining marks the learner present for the current week. Only the display name goes to Jitsi; never the email.
6. **Routes.** `/media/academy/classroom` (hub: "শিখছি" and "শেখাচ্ছি"), `/classroom/new` (course builder, moved), `/classroom/open`, `/classroom/[batch]`, `/classroom/[batch]/live`. `/desk`, `/desk/new`, `/desk/[id]` redirect.

## Not in scope

Server-side batches, real rosters, recording. The Jitsi room name is unguessable per batch but meet.jit.si rooms are public to whoever has the name; a self-hosted Jitsi with auth is the production path.
