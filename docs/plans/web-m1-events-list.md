# Plan: Web M1, Events list (read-only)

**Status: planned.** Second milestone of Phase 2 (see [roadmap](../design/roadmap.md)).
Screen spec: [events list](../design/screens/02-events-list.md). Builds on
[M0](web-m0-foundations.md).

## Goal

`/events` shows upcoming events as cards (date in the viewer's time zone, location,
spots badge, capacity bar) with loading, empty and error states. It starts with a small
API change (`signupCount`), because the cards can't show spots without it.

**Out of scope** (later milestones, so M1 stays one slice):
- "You're in" badge, "Create event" button in the empty state: need the current user (M3).
- Search, date filters, Upcoming/Past switch, "Clear filters": M6 (with API change 2).
- The event detail page the cards link to: M2. Until then the links 404.

## Concepts this milestone introduces

| Concept | Where |
|---|---|
| TypeORM `@VirtualColumn` (a computed, read-only field backed by a SQL subquery) | API `event.entity.ts` |
| Server Component data fetching, independent reads in parallel (`Promise.all`) | `events/page.tsx` |
| `loading.tsx` (Suspense boundary per route) and `error.tsx` (client error boundary) | `events/` |
| `cookies()` (async in Next 16) read in a layout | `layout.tsx`, `lib/tz-cookie.ts` |
| Client Component with `useEffect` + `router.refresh()` | `TimeZoneSync` |
| `Intl.DateTimeFormat` with an explicit `timeZone` | `lib/time.ts` |
| Unit tests for the web app (Vitest) | `lib/*.test.ts` |

Read before coding (under `node_modules/next/dist/docs/01-app/`):
`01-getting-started/06-fetching-data.md`, `03-api-reference/03-file-conventions/loading.md`,
`.../error.md`, `.../04-functions/cookies.md`, `.../use-router.md`.

## Decisions

1. **`signupCount` via `@VirtualColumn`.** `loadRelationCountAndMap`, the first idea in
   [api-changes.md](../design/api-changes.md), no longer exists in the installed TypeORM
   (1.1.1). `@VirtualColumn({ query })` declares a read-only property whose value is a SQL
   subquery, selected with every normal `find`/`findOneBy`. So the service code and its
   unit tests barely change, and the count is available wherever an `Event` is loaded.
   Trade-offs: raw SQL with hard-coded table/column names lives in the entity, and the
   count is computed on every load, including the ones in `SignupsService` and
   `EventsService.update` that don't need it (a cheap indexed count at this scale).
   *Alternatives:* (a) query builder with `addSelect(subquery)` and `getRawAndEntities()`,
   merging raw rows into entities by hand: more code and awkward to mock; (b) one grouped
   `COUNT ... GROUP BY eventId` query in the service, merged into the list in code: no
   raw SQL in the entity, but a second query and merge logic to test.
   Add `@Index(['eventId'])` to `Signup`: Postgres doesn't index foreign keys, and the
   unique `(userId, eventId)` index can't serve a lookup by `eventId` alone.
2. **`GET /events` and `GET /events/:id` always return `signupCount`; `POST` doesn't.**
   `PATCH` goes through a locked `manager.findOne`, so it returns the value read before
   the edit (a capacity edit never changes it, so it stays correct). `POST` returns the
   freshly saved entity, which has none. The web `Event` type declares it as required
   because the web only types list/detail responses; M7's forms redirect after saving and
   never read it from a mutation response.
3. **"Upcoming" in M1 is filtered in the page** (`endsAt >= now`), because the API's
   `past` filter is M6's API change 2. It's a one-line temporary filter, removed in M6.
   *Alternative:* show every event including past ones, with the "Ended" badge; simpler,
   but the heading "Upcoming events" would lie.
