import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { type Mock, vi } from 'vitest';
import { EventsService } from './events.service.js';
import { Event } from './entities/event.entity.js';

type MockRepository = Record<
  'create' | 'save' | 'find' | 'findOneBy' | 'remove',
  Mock
>;

// update() runs inside dataSource.transaction(); the callback receives an EntityManager.
type MockManager = Record<'findOne' | 'merge' | 'countBy' | 'save', Mock>;

// Plain object shaped like a saved Event (05:00–09:00); `overrides` tweaks single fields.
function makeEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: '5a8be171-f36d-419f-85c7-313410d09b73',
    title: 'beach cleanup',
    description: '',
    location: 'beach',
    startsAt: new Date('2026-06-01T05:00:00Z'),
    endsAt: new Date('2026-06-01T09:00:00Z'),
    capacity: 5,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

describe('EventsService', () => {
  let service: EventsService;
  let repo: MockRepository;
  let manager: MockManager;

  beforeEach(async () => {
    repo = {
      create: vi.fn(),
      save: vi.fn(),
      find: vi.fn(),
      findOneBy: vi.fn(),
      remove: vi.fn(),
    };
    manager = {
      findOne: vi.fn(),
      // merge really copies fields in TypeORM; mimic that so the date check sees the merged values.
      // EntityManager.merge takes the entity class first: merge(Event, target, source).
      merge: vi.fn((_entity: unknown, target: Event, source: Partial<Event>) =>
        Object.assign(target, source),
      ),
      countBy: vi.fn().mockResolvedValue(0),
      // Echo back whatever is saved, like the real repository does.
      save: vi.fn((e: Event) => Promise.resolve(e)),
    };
    // A fake transaction just runs the callback with our fake manager.
    const dataSource = {
      transaction: vi.fn((work: (m: MockManager) => unknown) => work(manager)),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: getRepositoryToken(Event), useValue: repo },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  describe('create', () => {
    const base = { title: 'Beach Cleanup', location: 'beach' };

    it('saves and returns a new event', async () => {
      const dto = {
        ...base,
        startsAt: new Date('2026-06-01T05:00:00Z'),
        endsAt: new Date('2026-06-01T09:00:00Z'),
      };
      const saved = makeEvent();
      repo.create.mockReturnValue(dto);
      repo.save.mockResolvedValue(saved);

      await expect(service.create(dto)).resolves.toEqual(saved);
      expect(repo.create).toHaveBeenCalledWith(dto);
      expect(repo.save).toHaveBeenCalledWith(dto);
    });

    // The private date check is tested through create(): give it bad input,
    // expect the exception, and make sure nothing reached the database.
    it.each([
      { case: 'ends before it starts', endsAt: '2026-06-01T04:00:00Z' },
      { case: 'ends exactly when it starts', endsAt: '2026-06-01T05:00:00Z' },
    ])(
      'throws BadRequestException when the event $case',
      async ({ endsAt }) => {
        const dto = {
          ...base,
          startsAt: new Date('2026-06-01T05:00:00Z'),
          endsAt: new Date(endsAt),
        };
        repo.create.mockReturnValue(dto);

        await expect(service.create(dto)).rejects.toThrow(BadRequestException);
        expect(repo.save).not.toHaveBeenCalled();
      },
    );
  });

  describe('findAll', () => {
    it('returns events ordered by start time, then title', async () => {
      const events = [makeEvent(), makeEvent({ title: 'park cleanup' })];
      repo.find.mockResolvedValue(events);

      await expect(service.findAll()).resolves.toEqual(events);
      expect(repo.find).toHaveBeenCalledWith({
        order: { startsAt: 'ASC', title: 'ASC' },
      });
    });
  });

  describe('findOne', () => {
    it('returns the event when it exists', async () => {
      const event = makeEvent();
      repo.findOneBy.mockResolvedValue(event);

      await expect(service.findOne(event.id)).resolves.toBe(event);
      expect(repo.findOneBy).toHaveBeenCalledWith({ id: event.id });
    });

    it('throws NotFoundException when no event matches', async () => {
      repo.findOneBy.mockResolvedValue(null);

      await expect(service.findOne('missing-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('merges the changes into the existing event and saves it', async () => {
      const event = makeEvent();
      manager.findOne.mockResolvedValue(event);

      const result = await service.update(event.id, {
        location: 'south beach',
      });

      expect(manager.merge).toHaveBeenCalledWith(Event, event, {
        location: 'south beach',
      });
      expect(result).toMatchObject({
        title: 'beach cleanup',
        location: 'south beach',
      });
    });

    it('locks the event row while updating', async () => {
      manager.findOne.mockResolvedValue(makeEvent());

      await service.update('some-id', { title: 'x' });

      expect(manager.findOne).toHaveBeenCalledWith(Event, {
        where: { id: 'some-id' },
        lock: { mode: 'pessimistic_write' },
      });
    });

    it('allows moving both dates when the result is still valid', async () => {
      manager.findOne.mockResolvedValue(makeEvent());

      // New start (10:00) is after the old end (09:00); only valid because endsAt moves too.
      const result = await service.update('some-id', {
        startsAt: new Date('2026-06-01T10:00:00Z'),
        endsAt: new Date('2026-06-01T12:00:00Z'),
      });

      expect(result.startsAt).toEqual(new Date('2026-06-01T10:00:00Z'));
      expect(manager.save).toHaveBeenCalled();
    });

    // PATCH sends one date; the check must compare it with the date already stored.
    it.each([
      {
        case: 'the new endsAt is before the stored startsAt',
        changes: { endsAt: new Date('2026-06-01T04:00:00Z') },
      },
      {
        case: 'the new startsAt is after the stored endsAt',
        changes: { startsAt: new Date('2026-06-01T10:00:00Z') },
      },
      {
        case: 'the new endsAt equals the stored startsAt',
        changes: { endsAt: new Date('2026-06-01T05:00:00Z') },
      },
    ])('throws BadRequestException when $case', async ({ changes }) => {
      manager.findOne.mockResolvedValue(makeEvent()); // 05:00–09:00

      await expect(service.update('some-id', changes)).rejects.toThrow(
        BadRequestException,
      );
      expect(manager.save).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when the event does not exist', async () => {
      manager.findOne.mockResolvedValue(null);

      await expect(
        service.update('missing-id', { title: 'x' }),
      ).rejects.toThrow(NotFoundException);
      expect(manager.save).not.toHaveBeenCalled();
    });

    describe('capacity', () => {
      it('throws ConflictException when lowered below the sign-up count', async () => {
        manager.findOne.mockResolvedValue(makeEvent({ capacity: 5 }));
        manager.countBy.mockResolvedValue(3);

        await expect(
          service.update('some-id', { capacity: 2 }),
        ).rejects.toThrow(ConflictException);
        expect(manager.countBy).toHaveBeenCalledWith(expect.anything(), {
          eventId: 'some-id',
        });
        expect(manager.save).not.toHaveBeenCalled();
      });

      it.each([
        { case: 'equal to the sign-up count', capacity: 3 },
        { case: 'above the sign-up count', capacity: 10 },
        { case: 'cleared to unlimited (null)', capacity: null },
      ])('allows a capacity $case', async ({ capacity }) => {
        manager.findOne.mockResolvedValue(makeEvent({ capacity: 5 }));
        manager.countBy.mockResolvedValue(3);

        await expect(
          service.update('some-id', { capacity }),
        ).resolves.toMatchObject({ capacity });
      });

      it('does not count sign-ups when capacity is not being changed', async () => {
        manager.findOne.mockResolvedValue(makeEvent());

        await service.update('some-id', { title: 'x' });

        expect(manager.countBy).not.toHaveBeenCalled();
      });
    });
  });

  describe('remove', () => {
    it('removes the loaded event', async () => {
      const event = makeEvent();
      repo.findOneBy.mockResolvedValue(event);

      await service.remove(event.id);

      expect(repo.remove).toHaveBeenCalledWith(event);
    });

    it('throws NotFoundException and removes nothing when the event does not exist', async () => {
      repo.findOneBy.mockResolvedValue(null);

      await expect(service.remove('missing-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(repo.remove).not.toHaveBeenCalled();
    });
  });
});
