import { PartialType } from '@nestjs/mapped-types';
import { CreateEventDto } from './create-event.dto.js';
import { IsDate, IsNotEmpty, IsString, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateEventDto extends PartialType(CreateEventDto) {
  @ValidateIf((_, value) => value !== undefined) // skip only when the field is absent
  @IsString()
  @IsNotEmpty()
  title?: string;

  @ValidateIf((_, value) => value !== undefined) // skip only when the field is absent
  @IsString()
  @IsNotEmpty()
  location?: string;

  @ValidateIf((_, value) => value !== undefined) // skip only when the field is absent
  @Type(() => Date)
  @IsDate()
  startsAt?: Date;

  @ValidateIf((_, value) => value !== undefined) // skip only when the field is absent
  @Type(() => Date)
  @IsDate()
  endsAt?: Date;
}
