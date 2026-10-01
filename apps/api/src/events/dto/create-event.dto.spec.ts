// @Type() reads decorator metadata; Nest loads this polyfill in the app, so tests must too.
import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateEventDto } from './create-event.dto.js';

async function invalidFields(body: object): Promise<string[]> {
  const dto = plainToInstance(CreateEventDto, body);
  const errors = await validate(dto);
  return errors.map((error) => error.property);
}

const validBody = {
  title: 'Beach cleanup',
  location: 'beach',
  startsAt: '2026-06-01T05:00:00Z',
  endsAt: '2026-06-01T09:00:00Z',
};

describe('CreateEventDto', () => {
  it('accepts a valid body without the optional fields', async () => {
    await expect(invalidFields(validBody)).resolves.toEqual([]);
  });

  it('accepts description and capacity', async () => {
    await expect(
      invalidFields({
        ...validBody,
        description: 'Bring gloves',
        capacity: 20,
      }),
    ).resolves.toEqual([]);
  });

  // Build a body with one required field removed, e.g. everything except title.
  it.each(['title', 'location', 'startsAt', 'endsAt'])(
    'requires %s',
    async (field) => {
      const body: Record<string, unknown> = { ...validBody };
      delete body[field];

      await expect(invalidFields(body)).resolves.toEqual([field]);
    },
  );
});
