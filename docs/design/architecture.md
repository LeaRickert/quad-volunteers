# Frontend architecture

Next.js 16, App Router, `src/` directory. Next.js 16 differs from older docs: check
`node_modules/next/dist/docs/` before implementing (e.g. `params`/`searchParams` and
`cookies()` are async, Middleware is now `proxy.ts`).

## Route map

```
src/app/
├── layout.tsx                 # html/body, fonts, <Header/>
├── page.tsx                   # redirect('/events')
├── events/
│   ├── page.tsx               # Events list (searchParams: q, from, to)
│   ├── loading.tsx            # card skeletons
│   ├── error.tsx              # "Couldn't load events" + retry (client)
│   └── [id]/
│       ├── page.tsx           # Event detail
│       └── not-found.tsx      # "Event not found"
├── me/signups/page.tsx        # My sign-ups
└── manage/
    ├── events/
    │   ├── layout.tsx         # gate: organizer | admin, else <NotAllowed/>
    │   ├── page.tsx           # list
    │   ├── new/page.tsx
    │   └── [id]/edit/page.tsx
    └── users/
        ├── layout.tsx         # gate: admin
        ├── page.tsx
        ├── new/page.tsx
        └── [id]/edit/page.tsx
```

Supporting code:

```
src/
├── components/   # design-system components (see design-system.md)
├── lib/
│   ├── api.ts        # server-only fetch wrapper for the NestJS API
│   ├── types.ts      # User, Event, Signup types (mirrors API responses)
│   ├── current-user.ts  # reads the viewing-as cookie → User | null
│   ├── time.ts       # date formatting in the campus time zone
│   └── form-errors.ts   # maps API 400 messages to form fields
└── actions/      # Server Actions ('use server'): signups.ts, events.ts, users.ts, identity.ts
```

## Data flow: server-only API access

```
Browser ──(HTML / form POST)──▶ Next.js server ──(fetch)──▶ NestJS API :3001 ──▶ Postgres
```

- **All API calls happen on the Next.js server**: in Server Components (reads) and
  Server Actions (writes). The browser never calls the API directly, so CORS is not
  involved and the API URL stays private.
- Env: `API_URL=http://localhost:3001` (server-only, no `NEXT_PUBLIC_` prefix) in
  `apps/web/.env.local`. Replaces the scaffolded `NEXT_PUBLIC_API_URL`.
- `lib/api.ts` starts with `import 'server-only'` and exposes typed helpers
  (`getEvents(query)`, `getEvent(id)`, `createSignup(eventId, userId)`, …). On a non-2xx
  response it throws an `ApiError { status, messages[] }` so callers can branch on
  404/409/400.
- Types are written by hand in `lib/types.ts` for now. A shared `packages/shared`
  workspace is a later option.

## Caching & freshness

- Start **without** Cache Components (`cacheComponents` off, the default). Per the
  Next.js 16 docs, `fetch` is not cached by default, so every page shows fresh data.
- After a mutation, Server Actions call `refresh()` (from `next/cache`) to re-render the
  current route, or `redirect()` to another page (e.g. after creating an event).
- Turning on Cache Components (`'use cache'`, `cacheTag`, `updateTag`) is its own
  step later, once the app works.

## Identity: "Viewing as"

- Cookie `viewAs` = user id. Read with `await cookies()` in `lib/current-user.ts`, which
  fetches the user from the API (`React.cache` so one request per render).
- `ViewingAsPicker` (client) renders a `<select>` of users inside a `<form>` whose
  action is the `setViewAs` Server Action; it submits on change and has a "Switch"
  button for no-JS.
- No cookie, or the user no longer exists → `currentUser = null`: the header shows
  "Choose a user". Actions that need a user show "Choose who you are in the header to
  sign up."
- Role helpers: `canManageEvents(user)` (organizer | admin), `canManageUsers(user)` (admin).
- ⚠️ Cosmetic only: Server Actions are reachable by direct POST, and the API has no
  auth. Each action still re-checks the role to keep the habit, but real protection
  comes with authentication.

## Time zones: one campus time zone

One installation serves one campus, so the app has a single configured time zone.

- Env: `APP_TIME_ZONE` (IANA name, e.g. `America/New_York`; server-only) in
  `apps/web/.env.local`. `lib/app-config.ts` (`getAppTimeZone()`) reads it and throws a
  clear error if it's missing or not a valid zone, like `API_URL`.
- The API stores and returns UTC instants. The web app formats them in the campus zone:
  `lib/time.ts` takes the zone as an argument (`Intl.DateTimeFormat('en-US', { timeZone })`),
  and pages pass `getAppTimeZone()`. Server rendering needs no cookie, client component
  or refresh, so there is no flash of UTC, and pages don't become dynamic just for time.
- Every viewer sees the same times (the campus's), which is what a volunteer needs
  ("9:00 AM at the arboretum"), wherever their device is.
- **Form input:** `datetime-local` values have no zone. The Server Action converts
  "2026-06-01T09:00" in the campus zone to an ISO UTC string before calling the API. The
  edit form converts stored UTC back to campus time for the input's default value.
- **Date filters (M6):** `from`/`to` are calendar dates; the web converts them to UTC
  instants using the campus zone before calling the API, so the API stays zone-agnostic.

## Mutations: Server Actions

Pattern for every action (`src/actions/*.ts`, `'use server'`):

1. Read form data and `currentUser`; re-check role where relevant.
2. Call the API through `lib/api.ts`.
3. On `ApiError`, return `{ status: 'error', message, fieldErrors }` for `useActionState`.
4. On success, either `refresh()` and return `{ status: 'success', message }`, or
   `redirect('/manage/events?saved=1')`.

Forms that show inline errors or a pending state are small Client Components using
`useActionState(action, initialState)`. Simple one-button forms can stay Server
Components (progressive enhancement).

## API error → UI mapping

| API response | UI |
|---|---|
| 400 with `message: string[]` (validation) | Field errors via `lib/form-errors.ts` (message starts with the field name, e.g. "title should not be empty") |
| 400 with a single message ("Event has already started") | Inline error next to the action |
| 404 on a page read | `notFound()` → `not-found.tsx` |
| 404 on an action | Inline error ("This event no longer exists.") |
| 409 | Inline error with the API message ("Event is full", "Email already exists") |
| Network error / 5xx | `error.tsx` boundary on pages; generic inline error in actions |

## Loading & streaming

- `loading.tsx` per main route shows skeletons matching the final layout.
- Independent reads (event + signups + current user) run in parallel with `Promise.all`.
- Buttons show pending state from `useActionState`'s `pending` flag.
