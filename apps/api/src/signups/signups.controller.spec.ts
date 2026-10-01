import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { SignupsController } from './signups.controller.js';
import { SignupsService } from './signups.service.js';

// Controllers should only pass request data through to the service,
// so a fake service is all these tests need.
describe('SignupsController', () => {
  let controller: SignupsController;
  let service: Record<
    'create' | 'findForEvent' | 'findForUser' | 'remove',
    Mock
  >;

  beforeEach(async () => {
    service = {
      create: vi.fn(),
      findForEvent: vi.fn(),
      findForUser: vi.fn(),
      remove: vi.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SignupsController],
      providers: [{ provide: SignupsService, useValue: service }],
    }).compile();

    controller = module.get(SignupsController);
  });

  it('create passes the event id from the URL and the user id from the body', async () => {
    service.create.mockResolvedValue({ id: 's1' });

    await expect(
      controller.create('event-1', { userId: 'user-1' }),
    ).resolves.toEqual({ id: 's1' });
    expect(service.create).toHaveBeenCalledWith('event-1', 'user-1');
  });

  it('remove passes both ids from the URL', async () => {
    await controller.remove('event-1', 'user-1');

    expect(service.remove).toHaveBeenCalledWith('event-1', 'user-1');
  });

  it('findForEvent and findForUser pass their id through', async () => {
    await controller.findForEvent('event-1');
    await controller.findForUser('user-1');

    expect(service.findForEvent).toHaveBeenCalledWith('event-1');
    expect(service.findForUser).toHaveBeenCalledWith('user-1');
  });
});
