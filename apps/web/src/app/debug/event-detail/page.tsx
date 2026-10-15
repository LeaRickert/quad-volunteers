import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Button from "@/components/Button";
import EventDetail from "@/components/EventDetail";
import { getAppTimeZone } from "@/lib/app-config";
import { DEBUG_NOW, detailEvents } from "../sample-events";

export const metadata: Metadata = { title: "Debug: event detail" };

export default function EventDetailDebugPage() {
  // A scratch page: don't ship it.
  if (process.env.NODE_ENV === "production") notFound();

  const timeZone = getAppTimeZone();

  return (
    <div className="flex flex-col gap-10">
      <header>
        <Link href="/debug" className="text-sm text-muted hover:text-foreground">
          ← UI debug
        </Link>
        <h1 className="text-2xl font-semibold">Event detail</h1>
        <p className="text-foreground-secondary">
          <code>EventDetail</code> with hand-made events, one per state. Resize to
          375px for a single column (card between the meta rows and About) and to
          1024px+ for two columns (the card sticks while the description scrolls).
          Times are shown in {timeZone}; the page pretends it is{" "}
          {DEBUG_NOW.toISOString()}.
        </p>
      </header>

      {detailEvents.map(({ note, event }) => (
        <section
          key={event.id}
          className="flex flex-col gap-3 border-t border-border-strong pt-4"
        >
          <h2 className="text-xs font-semibold tracking-wider text-muted uppercase">
            {note}
          </h2>
          <EventDetail event={event} timeZone={timeZone} now={DEBUG_NOW} />
        </section>
      ))}

      <section className="flex flex-col gap-3 border-t border-border-strong pt-4">
        <h2 className="text-xs font-semibold tracking-wider text-muted uppercase">
          children slot: where M4 puts Join / Cancel
        </h2>
        <EventDetail
          event={detailEvents[0].event}
          timeZone={timeZone}
          now={DEBUG_NOW}
        >
          <Button className="w-full">Join this event</Button>
        </EventDetail>
      </section>
    </div>
  );
}
