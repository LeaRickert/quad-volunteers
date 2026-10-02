# Event detail: `/events/[id]`

Mockups: `DetailDesktop`, `DetailDesktopStaff`, `DetailMobileJoin`, `DetailMobileIn`, `DetailMobileFull`, `DetailMobileEnded`.

## Purpose

Everything about one event, with a single clear action: join or cancel. For staff, who
is coming and event management.

## Data

- `GET /events/:id` (with `signupCount`) → 404 → `notFound()`.
- Current user (cookie) and their sign-ups (to know "am I in?").
- Staff only: `GET /events/:id/signups` (with users).

## Wireframe (mobile)

```
┌────────────────────────────────────┐
│ ← All events                       │
│                                    │
│ Beach cleanup                      │
│ 📅 Sat, Jun 1 · 9:00 – 12:00 PM    │
│ 📍 South beach                     │
│                                    │
│ ███████░░░  7 of 10 spots taken    │
│                                    │
│ ┌────────────────────────────────┐ │
│ │      [ Join this event ]       │ │  ← action area (states below)
│ └────────────────────────────────┘ │
│                                    │
│ About                              │
│ Bring gloves and water. We'll ...  │
│                                    │
│ ── Organizer tools (staff only) ── │
│ [Edit event]   [Delete event]      │
│                                    │
│ Volunteers (7)                     │
│ Ada Lovelace  ada@example.com  [Remove] │
│ Grace Hopper  grace@example.com [Remove]│
└────────────────────────────────────┘
```

Desktop: two columns: details/description on the left, action card + capacity
(sticky) on the right; attendee list full width below.

## Action area states

| Condition | Shows |
|---|---|
| No user chosen | "Choose who you are in the header to sign up." |
| Event has started / ended | "Ended" badge, "18 volunteers helped out", info message "This event has ended. Sign-ups and cancellations are closed." (no button) |
| Signed up, not started | "You're in! See you there." + `ConfirmButton` "Cancel my spot" → "Cancel your spot? [Yes, cancel] [Keep my spot]" |
| Not signed up, spots left / unlimited | `Button` primary "Join this event" |
| Not signed up, full | Badge "Full", dark bar, "This event is full. Spots open up if someone cancels, so check back later." + secondary "Browse other events" |
| Action pending | Button disabled with spinner ("Joining…") |
| API error (409/400/404) | Inline error message, e.g. the race case: "The last spot was just taken. Someone joined a moment before you." |

Success: after join or cancel, the page refreshes and shows an inline success message
(gold tint): "You're in! See you there. Meet at the North Gate at 9:00 AM." /
"Your spot was cancelled."

Layout: on desktop, details and "About this event" are on the left. On the right is an
action card: "**7 of 20** spots taken" + badge, an 8px capacity bar, the action, and the
note "You can cancel any time before the event starts." On mobile the action card sits
between the meta rows and "About this event".

## Staff section (organizer/admin)

- Volunteers see only the count. Staff see "Volunteers (7)" with the note "Only
  organizers and admins see this list", and a table: Name (avatar), Email, Signed up,
  and a ghost "Remove" button (`aria-label` "Remove Maya Chen from this event").
- The right column adds an "Organizer tools" card with "Edit event" (secondary) and
  "Delete event" (danger outline).
- "Edit event" → `/manage/events/[id]/edit`.
- "Delete event" → `ConfirmButton`: "Delete this event? 7 volunteers are signed up. Their sign-ups will be removed too." [Delete event] [Keep event] →
  redirect to `/manage/events?deleted=1`.
- Removing is blocked by the API once the event has started (shown as an inline error).

## States

| State | Display |
|---|---|
| Loading | Skeleton of title, meta lines, button |
| Not found | `not-found.tsx`: "We couldn't find that event." + link to events |
| No sign-ups (staff) | "No volunteers yet. Share the event!" |

## Acceptance criteria

- [ ] Every action-area state above renders correctly (test by switching users and editing dates/capacity).
- [ ] Join/cancel work, update the capacity bar, and show inline feedback.
- [ ] Full and duplicate sign-ups show the API's 409 message inline (e.g. when two tabs race).
- [ ] Attendee names and emails are hidden from volunteers.
- [ ] Unknown id shows the not-found page.
