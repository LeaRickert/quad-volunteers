import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, QueryFailedError } from 'typeorm';
import { type Mock, vi } from 'vitest';
import { Event } from '../events/entities/event.entity.js';
import { EventsService } from '../events/events.service.js';
import { UsersService } from '../users/users.service.js';
import { Signup } from './entities/signup.entity.js';
import { SignupsService } from './signups.service.js';

const EVENT_ID = '5a8be171-f36d-419f-85c7-313410d09b73';
const USER_ID = '8b5be171-f36d-419f-85c7-313410d09b73';
// All tests run with "now" frozen here, before the event starts (see beforeEach).
const NOW = new Date('2026-05-01T00:00:00Z');

function makeEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: EVENT_ID,
    title: 'beach cleanup',
    description: null,
    location: 'beach',
    startsAt: new Date('2026-06-01T05:00:00Z'),
    endsAt: new Date('2026-06-01T09:00:00Z'),
    capacity: 2,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

function uniqueViolation() {
  const driverError = Object.assign(new Error('duplicate key'), {
    code: '23505',
  });
  return new QueryFailedError('INSERT ...', [], driverError);
}

describe('SignupsService', () => {
  let service: SignupsService;
  let repo: Record<'find' | 'findOneBy' | 'remove', Mock>;
  let manager: Record<
    'findOne' | 'existsBy' | 'countBy' | 'create' | 'save',
    Mock
  >;
  let usersService: { findOne: Mock };
  let eventsService: { findOne: Mock };

  beforeEach(async () => {
    // Fake only Date, so `new Date()` / `Date.now()` return NOW; timers stay real.
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW);

    repo = { find: vi.fn(), findOneBy: vi.fn(), remove: vi.fn() };
    // Defaults describe the happy path; individual tests override what they need.
    manager = {
      findOne: vi.fn().mockResolvedValue(makeEvent()),
      existsBy: vi.fn().mockResolvedValue(false),
      countBy: vi.fn().mockResolvedValue(0),
      create: vi.fn((_entity: unknown, data: Partial<Signup>) => data),
      save: vi.fn((data: Partial<Signup>) =>
        Promise.resolve({ id: 'new-signup-id', ...data }),
      ),
    };
    usersService = { findOne: vi.fn().mockResolvedValue({ id: USER_ID }) };
    eventsService = { findOne: vi.fn().mockResolvedValue(makeEvent()) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignupsService,
        { provide: getRepositoryToken(Signup), useValue: repo },
        {
          provide: DataSource,
          useValue: {
            // A fake transaction just runs the callback with our fake manager.
            transaction: vi.fn((work: (m: typeof manager) => unknown) =>
              work(manager),
            ),
          },
        },
        // Whole services can be swapped too, not just repositories.
        { provide: UsersService, useValue: usersService },
        { provide: EventsService, useValue: eventsService },
      ],
    }).compile();

    service = module.get(SignupsService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('create', () => {
    it('saves a sign-up for the user and event', async () => {
      await expect(service.create(EVENT_ID, USER_ID)).resolves.toEqual({
        id: 'new-signup-id',
        eventId: EVENT_ID,
        userId: USER_ID,
      });
      expect(manager.create).toHaveBeenCalledWith(Signup, {
        eventId: EVENT_ID,
        userId: USER_ID,
      });
    });

    it('locks the event row before checking capacity', async () => {
      await service.create(EVENT_ID, USER_ID);

      expect(manager.findOne).toHaveBeenCalledWith(Event, {
        where: { id: EVENT_ID },
        lock: { mode: 'pessimistic_write' },
      });
    });

    it('throws NotFoundException when the event does not exist', async () => {
      manager.findOne.mockResolvedValue(null);

      await expect(service.create(EVENT_ID, USER_ID)).rejects.toThrow(
        NotFoundException,
      );
      expect(manager.save).not.toHaveBeenCalled();
    });

    it('passes on the NotFoundException when the user does not exist', async () => {
      usersService.findOne.mockRejectedValue(new NotFoundException());

      await expect(service.create(EVENT_ID, USER_ID)).rejects.toThrow(
        NotFoundException,
      );
      expect(manager.save).not.toHaveBeenCalled();
    });

    it.each([
      { case: 'exactly when the event starts', now: '2026-06-01T05:00:00Z' },
      { case: 'after the event has started', now: '2026-06-01T06:00:00Z' },
    ])('throws BadRequestException $case', async ({ now }) => {
      vi.setSystemTime(new Date(now));

      await expect(service.create(EVENT_ID, USER_ID)).rejects.toThrow(
        BadRequestException,
      );
      expect(manager.save).not.toHaveBeenCalled();
    });

    it('throws ConflictException when the user is already signed up', async () => {
      manager.existsBy.mockResolvedValue(true);

      await expect(service.create(EVENT_ID, USER_ID)).rejects.toThrow(
        'already signed up',
      );
      expect(manager.save).not.toHaveBeenCalled();
    });

    it('throws ConflictException when the event is full', async () => {
      manager.countBy.mockResolvedValue(2); // capacity is 2

      await expect(service.create(EVENT_ID, USER_ID)).rejects.toThrow(
        new ConflictException('Event is full'),
      );
      expect(manager.save).not.toHaveBeenCalled();
    });

    it('takes the last free spot', async () => {
      manager.countBy.mockResolvedValue(1); // capacity is 2

      await expect(service.create(EVENT_ID, USER_ID)).resolves.toBeDefined();
    });

    it('skips the capacity check for unlimited events', async () => {
      manager.findOne.mockResolvedValue(makeEvent({ capacity: null }));

      await service.create(EVENT_ID, USER_ID);

      expect(manager.countBy).not.toHaveBeenCalled();
      expect(manager.save).toHaveBeenCalled();
    });

    it('turns a unique-constraint error into ConflictException', async () => {
      manager.save.mockRejectedValue(uniqueViolation());

      await expect(service.create(EVENT_ID, USER_ID)).rejects.toThrow(
        ConflictException,
      );
    });

    it('re-throws other database errors unchanged', async () => {
      const dbDown = new Error('connection refused');
      manager.save.mockRejectedValue(dbDown);

      await expect(service.create(EVENT_ID, USER_ID)).rejects.toBe(dbDown);
    });
  });

  describe('findForEvent', () => {
    it('returns the sign-ups with their users, oldest first', async () => {
      const signups = [{ id: 's1' }, { id: 's2' }];
      repo.find.mockResolvedValue(signups);

      await expect(service.findForEvent(EVENT_ID)).resolves.toBe(signups);
      expect(repo.find).toHaveBeenCalledWith({
        where: { eventId: EVENT_ID },
        relations: { user: true },
        order: { createdAt: 'ASC' },
      });
    });

    it('passes on the NotFoundException for an unknown event', async () => {
      eventsService.findOne.mockRejectedValue(new NotFoundException());

      await expect(service.findForEvent(EVENT_ID)).rejects.toThrow(
        NotFoundException,
      );
      expect(repo.find).not.toHaveBeenCalled();
    });
  });

  describe('findForUser', () => {
    it('returns the sign-ups with their events, by event start', async () => {
      repo.find.mockResolvedValue([]);

      await service.findForUser(USER_ID);

      expect(repo.find).toHaveBeenCalledWith({
        where: { userId: USER_ID },
        relations: { event: true },
        order: { event: { startsAt: 'ASC' } },
      });
    });

    it('passes on the NotFoundException for an unknown user', async () => {
      usersService.findOne.mockRejectedValue(new NotFoundException());

      await expect(service.findForUser(USER_ID)).rejects.toThrow(
        NotFoundException,
      );
      expect(repo.find).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    const signup = { id: 's1', eventId: EVENT_ID, userId: USER_ID };

    it('removes the sign-up', async () => {
      repo.findOneBy.mockResolvedValue(signup);

      await service.remove(EVENT_ID, USER_ID);

      expect(repo.findOneBy).toHaveBeenCalledWith({
        eventId: EVENT_ID,
        userId: USER_ID,
      });
      expect(repo.remove).toHaveBeenCalledWith(signup);
    });

    it('throws NotFoundException when the user is not signed up', async () => {
      repo.findOneBy.mockResolvedValue(null);

      await expect(service.remove(EVENT_ID, USER_ID)).rejects.toThrow(
        NotFoundException,
      );
      expect(repo.remove).not.toHaveBeenCalled();
    });

    it('throws BadRequestException once the event has started', async () => {
      repo.findOneBy.mockResolvedValue(signup);
      vi.setSystemTime(new Date('2026-06-01T06:00:00Z'));

      await expect(service.remove(EVENT_ID, USER_ID)).rejects.toThrow(
        BadRequestException,
      );
      expect(repo.remove).not.toHaveBeenCalled();
    });
  });
});
