# Quad Volunteers: project spec

Last updated: 2026-10-12. This is the single source for **what** we're building and
**in what order**. How things look lives in [design/](design/README.md), and how
features are built lives in [plans/](plans/). Update this file whenever a goal or
priority changes.

## Vision

A campus volunteering app where students find volunteer events, sign up and keep a
record of their hours, and where student organizations run their events and report on
them.

It serves two kinds of volunteers equally:
- **Volunteers who need hours** for a course, scholarship, certification or community
  service requirement. They set their own hour goals and track progress toward them
  with hours that qualify.
- **Volunteers who just want to help.** Goals stay out of their way; they still get a
  record of their hours.

It's a rebuild of a student project from years ago that tracked volunteer hours for
an on-campus organization: a NestJS API, a Next.js web app and PostgreSQL.

## Users

| Role | Who | Main goals |
|---|---|---|
| **Volunteer** | Any student with a campus email | Find events, sign up, cancel, see their hours, and optionally track progress toward their own hour goals |
| **Organizer** | Student leader of an organization (per-org from Phase 5) | Run events, check volunteers in and out, confirm hours, see reports |
| **Admin** | Site administrator (e.g. the student activities office) | Manage users, roles, organizations and hour types; campus-wide reports |

Until Phase 3 there's no sign-in: a "Viewing as" picker stands in for identity, and
roles are a single field on the user.

## Phases at a glance

| Phase | Goal | Status | Key technical work |
|---|---|---|---|
| 1 | API foundation: users, events, sign-ups | ✅ Done | Nest modules, DI, TypeORM, DTO validation, transactions, unit tests |
| 2 | Web UI v1 | 🎨 Designed ([design docs](design/README.md), [roadmap M0–M9](design/roadmap.md)) | App Router, Server Components, Server Actions, forms, caching |
| 3 | Authentication & permissions | Planned | Migrations, Passport + JWT, guards, custom decorators, httpOnly cookies, `proxy.ts` |
| 4 | Volunteer hours & goals | Planned | State transitions, timestamps and duration math, optimistic UI, many-to-many tags, computed progress queries |
| 5 | Organizations | Planned | Many-to-many with roles, resource-level authorization, data migrations |
| 6 | Reports & exports | Planned | Aggregate queries (GROUP BY), date ranges, CSV generation, Route Handlers for downloads |
| 7 | Notifications | Planned | Email sending, templates, scheduled jobs, verification and reset tokens |

Each phase gets its own plan in `docs/plans/` before implementation, and ends with
tests, Postman requests (API) and updated docs.

## How to read the stories

Format: **ID: As a *role*, I want *…* so that *…*.**, followed by acceptance criteria.
Status: ✅ done · 🎨 designed · ⬜ planned. Priority: **Must** / **Should** / **Could**.

---

## Phase 1: API foundation ✅

| ID | Story | Status |
|---|---|---|
| F-1 | As an organizer, I want to create, edit and delete events (title, description, location, start/end, optional capacity) so that volunteers know what's happening. | ✅ |
| F-2 | As an admin, I want to create, edit and delete users with a role (volunteer / organizer / admin) so that people have the right access. | ✅ |
| F-3 | As a volunteer, I want to sign up for an event and cancel, so that organizers know I'm coming. Rules: no duplicates (409), capacity enforced and race-safe (409), no sign-up or cancel after the event starts (400). | ✅ |
| F-4 | As a volunteer, I want to see the events I signed up for, and organizers want to see who signed up for an event. | ✅ |

Details: AGENTS.md "Requirements" and [plans/signups.md](plans/signups.md).

## Phase 2: Web UI v1 🎨

Full specs, states and acceptance criteria are in the [screen specs](design/screens/);
the build order is in [design/roadmap.md](design/roadmap.md).

| ID | Story | Priority | Spec |
|---|---|---|---|
| W-1 | As a volunteer, I want to browse upcoming events with date, location and spots left so that I can find one that fits. | Must | [events list](design/screens/02-events-list.md) |
| W-2 | As a volunteer, I want to search by title or location and filter by date. | Should | [events list](design/screens/02-events-list.md) |
| W-3 | As a volunteer, I want an event page with full details and one clear Join / Cancel action. | Must | [event detail](design/screens/03-event-detail.md) |
| W-4 | As a volunteer, I want a list of my upcoming and past sign-ups, and to cancel from there. | Must | [my sign-ups](design/screens/04-my-signups.md) |
| W-5 | As an organizer, I want to create, edit and delete events with clear validation errors. | Must | [manage events](design/screens/05-manage-events.md) |
| W-6 | As an organizer, I want to see who's signed up (with emails) and remove someone. | Should | [event detail](design/screens/03-event-detail.md) |
| W-7 | As an admin, I want to manage users and their roles. | Must | [manage users](design/screens/06-manage-users.md) |
| W-8 | As a developer, I want a "Viewing as" picker so that I can try every role before sign-in exists. | Must | [layout & header](design/screens/01-layout-header.md) |

