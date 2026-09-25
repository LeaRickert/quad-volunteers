import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service.js';
import { Event } from './entities/event.entity.js';
import { getRepositoryToken } from '@nestjs/typeorm';
describe('EventsService', () => {
  let service: EventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: getRepositoryToken(Event), useValue: {} },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it("not found", async () => {

  })
});


//for example not-found, duplicate email and date order.
