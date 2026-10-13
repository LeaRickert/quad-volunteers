// Date formatting in a given time zone (the app's, see lib/app-config.ts). Every function takes the IANA zone
// explicitly, so output depends only on the arguments (and is easy to test).

const LOCALE = "en-US";

export function isValidTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat(LOCALE, { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

// Formatted pieces keyed by type ("weekday", "month", "day", "hour", ...). Building
// our own strings from parts keeps separators and spacing independent of the locale
// (newer ICU versions put a narrow no-break space before AM/PM).
function parts(
  iso: string,
  timeZone: string,
  options: Intl.DateTimeFormatOptions,
): Record<string, string> {
  const formatted = new Intl.DateTimeFormat(LOCALE, {
    timeZone,
    ...options,
  }).formatToParts(new Date(iso));
  return Object.fromEntries(formatted.map((p) => [p.type, p.value]));
}

// "SAT · OCT 10"
export function formatEyebrow(iso: string, timeZone: string): string {
  const p = parts(iso, timeZone, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  return `${p.weekday} · ${p.month} ${p.day}`.toUpperCase();
}

// "Saturday, October 10"
export function formatDateLong(iso: string, timeZone: string): string {
  const p = parts(iso, timeZone, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  return `${p.weekday}, ${p.month} ${p.day}`;
}

// "9:00 AM"
function formatTime(iso: string, timeZone: string): string {
  const p = parts(iso, timeZone, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${p.hour}:${p.minute} ${p.dayPeriod}`;
}

function dayKey(iso: string, timeZone: string): string {
  const p = parts(iso, timeZone, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
  return `${p.year}-${p.month}-${p.day}`;
}

// "9:00 AM – 12:00 PM"; when the end is on another calendar day in `timeZone`,
// the end carries its date: "9:00 PM – Oct 11, 1:00 AM".
export function formatTimeRange(
  startIso: string,
  endIso: string,
  timeZone: string,
): string {
  const start = formatTime(startIso, timeZone);
  const end = formatTime(endIso, timeZone);
  if (dayKey(startIso, timeZone) === dayKey(endIso, timeZone)) {
    return `${start} – ${end}`;
  }
  const p = parts(endIso, timeZone, { month: "short", day: "numeric" });
  return `${start} – ${p.month} ${p.day}, ${end}`;
}