API work this phase needs is listed in [design/api-changes.md](design/api-changes.md):
`signupCount` and filters on `GET /events` (upcoming by default, `past` for organizers, search and date range).

## Phase 3: Authentication & permissions ⬜

Replace "Viewing as" with real accounts, and have the API enforce who may do what.

**Prerequisite:** replace `synchronize: true` with **TypeORM migrations**. Phase 3 is the
first change to existing tables that hold real data.

| ID | Story | Priority |
|---|---|---|
| A-1 | As a student, I want to register with my campus email and a password so that I can sign up for events. | Must |
| A-2 | As a user, I want to sign in and sign out, and stay signed in between visits. | Must |
| A-3 | As a volunteer, I want sign-up and cancel to act on *my* account, so that nobody can sign up or cancel for me. | Must |
| A-4 | As the system, I want organizer and admin actions enforced by the API so that hidden buttons aren't the only protection. | Must |
| A-5 | As an admin, I want to promote users to organizer or admin. | Must |
| A-6 | As a user, I want to change my name and password. | Should |

Acceptance criteria:

- **A-1**
  - Registration accepts only emails whose domain is in the app config
    `ALLOWED_EMAIL_DOMAINS` (comma-separated, e.g. `campus.edu`), case-insensitive,
    with exact domain match (so `x@campus.edu.evil.com` is rejected).
  - The message reads "Use your @campus.edu email".
  - The setting is read by the API through `ConfigService` and shown in the web form.
  - Passwords: at least 10 characters, hashed with a slow hash (argon2 or bcrypt),
    never returned by the API.
  - A duplicate email gets a 409.
  - New accounts are volunteers.
- **A-2**
  - The API issues a short-lived JWT (Passport).
  - Next.js stores it in an **httpOnly, secure, SameSite** cookie, so browser JavaScript can't read it.
  - Signed-out users are redirected to sign in for protected pages (`proxy.ts` or layout checks).
  - Sign-out clears the cookie.
- **A-3**
  - `POST /events/:id/signups` takes no `userId`; the API uses the token's user.
  - Volunteers can only cancel their own sign-ups; organizers and admins can remove anyone.
- **A-4**
  - Guards plus a `@Roles()` decorator, and a `@CurrentUser()` decorator.
  - Not signed in → 401; signed in without permission → 403.
  - The web shows the "not allowed" screen for 403.
  - Server Actions re-check identity too.
- **A-5**
  - The first admin is created with a seed script or CLI command, never through public registration.
- "Viewing as" is removed; the header shows the signed-in user and a sign-out link.

**Known gap until Phase 7:** without email verification, anyone can *type* a campus
address. The domain rule keeps out casual sign-ups, but it doesn't prove someone owns
the address. N-4 closes this gap.

## Phase 4: Volunteer hours & goals ⬜

The original project's core feature, in two parts:

1. **Hours:** organizers record attendance **during** the event with a fast
   check-in/check-out roster, then adjust or fill in hours afterwards. Volunteers never
   edit their own hours.
2. **Goals:** events are tagged with the **hour types** they count as (e.g. Community
   service). Volunteers who need hours add their own goals and see progress from
   qualifying hours.

### Hours

| ID | Story | Priority |
|---|---|---|
| H-1 | As an organizer at an event, I want a roster where I can check each volunteer in and out with one tap so that hours are recorded as they happen. | Must |
| H-2 | As an organizer after an event, I want to review attendance, mark no-shows, and set or adjust each person's hours so that the record is correct even if check-out was missed. | Must |
| H-3 | As an organizer, I want to mark everyone still checked in as finished at the event's end time, in one action. | Should |
| H-4 | As a volunteer, I want to see my confirmed hours per event and my total, so that I have a record of my service. | Must |
| H-5 | As an organizer, I want to add a walk-in volunteer to the roster. | Could (see open questions) |

Acceptance criteria:

- **H-1**
  - Roster page per event: mobile-first, large touch targets, a search box for long lists.
  - Each row shows the state (*not arrived*, *checked in* with its time, *checked out*
    with its time and duration) and one primary button for the next step.
  - Undo is available for a few seconds after each tap.
  - Available from 1 hour before the event starts until 24 hours after it ends.
  - Works on a phone with a weak connection: the button responds instantly
    (optimistic UI) and the change syncs.
