# Plan: Web M2, Event detail (read-only)

**Status: planned.** Third milestone of Phase 2 (see [roadmap](../design/roadmap.md)).
Screen spec: [event detail](../design/screens/03-event-detail.md). Builds on
[M1](web-m1-events-list.md); the cards already link to `/events/[id]`.

## Goal

`/events/[id]` shows one event: title, date, time, location, description, and an
availability card (spots taken, badge, capacity bar), with loading, not-found and error
states. It is **read-only**: no Join or Cancel button yet. No backend work: `GET /events/:id`
already returns `signupCount` and also returns past events.

**Out of scope** (later milestones):
- Current user, "You're in" and the "Choose who you are" prompt: M3.
- Join, Cancel, success/error feedback, `ConfirmButton`: M4.
- Attendee list, "Organizer tools", Edit and Delete: M8 (and M7 for the edit page).

## Concepts this milestone introduces

| Concept | Where |
|---|---|
| Dynamic route segment `[id]`, async `params`, the global `PageProps<'/events/[id]'>` helper | `events/[id]/page.tsx` |
| `notFound()` + the `not-found.tsx` file convention | `events/[id]/` |
| `generateMetadata` (page title from data) and fetch memoization | `events/[id]/page.tsx` |
| Error mapping at the data layer (`ApiError` 404/400 → `null`) | `lib/api.ts` `getEvent` |
| CSS grid placement (`order` of columns vs DOM order) and `sticky` | `EventDetail` |
| Mocking `fetch` and aliasing `server-only` in Vitest | `lib/api.spec.ts` |

Read before coding (under `node_modules/next/dist/docs/01-app/03-api-reference/`):
`03-file-conventions/page.md` (params), `.../dynamic-routes.md`, `.../not-found.md`,
`04-functions/not-found.md`, `04-functions/generate-metadata.md`, `03-file-conventions/loading.md`
(status codes).

## Decisions

1. **`getEvent(id)` returns `Event | null`.** It maps `ApiError` 404 **and 400** to `null`
   and rethrows everything else. The 400 matters: the API validates ids with
   `ParseUUIDPipe`, so `/events/abc` is a 400, not a 404, and a visitor should see the same
   "not found" page for both. Network errors and 5xx propagate to `error.tsx`.
