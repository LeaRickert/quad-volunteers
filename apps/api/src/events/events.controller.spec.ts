import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller.js';
import { EventsService } from './events.service.js';
import { vi } from 'vitest';

describe('EventsController', () => {
  let controller: EventsController;
  let service: { findAll: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    service = { findAll: vi.fn().mockResolvedValue([]) };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [{ provide: EventsService, useValue: service }],
    }).compile();

    controller = module.get<EventsController>(EventsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('passes the query to the service and returns its result', async () => {
      const events = [{ id: '1' }];
      service.findAll.mockResolvedValue(events);

      await expect(controller.findAll({ past: true })).resolves.toBe(events);
      expect(service.findAll).toHaveBeenCalledWith({ past: true });
    });
  });
});
