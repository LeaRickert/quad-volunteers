import type { Event } from "@/lib/types";

// What the events UI shows for an event's availability. `left` is only present where
// the badge needs the number.
export type Spots =
  | { kind: "ended" }
  | { kind: "open" } // no capacity limit
  | { kind: "full" }
  | { kind: "few"; left: number } // 1-3 left
  | { kind: "plenty"; left: number }; // 4 or more left

const FEW_LEFT_MAX = 3;

export function getSpots(
  event: Pick<Event, "capacity" | "signupCount" | "endsAt">,
  now: Date,
): Spots {
  if (new Date(event.endsAt) < now) return { kind: "ended" };
  if (event.capacity === null) return { kind: "open" };

  const left = event.capacity - event.signupCount;
  if (left <= 0) return { kind: "full" };
  if (left <= FEW_LEFT_MAX) return { kind: "few", left };
  return { kind: "plenty", left };
}

export type SignupSummary = {
  strong: string;
  rest: string;
};
export function getSignupSummary(
  event: Pick<Event, "signupCount" | "capacity">,
  spots: Spots,
): SignupSummary {
  switch (spots.kind) {
    case "ended":
      return {
        strong: `${event.signupCount} ${event.signupCount === 1 ? "volunteer" : "volunteers"}`,
        rest: `helped out`,
      };
    case "open":
      return { strong: `${event.signupCount}`, rest: `signed up` };
    default:
      return {
        strong: `${event.signupCount} of ${event.capacity}`,
        rest: `spots taken`,
      };
  }
}
