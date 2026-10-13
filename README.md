# Quad Volunteers

A campus volunteering app: students find events, sign up and track their volunteer hours;
student organizations run events and report on them. It's a rebuild of an old student project,
using **NestJS** for the API and **Next.js** for the web app.

## Docs

- [Project spec](docs/spec.md): vision, users, phases and user stories
- [UI design](docs/design/README.md): design system, screen specs, mockups, UI roadmap
- [Feature plans](docs/plans/): implementation plans per feature

## Stack

- **API:** NestJS + TypeScript (`apps/api`) at http://localhost:3001
- **Web:** Next.js (App Router) + React + Tailwind CSS (`apps/web`) at http://localhost:3000
- **Database:** PostgreSQL (Docker)
- **Monorepo:** npm workspaces, Node 24

## Getting started

1. Make sure Postgres is running on `localhost:5432` with a `quad_volunteers` database.
   Use your own container, or run `npm run db:up` to start the one in `docker-compose.yml`.
2. Copy the env files:
   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env.local
   ```
3. Install and run:
   ```bash
   npm install
   npm run dev
   ```

## Scripts (from repo root)

| Command                          | What it does                     |
| -------------------------------- | -------------------------------- |
| `npm run dev`                    | Run API and web together         |
| `npm run dev:api` / `dev:web`    | Run one app                      |
| `npm run build`                  | Build both apps                  |
| `npm run lint`                   | Lint both apps                   |
| `npm test`                       | Run API and web tests            |
| `npm run db:up` / `db:down`      | Start/stop the compose Postgres  |

To run a script in one workspace, use `npm run <script> -w api` or `-w web`.
