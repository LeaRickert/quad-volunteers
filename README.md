# nextvolunteers

A basic volunteer sign-up app, built as a learning project for **NestJS** and **Next.js**.

## Stack

- **API:** NestJS + TypeScript (`apps/api`) at http://localhost:3001
- **Web:** Next.js (App Router) + React + Tailwind CSS (`apps/web`) at http://localhost:3000
- **Database:** PostgreSQL (Docker)
- **Monorepo:** npm workspaces, Node 24

## Getting started

1. Make sure Postgres is running on `localhost:5432` with a `nextvolunteers` database.
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
| `npm test`                       | Run API tests                    |
| `npm run db:up` / `db:down`      | Start/stop the compose Postgres  |

To run a script in one workspace, use `npm run <script> -w api` or `-w web`.
