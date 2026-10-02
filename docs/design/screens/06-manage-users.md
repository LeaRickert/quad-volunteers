# Manage users: `/manage/users`, `/new`, `/[id]/edit`

Mockup: `UsersDesktop`.

Visible to **admins** only (`manage/users/layout.tsx` gate).

## List: `/manage/users`

```
Mobile                                   Desktop (lg)
┌──────────────────────────────┐         ┌──────────────────────────────────────────────────┐
│ Manage users   [+ New user]  │         │ Manage users                        [+ New user] │
│ ┌──────────────────────────┐ │         │ Name          Email              Role       Actions │
│ │ Ada Lovelace  (volunteer)│ │         │ Ada Lovelace  ada@example.com    volunteer  Edit · Delete │
│ │ ada@example.com          │ │         │ Grace Hopper  grace@example.com  organizer  Edit · Delete │
│ │ [Edit]  [Delete]         │ │         └──────────────────────────────────────────────────┘
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

- Sorted by name (API order). Columns: Name (avatar; gold for organizers/admins, "(you)"
  for the current user), Email, Role badge (Admin red-tint, Organizer gold-tint,
  Volunteer gray), actions (Edit + icon-only delete).
- Subtitle: "8 people · roles control what each person can manage."
- Delete: `ConfirmButton` "Delete Ada Lovelace? Their N sign-ups will be removed."
  (N from `GET /users/:id/signups`, fetched when rendering the confirm text, or phrased
  generically as "Their sign-ups will be removed" in v1).
- Deleting the user you're currently "viewing as" clears the identity (header shows
  "Choose a user").

## Form: `/manage/users/new` and `/manage/users/[id]/edit`

| Field | Input | API rule |
|---|---|---|
| Name * | text, `required` | not empty |
| Email * | email, `required` | valid email, unique (409 → error on the email field) |
| Role | select: volunteer (default) / organizer / admin | enum |

- Same `useActionState` pattern as the event form; success → `redirect('/manage/users?saved=1')`.

## Acceptance criteria

- [ ] Only admins see the nav link and pages; others see NotAllowed.
- [ ] Create, edit (including role change), delete work with flash messages.
- [ ] Duplicate email shows "Email already exists" under the email field.
- [ ] Changing the current user's role immediately changes the header nav.
