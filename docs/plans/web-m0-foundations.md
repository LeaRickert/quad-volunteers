# Plan: Web M0, Foundations

**Status: implemented.** Deviations: the palette uses `@theme static` (Tailwind 4 only
emits theme variables that a utility uses, and the semantic layer reads them with
`var()`); the body font reads `var(--font-geist-sans)` directly (`--font-sans` is declared
in `@theme inline`, which doesn't emit it); the focus ring uses the `foreground` color so
it stays visible in dark mode; header text and links use `whitespace-nowrap` to fit 375px.
Original plan: First milestone of Phase 2 (see [roadmap](../design/roadmap.md)).
Screen spec: [layout & header](../design/screens/01-layout-header.md).

## Goal

Everything later milestones import, and nothing more: design tokens, a static header
shell, a typed server-only API client, hand-written types, the `API_URL` env var, and
`/` → `/events`. At the end you can open the app, see the branded shell, and a
throwaway `/events` page proves the web app can read from the API.

**Out of scope** (so M0 stays small): the "Viewing as" picker and role-aware nav (M3),
active-link highlighting and the mobile menu (M3, they need `usePathname` and client
state), real events UI (M1), time zone handling (M1).

## Concepts this milestone introduces

| Concept | Where |
|---|---|
| Root layout, `LayoutProps` / `metadata` | `layout.tsx` |
| Tailwind 4 `@theme` (CSS-first config, no `tailwind.config.js`) | `globals.css` |
| `import 'server-only'` | `lib/api.ts` |
| Server-only env vars (no `NEXT_PUBLIC_`) | `API_URL` |
| `redirect()` in a Server Component | `app/page.tsx` |
| `fetch` caching and static vs dynamic rendering | `lib/api.ts` |

Read before coding (Next 16 differs from older docs; paths under
`node_modules/next/dist/docs/01-app/`): `01-getting-started/03-layouts-and-pages.md`,
`01-getting-started/11-css.md`, `02-guides/environment-variables.md`,
`02-guides/redirecting.md`, `03-api-reference/04-functions/fetch.md`.

## Decisions

1. **Rename the env var to `API_URL`** (server-only), per `architecture.md`. The
   scaffolded `NEXT_PUBLIC_API_URL` isn't used by any code yet, so nothing breaks.
2. **Tokens: override Tailwind's palette** with `--color-*: initial;` inside `@theme`,
   then define only our colors. Our scale reuses Tailwind's names (`gray-400`,
   `red-400`…) with different values, and our `yellow-600` is *lighter* than
   `yellow-500`. Leaving Tailwind's defaults in would let `bg-gray-400` mean either
   thing depending on which shade exists. The cost is re-declaring `white`, `black`,
   `transparent` and `current`. *Alternative:* keep the defaults and only add the
   semantic names; less safe, since raw shades would still compile.
3. **Components use semantic tokens** (`bg-surface`, `text-muted`, `border-border`),
   never raw palette names or hex. Dark mode swaps the semantic variables in one
   `@media (prefers-color-scheme: dark)` block, so components need no `dark:` variants.
4. **`fetch` uses `cache: 'no-store'`.** Per the docs, an uncached `fetch` in a page
   with no request-time API (`cookies()`, `searchParams`) is run **once at
   `next build`** and the page is prerendered. The events list would freeze at build
   time. `no-store` makes the route dynamic. (Caching is introduced deliberately later.)
5. **Static header = Server Component** with plain `<Link>`s to Events and My sign-ups.
   No manage links yet; they appear with roles in M3.
6. **No frontend tests in M0.** Vitest starts in M1 with `lib/time.ts`. `lib/api.ts` gets
   its first test then too, once there's a `fetch` mock pattern worth keeping.

## Files

```
apps/web/
├── .env.example              # CHANGE: API_URL=http://localhost:3001 (+ comment)
├── package.json              # + lucide-react, server-only
└── src/
    ├── app/
    │   ├── globals.css       # REWRITE: tokens, base styles
    │   ├── layout.tsx        # CHANGE: metadata, <Header/>, <main>, container
    │   ├── page.tsx          # REPLACE: redirect('/events')
    │   └── events/page.tsx   # NEW, throwaway stub (replaced in M1)
    ├── components/
    │   └── Header.tsx        # NEW
    └── lib/
        ├── api.ts            # NEW
        └── types.ts          # NEW
```

Also delete the unused scaffold assets in `public/` (`next.svg`, `vercel.svg`, …) once
`page.tsx` stops referencing them.

## Steps

