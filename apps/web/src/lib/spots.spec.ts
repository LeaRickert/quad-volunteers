import { describe, expect, it } from "vitest";
import { getSpots } from "@/lib/spots";

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
