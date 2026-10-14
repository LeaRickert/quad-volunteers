import type { Metadata } from "next";
import EmptyState from "@/components/EmptyState";
import EventCard from "@/components/EventCard";
import EventGrid from "@/components/EventGrid";
import { getEvents } from "@/lib/api";
import { getAppTimeZone } from "@/lib/app-config";

export const metadata: Metadata = {
  title: "Events",
};

export default async function EventsPage() {
  // The API returns only upcoming and ongoing events by default.
  const events = await getEvents();
  const now = new Date();
  const timeZone = getAppTimeZone();

  return (
    <>
      <h1 className="text-[26px] font-semibold tracking-tight sm:text-3xl">
        Upcoming events
      </h1>
      <p className="text-foreground-secondary">
        Find a way to help out on campus this term
      </p>

      {events.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No upcoming events yet"
            description="Check back soon!"
          />
        </div>
      ) : (
        <>
          <p className="mt-6 mb-2 text-sm text-muted">
            {events.length} upcoming {events.length === 1 ? "event" : "events"}
          </p>
          <EventGrid>
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                timeZone={timeZone}
                now={now}
              />
            ))}
          </EventGrid>
        </>
      )}
    </>
  );
}
