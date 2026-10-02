# API changes needed by the UI

Backend work the screens depend on. Each change keeps the existing conventions in
`AGENTS.md` (DTO validation, unit tests, Postman folder).

## 1. Sign-up count on events (needed by: events list, event detail, manage events)

Add `signupCount: number` to every event returned by `GET /events` and `GET /events/:id`.

- Implementation idea: TypeORM query builder with
  `loadRelationCountAndMap('event.signupCount', 'event.signups')`, or a `COUNT` subquery.
- `signupCount` is a computed response field. It is not a column, and it is not accepted in DTOs.
- The UI derives "spots left" = `capacity - signupCount` (or "Unlimited" when
  `capacity` is null).

## 2. Search, date range and past events on `GET /events` (needed by: events list)

New query DTO `ListEventsQueryDto` (validated by the global `ValidationPipe`):

| Param | Type | Meaning |
|---|---|---|
| `q` | string, optional, trimmed, max 100 | Case-insensitive match on `title` or `location` (`ILIKE`) |
| `from` | ISO date, optional | Events starting on/after this date |
| `to` | ISO date, optional | Events starting on/before the end of this date |
| `past` | boolean, optional (default `false`) | `false`: upcoming and ongoing (`endsAt >= now`), soonest first. `true`: ended events (`endsAt < now`), most recent first |

- Query strings are strings: use `@Type(() => Date)` for dates and a `@Transform` for
  `past=true|false`. `from > to` → 400.
- Response shape stays an array (no pagination yet).

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
