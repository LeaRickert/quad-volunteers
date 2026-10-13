import "server-only";

import type { Event } from "@/lib/types";

// Thrown for any non-2xx response from the NestJS API. `messages` is always an array:
// validation errors (400) arrive as a list, everything else as a single string.
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly messages: string[],
  ) {
    super(messages.join("; "));
    this.name = "ApiError";
  }
}

function getBaseUrl(): string {
  const url = process.env.API_URL;
  if (!url) {
    throw new Error(
      "API_URL is not set. Copy apps/web/.env.example to apps/web/.env.local.",
    );
  }
  return url.replace(/\/$/, "");
}

// Nest's error body: { statusCode, message: string | string[], error }
async function readMessages(res: Response): Promise<string[]> {
  try {
    const body: unknown = await res.json();
    const message = (body as { message?: unknown } | null)?.message;
    if (Array.isArray(message)) return message.map(String);
    if (typeof message === "string") return [message];
  } catch {
    // body wasn't JSON; fall through
  }
  return [res.statusText || `Request failed with status ${res.status}`];
}

export async function apiFetch<T>(
  path: string,
  init: Omit<RequestInit, "body"> & { body?: unknown } = {},
): Promise<T> {
  const { body, headers, ...rest } = init;
  const res = await fetch(`${getBaseUrl()}${path}`, {
    // Without this, a page that uses no cookies/searchParams is prerendered at
    // `next build` and would show build-time data forever.
    cache: "no-store",
    ...rest,
    headers: {
      ...(body !== undefined && { "Content-Type": "application/json" }),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!res.ok) throw new ApiError(res.status, await readMessages(res));
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export function getEvents(): Promise<Event[]> {
  return apiFetch<Event[]>("/events");
}
