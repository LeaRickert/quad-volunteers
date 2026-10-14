# Design system

**Look:** campus red, gold highlights and cool grays. Clean linear/outline style,
softened by 6–8px corners and hairline shadows. The colors come from the original
student project this app is based on.

Visual reference: the `Main` (UI foundations) board in [mockups/](mockups/README.md).

Plain Tailwind CSS 4. Tokens go in `apps/web/src/app/globals.css` (`@theme`).
Components use semantic names (`bg-primary`, `text-muted`), never raw hex values, so
the look can change in one place.

## Palette

| Token | Hex | Role |
|---|---|---|
| `red-400` | `#d0012b` | **Primary**: main action buttons, brand mark, header top rule, active nav underline |
| `red-500` | `#b9122d` | Hover; date eyebrows and error text (6.6:1 on white) |
| `red-600` | `#9c1128` | Pressed; destructive confirm buttons ("Delete event", "Yes, cancel") |
| `yellow-500` | `#ffcd00` | **Gold highlight**: "You're in" badge, organizer/admin avatars, brand dot |
| `yellow-400` | `#dcb100` | Capacity bar fill, gold borders |
| `yellow-600` | `#ffe478` | Gold text/accents on dark backgrounds |
| `gray-900` | `#12181c` | Primary text; dark-mode page background; focus ring |
| `gray-800` | `#252d33` | "Full" badge and full capacity bar; dark-mode surfaces |
| `gray-700` | `#3a4750` | Secondary text (meta rows, descriptions) |
| `gray-600` | `#5c6b75` | Muted text, icons, hints (5.6:1 on white) |
| `gray-500` | `#a1a9af` | Input and secondary-button borders, dashed empty states |
| `gray-400` | `#dfe6eb` | Hairlines: card borders, dividers, table rules |
| `gray-300` | `#eef4f8` | Page background, table header, capacity track |
| `white` | `#ffffff` | Surfaces: cards, header, inputs |
| `red-tint` | `#fdf0f2` | *Derived.* Error message and confirm-step background, active mobile nav item |
| `gold-tint` | `#fff7d1` | *Derived.* Success message background, organizer role badge |

Rules:

- **Red acts.** One red primary button per view. Red text is for date eyebrows,
  links and errors only.
- **Gold highlights, never as text on white** (1.4:1). Gold fills always carry gray-900 text.
- **Grays carry everything else.**
- States differ by **lightness and icon**, not hue alone (see Badges).

### Semantic tokens (light → dark)

| Semantic | Light | Dark |
|---|---|---|
| `background` | gray-300 | gray-900 |
| `surface` | white | gray-800 |
| `foreground` | gray-900 | gray-300 |
| `foreground-secondary` | gray-700 | gray-400 |
| `muted` | gray-600 | gray-500 |
| `border` | gray-400 | gray-700 |
| `border-strong` | gray-500 | gray-600 |
| `eyebrow` (date labels) | red-500 | yellow-600 |
| `danger` (red text and borders on surfaces) | red-500 | red-tint |
| `primary` / `on-primary` | red-400 / white | red-400 / white |

Dark mode follows the system setting (see `EventsDesktopDark`). Red text is too dark to
read on gray-800, so dark mode uses gold-600 for date eyebrows and "few spots" text.

## Typography: Geist

Already loaded by the Next.js template (`next/font`).

| Style | Spec | Use |
|---|---|---|
| Page title | 30px / 600 / −2% (mobile 26px) | `h1` |
| Detail title | 34px / 600 / −2% (mobile 26px) | Event detail `h1` |
| Section / card title | 18px / 600 | `h2`, event cards |
| Body | 15px / 400 / line-height 1.6 for prose | Descriptions, forms |
| Meta | 13–14px / 400, gray-600–700 | Times, locations, counts |
| Eyebrow | 12px / 600 / +6% / uppercase, red-500 | "SAT · OCT 10", section labels |
| Label | 14px / 600 | Form labels |

Use tabular figures (`font-variant-numeric: tabular-nums`) for counts like `7 / 20`.

## Shape, elevation, spacing

| Thing | Value |
|---|---|
| Buttons, inputs | 6px radius |
| Cards, tables, messages, confirm step | 8px radius |
| Badges, avatars, capacity bars | fully rounded |
| Borders | 1px gray-400 (cards), 1px gray-500 (inputs, secondary buttons) |
| Card shadow | `0 1px 2px rgba(18,24,28,0.06)` |
| Popover / menu shadow | `0 6px 16px rgba(18,24,28,0.10), 0 1px 2px rgba(18,24,28,0.06)` |
| Spacing | 4px grid; page padding 32px desktop / 16px mobile; content `max-width: 1160px` |
| Touch targets | ≥ 44px (buttons 44px; small buttons 36px only in dense desktop tables and toolbars) |

## Icons

Lucide outline icons (`lucide-react`), 1.75px stroke, 16px in meta rows, 18px in
buttons, 24px in empty states. Icons are always paired with text, or have an `aria-label`
when icon-only. Set used so far: calendar, clock, map-pin, users, search, check,
chevron-down/right, menu, x, plus, pencil, trash-2, alert-circle, info, arrow-left,
lock, user-x, history, calendar-x, calendar-check.

## Components (`apps/web/src/components/`)

Server Components unless marked **client**.

