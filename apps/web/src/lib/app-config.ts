import "server-only";

import { isValidTimeZone } from "@/lib/time";

// The campus's IANA time zone (e.g. "America/New_York"). One installation serves one
// campus, so every date is shown, and every form time read, in this zone.
export function getAppTimeZone(): string {
  const zone = process.env.APP_TIME_ZONE;
  if (!zone) {
    throw new Error(
      "APP_TIME_ZONE is not set. Copy apps/web/.env.example to apps/web/.env.local.",
    );
  }
  if (!isValidTimeZone(zone)) {
    throw new Error(
      `APP_TIME_ZONE "${zone}" is not a valid IANA time zone (e.g. America/New_York).`,
    );
  }
  return zone;
}
