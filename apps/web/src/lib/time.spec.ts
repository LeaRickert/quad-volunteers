import { describe, expect, it } from "vitest";
import {
  formatDateLong,
  formatEyebrow,
  formatTimeRange,
  isValidTimeZone,
} from "@/lib/time";

const LA = "America/Los_Angeles"; // UTC-7 in October (PDT)
const BERLIN = "Europe/Berlin"; // UTC+2 in October (CEST)
const TOKYO = "Asia/Tokyo"; // UTC+9, no DST

// Sat Oct 10 2026, 09:00 in Los Angeles
const START = "2026-10-10T16:00:00.000Z";
const END = "2026-10-10T19:00:00.000Z";

describe("isValidTimeZone", () => {
  it("accepts IANA zones", () => {
    expect(isValidTimeZone(TOKYO)).toBe(true);
    expect(isValidTimeZone("UTC")).toBe(true);
  });

  it.each(["", "garbage", "Mars/Olympus_Mons"])("rejects %j", (value) => {
    expect(isValidTimeZone(value)).toBe(false);
  });
});

describe("formatEyebrow", () => {
  it("formats weekday, month and day in uppercase", () => {
    expect(formatEyebrow(START, LA)).toBe("SAT · OCT 10");
  });

  it("moves to the next day when the zone is ahead", () => {
    // 23:30 UTC is still Saturday in Los Angeles, already Sunday in Tokyo
    const instant = "2026-10-10T23:30:00.000Z";
    expect(formatEyebrow(instant, LA)).toBe("SAT · OCT 10");
    expect(formatEyebrow(instant, TOKYO)).toBe("SUN · OCT 11");
  });
});

describe("formatDateLong", () => {
  it("spells out weekday and month", () => {
    expect(formatDateLong(START, LA)).toBe("Saturday, October 10");
  });

  it("follows the viewer's zone", () => {
    expect(formatDateLong("2026-10-10T23:30:00.000Z", TOKYO)).toBe(
      "Sunday, October 11",
    );
  });
});

describe("formatTimeRange", () => {
  it("formats a same-day range with a plain space before AM/PM", () => {
    const range = formatTimeRange(START, END, LA);
    expect(range).toBe("9:00 AM – 12:00 PM");
    expect(range).not.toMatch(/ | /);
  });

  it("shows the same instants as different clock times per zone", () => {
    expect(formatTimeRange(START, END, BERLIN)).toBe("6:00 PM – 9:00 PM");
  });

  it("labels midnight and noon as 12 AM / 12 PM", () => {
    expect(
      formatTimeRange("2026-10-10T07:00:00.000Z", "2026-10-10T19:00:00.000Z", LA),
    ).toBe("12:00 AM – 12:00 PM");
  });

  it("adds the end date when the event crosses midnight", () => {
    // Oct 10 9:00 PM to Oct 11 1:30 AM in Los Angeles
    expect(
      formatTimeRange("2026-10-11T04:00:00.000Z", "2026-10-11T08:30:00.000Z", LA),
    ).toBe("9:00 PM – Oct 11, 1:30 AM");
  });

  it("uses the zone's calendar day, not UTC's, to decide", () => {
    // Crosses UTC midnight but stays on one day in Tokyo (Oct 11 8:00–10:00)
    expect(
      formatTimeRange("2026-10-10T23:00:00.000Z", "2026-10-11T01:00:00.000Z", TOKYO),
    ).toBe("8:00 AM – 10:00 AM");
  });

  it("reads the wall clock across a daylight-saving change", () => {
    // US clocks fall back on Nov 1 2026 (2:00 AM PDT -> 1:00 AM PST). Start is
    // midnight PDT; end is 3 real hours later, which reads 2:00 AM PST.
    expect(
      formatTimeRange("2026-11-01T07:00:00.000Z", "2026-11-01T10:00:00.000Z", LA),
    ).toBe("12:00 AM – 2:00 AM");
  });
});
