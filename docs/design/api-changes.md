# API changes needed by the UI

Backend work the screens depend on. Each change keeps the existing conventions in
`AGENTS.md` (DTO validation, unit tests, Postman folder).

## 1. Sign-up count on events (needed by: events list, event detail, manage events)

Add `signupCount: number` to every event returned by `GET /events` and `GET /events/:id`.

- Implementation: a TypeORM `@VirtualColumn` on `Event` backed by a `COUNT` subquery
  (`loadRelationCountAndMap` no longer exists in TypeORM 1.x). See
  [plans/web-m1-events-list.md](../plans/web-m1-events-list.md).
- `signupCount` is a computed response field. It is not a column, and it is not accepted in DTOs.
- The UI derives "spots left" = `capacity - signupCount` (or "Unlimited" when
  `capacity` is null).

## 2. Filters on `GET /events` (needed by: events list, manage events)

New query DTO `ListEventsQueryDto` (validated by the global `ValidationPipe`). It ships in
two parts: **2a** (`past`, in web milestone M1) and **2b** (`q`, `from`, `to`, in M6).
The global pipe has `forbidNonWhitelisted`, so a param is a 400 until its part ships.

| Param | Type | Meaning |
|---|---|---|
| `q` **(2b)** | string, optional, trimmed, max 100 | Case-insensitive match on `title` or `location` (`ILIKE`) |
| `from` **(2b)** | ISO date, optional | Events starting on/after this date |
| `to` **(2b)** | ISO date, optional | Events starting on/before the end of this date |
| `past` **(2a, done)** | boolean, optional (default `false`) | `false`: upcoming and ongoing (`endsAt >= now`), soonest first. `true`: ended events (`endsAt < now`), most recent first |

- Query strings are strings: use `@Type(() => Date)` for dates and a `@Transform` for
  `past=true|false`. `from > to` → 400.
- Response shape stays an array (no pagination yet).
- **The default changes `GET /events`:** it no longer returns ended events. The public
  events list never shows a past toggle; only manage events (M7) sends `past=true`.
  `GET /events/:id` and the sign-up endpoints still work for past events.

## 3. No change needed (already supported)

| UI need | Existing endpoint |
|---|---|
| "Viewing as" user list | `GET /users` |
| "You're signed up" marker, My sign-ups | `GET /users/:userId/signups` (includes `event`) |
| Attendee list for staff | `GET /events/:eventId/signups` (includes `user`) |
| Sign up / cancel / staff removes volunteer | `POST` / `DELETE /events/:eventId/signups/...` |
| Manage events and users | Existing CRUD; capacity-below-count 409 already enforced |

## Later (not v1)

- `signupCount` on `GET /users` (show activity in manage users).
- Role enforcement once authentication exists (the UI's role checks are cosmetic).
