import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { CreateSignupDto } from './dto/create-signup.dto.js';
import { SignupsService } from './signups.service.js';

// No prefix: routes live under both /events and /users, so each method has its full path.
@Controller()
export class SignupsController {
  constructor(private readonly signupsService: SignupsService) {}

  @Post('events/:eventId/signups')
  create(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() createSignupDto: CreateSignupDto,
  ) {
    return this.signupsService.create(eventId, createSignupDto.userId);
  }

  @Get('events/:eventId/signups')
  findForEvent(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return this.signupsService.findForEvent(eventId);
  }

  @Delete('events/:eventId/signups/:userId')
  @HttpCode(204)
  remove(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.signupsService.remove(eventId, userId);
  }

  @Get('users/:userId/signups')
  findForUser(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.signupsService.findForUser(userId);
  }
}