| Component | Spec |
|---|---|
| `Header` | White bar, **3px red top rule**, 1px gray-400 bottom border, 64px tall (60px mobile). Brand mark: red 30px rounded square with white "qv" and a gold dot. Desktop nav: text links with a **2px red underline** on the active item. Right: "Viewing as" picker button (avatar + name + role + chevron). Mobile: avatar button + menu button (44px) |
| `MobileMenu` **client** | Panel under the header with a 35% gray-900 backdrop. Nav items are 48px rows (active: red-tint background, red-500 text). Below them, a "Viewing as" listbox of users with a red check on the selected one |
| `ViewingAsPicker` **client** | Button with `aria-haspopup="listbox"`; options show avatar, name and role |
| `Avatar` | Circle with initials; volunteers gray-300 fill, organizers and admins gold fill |
| `Button` | `primary` (red-400 fill, white text) · `secondary` (white, gray-500 border, gray-900 text) · `danger-outline` (white, red-400 border, red-500 text) · `danger` (red-600 fill) · `ghost`. Sizes 44px / 36px. `pending`: spinner + "Joining…" + disabled |
| `Badge` | Pill, 24px tall, 12px/600, optional 13px icon. See table below |
| `EventCard` | White card, 20px padding. Eyebrow date (+ "You're in" badge top right), title, time and location meta rows, divider, then "7 of 20 signed up" + spots badge, then a 6px capacity bar. Whole card is one link |
| `CapacityBar` | 6px (`md`, cards) or 12px (`lg`, detail) track in gray-300. Fill gold-400; gray-800 when full; hidden for unlimited. Has `role="img"` and a label like "7 of 20 spots taken" |
| `DateTile` | 56×60 outlined tile: month (11px red-500) over day (22px gray-900). Used on My sign-ups |
| `FormField` | Label (14/600, red asterisk for required), 44px input, hint (13px muted), error (13px red-500 with alert icon; red border + 3px red-tint ring; `aria-invalid`, `aria-describedby`) |
| `ErrorSummary` | Error message at the top of a form: "Please fix 3 problems before saving." with links to each field |
| `InlineMessage` | `success` (gold-tint background, gold-400 border, check icon) · `error` (red-tint, red-400 border, alert icon) · `info` (white, gray-500 border, info icon). `role="status"`, `aria-live="polite"`. The gold and red tints have no semantic token, so `success` and `error` set their own `dark:` colors (the one place raw palette names are allowed) |
| `ConfirmButton` **client** | First click reveals a red-tint panel: question (15/600), consequence line, `danger` confirm + `secondary` keep. Focus moves to the confirm button |
| `Segmented` | Upcoming / Past switch (manage events only): gray-300 track; active item is a white raised pill |
| `SpotsBadge` | Maps an event's availability (`lib/spots.ts`) to a `Badge`: Open to all (outline, users icon), N spots left (neutral), Only N left / Last spot (warning, clock icon), Full, Ended (history icon) |
| `EventGrid` | The events card grid: `repeat(auto-fill, minmax(300px, 1fr))`, 16px gap. Shared by the page and its skeleton |
| `CardSkeleton` | Loading placeholder with the same row heights as `EventCard` (`bg-border` bars, `animate-pulse`) |
| `EmptyState` | White card with dashed gray-500 border, 52px icon circle, title (17/600), one sentence, one action |
| `DataTable` | White card, gray-300 header row (12px uppercase), 1px gray-400 row rules, horizontal scroll when narrow |
| `NotAllowed` | Centered card: red-tint lock icon, "This page is for organizers", explanation, "Back to events" |

### Badges

| Badge | When | Style |
|---|---|---|
| **You're in** ✓ | Current user signed up | Gold-500 fill, gray-900 text, check |
| **N spots left** | 4 or more spots left | Gray-300 fill, gray-700 text |
| **Only N left** / **Last spot** | 1–3 spots left | White, red-400 border, red-500 text, clock icon |
| **Full** | No spots | Gray-800 fill, white text |
| **Open to all** | No capacity limit | White, gray-500 border, users icon |
| **Ended** | Event finished | Gray-300 fill, gray-600 text, history icon |
| **Admin** / **Organizer** / **Volunteer** | Role, in manage users | Red-tint and red-600 / gold-tint and gray-900 / gray |

## Copy & tone

Friendly and direct; say what happened and what to do next.

- Actions: "Join this event", "Cancel my spot", "Browse other events", "Clear search".
- Success: "You're in! See you there." · "Your spot was cancelled." · "Event saved."
- Errors: "The last spot was just taken." · "End time must be after the start." ·
  "Can't be lower than the 7 people already signed up."
- Dates: eyebrow `SAT · OCT 10`; meta `Saturday, October 10` and `9:00 AM – 12:00 PM`.

## Accessibility checklist (every screen)

- Landmarks (`header`, `nav`, `main`), one `h1`, headings in order.
- Every input has a `<label>`; errors use `aria-invalid` and `aria-describedby`; the form error summary links to fields.
- **Focus:** a 2px gray-900 outline, offset 2px. It shows up on red, gold and white
  alike, which is why the focus ring isn't gold.
- Keyboard reachable; the confirm step moves focus to its confirm button; the mobile menu uses `aria-expanded`.
- Inline messages use `aria-live="polite"`; the capacity bar has a text equivalent.
- Body text contrast ≥ 4.5:1 (checked for gray-600/700 on white and gray-300, red-500 on white, gray-900 on gold).
- **Known trade-off:** gray-500 input borders are about 2.4:1 against white, below the
  3:1 WCAG asks for component outlines. We keep them for the lighter outline look;
  labels and the white field on a gray page identify the inputs. Switch
  `border-strong` to gray-600 if this needs to be strictly compliant.
- Respect `prefers-reduced-motion`.
