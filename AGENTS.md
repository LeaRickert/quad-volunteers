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
├── apps/
│   ├── api/              # NestJS app, http://localhost:3001
│   │   ├── src/
│   │   │   ├── main.ts       # bootstrap: global ValidationPipe, CORS, port 3001
│   │   │   ├── app.module.ts # ConfigModule + TypeOrmModule root config
│   │   │   ├── users/        # resource: module, controller, service, entity, dto, specs
│   │   │   └── events/       # resource: same shape as users/
│   │   ├── postman/      # nextvolunteers.postman_collection.json (API smoke tests)
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

## Database

- Local Postgres runs in the existing Docker container **`my-postgres`**:
  `localhost:5432`, user `postgres`, password `mysecretpassword`, db `nextvolunteers`
  (local dev credentials only).
- Connection string: `postgresql://postgres:mysecretpassword@localhost:5432/nextvolunteers`
- Inspect: `docker exec -it my-postgres psql -U postgres -d nextvolunteers`
- `docker-compose.yml` / `npm run db:up` is an alternative; don't run it while
  `my-postgres` is up (port 5432 conflict).
- **ORM: TypeORM.** Connection set up in `app.module.ts` with
  `TypeOrmModule.forRootAsync` reading `DATABASE_URL` from `ConfigService`;
  `autoLoadEntities: true`.
- **`synchronize: true` (dev only):** tables are created/altered from entities on
  startup. No migrations yet. Replacing this with TypeORM migrations is a planned step
  and must happen before any real data or deployment.
- Tables: `users`, `events` (no relations yet).

## Configuration

- `apps/api/.env` (from `.env.example`): `PORT`, `WEB_ORIGIN`, `DATABASE_URL`.
  Loaded by `ConfigModule.forRoot({ isGlobal: true })`; inject `ConfigService` to read
  values (`getOrThrow` for required ones). `main.ts` reads `PORT`/`WEB_ORIGIN` from
  `process.env` with defaults.
- `apps/web/.env.local` (from `.env.example`): `NEXT_PUBLIC_API_URL=http://localhost:3001`.
- `.env` files are gitignored; only `.env.example` files are committed.

## Decisions so far

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
  `getRepositoryToken(Entity)`) and per DTO (`plainToInstance` + `validate`);
  Postman collection for end-to-end smoke tests (`npx newman run apps/api/postman/nextvolunteers.postman_collection.json`).

## Requirements

### Done: Users & Events CRUD API

Both resources expose `GET /x`, `GET /x/:id`, `POST /x`, `PATCH /x/:id`, `DELETE /x/:id`.

- **User:** `id` (uuid), `name`, `email` (unique), `role` (`admin` | `organizer` |
  `volunteer`, default `volunteer`), `createdAt`, `updatedAt`. Listed by name.
  Duplicate email → 409.
- **Event:** `id` (uuid), `title`, `description?`, `location`, `startsAt`, `endsAt`
  (must be after `startsAt`), `capacity?` (int ≥ 1, null = unlimited), `createdAt`,
  `updatedAt`. Listed by `startsAt`, then `title`.
- No authentication or authorization: any client can create any role, including `admin`.

### To be defined

- Sign-ups: users joining events (relation, capacity enforcement)
- Event ownership (`createdBy` organizer)
- Authentication and role-based permissions
- TypeORM migrations (replace `synchronize`)
- Frontend pages in `apps/web` consuming the API
- Shared types between API and web (possible `packages/shared` workspace)
- Pagination/filtering (e.g. upcoming events only)
- Deployment (out of scope for now)
