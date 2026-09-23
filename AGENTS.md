# AGENTS.md

Instructions for AI coding agents working in this repo. See `README.md` for the
project overview, setup and scripts.

## About this project

A basic **volunteer sign-up app**, built **for learning purposes** so the developer
understands the **NestJS** (backend) and **Next.js** (frontend) frameworks.

The full description and requirements will be fleshed out step by step. Update the
"Requirements" and "Decisions" sections below as they are agreed on.

## How to work with me (IMPORTANT)

The developer is guiding development in small steps to understand each piece.

- **Default to guiding and planning, not writing code.** Explain concepts, outline
  the steps, point to the files involved, and show short illustrative snippets when
  they help understanding.
- **Only generate full code / make file edits when asked directly** (e.g. "write
  it", "implement this", "generate the code").
- Explain the *why*: which NestJS / Next.js concept is in play (modules, providers,
  DI, controllers, DTOs/pipes, Server vs Client Components, routing, data fetching…).
- Keep steps small and one concept at a time; suggest a sensible next step at the end.
- When there is a real choice to make (library, pattern, structure), lay out the
  options briefly with a recommendation and let the developer decide.
- Prefer framework conventions and official tooling (Nest CLI generators,
  Next.js file conventions) over custom setups.

## Stack details

| Part      | Tech                                                      | Location    |
| --------- | --------------------------------------------------------- | ----------- |
| Backend   | NestJS 12, TypeScript (ESM, strict), Vitest, oxlint       | `apps/api`  |
| Frontend  | Next.js 16 (App Router, `src/`), React 19, Tailwind CSS 4 | `apps/web`  |
| Database  | PostgreSQL (Docker container)                             | —           |
| Tooling   | npm workspaces monorepo, Node 24                          | repo root   |

Next.js 16 may differ from older training data. See `apps/web/AGENTS.md` and read
the bundled docs in `node_modules/next/dist/docs/` before writing Next.js code.
(With workspaces, `next` may be hoisted to the root `node_modules/`.)

## Layout

```
nextvolunteers/
├── package.json          # workspaces + root scripts
├── docker-compose.yml    # optional reproducible Postgres (see below)
├── apps/
│   ├── api/              # NestJS app, http://localhost:3001
│   │   ├── src/main.ts   # bootstrap: port 3001, CORS for the web app
│   │   └── .env.example
│   └── web/              # Next.js app, http://localhost:3000
│       ├── src/app/      # App Router routes
│       └── .env.example
```

Nest generators (run from `apps/api`): `npx nest g resource <name>`,
`npx nest g module <name>`, etc.

## Database

- Local Postgres runs in the existing Docker container **`my-postgres`**:
  `localhost:5432`, user `postgres`, password `mysecretpassword`, db `nextvolunteers`
  (local dev credentials only).
- Connection string: `postgresql://postgres:mysecretpassword@localhost:5432/nextvolunteers`
- Inspect: `docker exec -it my-postgres psql -U postgres -d nextvolunteers`
- `docker-compose.yml` / `npm run db:up` is an alternative; don't run it while
  `my-postgres` is up (port 5432 conflict).
- **No ORM / DB layer chosen yet.** This is a planned learning step (options:
  Prisma, TypeORM, Drizzle, MikroORM).

## Configuration

- `apps/api/.env` (from `.env.example`): `PORT`, `WEB_ORIGIN`, `DATABASE_URL`.
  Not loaded automatically yet; config loading (`@nestjs/config` or
  `node --env-file`) is a future step. Defaults in `main.ts` make it work without it.
- `apps/web/.env.local` (from `.env.example`): `NEXT_PUBLIC_API_URL=http://localhost:3001`.
- `.env` files are gitignored; only `.env.example` files are committed.

## Decisions so far

- Monorepo with npm workspaces (`apps/api`, `apps/web`).
- API on port 3001, web on 3000; CORS enabled on the API for the web origin.
- Next.js App Router + Tailwind + `src/` dir + `@/*` import alias.
- ORM: deferred.

## Requirements (to be defined)

Placeholder. Likely areas to decide together:
- Core entities (e.g. volunteers, events/opportunities, shifts, sign-ups)
- User roles (volunteer vs organizer/admin) and authentication
- Validation (class-validator DTOs), error handling, API shape (REST)
- Shared types between API and web (possible `packages/shared` workspace)
- Testing approach (unit vs e2e) and deployment (out of scope for now)
