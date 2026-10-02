# Mockups

High-fidelity mockups of the main screens and states. They're the visual reference for
[design-system.md](../design-system.md) and the [screen specs](../screens/).

- **Live canvas (Claude design):** https://claude.ai/artifact/YJrgecHDxzqWU9T2PRHkgD
  (private until shared from its Share menu). This is the source of truth; edit there.
- **Offline previews:** open [`preview/index.html`](preview/index.html) in a browser.
  Each board is a plain static HTML page (it needs internet only for the Geist font).

## Contents

| Folder | What |
|---|---|
| `canvas/` | The canvas files as published: `canvas.json` (board layout) and one `*.dc.html` per artboard. These need the canvas runtime (`support.js`), so view them on the canvas, not directly |
| `preview/` | Static HTML exports of each artboard plus an index page |
| `generator/` | The Python scripts that produced the first version (`gen_lib.py` has the tokens and components; `python3 gen_screens.py` writes to `out/project/`). Kept for reference; it doesn't pick up edits made on the canvas |

## Boards

| Row | Boards |
|---|---|
| Foundations | `Main` (UI foundations / style guide), `MobileMenu` (menu open + Viewing as) |
| Events list | `EventsDesktop`, `EventsMobile`, `EventsMobileEmpty` (no results), `EventsDesktopDark` |
| Event detail | `DetailDesktop` (can join), `DetailDesktopStaff` (organizer: attendees, tools, delete confirm), `DetailMobileJoin`, `DetailMobileIn` (you're in + cancel confirm), `DetailMobileFull` (409 race), `DetailMobileEnded` |
| My sign-ups | `SignupsDesktop`, `SignupsMobile` (after a cancel), `SignupsMobileEmpty` |
| Manage | `ManageEventsDesktop`, `EventFormDesktop` (errors), `UsersDesktop`, `EventFormMobile` (errors), `NotAllowedMobile` |

Mobile boards are 390px wide; desktop boards are designed at 1280px and are fluid.

## Updating

After changing the canvas, re-download its `project/` files into `canvas/` and
regenerate `preview/`. Ask Claude to "sync the mockups from the canvas".
