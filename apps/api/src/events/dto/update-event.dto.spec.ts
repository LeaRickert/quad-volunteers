import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateEventDto } from './update-event.dto.js';

// Mimics the global ValidationPipe: plain JSON → DTO instance → run the checks.
// Returns the names of the fields that failed.
async function invalidFields(body: object): Promise<string[]> {
  const dto = plainToInstance(UpdateEventDto, body);
  const errors = await validate(dto);
  return errors.map((error) => error.property);
}

describe('UpdateEventDto', () => {
  it('accepts an empty body (PATCH may change nothing)', async () => {
    await expect(invalidFields({})).resolves.toEqual([]);
  });

  it('converts ISO date strings into Date objects', () => {
    const dto = plainToInstance(UpdateEventDto, {
      startsAt: '2026-06-01T05:00:00Z',
    });

    expect(dto.startsAt).toBeInstanceOf(Date);
    expect(dto.startsAt?.toISOString()).toBe('2026-06-01T05:00:00.000Z');
  });

  // Required columns: PATCH may leave them out, but not set them to null.
  it.each(['title', 'location', 'startsAt', 'endsAt'])(
    'rejects null %s',
    async (field) => {
      await expect(invalidFields({ [field]: null })).resolves.toEqual([field]);
    },
  );

  // Nullable columns: null is how a client clears them.
  it.each(['description', 'capacity'])('accepts null %s', async (field) => {
    await expect(invalidFields({ [field]: null })).resolves.toEqual([]);
  });

  it.each([
    { field: 'title', body: { title: '' } },
    { field: 'location', body: { location: '' } },
    { field: 'startsAt', body: { startsAt: 'not-a-date' } },
    { field: 'endsAt', body: { endsAt: 'not-a-date' } },
    { field: 'capacity', body: { capacity: 0 } },
    { field: 'capacity', body: { capacity: 2.5 } },
    { field: 'capacity', body: { capacity: '5' } },
  ])('rejects $field = $body', async ({ field, body }) => {
    await expect(invalidFields(body)).resolves.toEqual([field]);
  });
});