4. **Time zone cookie, as designed in `architecture.md`.** Reading `cookies()` in the
   root layout makes every route dynamic; fine (all pages read the API per request, and
   M3's "Viewing as" needs cookies anyway). The cookie is user-controlled input, so the
   server validates it and falls back to UTC.
5. **Pure logic in `lib/`, tested with Vitest**: `time.ts` (formatting) and `spots.ts`
   (badge state). Components stay thin. Server Components and the cookie sync get
   manual checks; React Testing Library and Playwright stay deferred to M4.
6. **`Button` is introduced now**, minimal (`primary` and `secondary`, 44px), because
   `error.tsx` needs "Try again". M4 adds the pending state and the danger variants.
7. **Whole card is one link** via the stretched-link pattern: the title is the `<Link>`
   with an `after:absolute after:inset-0` pseudo-element, the card is `relative`. One
   tab stop per card and the title is the accessible name, as the spec asks.
8. **Next.js 16 `error.tsx` retry prop.** The docs show `retry()`, but the version table
   calls it `unstable_retry` (added 16.2). Check which name the installed 16.3.6 types
   expose before writing it.

## Steps

One commit per step (or per small group), checking the app after each.

### 1. API: `signupCount` (API change 1)

Files: `apps/api/src/events/entities/event.entity.ts`,
`apps/api/src/signups/entities/signup.entity.ts`, `apps/api/postman/…collection.json`,
and optionally a small `events.service.spec.ts` addition.

- **Entity:** add the virtual column. The subquery receives the table alias TypeORM
  uses, and the column names must be double-quoted (they're camelCase):
  ```ts
  // Computed by Postgres on every load; read-only, never written.
  @VirtualColumn({
    type: 'int',
    query: (alias) =>
      `SELECT COUNT(*)::int FROM "signups" WHERE "signups"."eventId" = ${alias}."id"`,
  })
  signupCount?: number;
  ```
  The `::int` cast matters: Postgres `COUNT` is a `bigint`, which the `pg` driver
  returns as a **string**; the cast keeps the JSON value a number. Confirm the exact
  `VirtualColumn` option names and the alias format in the installed TypeORM before
  writing it (the types are in `node_modules/typeorm/decorator/options/`).
- **Signup entity:** `@Index(['eventId'])` next to `@Unique`. `synchronize` creates it.
- **Service:** no change. `findAll`, `findOne` and `SignupsService`'s calls keep working;
  `findAll` ordering is untouched.
- **Unit tests:** existing service tests stay green. They mock the repository, so they
  can't prove the count is loaded; that's what Postman is for (same as the other
  DB-dependent rules). Optional: a test that reads the entity metadata
  (`getMetadataArgsStorage().columns`) to assert the virtual column exists, if you want
  a guard against it being removed.
- **Postman:**
  - "List events" and "Get event": add `signupCount is a number` (this also catches the
    `bigint`-as-string problem).
  - In the Signups folder, after "Sign up B" add **"Get event: signupCount is 2"** and
    after "Cancel A" **"Get event: signupCount is 1"** (the folder already creates its
    own capacity-2 event). The existing "Lower capacity below sign-ups (409)" request
    already exercises the locked `PATCH` path with the virtual column in the select.
- **Docs:** [api-changes.md](../design/api-changes.md) item 1 already names the
  `@VirtualColumn` approach; mark it done once implemented;
  `AGENTS.md` Requirements table notes `signupCount` on GET responses and the
  `@VirtualColumn` pattern.
- **Verify:** `npm test -w api`, `npm run lint -w api`, `npm run build -w api`, then
  `npx newman run apps/api/postman/quad-volunteers.postman_collection.json` against a
  running API; and `curl localhost:3001/events` shows a numeric `signupCount` on every
  event. Also check `PATCH /events/:id` with a new capacity still works (lock +
  virtual column in the same query).

### 2. Web: type and fetch helper

- `lib/types.ts`: `Event` gains `signupCount: number` (see decision 2).
- `lib/api.ts`: add `getEvents(): Promise<Event[]>` (`apiFetch<Event[]>('/events')`).
  Typed helpers live next to `apiFetch`, one per endpoint, added when first used.
- Delete the M0 stub's direct `apiFetch` call when the page is rewritten (step 8).

### 3. Web: Vitest

- `npm install -D vitest -w web`; `apps/web/vitest.config.ts` with the `@/*` alias
  (mirror `tsconfig.json` `paths`) and `environment: 'node'`.
- Script `"test": "vitest run"` in `apps/web/package.json`; root `"test"` runs both
  workspaces (`npm run test -w api && npm run test -w web`); update the README scripts
  table.
- Check `tsconfig` includes `*.test.ts`, and ESLint doesn't flag the test globals
  (import `describe/it/expect` explicitly, which avoids the problem).

### 4. `lib/time.ts` (pure, tested)

All functions take an IANA time zone argument, so they're deterministic:

| Function | Example output |
|---|---|
| `formatEyebrow(iso, tz)` | `SAT · OCT 10` |
| `formatDateLong(iso, tz)` | `Saturday, October 10` |
| `formatTimeRange(startIso, endIso, tz)` | `9:00 AM – 12:00 PM`; if the end falls on another day in `tz`, the end includes the date (`9:00 PM – Oct 11, 1:00 AM`) |
| `resolveTimeZone(value)` | returns `value` if `Intl` accepts it, else `'UTC'` (cookie is untrusted) |

Use `Intl.DateTimeFormat('en-US', { timeZone, … })`, building the eyebrow from parts
(`formatToParts`) so the separators are ours, not the locale's. Tests (`time.test.ts`):
same instant in two zones (`America/Los_Angeles` vs `Europe/Berlin`) gives different
day/time, midnight-crossing range, a DST-change date, invalid zone → `UTC`, `undefined`
→ `UTC`.

### 5. Time zone cookie

- `lib/tz-cookie.ts` (`server-only`): `getTimeZone()` reads `await cookies()` → `tz`,
  passes it through `resolveTimeZone`. Also returns whether the cookie existed.
- `components/TimeZoneSync.tsx` (`'use client'`): props `current: string | null` (what
  the server used). In `useEffect`, read
  `Intl.DateTimeFormat().resolvedOptions().timeZone`; if it differs from `current`, set
  `document.cookie = 'tz=<zone>; path=/; max-age=31536000; samesite=lax'` and call
  `router.refresh()` **once** (the effect only runs when the values differ, so no loop).
  Renders `null`.
- `layout.tsx` (make the component `async`): `const { zone, known } = await getTimeZone()`
  and render `<TimeZoneSync current={known ? zone : null} />`.
- First visit renders in UTC (labelled, per the architecture doc), then refreshes into
  local time. Accept the one-time flash; it's the trade-off of server-rendered dates.
  Note it in `architecture.md`.

### 6. `lib/spots.ts` (pure, tested)

`getSpots(event, now: Date)` returns a discriminated union the UI maps to a badge:

| Condition (checked in this order) | Result |
|---|---|
| `endsAt < now` | `{ kind: 'ended' }` |
| `capacity === null` | `{ kind: 'open' }` ("Open to all", no bar) |
| `left <= 0` | `{ kind: 'full' }` |
| `left <= 3` | `{ kind: 'few', left }` ("Only N left" / "Last spot" when 1) |
| otherwise | `{ kind: 'plenty', left }` ("N spots left") |

Tests: each row, boundaries at 3 / 4 left, `left` negative (capacity edited below
count can't happen via the API, but don't render "-1"), ended-and-full is "ended".

### 7. Components (`components/`, Server Components unless noted)

Specs in [design-system.md](../design/design-system.md); mockups `EventsDesktop`,
`EventsMobile`, `EventsDesktopDark`.

- `Badge`: pill, 24px, 12px/600, optional lucide icon. Variants used now: `neutral`
  (spots left), `warning` (few left: red outline + clock icon), `full` (gray-800 fill),
  `outline` (open to all, users icon), `ended` (history icon). The gold "You're in"
  variant waits for M3.
- `CapacityBar`: `taken`, `capacity`; 6px track, gold-400 fill (gray-800 when full),
  `role="img"` + `aria-label="7 of 20 spots taken"`. Not rendered for unlimited.
- `EventCard`: props `event`, `timeZone`, `now`. Eyebrow date, title link (stretched),
  time and location rows (lucide `clock`, `map-pin`, 16px, `muted`), divider, "7 of 20
  signed up" with `tabular-nums` + badge, bar. Shadow `shadow-card`, radius `rounded-card`.
- `EmptyState`: dashed `border-border-strong` card, icon circle, title, sentence, optional
  action slot.
- `Button`: see decision 6. Renders a `<button>`; a link variant is `<Link>` with the same
  class helper (export a `buttonStyles()` helper rather than polymorphism).

### 8. Events page, loading, error

- `events/page.tsx` (rewrite the M0 stub): `export const metadata = { title: 'Events' }`;
  `const [events, { zone }] = await Promise.all([getEvents(), getTimeZone()])`; filter
  upcoming (decision 3, with a `// removed in M6` comment); heading "Upcoming events",
  count line ("6 upcoming events", singular for 1); grid `grid-cols-1 sm:grid-cols-2
  lg:grid-cols-3 gap-4`; `EmptyState` ("No upcoming events yet. Check back soon!") when
  empty. One `now = new Date()` per render, passed down.
- `events/loading.tsx`: heading skeleton + 6 card skeletons matching the card height
  (`animate-pulse`, honors reduced motion via the global rule).
- `events/error.tsx` (`'use client'`): "We couldn't load events." + `Button` "Try again"
  calling the retry prop (decision 8). Log nothing; `error.digest` matches server logs.

### 9. Docs

- This plan: status → implemented, record deviations.
- `roadmap.md`: M1 ✅; `AGENTS.md`: Layout/what's built, Testing decision (web tests are
  Vitest, pure helpers only for now), `signupCount` in the API table.
- `architecture.md`: first-visit UTC flash note; `README.md`: `npm test` runs both apps.

## Verification

Automated:
- `npm test` (API + web), `npm run lint`, `npm run build` all pass; build works with the
  API stopped and `/events` is `ƒ` (dynamic).
- Newman run of the Postman collection passes, including the new `signupCount` requests.

Manual (API + web running). Seed with Postman/curl: an unlimited event, one with 8 spots
free, one with 2 left, one with 1 left, one full, one already ended, and one that spans
midnight.
- [ ] Each seeded event shows the right badge and bar: "Open to all" (no bar), "8 spots
      left", "Only 2 left", "Last spot", "Full" (dark bar); the ended one is not listed.
- [ ] Sign up a user to an event via Postman and reload: "N of M signed up" updates.
- [ ] Sorted soonest first; count line is right, singular for one event.
- [ ] Time zone: clear the `tz` cookie and reload: UTC flash, then local time. Set the
      cookie to `Asia/Tokyo` in DevTools: times shift on reload. Set it to `garbage`:
      falls back to UTC, no crash. No refresh loop (network tab shows one extra request).
- [ ] The midnight-spanning event shows the end with its date.
- [ ] Loading: temporarily add `await new Promise(r => setTimeout(r, 2000))` in the page;
      skeletons appear and match the card layout; remove it.
- [ ] Error: stop the API; "We couldn't load events." appears; restart and "Try again"
      recovers without a full reload.
- [ ] Empty: with only past events (or no events), the empty state shows.
- [ ] 375px: one column, no horizontal scroll; 640px: two columns; 1024px: three.
- [ ] Keyboard: one Tab stop per card, visible focus ring around the title, Enter opens
      `/events/[id]` (404 until M2).
- [ ] Dark mode: eyebrow is gold, cards on `surface`, badges legible.
- [ ] Console has no errors or hydration warnings (the date formatting is
      server-only, so no hydration mismatch is expected).

## Acceptance (from [02-events-list.md](../design/screens/02-events-list.md))

- [ ] Upcoming events sorted soonest first.
- [ ] Spots badge correct for unlimited / plenty / few / full.
- [ ] Single column at 375px; 2/3 columns at `sm`/`lg`.
- [ ] Loading, empty and API-error states match the spec.
- Deferred: "You're in" (M3); search, date range and past view, and the URL reflecting
  them (M6).

## Open questions

- None blocking. If you'd rather not show a temporary "upcoming" filter (decision 3),
  say so and step 8 lists everything with "Ended" badges instead.