Small and reviewable; one commit each (or a few combined), checking the app after each.

### 1. Dependencies and env

```bash
npm install lucide-react server-only -w web
```

- `.env.example`: replace `NEXT_PUBLIC_API_URL` with `API_URL=http://localhost:3001` and a
  comment that it is server-only (read by the Next.js server, never sent to the browser).
- Update your local `apps/web/.env.local` the same way (gitignored; not committed).

### 2. Design tokens (`globals.css`)

Source: [design-system.md](../design/design-system.md) palette and semantic tables.

```css
@import "tailwindcss";

@theme {
  --color-*: initial;                 /* drop Tailwind's default palette */
  --color-white: #ffffff;
  --color-black: #000000;
  --color-transparent: transparent;
  --color-current: currentColor;

  --color-red-400: #d0012b;           /* primary */
  --color-red-500: #b9122d;
  --color-red-600: #9c1128;
  --color-yellow-400: #dcb100;
  --color-yellow-500: #ffcd00;
  --color-yellow-600: #ffe478;
  --color-gray-300: #eef4f8;          /* … gray-400 to gray-900 per the table */
  --color-red-tint: #fdf0f2;
  --color-gold-tint: #fff7d1;

  --radius-control: 6px;              /* buttons, inputs */
  --radius-card: 8px;                 /* cards, tables, messages */
  --shadow-card: 0 1px 2px rgb(18 24 28 / 0.06);
  --shadow-popover: 0 6px 16px rgb(18 24 28 / 0.10), 0 1px 2px rgb(18 24 28 / 0.06);
}

/* Semantic layer: swapped for dark mode; `inline` so utilities reference the variable */
:root {
  --background: var(--color-gray-300);
  --surface: var(--color-white);
  --foreground: var(--color-gray-900);
  --foreground-secondary: var(--color-gray-700);
  --muted: var(--color-gray-600);
  --border: var(--color-gray-400);
  --border-strong: var(--color-gray-500);
  --eyebrow: var(--color-red-500);
}
@media (prefers-color-scheme: dark) {
  :root {
    --background: var(--color-gray-900);
    --surface: var(--color-gray-800);
    --foreground: var(--color-gray-300);
    --foreground-secondary: var(--color-gray-400);
    --muted: var(--color-gray-500);
    --border: var(--color-gray-700);
    --border-strong: var(--color-gray-600);
    --eyebrow: var(--color-yellow-600);
  }
}

@theme inline {
  --color-background: var(--background);
  --color-surface: var(--surface);
  --color-foreground: var(--foreground);
  --color-foreground-secondary: var(--foreground-secondary);
  --color-muted: var(--muted);
  --color-border: var(--border);
  --color-border-strong: var(--border-strong);
  --color-eyebrow: var(--eyebrow);
  --color-primary: var(--color-red-400);
  --color-on-primary: var(--color-white);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}
```

Base styles below it: `body` uses `bg-background text-foreground font-sans` (the
scaffold sets `Arial`, which is why Geist isn't visible today); 15px body text;
`:focus-visible { outline: 2px solid foreground; outline-offset: 2px }` (gray-900 in light;
in dark, check it stays visible, see Verification); `@media (prefers-reduced-motion)`
turns transitions/animations off.

Gotcha to confirm in the Tailwind 4 / Next docs while doing this: the `:root` semantic
variables must be declared outside `@theme` (they change at runtime), while `@theme
inline` maps utilities to them.

### 3. Types (`lib/types.ts`)

Mirror the API's JSON. Dates are **ISO strings** over the wire, not `Date`s.

```ts
export type Role = 'admin' | 'organizer' | 'volunteer';
export interface User { id: string; name: string; email: string; role: Role; createdAt: string; updatedAt: string }
export interface Event {
  id: string; title: string; description: string | null; location: string;
  startsAt: string; endsAt: string; capacity: number | null;
  createdAt: string; updatedAt: string;
}
export interface Signup { id: string; userId: string; eventId: string; createdAt: string; user?: User; event?: Event }
```

`signupCount` is **not** added here; it arrives with API change 1 (before M1), in the
same change that adds it to the API.

### 4. API client (`lib/api.ts`)

`import 'server-only'` on line 1: importing this file from a Client Component becomes a
build error instead of a leaked URL.

- `ApiError extends Error { status: number; messages: string[] }`.
- `apiFetch<T>(path, init?)`:
  - base URL from `process.env.API_URL`; throw a clear error if it's unset (don't default
    silently; a missing `.env.local` should fail loudly);
  - `cache: 'no-store'`, `Content-Type: application/json` when there's a body;
  - 204 → `undefined`; other 2xx → parsed JSON;
  - non-2xx → read Nest's error body `{ statusCode, message: string | string[], error }`,
    normalize `message` to `string[]`, throw `ApiError`. A body that isn't JSON still
    yields an `ApiError` with a generic message;
  - network failure (API down) propagates as the original error; page `error.tsx`
    boundaries handle it in M1.
