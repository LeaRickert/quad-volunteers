# UI Design: Quad Volunteers web app

Working goals for the Next.js frontend (`apps/web`). These docs describe *what* we are
building and *why*. Implementation happens milestone by milestone (see
[roadmap.md](roadmap.md)). Update these docs when a decision changes.

## Documents

| Doc | What it covers |
|---|---|
| [README.md](README.md) | Goals, users, principles, decisions (this file) |
| [design-system.md](design-system.md) | Colors, type, spacing, components, accessibility |
| [mockups/](mockups/README.md) | High-fidelity mockups of every main screen and state (canvas + offline previews) |
| [architecture.md](architecture.md) | Routes, server/client split, data fetching, identity, errors |
| [api-changes.md](api-changes.md) | Backend additions the UI needs |
| [roadmap.md](roadmap.md) | Milestones with acceptance criteria and the Next.js features each uses |
| [screens/](screens/) | One spec per screen: purpose, wireframes, states, criteria |

Mockups: [canvas](https://claude.ai/artifact/YJrgecHDxzqWU9T2PRHkgD) · [offline previews](mockups/preview/index.html)

Screens:
[layout & header](screens/01-layout-header.md) ·
[events list](screens/02-events-list.md) ·
[event detail](screens/03-event-detail.md) ·
[my sign-ups](screens/04-my-signups.md) ·
[manage events](screens/05-manage-events.md) ·
[manage users](screens/06-manage-users.md)

## Goal

This is **Phase 2 (Web UI v1)** of the [project spec](../spec.md). Later phases (auth,
hours, organizations, reports) will add screens here.


A friendly, mobile-first web app where volunteers find events and sign up, organizers
run events, and admins manage people. It's built with Next.js 16 (App Router) on top
of the existing NestJS API.

## Users

| Role | Main jobs | Sees |
|---|---|---|
| **Volunteer** | Find upcoming events, check spots left, sign up, cancel, see "my" events | Events, event detail (attendee *count* only), My sign-ups |
| **Organizer** | Everything a volunteer does, plus create/edit/delete events and see/remove attendees | + Manage events, attendee names and emails |
| **Admin** | Everything an organizer does, plus manage users and roles | + Manage users |

There is no authentication yet. The current user is chosen with a **"Viewing as" picker**
in the header (see [architecture.md](architecture.md#identity-viewing-as)). Role-based
hiding is **cosmetic** until the API enforces roles.

## Principles

1. **Mobile-first.** Design for ~375px wide, then enhance for tablet and desktop.
   Volunteer screens are primarily used on phones.
2. **Campus colors, clean lines.** Campus red for actions, gold highlights, cool grays.
   A linear/outline look softened by 6–8px corners and hairline shadows. Plain,
   encouraging copy ("Join this event", "You're in!").
3. **Server-first.** Pages are Server Components that fetch from the API. Client
   Components only where interaction needs them (picker, confirm step, pending state).
4. **Works without JavaScript where practical.** Forms post to Server Actions; search is
   a plain GET form. JS improves the experience (pending states, inline errors).
5. **Clear states.** Every screen defines loading, empty, error and not-allowed states.
6. **Errors where they happen.** Messages appear inline next to the form or button that
   caused them, never as a generic alert.
7. **Safe destructive actions.** Cancel and delete use a two-step confirm with the
   consequence stated ("7 sign-ups will be removed").
8. **Accessible by default.** WCAG AA contrast, labelled inputs, visible focus, keyboard
   reachable, `aria-live` for inline messages.

## Decisions (from the design interview, 2026-10-01)

| Topic | Decision |
|---|---|
| Scope v1 | Events list, event detail + sign-up, my sign-ups, manage events, manage users |
| Identity | "Viewing as" picker in header, stored in a cookie |
| Role UI | Show/hide navigation and actions by role (cosmetic until auth) |
| Styling | Plain Tailwind CSS 4 with our own small components (no component library) |
| Look & feel | *(revised 2026-10-02)* Campus palette from the original student project: red `#d0012b` primary, gold highlights, cool grays; clean linear/outline style with subtle radius and shadows. See [mockups](mockups/README.md) |
| Header | White, 3px red top rule, red underline on the active nav item |
| Typeface / icons | Geist / Lucide outline |
| Devices | Mobile-first |
| Events list | Cards grid, spots-left badge, "You're signed up" marker, past-events toggle, search/filter |
| Filtering | Done by the API (`GET /events?q=&from=&to=&past=`) |
| Attendees | Volunteers see a count, organizers/admins see names and emails and can remove people |
| Forms | Dedicated pages (`/manage/.../new`, `/manage/.../[id]/edit`) |
| Confirmation | Two-step confirm for cancel/delete |
| Feedback | Inline messages (no toasts) |
| Times | Shown in the campus time zone (`APP_TIME_ZONE`) |
| Dark mode | Follows the system setting; light is the primary target, and the events list is mocked in dark to prove the palette |

## Out of scope for v1

Real authentication, event ownership (organizers editing only their own events),
waitlists, pagination, notifications/email, images, maps, i18n, frontend automated
tests (see [roadmap.md](roadmap.md#open-questions)).
