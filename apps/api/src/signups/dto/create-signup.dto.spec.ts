import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateSignupDto } from './create-signup.dto.js';

async function invalidFields(body: object): Promise<string[]> {
  const errors = await validate(plainToInstance(CreateSignupDto, body));
  return errors.map((error) => error.property);
}

describe('CreateSignupDto', () => {
  it('accepts a uuid userId', async () => {
    await expect(
      invalidFields({ userId: '8b5be171-f36d-419f-85c7-313410d09b73' }),
    ).resolves.toEqual([]);
  });

  it.each([
    { case: 'missing', body: {} },
    { case: 'null', body: { userId: null } },
    { case: 'not a uuid', body: { userId: 'abc' } },
  ])('rejects a userId that is $case', async ({ body }) => {
    await expect(invalidFields(body)).resolves.toEqual(['userId']);
  });
});
