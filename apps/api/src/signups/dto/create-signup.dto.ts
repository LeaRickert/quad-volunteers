import { IsUUID } from 'class-validator';

export class CreateSignupDto {
  // No auth yet, so the client says who is signing up.
  @IsUUID()
  userId: string;
}
