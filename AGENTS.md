# AGENTS.md

Instructions for AI coding agents working in this repo. See `README.md` for the
project overview, setup and scripts.

## About this project

A **campus volunteering app**: students find events, sign up and track volunteer hours;
student organizations run events and report on them. NestJS API, Next.js web app,
PostgreSQL.

**Product spec: [docs/spec.md](docs/spec.md).** It has the vision, roles, phases 1–7
and user stories with acceptance criteria. Read it before planning a feature, and
update it when goals change. This file keeps working conventions, decisions and what's
built.

## How to work with me (IMPORTANT)

**About the developer:** an experienced developer who knows JavaScript/TypeScript and
general software development well, but is **new to NestJS and Next.js**. Skip
explanations of language basics and general programming. Focus on framework idioms,
conventions, and where NestJS or Next.js behaves differently from what an experienced
developer would expect.

**What they're practicing**, so support and reinforce it:
- **Documentation discipline:** keep `docs/spec.md`, `docs/design/`, `docs/plans/` and
  this file current with every change. Plans are written before features are built.
- **Testing:** every change ships with tests (unit, plus Postman for API behavior), and
  verification steps are part of every plan.
- **AI-assisted workflow:** plan → review → implement in small, reviewable steps; the
  developer decides, the agent proposes and explains.

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

| Part       | Tech                                                        | Location   |
| ---------- | ----------------------------------------------------------- | ---------- |
| Backend    | NestJS 12, TypeScript (ESM, strict), Vitest, oxlint         | `apps/api` |
| ORM        | TypeORM via `@nestjs/typeorm`, `pg` driver                  | `apps/api` |
| Validation | class-validator + class-transformer (global ValidationPipe) | `apps/api` |
| Frontend   | Next.js 16 (App Router, `src/`), React 19, Tailwind CSS 4   | `apps/web` |
| Database   | PostgreSQL (Docker container)                               | —          |
| Tooling    | npm workspaces monorepo, Node 24                            | repo root  |

Next.js 16 may differ from older training data. See `apps/web/AGENTS.md` and read
the bundled docs in `node_modules/next/dist/docs/` before writing Next.js code.
(With workspaces, `next` may be hoisted to the root `node_modules/`.)

## Layout

```
nextvolunteers/
├── package.json          # workspaces + root scripts
├── docker-compose.yml    # optional reproducible Postgres (see below)
├── docs/spec.md          # product spec: vision, phases, user stories
├── docs/plans/           # feature plans (e.g. signups.md)
├── docs/design/          # UI design docs: goals, design system, screens, roadmap
├── apps/
│   ├── api/              # NestJS app, http://localhost:3001
│   │   ├── src/
│   │   │   ├── main.ts       # bootstrap: global ValidationPipe, CORS, port 3001
│   │   │   ├── app.module.ts # ConfigModule + TypeOrmModule root config
│   │   │   ├── common/       # shared helpers (database-errors.ts: isUniqueViolation)
│   │   │   ├── users/        # resource: module, controller, service, entity, dto, specs
│   │   │   ├── events/       # resource: same shape as users/
│   │   │   └── signups/      # users ↔ events join entity, nested routes
│   │   ├── postman/      # quad-volunteers.postman_collection.json (API smoke tests)
│   │   └── .env.example
│   └── web/              # Next.js app, http://localhost:3000
│       ├── src/app/      # App Router routes
│       └── .env.example
```

Nest generators (run from `apps/api`): `npx nest g resource <name>`,
`npx nest g module <name>`, etc.

### Resource conventions (follow `users/` and `events/`)

- `nest g resource <name>`, then: entity in `entities/`, `TypeOrmModule.forFeature([Entity])`
  in the module, `@InjectRepository(Entity)` in the service.
- ESM: relative imports need `.js` extensions (`./entities/user.entity.js`).
- Entities: `@Entity('<plural>')` table names, `@PrimaryGeneratedColumn('uuid')` ids,
  `timestamptz` dates, `@CreateDateColumn`/`@UpdateDateColumn`. Declare enums *above*
  the class that uses them (decorators run at class definition).
- Controllers: `@Param('id', ParseUUIDPipe)` on every `:id`, `@HttpCode(204)` on DELETE.
- Services: `findOne` throws `NotFoundException`; `update` = `findOne` + `repo.merge` +
  `repo.save`; `remove` = `findOne` + `repo.remove`. Catch errors only to map them
  (Postgres `23505` via `QueryFailedError` → `ConflictException`), otherwise re-throw.
- DTOs: dates use `@Type(() => Date)` + `@IsDate()` so services get real `Date`s.
  Update DTOs extend `PartialType(CreateDto)` but override non-nullable fields with
  `@ValidateIf((_, v) => v !== undefined)` so PATCH rejects `null` (`@IsOptional`
  lets `null` through → DB NOT NULL error → 500).
- Business rules that span fields (e.g. `endsAt > startsAt`) live in the service and
  run on the merged entity, so partial PATCHes are checked against stored values.

### Relations & cross-module conventions (see `signups/`)

- Join entities get their own table with explicit FK columns (`userId`, `eventId`) plus
  `@ManyToOne` + `@JoinColumn({ name: 'userId' })`, `onDelete: 'CASCADE'`, and
  `@Unique([...])` for pairs that must not repeat.
- Inverse sides are optional (`signups?: Relation<Signup[]>`): only populated when a
  query asks for them. Always wrap relation types in `Relation<>` (ESM circular imports).
- To reuse another resource's logic, export its service from its module and import the
  module. Don't import modules in both directions; use `manager.countBy(Entity, ...)`
  inside a transaction instead.
