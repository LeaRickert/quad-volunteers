# Layout & header

Shared shell for every page: `src/app/layout.tsx` + `components/Header.tsx`.

Mockups: `EventsDesktop` (desktop header), `MobileMenu` (menu open), any mobile board (closed).

## Purpose

Brand, navigation that adapts to the current user's role, and the "Viewing as" picker.

## Wireframes

Mobile (default):

```
┌────────────────────────────────────┐
│ 🤝 nextvolunteers          [☰ Menu]│
├────────────────────────────────────┤
│ (menu open)                        │
│  Events                            │
│  My sign-ups                       │
│  Manage events      (organizer+)   │
│  Manage users       (admin)        │
│  ──────────────────────────────    │
│  Viewing as: [Ada Lovelace ▾]      │
│              volunteer             │
└────────────────────────────────────┘
```

Desktop (`sm`+):

```
┌──────────────────────────────────────────────────────────────────┐
│ 🤝 nextvolunteers   Events  My sign-ups  Manage events  Manage users │
│                                        Viewing as: [Ada Lovelace ▾] │
└──────────────────────────────────────────────────────────────────┘
```

## Visual spec

- White bar with a **3px red top rule** and a 1px gray-400 bottom border; 64px tall
  on desktop, 60px on mobile.
- Brand: red 30px rounded square with a white "nv" and a small gold dot, then
  "nextvolunteers" (17/600).
- Desktop nav: text links; the active one is gray-900 and semibold with a **2px red
  underline**; the others are gray-700.
- Picker (desktop): "Viewing as" label, then an outlined button with an avatar, name,
  role and a chevron. Avatars are gold for organizers and admins, gray for volunteers.
- Mobile: avatar button and an outlined menu button, both 44px. The open menu drops
  down as a panel over a dimmed backdrop. Nav rows are 48px; the active row has a
  red-tint background and red text. Then a "Viewing as" listbox (red check on the
  selected user) and the note "Stand-in for sign-in until accounts exist."

## Behavior

- Active nav item is highlighted (`aria-current="page"`). Needs `usePathname`, so the
  nav links are a small client component.
- Role-based items: "Manage events" for organizer/admin, "Manage users" for admin.
- Picker lists all users as "Name (role)". Changing it sets the `viewAs` cookie via a
  Server Action and re-renders the page with the new identity.
- Mobile menu: a `<details>`/`<summary>` disclosure (works without JS, accessible) or a
  button toggling `aria-expanded`.

## States

| State | Display |
|---|---|
| No user chosen | Picker shows "Choose a user…"; only "Events" in nav |
| User chosen | Name + role under the picker; nav per role |
| Chosen user was deleted | Treated as no user; cookie cleared on next switch |
| API down | Header still renders; picker shows "Users unavailable" |

## Acceptance criteria

- [ ] Header appears on every page with brand linking to `/events`.
- [ ] Switching user updates nav items and page content without a manual reload.
- [ ] Works at 375px: nav collapses into a menu; all items reachable by keyboard.
- [ ] Page `<title>` is "nextvolunteers" plus the page name (metadata per page).
