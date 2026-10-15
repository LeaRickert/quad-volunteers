import type { Event } from "@/lib/types";

// Hand-made events covering every visual state of the events UI. The page renders them
// against a fixed "now" so the badges never change as the real date moves on.
export const DEBUG_NOW = new Date("2026-10-13T12:00:00.000Z");

function event(
  id: string,
  overrides: Partial<Event> &
    Pick<Event, "title" | "startsAt" | "endsAt" | "capacity" | "signupCount">,
): Event {
  return {
    id,
    description: null,
    location: "Campus Arboretum, North Gate",
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-09-01T00:00:00.000Z",
    ...overrides,
  };
}

// Each entry notes the state it exercises. Times are UTC; the page formats them in
// APP_TIME_ZONE.
export const sampleEvents: { note: string; event: Event }[] = [
  {
    note: "plenty: 13 spots left",
    event: event("s1", {
      title: "Arboretum Trail Cleanup",
      startsAt: "2026-10-17T13:00:00.000Z",
      endsAt: "2026-10-17T16:00:00.000Z",
      capacity: 20,
      signupCount: 7,
    }),
  },
  {
    note: "plenty, boundary: exactly 4 left",
    event: event("s2", {
      title: "Library Book Drive",
      location: "Main Library, Room 2",
      startsAt: "2026-10-18T14:00:00.000Z",
      endsAt: "2026-10-18T18:00:00.000Z",
      capacity: 10,
      signupCount: 6,
    }),
  },
  {
    note: "few: 3 left (boundary)",
    event: event("s3", {
      title: "Campus Garden Planting",
      location: "Community Garden",
      startsAt: "2026-10-19T14:00:00.000Z",
      endsAt: "2026-10-19T17:00:00.000Z",
      capacity: 12,
      signupCount: 9,
    }),
  },
  {
    note: "few: 2 left",
    event: event("s4", {
      title: "Food Pantry Restock",
      location: "Student Union, Room 214",
      startsAt: "2026-10-20T20:00:00.000Z",
      endsAt: "2026-10-20T22:00:00.000Z",
      capacity: 8,
      signupCount: 6,
    }),
  },
  {
    note: "few: last spot",
    event: event("s5", {
      title: "Tutoring Night",
      location: "Learning Commons",
      startsAt: "2026-10-21T23:00:00.000Z",
      endsAt: "2026-10-22T01:00:00.000Z",
      capacity: 6,
      signupCount: 5,
    }),
  },
  {
    note: "full",
    event: event("s6", {
      title: "Homecoming Parade Marshals",
      location: "Main Street Gate",
      startsAt: "2026-10-24T12:00:00.000Z",
      endsAt: "2026-10-24T15:00:00.000Z",
      capacity: 10,
      signupCount: 10,
    }),
  },
  {
    note: "full, capacity 1",
    event: event("s7", {
      title: "Guest Speaker Greeter",
      location: "Auditorium Lobby",
      startsAt: "2026-10-25T17:00:00.000Z",
      endsAt: "2026-10-25T19:00:00.000Z",
      capacity: 1,
      signupCount: 1,
    }),
  },
  {
    note: "unlimited, nobody signed up yet",
    event: event("s8", {
      title: "Open Campus Day",
      location: "The Quad",
      startsAt: "2026-10-26T13:00:00.000Z",
      endsAt: "2026-10-26T21:00:00.000Z",
      capacity: null,
      signupCount: 0,
    }),
  },
  {
    note: "unlimited, many signed up",
    event: event("s9", {
      title: "Neighborhood Food Drive",
      location: "Gym Parking Lot",
      startsAt: "2026-10-27T13:00:00.000Z",
      endsAt: "2026-10-27T17:00:00.000Z",
      capacity: null,
      signupCount: 148,
    }),
  },
  {
    note: "nobody signed up yet, with a limit",
    event: event("s10", {
      title: "Riverbank Litter Sweep",
      location: "Riverside Path",
      startsAt: "2026-10-28T13:00:00.000Z",
      endsAt: "2026-10-28T15:00:00.000Z",
      capacity: 15,
      signupCount: 0,
    }),
  },
  {
    note: "crosses midnight: end time shows its date",
    event: event("s11", {
      title: "Overnight Shelter Support",
      location: "Downtown Shelter",
      startsAt: "2026-10-30T23:00:00.000Z",
      endsAt: "2026-10-31T11:00:00.000Z",
      capacity: 6,
      signupCount: 2,
    }),
  },
  {
    note: "very long title and location",
    event: event("s12", {
      title:
        "Annual Intercollegiate Community Service Weekend Kickoff and Volunteer Appreciation Breakfast",
      location:
        "Student Recreation and Wellness Center, Second Floor Multipurpose Room B, East Entrance",
      startsAt: "2026-11-02T13:00:00.000Z",
      endsAt: "2026-11-02T16:00:00.000Z",
      capacity: 40,
      signupCount: 18,
    }),
  },
  {
    note: "DST change (US clocks fall back Nov 1): midnight start, 3 real hours",
    event: event("s13", {
      title: "Midnight Run for Charity",
      location: "Stadium",
      startsAt: "2026-11-01T04:00:00.000Z",
      endsAt: "2026-11-01T07:00:00.000Z",
      capacity: 30,
      signupCount: 12,
    }),
  },
  {
    note: "ended",
    event: event("s14", {
      title: "Back to School Cleanup",
      location: "Gym",
      startsAt: "2026-10-01T14:00:00.000Z",
      endsAt: "2026-10-01T18:00:00.000Z",
      capacity: 10,
      signupCount: 4,
    }),
  },
  {
    note: "ended, was full",
    event: event("s15", {
      title: "Fall Festival Setup",
      location: "The Quad",
      startsAt: "2026-10-05T14:00:00.000Z",
      endsAt: "2026-10-05T18:00:00.000Z",
      capacity: 10,
      signupCount: 10,
    }),
  },
  {
    note: "in progress right now (not ended)",
    event: event("s16", {
      title: "Community Kitchen Shift",
      location: "Church Basement",
      startsAt: "2026-10-13T10:00:00.000Z",
      endsAt: "2026-10-13T14:00:00.000Z",
      capacity: 8,
      signupCount: 8,
    }),
  },
];