2. **The page calls `getEvent` from both `generateMetadata` and the page.** Next memoizes
   identical `GET` fetches within one render, so the API sees one request. No
   `React.cache` yet (that arrives with M3's current user). The verification checks it.
3. **No Join/Cancel placeholder.** In M2 the availability card shows facts only. A disabled
   button would be a UI that does nothing. The card is built with a place for the action
   (a child slot in `EventDetail`) that M3/M4 fill. Consequence: the note "You can cancel
   any time before the event starts." (it sits under the button in the mockups) waits for M4.
4. **A pure `EventDetail` component** (`event`, `timeZone`, `now`) renders the whole page
   body, so the page stays tiny and `/debug` can render every state from sample data
   (full, ended, unlimited…) without database setup.
5. **`loading.tsx` costs the 404 status.** With a streamed response Next returns HTTP 200
   for `notFound()` (the docs say so) and injects `noindex`. For a private campus app that's
   fine, and the spec asks for a skeleton, so we keep `loading.tsx`. Verification expects
   200 and the not-found UI, not a 404 from `curl`.
6. **Per-route `error.tsx`** ("We couldn't load this event.") instead of reusing the events
   list one, whose copy says "events". The list's boundary would still catch it otherwise.
7. **State copy comes from one pure helper**, `getSignupSummary(event, spots)` in
   `lib/spots.ts` (tested), so wording and pluralization aren't scattered in JSX:

   | `spots.kind` | Summary |
   |---|---|
   | plenty / few / full | **7 of 20** spots taken |
   | open (no limit) | **14** signed up |
   | ended | **18 volunteers** helped out (**1 volunteer** helped out) |

8. **`InlineMessage` ships with all three variants** (`info`, `success`, `error`) though M2
   only uses `info`. The tokens exist, `/debug` shows them, and M4 needs the other two
   immediately.

## Steps

One commit per step (or small group); check the app after each.

### 1. `getEvent` and testing the API client

Files: `lib/api.ts`, `lib/api.spec.ts` (new), `vitest.config.mts`.

- `getEvent(id): Promise<Event | null>` next to `getEvents`:
  ```ts
  try { return await apiFetch<Event>(`/events/${id}`); }
  catch (e) { if (e instanceof ApiError && (e.status === 404 || e.status === 400)) return null; throw e; }
  ```
  Encode the id (`encodeURIComponent`) so a path-like value can't change the URL.
- **Vitest can't import `server-only`** (it throws outside a Server Component). Alias it to
  an empty module in `vitest.config.mts` (`resolve.alias` → a one-line stub file under
  `src/test/`). This is the "fetch mock pattern worth keeping" promised in M1.
- `api.spec.ts`, with `vi.stubGlobal('fetch', vi.fn())` and `vi.stubEnv('API_URL', …)`:
  - `apiFetch`: parses JSON; returns `undefined` for 204; sends `cache: 'no-store'`; sets
    `Content-Type` only when there's a body; Nest's `message: string[]` and `string` both
    become `ApiError.messages`; a non-JSON error body still throws `ApiError`; a missing
    `API_URL` throws the readable error.
  - `getEvent`: returns the event; 404 → `null`; 400 → `null`; 500 rethrows `ApiError`; a
    network failure (fetch rejects) rethrows.
- **Verify:** `npm test -w web`, lint, `tsc`.

### 2. Pure helper and small components

- `lib/spots.ts`: add `getSignupSummary(event, spots)` (decision 7). Tests in `spots.spec.ts`:
  each kind, 0 sign-ups, singular/plural for ended, unlimited.
- `CapacityBar`: add `size?: 'md' | 'lg'` (6px for cards, 8px on the detail card).
- `components/InlineMessage.tsx`: `variant` `info` (white, gray-500 border, info icon) ·
  `success` (gold-tint, gold-400 border, check icon) · `error` (red-tint, red-400 border,
  alert icon), a bold title and optional body, `role="status"` with `aria-live="polite"`.
  Use semantic tokens so dark mode works (gold/red tint backgrounds need dark equivalents:
  check `/debug` in dark mode before moving on; add tokens if they read badly).
- Add all three to `/debug`.

### 3. `EventDetail` component

`components/EventDetail.tsx` (Server Component, no data fetching):

- Layout: single column on mobile in this DOM order: header (back link, eyebrow, `h1`,
  meta rows), availability card, "About this event". At `lg`: a two-column grid; header and
  About in column 1, the card in column 2 spanning both rows with
  `lg:self-start lg:sticky lg:top-6` (the card stays in view while the description scrolls).
- Header: `ArrowLeft` "All events" link to `/events`; eyebrow `formatEyebrow`; `h1`
  (34px/600 on desktop, 26px on mobile per the design system); meta rows with
  `Calendar` (`formatDateLong`), `Clock` (`formatTimeRange`), `MapPin` (location); icons are
  `aria-hidden`. Long titles and locations wrap (`break-words`).
- "About this event" `h2` and the description with `whitespace-pre-line` (it's plain text from
  a textarea); omitted when `description` is `null` or empty.
- Availability card (`shadow-card` surface): the `getSignupSummary` line + `SpotsBadge`; an
  8px `CapacityBar` (not for unlimited or ended events); then by state:
  - **full**: "This event is full" + "Spots open up if someone cancels, so check back later." +
    a secondary "Browse other events" link (`buttonStyles`);
  - **ended**: an `info` `InlineMessage` "This event has ended." / "Sign-ups and cancellations
    are closed.";
  - **otherwise** nothing more yet; `children` renders at the bottom for M4's action area.
- `/debug`: a section rendering `EventDetail` for four sample events (plenty, full, ended,
  unlimited), plus one with `description: null` and a very long title.

### 4. Route files

`app/events/[id]/`:

- `page.tsx`: `export async function generateMetadata({ params }: PageProps<'/events/[id]'>)`
  returns `{ title: event.title }`, or `{ title: 'Event not found' }` for `null`. The page:
  `const { id } = await params; const event = await getEvent(id); if (!event) notFound();`
  then `<EventDetail event timeZone now />`.
- `loading.tsx`: `DetailSkeleton` mirroring the layout (same grid, same row heights; bars use
  `bg-border`, with the `role="status"` + `sr-only` pattern from the events list).
- `not-found.tsx`: `EmptyState` (`CalendarX`), title "We couldn't find that event.", a
  "Browse events" link-button to `/events`.
- `error.tsx` (`'use client'`, decision 6): `EmptyState` with `CircleAlert`, "We couldn't load
  this event.", `Try again` calling `retry()`.

### 5. Docs

- This plan: status → implemented, record deviations and verification status.
- `roadmap.md`: M2 ✅; `AGENTS.md`: layout, "Next" section; `design-system.md`: `InlineMessage`
  (already specced) and `EventDetail`, `CapacityBar` sizes; screen spec 03: note which states
  are built (M2) and which wait.

## Verification

Automated:
- `npm test` (API + web), `npm run lint`, `npm run build` pass; build output shows
  `ƒ /events/[id]`.
- No API change, so no Postman change; newman still passes.

Manual (API + web running; the dev data from M1 covers every state):
- [ ] Clicking a card opens its page; the URL is `/events/<uuid>`; the tab title is the event's
      title plus " · Quad Volunteers".
- [ ] Arboretum (7 of 20): "**7 of 20** spots taken", "13 spots left", gold bar at 35%.
- [ ] Food Pantry: "Last spot"; Library: "Only 2 left"; Overnight Shelter (6 of 6): "Full",
      dark bar, the full message and "Browse other events"; Open Campus Day: "**5** signed up",
      "Open to all", no bar.
- [ ] An ended event (the old "Park cleanup", or one you create): "Ended", "**N volunteers**
      helped out", the info message, no bar.
- [ ] The overnight event shows "7:00 PM – Oct 31, 7:00 AM"; the dates match the list card.
- [ ] An event with no description has no "About" section; a very long title/location wraps
      with no horizontal scroll at 375px.
- [ ] `/events/00000000-0000-0000-0000-000000000000` (valid, unknown) and `/events/abc`
      (invalid) both show "We couldn't find that event."; `curl -I` returns **200** (decision 5)
      with a `noindex` meta in the body.
- [ ] Memoization: temporarily log in `apiFetch`; loading one detail page logs one
      `GET /events/:id`, not two. Remove the log.
- [ ] Loading: temporarily delay the page 2 s; the skeleton matches the layout (no jump).
- [ ] Error: stop the API; "We couldn't load this event." appears; restart and "Try again"
      recovers.
- [ ] 375px: single column, the card sits between the meta rows and About. 1024px+: two
      columns, the card is sticky while scrolling a long description.
- [ ] Keyboard: Tab order is back link → (card contents) → footer; focus rings visible; the
      "Browse other events" link works.
- [ ] Dark mode: `InlineMessage` variants, the bar and badges are legible.
- [ ] Console: no errors or hydration warnings.

## Acceptance (from [03-event-detail.md](../design/screens/03-event-detail.md), the parts M2 covers)

- [ ] Full, ended and unlimited events render their action-area states correctly.
- [ ] Unknown id shows the not-found page.
- Deferred: join/cancel and every state that depends on the current user (M3, M4); "Attendee
  names and emails are hidden from volunteers" and the staff section (M8).

## Open questions

- Decision 3 (no action placeholder) and decision 5 (`loading.tsx` costs the 404 status) are the
  two judgment calls; say if you'd rather show a disabled "Join this event" button, or drop
  `loading.tsx` from this route to get a real 404.
