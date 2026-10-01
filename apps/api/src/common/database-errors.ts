import { QueryFailedError } from 'typeorm';

// True when Postgres rejected a write because of a UNIQUE constraint (SQLSTATE 23505).
export function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof QueryFailedError &&
    (error.driverError as { code?: string }).code === '23505'
  );
}
