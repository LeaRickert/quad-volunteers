import { IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class ListEventsQueryDto {
  // false/absent: upcoming and ongoing events. true: ended events.
  // Query values are strings and the global pipe doesn't convert types implicitly,
  // so map 'true'/'false' ourselves; anything else stays a string and fails @IsBoolean().
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean()
  past?: boolean;
}
