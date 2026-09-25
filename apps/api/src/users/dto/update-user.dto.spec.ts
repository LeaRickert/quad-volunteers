import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateUserDto } from './update-user.dto.js';

// Mimics what the global ValidationPipe does with a request body:
// turn plain JSON into a DTO instance, then run the decorators' checks.
// Returns the names of the fields that failed.
async function invalidFields(body: object): Promise<string[]> {
  const dto = plainToInstance(UpdateUserDto, body);
  const errors = await validate(dto);
  return errors.map((error) => error.property);
}

describe('UpdateUserDto', () => {
  it('accepts an empty body (PATCH may change nothing)', async () => {
    await expect(invalidFields({})).resolves.toEqual([]);
  });

  it('accepts a partial update', async () => {
    await expect(invalidFields({ name: 'Ada King' })).resolves.toEqual([]);
  });

  // it.each runs the same test once per row; $field is filled in from the row.
  it.each([
    { field: 'name', body: { name: null } },
    { field: 'email', body: { email: null } },
    { field: 'role', body: { role: null } },
  ])('rejects null $field', async ({ field, body }) => {
    await expect(invalidFields(body)).resolves.toEqual([field]);
  });

  it.each([
    { field: 'name', body: { name: '' } },
    { field: 'email', body: { email: 'not-an-email' } },
    { field: 'role', body: { role: 'superuser' } },
  ])('rejects an invalid $field', async ({ field, body }) => {
    await expect(invalidFields(body)).resolves.toEqual([field]);
  });
});
