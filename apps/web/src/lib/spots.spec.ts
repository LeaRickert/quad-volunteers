import { describe, expect, it } from "vitest";
import { getSignupSummary, getSpots } from "@/lib/spots";

const NOW = new Date("2026-10-10T12:00:00.000Z");
const FUTURE = "2026-10-10T18:00:00.000Z";
const PAST = "2026-10-10T08:00:00.000Z";

function spots(capacity: number | null, signupCount: number, endsAt = FUTURE) {
  return getSpots({ capacity, signupCount, endsAt }, NOW);
}

describe("getSpots", () => {
  it("is open when there is no capacity limit, however many signed up", () => {
    expect(spots(null, 0)).toEqual({ kind: "open" });
    expect(spots(null, 500)).toEqual({ kind: "open" });
  });

  it("is plenty with 4 or more spots left", () => {
    expect(spots(20, 7)).toEqual({ kind: "plenty", left: 13 });
    expect(spots(20, 0)).toEqual({ kind: "plenty", left: 20 });
  });

  it("switches from plenty to few at the 4 / 3 boundary", () => {
    expect(spots(10, 6)).toEqual({ kind: "plenty", left: 4 });
    expect(spots(10, 7)).toEqual({ kind: "few", left: 3 });
  });

  it("is few with 3, 2 or 1 spots left", () => {
    expect(spots(10, 8)).toEqual({ kind: "few", left: 2 });
    expect(spots(10, 9)).toEqual({ kind: "few", left: 1 });
  });

  it("is full when every spot is taken", () => {
    expect(spots(10, 10)).toEqual({ kind: "full" });
  });

  it("is full, never negative, when sign-ups exceed capacity", () => {
    expect(spots(10, 12)).toEqual({ kind: "full" });
  });

  describe("ended events", () => {
    it("are ended once the end time has passed", () => {
      expect(spots(20, 7, PAST)).toEqual({ kind: "ended" });
    });

    it("are ended even when unlimited or full", () => {
      expect(spots(null, 3, PAST)).toEqual({ kind: "ended" });
      expect(spots(10, 10, PAST)).toEqual({ kind: "ended" });
    });

    it("are still running at the exact end time", () => {
      expect(spots(20, 7, NOW.toISOString())).toEqual({
        kind: "plenty",
        left: 13,
      });
    });
  });
});

function summary(
  capacity: number | null,
  signupCount: number,
  endsAt = FUTURE,
) {
  const event = { capacity, signupCount, endsAt };
  const { strong, rest } = getSignupSummary(event, getSpots(event, NOW));
  return `${strong} ${rest}`; // the sentence as rendered
}

describe("getSignupSummary", () => {
  it("shows taken of capacity", () => {
    expect(summary(20, 7)).toBe("7 of 20 spots taken");
    expect(summary(10, 0)).toBe("0 of 10 spots taken");
    expect(summary(10, 10)).toBe("10 of 10 spots taken"); // full
  });

  it("shows only the count when unlimited", () => {
    expect(summary(null, 14)).toBe("14 signed up");
  });

  it("says how many helped out once ended, singular and plural", () => {
    expect(summary(20, 18, PAST)).toBe("18 volunteers helped out");
    expect(summary(20, 1, PAST)).toBe("1 volunteer helped out");
    expect(summary(null, 0, PAST)).toBe("0 volunteers helped out");
  });
});
