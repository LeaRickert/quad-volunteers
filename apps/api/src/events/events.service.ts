import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto.js';
import { UpdateEventDto } from './dto/update-event.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Event } from './entities/event.entity.js';
import { Signup } from '../signups/entities/signup.entity.js';
@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
    private readonly dataSource: DataSource,
  ) {}
  async create(createEventDto: CreateEventDto) {
    const event = this.eventsRepository.create(createEventDto);
    this.#assertsEndsAfterStart(event);
    return await this.eventsRepository.save(event);
  }

  findAll() {
    return this.eventsRepository.find({
      order: {
        startsAt: 'ASC',
        title: 'ASC',
      },
    });
  }

  async findOne(id: string) {
    const event = await this.eventsRepository.findOneBy({ id });
    if (!event) {
      throw new NotFoundException(`Event with id ${id} not found`);
    }
    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    // Same lock as SignupsService.create, so a sign-up can't slip in
    // between counting sign-ups and lowering the capacity.
    return this.dataSource.transaction(async (manager) => {
      const event = await manager.findOne(Event, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!event) {
        throw new NotFoundException(`Event with id ${id} not found`);
      }
      manager.merge(Event, event, updateEventDto);
      this.#assertsEndsAfterStart(event);

      if (updateEventDto.capacity != null) {
        const taken = await manager.countBy(Signup, { eventId: id });
        if (taken > updateEventDto.capacity) {
          throw new ConflictException(
            `Capacity cannot be lower than the ${taken} current sign-ups`,
          );
        }
      }

      return manager.save(event);
    });
  }

  async remove(id: string) {
    const event = await this.findOne(id);
    return await this.eventsRepository.remove(event);
  }

  #assertsEndsAfterStart(event: Event) {
    if (event.endsAt <= event.startsAt) {
      throw new BadRequestException(
        `Event must End after Start ( ${event.startsAt.toISOString()} )`,
      );
    }
  }
}