- Read-check-write rules that must hold under concurrency (capacity) run in
  `dataSource.transaction()` and lock the parent row with
  `lock: { mode: 'pessimistic_write' }`. Every writer of that rule takes the same lock
  (`SignupsService.create`, `EventsService.update`).

## Database

- Local Postgres runs in the existing Docker container **`my-postgres`**:
  `localhost:5432`, user `postgres`, password `mysecretpassword`, db `quad_volunteers`
  (local dev credentials only).
- Connection string: `postgresql://postgres:mysecretpassword@localhost:5432/quad_volunteers`
- Inspect: `docker exec -it my-postgres psql -U postgres -d quad_volunteers`
- `docker-compose.yml` / `npm run db:up` is an alternative; don't run it while
  `my-postgres` is up (port 5432 conflict).
- **ORM: TypeORM.** Connection set up in `app.module.ts` with
  `TypeOrmModule.forRootAsync` reading `DATABASE_URL` from `ConfigService`;
  `autoLoadEntities: true`.
- **`synchronize: true` (dev only):** tables are created/altered from entities on
  startup. No migrations yet. Replacing this with TypeORM migrations is a planned step
  and must happen before any real data or deployment.
- Tables: `users`, `events`, `signups` (FKs to both, `ON DELETE CASCADE`,
  unique `(userId, eventId)`).

## Configuration

- `apps/api/.env` (from `.env.example`): `PORT`, `WEB_ORIGIN`, `DATABASE_URL`.
  Loaded by `ConfigModule.forRoot({ isGlobal: true })`; inject `ConfigService` to read
  values (`getOrThrow` for required ones). `main.ts` reads `PORT`/`WEB_ORIGIN` from
  `process.env` with defaults.
- `apps/web/.env.local` (from `.env.example`): `NEXT_PUBLIC_API_URL=http://localhost:3001`.
- `.env` files are gitignored; only `.env.example` files are committed.

## Decisions so far

- Name: **Quad Volunteers** (slug `quad-volunteers`, monogram "qv"), replacing the
  working title `nextvolunteers`. Database is `quad_volunteers`;
  the project folder is still named `nextvolunteers/`.
- Monorepo with npm workspaces (`apps/api`, `apps/web`).
- API on port 3001, web on 3000; CORS enabled on the API for the web origin.
- Next.js App Router + Tailwind + `src/` dir + `@/*` import alias.
- ORM: **TypeORM** (chosen over Prisma for Nest-idiomatic DI practice);
  `synchronize: true` in dev until migrations are added.
- Config: **`@nestjs/config`**, global.
- Validation: global `ValidationPipe({ whitelist, forbidNonWhitelisted, transform })`;
  unknown body properties → 400.
- REST API, JSON bodies, UUID ids. Errors: 400 validation / bad uuid, 404 not found,
  409 duplicate, 204 on delete.
- Testing: Vitest unit tests per service (mocked repository via
  `getRepositoryToken(Entity)`) and per DTO (`plainToInstance` + `validate`).
  Transactions: provide `DataSource` as `{ transaction: vi.fn((work) => work(manager)) }`
  with a fake manager. Time-based rules: `vi.useFakeTimers({ toFake: ['Date'] })` +
  `vi.setSystemTime()`. Specs using `@Type()` without Nest need `import 'reflect-metadata'`.
  Postman collection for end-to-end smoke tests (`npx newman run apps/api/postman/quad-volunteers.postman_collection.json`).

## Requirements

### Done: Sign-ups (plan: `docs/plans/signups.md`)

| Method | Path | Notes |
|---|---|---|
| POST | `/events/:eventId/signups` `{ userId }` | 201 · 400 event started · 404 event/user · 409 duplicate · 409 full |
| GET | `/events/:eventId/signups` | sign-ups with `user`, oldest first |
| DELETE | `/events/:eventId/signups/:userId` | 204 · 400 event started · 404 not signed up |
| GET | `/users/:userId/signups` | sign-ups with `event`, by `event.startsAt` |

- Cancelling deletes the row; spots taken = row count; `capacity: null` = unlimited.
- `PATCH /events/:id` with `capacity` below the current sign-up count → 409.
- Capacity is race-safe (transaction + row lock); verified with 10 parallel sign-ups.

### Done: Users & Events CRUD API

Both resources expose `GET /x`, `GET /x/:id`, `POST /x`, `PATCH /x/:id`, `DELETE /x/:id`.

- **User:** `id` (uuid), `name`, `email` (unique), `role` (`admin` | `organizer` |
  `volunteer`, default `volunteer`), `createdAt`, `updatedAt`. Listed by name.
  Duplicate email → 409.
- **Event:** `id` (uuid), `title`, `description?`, `location`, `startsAt`, `endsAt`
  (must be after `startsAt`), `capacity?` (int ≥ 1, null = unlimited), `createdAt`,
  `updatedAt`. Listed by `startsAt`, then `title`.
- No authentication or authorization: any client can create any role, including `admin`,
  and sign up any user (`userId` comes from the request body).

### Next (see [docs/spec.md](docs/spec.md))

- **Phase 2, Web UI v1:** designed in `docs/design/`. Build per `design/roadmap.md`
  milestones M0–M9, checking each screen spec's acceptance criteria and mockup.
  It includes API changes for `signupCount` and event filters.
- **Phase 3, Auth:** migrations first, then email + password limited to
  `ALLOWED_EMAIL_DOMAINS`, JWT, guards.
- **Then:** Phase 4 volunteer hours (check-in/out roster) and personal hour goals (hour types on events), Phase 5 organizations,
  Phase 6 reports and CSV, Phase 7 notifications.
- **Unscheduled:** shared API/web types (`packages/shared`), pagination, waitlists,
  shifts, deployment.
