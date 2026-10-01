# Plan: Sign-ups (users ↔ events)

**Status: implemented.** Deviation: `EventsModule` doesn't register the `Signup`
repository; `EventsService.update` counts via the transaction's `manager.countBy(Signup, …)`.

## Context

Users and events exist as independent CRUD resources. Next: let users (volunteers)
sign up for events. Decisions made with the developer:

- **Model:** explicit `Signup` entity (not `@ManyToMany`), so it can carry its own fields.
- **Cancelling:** deletes the row (no status column). Spots taken = row count.
- **Rules:** no duplicate sign-ups (409), capacity enforced (409 when full), no sign-up
  or cancellation once the event has started (400).
- **Routes:** nested under events (+ a per-user list). No auth yet, so `userId` is sent.
- **Concurrency:** capacity check runs in a transaction with a row lock on the event.
- **Capacity edits:** lowering an event's capacity below its sign-up count → 409.

## Data model

```ts
@Entity('signups')
@Unique(['userId', 'eventId'])
export class Signup {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column() userId: string;
  @ManyToOne(() => User, (user) => user.signups, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: Relation<User>;

  @Column() eventId: string;
  @ManyToOne(() => Event, (event) => event.signups, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'eventId' })
  event: Relation<Event>;

  @CreateDateColumn({ type: 'timestamptz' }) createdAt: Date;
}
```

`User` and `Event` each get `@OneToMany(() => Signup, ...) signups: Relation<Signup[]>`.

- Explicit `userId`/`eventId` columns allow `where: { eventId }` without joins.
- `onDelete: 'CASCADE'`: deleting a user/event removes its sign-ups.
- `Relation<>` avoids ESM circular-import errors between entity files.

## Routes

| Method | Path | Body | Success | Errors |
|---|---|---|---|---|
| POST | `/events/:eventId/signups` | `{ userId }` | 201 sign-up | 400 bad uuid / event started · 404 event or user · 409 duplicate · 409 full |
| GET | `/events/:eventId/signups` | — | 200 sign-ups with `user`, oldest first | 404 event |
| DELETE | `/events/:eventId/signups/:userId` | — | 204 | 400 event started · 404 not signed up |
| GET | `/users/:userId/signups` | — | 200 sign-ups with `event`, by `event.startsAt` | 404 user |

Plus: `PATCH /events/:id` with `capacity` below the current sign-up count → 409.

## Module structure

```
SignupsModule
  imports: TypeOrmModule.forFeature([Signup]), UsersModule, EventsModule
  controllers: SignupsController   (@Controller() with full paths per method)
  providers: SignupsService
```

- `UsersModule` / `EventsModule` add `exports` for their services so `SignupsService`
  can reuse `findOne` (and its 404).
- `EventsModule` registers `forFeature([Event, Signup])` to count sign-ups itself,
  avoiding a circular module import.

## Sign-up: transaction + row lock

```ts
return this.dataSource.transaction(async (manager) => {
  const event = await manager.findOne(Event, {
    where: { id: eventId },
    lock: { mode: 'pessimistic_write' },
  });
  if (!event) throw new NotFoundException(...);
  if (event.startsAt <= new Date()) throw new BadRequestException('Event already started');
  await this.usersService.findOne(userId);
  if (event.capacity !== null) {
    const taken = await manager.count(Signup, { where: { eventId } });
    if (taken >= event.capacity) throw new ConflictException('Event is full');
  }
  return manager.save(manager.create(Signup, { eventId, userId }));
});   // try/catch: isUniqueViolation → 409 "already signed up"
```

`EventsService.update` takes the same lock when checking the count against a new capacity.

## Steps

1. **Entity & relations:** `Signup`, inverse `signups` on `User` and `Event`. Verify with `\d signups`.
2. **Module wiring:** `SignupsModule`, controller, service; `exports` in Users/Events modules.
3. **Read routes:** `GET /events/:eventId/signups`, `GET /users/:userId/signups`.
4. **POST sign-up:** transaction, lock, rules.
5. **DELETE (cancel):** 404 if not signed up, 400 if started.
6. **Capacity rule** in `EventsService.update` (409).
7. **Tests:** unit tests with a mocked `DataSource.transaction`, `vi.setSystemTime()`
   for "already started"; Signups folder in the Postman collection.
8. **Docs:** update AGENTS.md (decisions, conventions, requirements).

## Verification

- `npm test`; Newman run of the Users, Events and Signups folders.
- Concurrency: event with `capacity: 3`, 10 users, 10 parallel POSTs → exactly
  three 201s and seven 409s.

## Out of scope

Sign-up counts on `GET /events`, waitlists, auth-dependent rules (volunteers-only).
