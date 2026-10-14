# Roadmap: UI milestones

Each milestone is a small, reviewable slice that introduces one or two Next.js
features, ends in something you can click, and has acceptance criteria (in the linked
screen specs). Plan and
implement them one at a time; update the docs if a decision changes.

| # | Milestone | Delivers | Next.js / React concepts | Backend |
|---|---|---|---|---|
| M0 ✅ | **Foundations** | Design tokens in `globals.css` (from design-system.md / `Main` mockup), `lucide-react`, root layout + header shell (static nav), `lib/api.ts`, `lib/types.ts`, `API_URL` env, `/` → `/events` | Layouts, Tailwind `@theme`, `server-only`, env vars, `redirect` | — |
| M1 | **Events list (read-only)** | Cards with date, location, spots badge; loading and error states; `APP_TIME_ZONE` + `lib/time.ts` | Server Components fetching, `loading.tsx`, `error.tsx`, server-only config (`APP_TIME_ZONE`), unit tests with Vitest | API change 1: `signupCount`; API change 2a: `past` |
| M2 | **Event detail (read-only)** | Detail page, capacity bar, not-found | Dynamic routes, async `params`, `notFound()`, `generateMetadata` | — |
| M3 | **Viewing as** | Picker, role-aware nav, "You're in" markers | `cookies()`, Server Actions, Client vs Server Components, `usePathname`, `React.cache` | — |
| M4 | **Join & cancel** | Action area states, inline success/error, `ConfirmButton` | `useActionState`, pending UI, `refresh()`, mapping API errors | — |
| M5 | **My sign-ups** | Upcoming/past lists with cancel | Reusing actions/components across routes | — |
| M6 | **Search & date filter** | GET filter form (`min` on date inputs = today), empty states | `searchParams`, URL as state, progressive enhancement | API change 2b: `q`, `from`, `to` |
| M7 | **Manage events** | List, create/edit form, delete, role gate | Forms + validation errors, `redirect()` after mutation, nested layouts as gates, date-time ↔ UTC | — |
| M8 | **Staff tools & manage users** | Attendee list + remove on detail; users CRUD | Conditional rendering by role, reusing form patterns | — |
| M9 | **Polish** | Responsive pass (375 / 768 / 1280), a11y checklist, dark mode check, copy review | Metadata, accessibility | — |

## Definition of done (every milestone)

- Acceptance criteria in the relevant screen spec are checked off, and the screen matches its mockup.
- Works at 375px and desktop; keyboard usable; no console errors.
- `npm run lint -w web` and `npm run build -w web` pass.
- Backend changes ship with unit tests and Postman requests (API conventions in `AGENTS.md`).
- Docs updated if behavior changed.

## Open questions

- **Frontend tests:** Vitest + React Testing Library for components, and/or Playwright
  for end-to-end flows? Decide before or during M4, when there's real interaction worth testing.
- **Caching:** when to introduce Cache Components (`'use cache'`, tags) as its own
  step. Probably after M7.
- **Shared types:** keep hand-written `lib/types.ts`, or create `packages/shared`?
  Revisit when types drift.
- **Authentication:** replaces the "Viewing as" picker; the next big topic after v1.
