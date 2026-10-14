// @Transform() reads decorator metadata; Nest loads this polyfill in the app, so tests must too.
import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ListEventsQueryDto } from './list-events-query.dto.js';

// Query-string values always arrive as strings.
async function check(query: Record<string, string>) {
  const dto = plainToInstance(ListEventsQueryDto, query);
  const errors = await validate(dto);
  return { dto, invalid: errors.map((error) => error.property) };
}

describe('ListEventsQueryDto', () => {
  it('accepts an empty query and leaves past undefined', async () => {
    const { dto, invalid } = await check({});
    expect(invalid).toEqual([]);
    expect(dto.past).toBeUndefined();
  });

  it("converts 'true' to the boolean true", async () => {
    const { dto, invalid } = await check({ past: 'true' });
    expect(invalid).toEqual([]);
    expect(dto.past).toBe(true);
  });

  it("converts 'false' to the boolean false (not a truthy string)", async () => {
    const { dto, invalid } = await check({ past: 'false' });
    expect(invalid).toEqual([]);
    expect(dto.past).toBe(false);
  });

  it.each(['maybe', '1', '0', 'TRUE', ''])('rejects past=%j', async (value) => {
    const { invalid } = await check({ past: value });
    expect(invalid).toEqual(['past']);
  });

  describe('with the app-wide ValidationPipe options', () => {
    const pipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    });
    const run = (query: object) =>
      pipe.transform(query, { type: 'query', metatype: ListEventsQueryDto });

    it('passes the converted value on', async () => {
      await expect(run({ past: 'true' })).resolves.toMatchObject({
        past: true,
      });
    });

    it('rejects query params that are not allowed yet', async () => {
      await expect(run({ q: 'beach' })).rejects.toThrow();
    });
  });
});
