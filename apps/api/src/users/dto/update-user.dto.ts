import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto.js';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateIf,
} from 'class-validator';
import { UserRole } from '../entities/user.entity.js';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ValidateIf((_, value) => value !== undefined) // skip only when the field is absent
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsEmail()
  @IsNotEmpty()
  email?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsEnum(UserRole)
  role?: UserRole;
}
