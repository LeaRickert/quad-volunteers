# Manage events: `/manage/events`, `/new`, `/[id]/edit`

Mockups: `ManageEventsDesktop`, `EventFormDesktop`, `EventFormMobile`, `NotAllowedMobile`.

Visible to **organizers and admins**. `manage/events/layout.tsx` renders `<NotAllowed/>`
for others. No ownership yet: organizers can edit any event.

## List: `/manage/events`

```
Mobile                                   Desktop (lg)
┌──────────────────────────────┐         ┌─────────────────────────────────────────────────────┐
│ Manage events   [+ New event]│         │ Manage events                         [+ New event] │
│ ┌──────────────────────────┐ │         │ Title          Date          Spots    Actions        │
│ │ Beach cleanup            │ │         │ Beach cleanup  Sat, Jun 1    7/10     Edit · Delete  │
│ │ Sat, Jun 1 · 7/10        │ │         │ Food bank      Sun, Jun 2    20/20    Edit · Delete  │
│ │ [Edit]  [Delete]         │ │         └─────────────────────────────────────────────────────┘
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

- Table columns: **Event** (title link + location), **Date** (date + time), **Sign-ups**
  (`7 / 20` + mini capacity bar, or "14 · no limit"), and actions ("Edit" secondary +
  icon-only delete, both 36px).
- Shows upcoming events by default, soonest first, with an Upcoming / Past switch
  (`Segmented`) that requests `GET /events?past=true` (most recent first). This is the only
  screen with a past view.
- Title links to the public detail page (where attendees are listed).
- Delete uses `ConfirmButton`: "Delete Beach cleanup? 7 sign-ups will be removed."
- Flash messages via search params: `?saved=1` → "Event saved.", `?deleted=1` → "Event deleted."

## Form: `/manage/events/new` and `/manage/events/[id]/edit`

One shared `EventForm` (client component with `useActionState`).

```
┌────────────────────────────────────┐
│ New event                          │
│ Title *        [                 ] │
│ Location *     [                 ] │
│ Starts *       [ 2026-06-01 09:00 ]│  datetime-local
│ Ends *         [ 2026-06-01 12:00 ]│
│ Capacity       [   ]  Leave empty for unlimited │
│ Description    [                 ] │  textarea
│                [                 ] │
│ Times are in campus time (America/New_York) │
│                                    │
│ [Save event]   Cancel              │
└────────────────────────────────────┘
```

| Field | Input | Client hints | API rule |
|---|---|---|---|
| Title | text | `required` | not empty |
| Location | text | `required` | not empty |
| Starts / Ends | `datetime-local` | `required`; ends `min` = starts | `endsAt > startsAt` (400) |
| Capacity | number | `min=1`, `step=1`, empty = unlimited | int ≥ 1 or null; not below sign-ups (409) |
| Description | textarea | optional | string or null |

- Server Action converts date-times in the campus time zone to UTC ISO strings (see
  [architecture.md](../architecture.md#time-zones-one-campus-time-zone)).
- Edit: empty capacity or description is sent as `null` to clear it.
- Breadcrumb "Manage events › Edit event"; subtitle "Arboretum Trail Cleanup · 7 volunteers signed up".
- Error summary at the top of the form ("Please fix 3 problems before saving." linking to each field).
- The time zone note sits under the date fields: "Times are in campus time: America/New_York".
- Errors: field errors under inputs (`lib/form-errors.ts`), cross-field errors
  ("Event must end after start", "Capacity cannot be lower than the 7 current
  sign-ups") as an inline message above the buttons. Entered values are preserved.
- Success → `redirect('/manage/events?saved=1')`.
- Edit of unknown id → `notFound()`.

## Acceptance criteria

- [ ] Volunteers see NotAllowed on all `/manage/events` routes; nav link hidden.
- [ ] Create, edit, delete work; list updates; flash message shown.
- [ ] A time entered in the form displays as the same local time on the detail page.
- [ ] API validation errors appear on the right fields; values are not lost.
- [ ] Lowering capacity below sign-ups shows the 409 message.
