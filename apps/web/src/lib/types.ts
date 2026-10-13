// Hand-written mirrors of the API's JSON responses (apps/api entities).
// Dates are ISO 8601 strings over the wire, not Date objects.

export type Role = "admin" | "organizer" | "volunteer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

// Shadows the DOM's global `Event` type in files that import it.
export interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string;
  startsAt: string;
  endsAt: string;
  capacity: number | null; // null = unlimited
  // Returned by GET /events and GET /events/:id only (not by POST/PATCH responses).
  signupCount: number;
  createdAt: string;
  updatedAt: string;
}

// `user` / `event` are only present on endpoints that include them:
// GET /events/:id/signups has `user`, GET /users/:id/signups has `event`.
export interface Signup {
  id: string;
  userId: string;
  eventId: string;
  createdAt: string;
  user?: User;
  event?: Event;
}
