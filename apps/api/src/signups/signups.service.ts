import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { isUniqueViolation } from '../common/database-errors.js';
import { Event } from '../events/entities/event.entity.js';
import { EventsService } from '../events/events.service.js';
import { UsersService } from '../users/users.service.js';
import { Signup } from './entities/signup.entity.js';

@Injectable()
export class SignupsService {
  constructor(
    @InjectRepository(Signup)
    private readonly signupsRepository: Repository<Signup>,
    // Provided by TypeOrmModule; used to run several queries in one transaction.
    private readonly dataSource: DataSource,
    // Exported by UsersModule / EventsModule; reused for their 404 handling.
    private readonly usersService: UsersService,
    private readonly eventsService: EventsService,
  ) {}

  async create(eventId: string, userId: string) {
    try {
      return await this.dataSource.transaction(async (manager) => {
        // Lock the event row until commit: a concurrent sign-up for the same
        // event waits here, so two requests can't both take the last spot.
        const event = await manager.findOne(Event, {
          where: { id: eventId },
          lock: { mode: 'pessimistic_write' },
        });
        if (!event) {
          throw new NotFoundException(`Event with id ${eventId} not found`);
        }
        this.#assertNotStarted(event);
        await this.usersService.findOne(userId);

        // Checked before capacity so a full event still reports the clearer error.
        if (await manager.existsBy(Signup, { eventId, userId })) {
          throw new ConflictException(
            'User is already signed up for this event',
          );
        }
        if (event.capacity !== null) {
          const taken = await manager.countBy(Signup, { eventId });
          if (taken >= event.capacity) {
            throw new ConflictException('Event is full');
          }
        }

        return manager.save(manager.create(Signup, { eventId, userId }));
      });
    } catch (error) {
      // Backstop for the unique (userId, eventId) constraint.
      if (isUniqueViolation(error)) {
        throw new ConflictException('User is already signed up for this event');
      }
      throw error;
    }
  }

  async findForEvent(eventId: string) {
    await this.eventsService.findOne(eventId); // 404 for an unknown event
    return this.signupsRepository.find({
      where: { eventId },
      relations: { user: true },
      order: { createdAt: 'ASC' },
    });
  }

  async findForUser(userId: string) {
    await this.usersService.findOne(userId); // 404 for an unknown user
    return this.signupsRepository.find({
      where: { userId },
      relations: { event: true },
      order: { event: { startsAt: 'ASC' } },
    });
  }

  async remove(eventId: string, userId: string) {
    const event = await this.eventsService.findOne(eventId);
    const signup = await this.signupsRepository.findOneBy({ eventId, userId });
    if (!signup) {
      throw new NotFoundException(
        `User ${userId} is not signed up for event ${eventId}`,
      );
    }
    this.#assertNotStarted(event);
    await this.signupsRepository.remove(signup);
  }

  #assertNotStarted(event: Event) {
    if (event.startsAt.getTime() <= Date.now()) {
      throw new BadRequestException('Event has already started');
    }
  }
}
