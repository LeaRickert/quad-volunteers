import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiFetch, getEvent, getEvents } from "@/lib/api";

const fetchMock = vi.fn<typeof fetch>();

// A Response can only be read once, so build a fresh one per call.
function json(body: unknown, status = 200, statusText = "") {
  return new Response(JSON.stringify(body), {
    status,
    statusText,
    headers: { "Content-Type": "application/json" },
  });
}

// The [url, init] pair of the nth fetch call.
function call(n = 0) {
  const [url, init] = fetchMock.mock.calls[n];
  return { url: String(url), init: init as RequestInit };
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("API_URL", "http://api.test");
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("apiFetch", () => {
  it("requests API_URL + path and returns the parsed JSON", async () => {
    fetchMock.mockResolvedValueOnce(json([{ id: "1" }]));

    await expect(apiFetch("/events")).resolves.toEqual([{ id: "1" }]);
    expect(call().url).toBe("http://api.test/events");
  });

  it("ignores a trailing slash on API_URL", async () => {
    vi.stubEnv("API_URL", "http://api.test/");
    fetchMock.mockResolvedValueOnce(json([]));

    await apiFetch("/events");

    expect(call().url).toBe("http://api.test/events");
  });

  it("never caches, so pages show fresh data", async () => {
    fetchMock.mockResolvedValueOnce(json([]));

    await apiFetch("/events");

    expect(call().init.cache).toBe("no-store");
  });

  it("returns undefined for a 204 No Content", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));

    await expect(apiFetch("/events/1", { method: "DELETE" })).resolves.toBeUndefined();
  });

  describe("request body and headers", () => {
    it("sends no Content-Type and no body on a plain GET", async () => {
      fetchMock.mockResolvedValueOnce(json([]));

      await apiFetch("/events");

      expect(call().init.body).toBeUndefined();
      expect(call().init.headers).not.toHaveProperty("Content-Type");
    });

    it("sends an object body as JSON with a Content-Type", async () => {
      fetchMock.mockResolvedValueOnce(json({ id: "1" }, 201));

      await apiFetch("/events", { method: "POST", body: { title: "Beach" } });

      expect(call().init.method).toBe("POST");
      expect(call().init.body).toBe('{"title":"Beach"}');
      expect(call().init.headers).toMatchObject({
        "Content-Type": "application/json",
      });
    });

    it("keeps headers the caller passes", async () => {
      fetchMock.mockResolvedValueOnce(json([]));

      await apiFetch("/events", { headers: { "X-Test": "1" } });

      expect(call().init.headers).toMatchObject({ "X-Test": "1" });
    });
  });

  describe("errors", () => {
    it("throws ApiError with every validation message when Nest sends an array", async () => {
      fetchMock.mockResolvedValueOnce(
        json(
          {
            statusCode: 400,
            error: "Bad Request",
            message: ["title should not be empty", "location must be a string"],
          },
          400,
        ),
      );

      const error = await apiFetch("/events").catch((e: unknown) => e);

      expect(error).toBeInstanceOf(ApiError);
      expect(error).toMatchObject({
        status: 400,
        messages: ["title should not be empty", "location must be a string"],
      });
    });

    it("wraps a single string message in an array", async () => {
      fetchMock.mockResolvedValueOnce(
        json({ statusCode: 409, message: "Event is full", error: "Conflict" }, 409),
      );

      const error = await apiFetch("/events").catch((e: unknown) => e);

      expect(error).toMatchObject({ status: 409, messages: ["Event is full"] });
    });

    it("joins the messages into the Error message", async () => {
      fetchMock.mockResolvedValueOnce(json({ message: ["a", "b"] }, 400));

      const error = await apiFetch("/events").catch((e: unknown) => e);

      expect((error as ApiError).message).toBe("a; b");
      expect((error as ApiError).name).toBe("ApiError");
    });

    it("falls back to the status text when the body is not JSON", async () => {
      fetchMock.mockResolvedValueOnce(
        new Response("<html>bad gateway</html>", {
          status: 502,
          statusText: "Bad Gateway",
        }),
      );

      const error = await apiFetch("/events").catch((e: unknown) => e);

      expect(error).toMatchObject({ status: 502, messages: ["Bad Gateway"] });
    });

    it("falls back to a generic message when there is no status text either", async () => {
      fetchMock.mockResolvedValueOnce(new Response("nope", { status: 500 }));

      const error = await apiFetch("/events").catch((e: unknown) => e);

      expect(error).toMatchObject({
        status: 500,
        messages: ["Request failed with status 500"],
      });
    });

    it("falls back when the JSON body has no usable message", async () => {
      fetchMock.mockResolvedValueOnce(json({ statusCode: 500 }, 500, "Server Error"));

      const error = await apiFetch("/events").catch((e: unknown) => e);

      expect(error).toMatchObject({ messages: ["Server Error"] });
    });

    it("lets a network failure through unchanged", async () => {
      const failure = new TypeError("fetch failed");
      fetchMock.mockRejectedValueOnce(failure);

      await expect(apiFetch("/events")).rejects.toBe(failure);
    });

    it("fails loudly when API_URL is not set, without calling the API", async () => {
      vi.stubEnv("API_URL", "");

      await expect(apiFetch("/events")).rejects.toThrow(/API_URL is not set/);
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });
});

describe("getEvents", () => {
  it("fetches GET /events", async () => {
    const events = [{ id: "1" }, { id: "2" }];
    fetchMock.mockResolvedValueOnce(json(events));

    await expect(getEvents()).resolves.toEqual(events);
    expect(call().url).toBe("http://api.test/events");
  });
});

describe("getEvent", () => {
  const event = { id: "5a8be171-f36d-419f-85c7-313410d09b73", title: "Beach" };

  it("returns the event", async () => {
    fetchMock.mockResolvedValueOnce(json(event));

    await expect(getEvent(event.id)).resolves.toEqual(event);
    expect(call().url).toBe(`http://api.test/events/${event.id}`);
  });

  it("returns null when the event does not exist (404)", async () => {
    fetchMock.mockResolvedValueOnce(
      json({ statusCode: 404, message: "Event with id x not found" }, 404),
    );

    await expect(getEvent(event.id)).resolves.toBeNull();
  });

  it("returns null when the id is not a UUID (400)", async () => {
    fetchMock.mockResolvedValueOnce(
      json({ statusCode: 400, message: "Validation failed (uuid is expected)" }, 400),
    );

    await expect(getEvent("abc")).resolves.toBeNull();
  });

  it("rethrows a server error instead of calling it not found", async () => {
    fetchMock.mockResolvedValueOnce(json({ message: "Internal server error" }, 500));

    await expect(getEvent(event.id)).rejects.toMatchObject({
      name: "ApiError",
      status: 500,
    });
  });

  it("rethrows a network failure", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("fetch failed"));

    await expect(getEvent(event.id)).rejects.toThrow("fetch failed");
  });

  it("encodes the id so it cannot change the URL path", async () => {
    fetchMock.mockResolvedValueOnce(json({}, 404));

    await getEvent("../users?x=1");

    expect(call().url).toBe("http://api.test/events/..%2Fusers%3Fx%3D1");
  });
});
