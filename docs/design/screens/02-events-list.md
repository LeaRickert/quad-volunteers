# Events list: `/events`

Mockups: `EventsDesktop`, `EventsMobile`, `EventsMobileEmpty`, `EventsDesktopDark`.

## Purpose

Help volunteers quickly find an upcoming event with space and see which ones they've joined.

## Data

- `GET /events?q=&from=&to=&past=` (needs [API changes](../api-changes.md) 1 and 2), including `signupCount`.
- Current user's sign-ups: `GET /users/:id/signups` → set of event ids (only when a user is chosen).
- Both fetched in parallel in the page (Server Component).

## Wireframes

Mobile:

```
┌────────────────────────────────────┐
│ Upcoming events                    │
│ ┌────────────────────────────────┐ │
│ │ 🔍 Search title or location    │ │
│ └────────────────────────────────┘ │
│ From [  date  ]  To [  date  ]     │
│ [Search]        Show past events → │
│                                    │
│ ┌────────────────────────────────┐ │
│ │ Beach cleanup     ✓ You're in  │ │
│ │ Sat, Jun 1 · 9:00 – 12:00 PM   │ │
│ │ 📍 South beach                 │ │
│ │ [ 3 spots left ]               │ │
│ └────────────────────────────────┘ │
│ ┌────────────────────────────────┐ │
│ │ Food bank sorting              │ │
│ │ Sun, Jun 2 · 10:00 AM – 2:00 PM│ │
│ │ 📍 Community hall              │ │
│ │ [ Full ]                       │ │
│ └────────────────────────────────┘ │
└────────────────────────────────────┘
```

Desktop: filters on one row, cards in a 2-column (`sm`) / 3-column (`lg`) grid.

## Behavior

- Whole card is a link to `/events/[id]` (one link per card, title as the accessible name).
- Filters are a **GET form**: submitting updates the URL (`/events?q=beach&from=2026-06-01`),
  so results are shareable and work without JS. The page reads `await searchParams`.
- "Show past events" toggles `past=1` (heading becomes "Past events"; link back to upcoming).
- "Clear filters" link appears when any filter is active.
- Card anatomy (see `EventCard` in the design system): a red eyebrow date ("SAT · OCT 10")
  with "You're in" at the top right, then the title, time and location rows, a divider,
  "7 of 20 signed up" with a spots badge, and a capacity bar.
- Spots badge:
  - capacity null → "Open to all" (outline, no bar)
  - 4 or more left → "N spots left" (gray)
  - 1–3 left → "Only N left" / "Last spot" (red outline)
  - none left → "Full" (dark gray, bar dark)
  - past events → "Ended"
- Current user signed up → gold "You're in ✓" badge.
- Header row: page title and subtitle on the left, Upcoming/Past segmented switch on
  the right. Desktop filters sit in one white card: Search (with icon), From, To and a
  secondary "Search" button. Mobile shows Search plus "Any date" and "Search" buttons.
- Result count line above the grid ("6 upcoming events").

## States

| State | Display |
|---|---|
| Loading | `loading.tsx`: 6 card skeletons |
| No events at all | EmptyState: "No upcoming events yet. Check back soon!" (+ "Create event" for organizers) |
| No results for filters | EmptyState (dashed card, calendar-x icon): "No events match “pottery”", "Try a different word, or clear your search…" + "Clear search"; a "Clear" link next to the filters |
| API error | `error.tsx`: "We couldn't load events." + Try again |
| Invalid filter (API 400, e.g. from > to) | Inline error above results |

## Acceptance criteria

- [ ] Upcoming events sorted soonest first; past view sorted most recent first.
- [ ] Spots badge correct for unlimited / plenty / few / full.
- [ ] "You're in" shows only for the chosen user's events.
- [ ] Search by title or location and date range filter results (via API) and are reflected in the URL.
- [ ] Single column at 375px; 2/3 columns at `sm`/`lg`.