- **H-2**
  - Attendance per sign-up: `signed_up` → `checked_in` → `attended`, or `no_show`.
  - Hours = check-out − check-in, rounded to the nearest 0.25h.
  - Defaults when times are missing: no check-out → event end; no times at all but
    marked attended → event duration.
  - The organizer can override hours (0–24, steps of 0.25), and the record shows it was adjusted.
- **H-4**
  - Only `attended` sign-ups count.
  - Hours appear on My sign-ups (past events) and on the **My hours** screen (G-3) as
    a total ("12.5 hours this term") with a history.
- Data: the sign-up gains `attendance`, `checkedInAt`, `checkedOutAt` and `hours`
  (decimal), plus who last edited the hours and when. This is a migration.

### Hour types & goals

| ID | Story | Priority |
|---|---|---|
| G-1 | As an admin, I want to manage hour types (e.g. Community service, Peer education) so that events can say what kind of service they count as. | Must |
| G-2 | As an organizer, I want to tag an event with the hour types it counts as, or none, so that volunteers know whether it counts toward their requirements. | Must |
| G-3 | As a volunteer, I want a **My hours** screen with my total confirmed hours and my history, so that I have a record whether or not I have a goal. | Must |
| G-4 | As a volunteer who needs hours, I want to add, edit and delete my own goals on My hours (target, hour types that count, dates), so that I can track a requirement. | Must |
| G-5 | As a volunteer with goals, I want each goal's progress, deadline and pace (on track / behind), with the events that counted, so that I know where I stand. | Must |
| G-6 | As a volunteer with goals, I want to see which events count toward my goals: a badge on event cards, a filter on the events list, and a note on the event page. | Should |

Acceptance criteria:

- **G-1**
  - Each hour type has a unique name and a short description.
  - Seeded defaults: *Community service*, *Peer education*.
  - Types can be renamed or **deactivated**, but a type in use can't be deleted.
    Deactivated types disappear from the event form but stay on past events and goals.
- **G-2**
  - The event form has a multi-select for hour types; it can be empty.
  - Event detail lists the types, e.g. "Counts as: Community service".
  - An event with **no** types is plain volunteering: its hours still go into the
    volunteer's total and history, but never toward a goal.
- **G-3**
  - **My hours** (`/me/hours`) is reached from the main navigation.
  - It shows total confirmed hours, hours this term, and a history table (event, date,
    hour types, hours, attendance).
  - Goal cards appear only if the volunteer has added goals.
  - There's an "Add a goal" action.
- **G-4**
  - A goal has:
    - a title (e.g. "Peer Ed certification")
    - target hours (0.25–1000, steps of 0.25)
    - at least one accepted hour type
    - a start date (default today)
    - an optional due date (on or after the start)
    - an optional note (e.g. "Submit to Dr. Lee")
  - **Goals are opt-in and set only by the volunteer.** Nothing at registration or
    sign-up asks about them, and admins and organizations can't assign them.
  - **Goals are private.** Only their owner can see them; the API scopes
    `/me/goals` to the signed-in user.
- **G-5**
  - Progress counts the volunteer's `attended` hours from events whose start falls
    within the goal's window and that share at least one hour type with the goal.
  - Hours count toward **every** matching goal.
  - Progress is calculated when requested (a query), not stored.
  - Status:
    - **completed** once progress reaches the target (and stays completed)
    - **past due** when the due date passes before that
    - otherwise **active**
  - Pace (only with a due date): *on track* if progress/target ≥ the share of the
    window that has passed; otherwise *behind*.
- **G-6**
  - Shown only to volunteers with at least one active goal.
  - The badge "Counts toward your goal" appears when the event matches an active
    goal's hour types and window.
  - The events-list filter "Counts toward my goals" is a GET parameter, like the other filters.
  - On the event page, joining shows "Counts toward: Peer Ed certification".
- Data: new `HourType`, an event ↔ hour type join table, and `Goal` with a goal ↔ hour
  type join table. These are migrations.

## Phase 5: Organizations ⬜

Events belong to student organizations. Events stay **public** (any volunteer can
join any event), but organizers only manage their own organization's events.

| ID | Story | Priority |
|---|---|---|
| O-1 | As an admin, I want to create organizations (name, short description) and assign organizers to them. | Must |
| O-2 | As an organizer, I want every event I create to belong to my organization, and to manage only my organization's events, rosters and hours. | Must |
| O-3 | As a volunteer, I want to see which organization runs an event and filter events by organization. | Must |
| O-4 | As a volunteer, I want an organization page with its description and upcoming events. | Should |
| O-5 | As an organizer of several organizations, I want to choose which one an event belongs to. | Should |

