import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsModule } from '../events/events.module.js';
import { UsersModule } from '../users/users.module.js';
import { Signup } from './entities/signup.entity.js';
import { SignupsController } from './signups.controller.js';
import { SignupsService } from './signups.service.js';

@Module({
  // UsersModule / EventsModule export their services, so SignupsService can inject them.
  imports: [TypeOrmModule.forFeature([Signup]), UsersModule, EventsModule],
  controllers: [SignupsController],
  providers: [SignupsService],
})
export class SignupsModule {}
