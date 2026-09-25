import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto.js';
import { UpdateEventDto } from './dto/update-event.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity.js';
@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
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
    const event = await this.findOne(id);
    this.eventsRepository.merge(event, updateEventDto);
    this.#assertsEndsAfterStart(event);
    return await this.eventsRepository.save(event);
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