- Only the generic helper in M0. Typed helpers (`getEvents`, `getEvent`, …) are added
  by the milestone that first uses them.

### 5. Header and layout

- `components/Header.tsx` (Server Component), per the screen spec's visual section: white
  bar, 3px red top rule, 1px `border` bottom, 64px tall (60px mobile); brand mark = red
  30px rounded square with white **"qv"** and a small gold dot, then "Quad Volunteers"
  (17/600), linking to `/events`; nav links Events and My sign-ups (`foreground-secondary`,
  no active state yet). Both links fit at 375px, so no menu is needed in M0.
- `layout.tsx`: replace the "Create Next App" metadata with
  `title: { default: 'Quad Volunteers', template: '%s · Quad Volunteers' }` so later pages
  only set their own name; render `<Header />` then `<main>` with the content container
  (`max-width: 1160px`, padding 16px mobile / 32px `sm`+). Landmarks: `header`, `nav`,
  `main`.
- `lucide-react` is installed but M0 only needs it if the header uses an icon; otherwise
  the first use is M1 (calendar, map-pin, users). Install now to match the roadmap.

### 6. Redirect and stub

- `app/page.tsx`: `redirect('/events')` (Server Component; no JSX).
- `app/events/page.tsx` (**temporary**): async Server Component that calls
  `apiFetch<Event[]>('/events')` and renders `<h1>Events</h1>` plus "N events from the
  API". It exists so `/` has a target and so you can see the whole chain
  (server component → `lib/api.ts` → Nest → Postgres) work. M1 replaces it.

### 7. Docs

- `AGENTS.md`: Configuration section (`API_URL` replaces `NEXT_PUBLIC_API_URL`; the
  server-only note), and add `components/`, `lib/` to the Layout tree and "what's built".
- `README.md`: no change needed unless it mentions the old var (it doesn't).
- `docs/design/design-system.md`: Header row says brand mark "nv"; it should be **"qv"**
  (project rename). Fix it.
- `docs/design/roadmap.md`: mark M0 done when finished.
- This plan: set **Status: implemented** and note any deviations.

## Verification

Automated:
- `npm run lint -w web` and `npm run build -w web` pass. Build must succeed **with the API
  stopped** (the stub page is dynamic, so it must not fetch at build time; if the build
  fails or the page is marked `○ Static`, `no-store` isn't taking effect).

Manual (API + web running, `npm run dev`):
- [ ] `curl -sI localhost:3000/` returns a `307` with `location: /events`.
- [ ] `/events` shows the header and "N events from the API"; creating an event via
      Postman and reloading changes N (no stale data).
- [ ] Stop the API: `/events` shows Next's error page (not a blank page); restart: it recovers.
- [ ] Unset `API_URL` in `.env.local`, restart: the error names the missing variable.
- [ ] `grep -r "localhost:3001" apps/web/.next/static` finds nothing (the URL never
      reaches browser bundles).
- [ ] Temporarily import `lib/api.ts` from a `'use client'` file: the build fails with the
      `server-only` message. Revert.
- [ ] 375px and 1280px: header fits, no horizontal scroll, Tab shows the focus ring on
      the brand link and both nav links.
- [ ] Dark mode (OS setting or DevTools emulation): background, surface and text swap;
      focus ring is visible. If the ring disappears on the dark background, make it
      `foreground` instead of fixed gray-900.
- [ ] Geist renders (not Arial); no console errors; page `<title>` is "Quad Volunteers".

## Acceptance (from [01-layout-header.md](../design/screens/01-layout-header.md), the parts M0 covers)

- [ ] Header appears on every page with the brand linking to `/events`.
- [ ] Page `<title>` is "Quad Volunteers" plus the page name (template in place; each
      page sets its name from M1).
- The remaining criteria (user switching, role nav, 375px menu) are M3.

## Open questions

- Whether `Button`, `Badge` etc. land in M0 or with their first user. **Proposal:** with
  their first user (M1 for `Badge`/`CapacityBar`/`EventCard`, M4 for `Button`), so every
  component is exercised when it's built.