export const summaryEvents: { note: string; event: Event }[] = [
  {
    note: "Default ( plenty, few, full)",
    event: event("s1", {
      title: "Arboretum Trail Cleanup",
      startsAt: "2026-10-17T13:00:00.000Z",
      endsAt: "2026-10-17T16:00:00.000Z",
      capacity: 20,
      signupCount: 7,
    }),
  },
  {
    note: "Event ended many helped",
    event: event("s15", {
      title: "Fall Festival Setup",
      location: "The Quad",
      startsAt: "2026-10-05T14:00:00.000Z",
      endsAt: "2026-10-05T18:00:00.000Z",
      capacity: 10,
      signupCount: 9,
    }),
  },
  {
    note: "Event ended - 1 person helped",
    event: event("s15", {
      title: "Fall Festival Setup",
      location: "The Quad",
      startsAt: "2026-10-05T14:00:00.000Z",
      endsAt: "2026-10-05T18:00:00.000Z",
      capacity: 10,
      signupCount: 1,
    }),
  },
  {
    note: "Open capacity",
    event: event("s9", {
      title: "Neighborhood Food Drive",
      location: "Gym Parking Lot",
      startsAt: "2026-10-27T13:00:00.000Z",
      endsAt: "2026-10-27T17:00:00.000Z",
      capacity: null,
      signupCount: 148,
    }),
  },
];

const LONG_DESCRIPTION = `Help the Friends of Hale Library set up for the fall book sale. We'll unpack donated boxes, sort books by genre and arrange tables in the main lobby.

Wear comfortable shoes; there's some lifting. Coffee and pastries provided.

Parking: use the visitor lot behind the library and show this page to the attendant.
Check in at the front desk when you arrive.

${"We will also need help carrying the leftover boxes back to storage once the doors close. ".repeat(8)}`;

// Whole-page states for EventDetail (/debug/event-detail), most with a description so the
// two-column layout has something to scroll past.
export const detailEvents: { note: string; event: Event }[] = [
  {
    note: "plenty: gold bar, 13 spots left",
    event: event("d1", {
      title: "Library Book Sale Setup",
      location: "Hale Library, Main Lobby",
      description: LONG_DESCRIPTION,
      startsAt: "2026-10-24T12:00:00.000Z",
      endsAt: "2026-10-24T15:00:00.000Z",
      capacity: 20,
      signupCount: 7,
    }),
  },
  {
    note: "few: last spot",
    event: event("d2", {
      title: "Food Pantry Restock",
      description: "Restock shelves before the weekend rush.",
      startsAt: "2026-10-17T13:00:00.000Z",
      endsAt: "2026-10-17T16:00:00.000Z",
      capacity: 8,
      signupCount: 7,
    }),
  },
  {
    note: "full: dark bar (the full message and link are part of the card)",
    event: event("d3", {
      title: "Overnight Shelter Shift",
      location: "Grace Community Shelter",
      description: "Help set up cots and serve breakfast.",
      startsAt: "2026-10-31T23:00:00.000Z",
      endsAt: "2026-11-01T11:00:00.000Z",
      capacity: 6,
      signupCount: 6,
    }),
  },
  {
    note: "unlimited: no bar, 'signed up' count",
    event: event("d4", {
      title: "Open Campus Day",
      description: "Greet visitors and hand out maps.",
      startsAt: "2026-10-27T13:00:00.000Z",
      endsAt: "2026-10-27T17:00:00.000Z",
      capacity: null,
      signupCount: 5,
    }),
  },
  {
    note: "ended: no bar, 'volunteers helped out' (plural)",
    event: event("d5", {
      title: "Fall Festival Setup",
      location: "The Quad",
      description: "Thanks to everyone who helped.",
      startsAt: "2026-10-05T14:00:00.000Z",
      endsAt: "2026-10-05T18:00:00.000Z",
      capacity: 20,
      signupCount: 18,
    }),
  },
  {
    note: "ended: singular ('1 volunteer')",
    event: event("d6", {
      title: "Parking Lot Sweep",
      startsAt: "2026-10-05T14:00:00.000Z",
      endsAt: "2026-10-05T16:00:00.000Z",
      capacity: null,
      signupCount: 1,
    }),
  },
  {
    note: "no description: no About section",
    event: event("d7", {
      title: "Quick Setup Crew",
      startsAt: "2026-10-20T14:00:00.000Z",
      endsAt: "2026-10-20T15:00:00.000Z",
      capacity: 10,
      signupCount: 0,
    }),
  },
  {
    note: "very long title, location and unbroken word: wraps, no horizontal scroll",
    event: event("d8", {
      title:
        "Annual Interdepartmental Community Outreach and Environmental Stewardship Volunteer Appreciation Weekend",
      location:
        "The Robert and Margaret Whitfield Memorial Center for Community Engagement, Building C, Second Floor Conference Annex",
      description: `Unbroken: ${"Supercalifragilistic".repeat(8)}`,
      startsAt: "2026-10-21T14:00:00.000Z",
      endsAt: "2026-10-21T18:00:00.000Z",
      capacity: 30,
      signupCount: 12,
    }),
  },
];