Acceptance criteria:

- **Role model change:**
  - Site roles become `volunteer` | `admin`.
  - "Organizer" becomes a per-organization membership (`OrganizationMember` with
    role `organizer`).
  - A migration moves today's organizers into a default organization.
- **Authorization:**
  - Checks become resource-level ("is this user an organizer of *this event's* organization?").
  - Admins can do everything.
- **Events:**
  - Events get a required `organizationId`; existing events move to the default organization.
  - Event cards and pages show the organization name.

## Phase 6: Reports & exports ⬜

| ID | Story | Priority |
|---|---|---|
| R-1 | As a volunteer, I want my hours by term with a list of events, and to download it as CSV, so that I can show my service record (e.g. for a scholarship). | Must |
| R-2 | As an organizer, I want a report of my organization's hours per volunteer and per event for a date range, exportable as CSV. | Must |
| R-3 | As an organizer, I want an attendance summary per event: signed up, attended, no-shows, total hours. | Should |
| R-4 | As an admin, I want campus-wide totals per organization and per term. | Should |
| R-5 | As a volunteer with a goal, I want to export a service record for that goal (CSV and a printable page) listing each counted event, date, hour type, hours and the confirming organizer, so that I can hand it to an advisor or program. | Must |

Acceptance criteria:

- Date range filter with presets for terms. Term dates live in config (e.g. Fall:
  Aug 20–Dec 20).
- Totals are calculated in the database (GROUP BY), not by loading every row.
- CSV downloads come from a Next.js Route Handler (or the API) with sensible file
  names, like `hours-maya-chen-fall-2026.csv`.
- Only `attended` hours count. Reports respect permissions: volunteers see their own,
  organizers see their organizations, admins see everything.
- Personal goals stay private: organizer and admin reports show hours, never
  volunteers' goals.

## Phase 7: Notifications ⬜

| ID | Story | Priority |
|---|---|---|
| N-1 | As a volunteer, I want an email confirming my sign-up or cancellation, with the event details. | Must |
| N-2 | As a volunteer, I want a reminder email 24 hours before an event I signed up for. | Must |
| N-3 | As a user, I want to turn off reminder emails. | Should |
| N-4 | As a new user, I want to verify my email address, and as a user I want to reset a forgotten password, so that accounts really belong to campus students. | Must |
| N-5 | As an organizer, I want an email when my event becomes full or someone cancels close to the start. | Could |

Acceptance criteria:

- Emails go through a provider abstraction. In development, a local mail catcher
  (e.g. Mailpit in Docker) captures them, so no real email is sent.
- Reminders are a scheduled job (`@nestjs/schedule`) that runs safely more than once:
  no duplicate reminders.
- **N-4:**
  - Unverified accounts can sign in but can't sign up for events.
  - Verification and reset links are single-use and expire (24h / 1h).

---

## Configuration (new settings by phase)

| Setting | Phase | Example |
|---|---|---|
| `ALLOWED_EMAIL_DOMAINS` | 3 | `campus.edu` |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | 3 | random secret, `1h` |
| `TERMS` | 6 | `Fall:08-20:12-20,Spring:01-10:05-15` |
| `MAIL_*` (host, from address) | 7 | Mailpit on `localhost:1025` in dev |

## Not planned (for now)

- **Waitlists:** join a waitlist when an event is full.
- **Recurring events and shifts:** weekly events, multiple time slots per event.
- **Deployment and CI:** public hosting. Revisit after Phase 3. Migrations (Phase 3)
  are a prerequisite.
- **Assigned requirements:** admins or organizations assigning hour goals to
  volunteers. Goals are personal only.
- **Goal prompts:** asking about hour requirements at registration or sign-up. Goals
  live only on My hours.
- Native mobile app, payments, chat, maps, i18n.

## Open questions

- **Walk-ins (H-5):** can organizers check in someone who didn't sign up, and does that
  ignore capacity?
- **Check-in by volunteers:** should volunteers be able to check *themselves* in (e.g.
  scanning a QR code at the event), with the organizer confirming? Today's decision is
  organizer-only.
- **Hours lock:** should hours become read-only after some time (e.g. end of term) so
  reports stay stable?
- **Term definitions:** a fixed config list, or managed by admins in the app?
- **Past-due goals:** once the due date passes, should later hours stop counting
  (current rule: only events within the window count), or count separately as "late"?
- **"Any type" goals:** can a personal goal accept every hour type, e.g. "50 hours of
  any service", or must it list specific types?
- **Event ownership vs organizations:** is "my organization's events" enough, or do
  events also need a specific owner or contact person?
