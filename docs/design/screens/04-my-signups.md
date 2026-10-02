# My sign-ups: `/me/signups`

Mockups: `SignupsDesktop`, `SignupsMobile`, `SignupsMobileEmpty`.

## Purpose

"What have I signed up for?" Upcoming commitments first, with an easy way to cancel.

## Data

`GET /users/:currentUserId/signups` (includes `event`, sorted by `event.startsAt`).
Split into upcoming (`endsAt >= now`) and past in the page.

## Wireframe (mobile)

```
┌────────────────────────────────────┐
│ My sign-ups                        │
│                                    │
│ Upcoming (2)                       │
│ ┌────────────────────────────────┐ │
│ │ Beach cleanup                  │ │
│ │ Sat, Jun 1 · 9:00 – 12:00 PM   │ │
│ │ 📍 South beach                 │ │
│ │ [View]        [Cancel my spot] │ │
│ └────────────────────────────────┘ │
│                                    │
│ Past (5)                     [▸]   │  ← collapsed <details>
└────────────────────────────────────┘
```

## Visual spec

- Subtitle "Events you've joined as Maya Chen.", then "Upcoming (2)".
- Each row is a white card: `DateTile` (OCT / 10), linked title, a time row, a
  location row, then "View" (secondary) and "Cancel my spot" (danger outline). The
  buttons wrap under the info on mobile.
- Past events: a collapsed `<details>` card, "Past events (5)" with a history icon.
- Empty state: gold-tint calendar-check icon, "You haven't joined any events yet",
  "Find something that fits your schedule…", primary "Browse events".

## Behavior

- Cancel uses the same `ConfirmButton` + Server Action as the detail page. Afterwards
  the row disappears and an inline message confirms ("Your spot at Beach cleanup was cancelled.").
- Events that have started show "Started" instead of a cancel button.
- Past list is collapsed by default, muted styling, no actions.

## States

| State | Display |
|---|---|
| No user chosen | "Choose who you are in the header to see your sign-ups." |
| No sign-ups | EmptyState: "You haven't joined any events yet." + "Browse events" |
| Loading / error | Skeleton / `error.tsx` |

## Acceptance criteria

- [ ] Shows only the chosen user's sign-ups, upcoming first.
- [ ] Cancel works from this page and the event's capacity reflects it.
- [ ] Empty and no-user states render with a clear next step.
