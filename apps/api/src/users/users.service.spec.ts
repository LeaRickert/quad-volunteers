import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueryFailedError } from 'typeorm';
import { vi, type Mock } from 'vitest';
import { UsersService } from './users.service.js';
import { User, UserRole } from './entities/user.entity.js';

// A fake repository: only the methods UsersService calls, each a vi.fn() spy.
// Each test decides what they return and checks how they were called.
type MockRepository = Record<
  'create' | 'save' | 'find' | 'findOneBy' | 'merge' | 'remove',
  Mock
>;

// The error TypeORM throws when Postgres rejects a duplicate unique value.
function uniqueViolation() {
  const driverError = Object.assign(new Error('duplicate key'), {
    code: '23505',
  });
  return new QueryFailedError('INSERT ...', [], driverError);
}

// Plain object shaped like a saved User; `overrides` tweaks single fields.
function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: '8b5be171-f36d-419f-85c7-313410d09b73',
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    role: UserRole.VOLUNTEER,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

describe('UsersService', () => {
  let service: UsersService;
  let repo: MockRepository;

  // Runs before every `it`, so each test starts with fresh spies and no leftover state.
  beforeEach(async () => {
    repo = {
      create: vi.fn(),
      save: vi.fn(),
      find: vi.fn(),
      findOneBy: vi.fn(),
      // merge really copies fields in TypeORM; mimic that so update() sees the change.
      merge: vi.fn((target: User, source: Partial<User>) =>
        Object.assign(target, source),
      ),
      remove: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        // Same token @InjectRepository(User) asks for, so Nest injects our fake.
        { provide: getRepositoryToken(User), useValue: repo },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  describe('create', () => {
    it('saves and returns the new user', async () => {
      const dto = { name: 'Ada Lovelace', email: 'ada@example.com' };
      const saved = makeUser();
      repo.create.mockReturnValue(dto); // sync method → mockReturnValue
      repo.save.mockResolvedValue(saved); // async method → mockResolvedValue

      await expect(service.create(dto)).resolves.toEqual(saved);
      expect(repo.create).toHaveBeenCalledWith(dto);
      expect(repo.save).toHaveBeenCalledWith(dto);
    });

    it('throws ConflictException when the email already exists', async () => {
      repo.create.mockReturnValue({});
      repo.save.mockRejectedValue(uniqueViolation());

      await expect(
        service.create({ name: 'Ada', email: 'ada@example.com' }),
      ).rejects.toThrow(ConflictException);
    });

    it('re-throws other database errors unchanged', async () => {
      const dbDown = new Error('connection refused');
      repo.create.mockReturnValue({});
      repo.save.mockRejectedValue(dbDown);

      await expect(
        service.create({ name: 'Ada', email: 'ada@example.com' }),
      ).rejects.toBe(dbDown);
    });
  });

  describe('findAll', () => {
    it('returns users ordered by name', async () => {
      const users = [makeUser({ name: 'Ada' }), makeUser({ name: 'Grace' })];
      repo.find.mockResolvedValue(users);

      await expect(service.findAll()).resolves.toEqual(users);
      expect(repo.find).toHaveBeenCalledWith({ order: { name: 'ASC' } });
    });
  });

  describe('findOne', () => {
    it('returns the user when it exists', async () => {
      const user = makeUser();
      repo.findOneBy.mockResolvedValue(user);

      await expect(service.findOne(user.id)).resolves.toBe(user);
      expect(repo.findOneBy).toHaveBeenCalledWith({ id: user.id });
    });

    it('throws NotFoundException when no user matches', async () => {
      repo.findOneBy.mockResolvedValue(null);

      await expect(service.findOne('missing-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('merges the changes into the existing user and saves it', async () => {
      const user = makeUser();
      repo.findOneBy.mockResolvedValue(user);
      // Echo back whatever is saved, like the real repository does.
      repo.save.mockImplementation((u: User) => Promise.resolve(u));

      const result = await service.update(user.id, { name: 'Ada King' });

      expect(repo.merge).toHaveBeenCalledWith(user, { name: 'Ada King' });
      expect(result).toMatchObject({ name: 'Ada King', email: user.email });
    });

    it('throws NotFoundException (not a 500) when the user does not exist', async () => {
      repo.findOneBy.mockResolvedValue(null);

      await expect(service.update('missing-id', { name: 'x' })).rejects.toThrow(
        NotFoundException,
      );
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('throws ConflictException when changing to an email that is taken', async () => {
      repo.findOneBy.mockResolvedValue(makeUser());
      repo.save.mockRejectedValue(uniqueViolation());

      await expect(
        service.update('some-id', { email: 'taken@example.com' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('removes the loaded user', async () => {
      const user = makeUser();
      repo.findOneBy.mockResolvedValue(user);

      await service.remove(user.id);

      expect(repo.remove).toHaveBeenCalledWith(user);
    });

    it('throws NotFoundException and removes nothing when the user does not exist', async () => {
      repo.findOneBy.mockResolvedValue(null);

      await expect(service.remove('missing-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(repo.remove).not.toHaveBeenCalled();
    });
  });
});
