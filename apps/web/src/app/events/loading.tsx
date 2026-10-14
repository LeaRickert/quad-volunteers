import EventGrid from "@/components/EventGrid";
import CardSkeleton from "@/components/skeleton/CardSkeleton";

// Mirrors the events page: title, subtitle, count line, then the card grid.
export default function Loading() {
  return (
    <div role="status">
      <span className="sr-only">Loading events…</span>
      <div aria-hidden className="animate-pulse">
        <div className="h-8 w-56 rounded bg-border" />
        <div className="mt-2 h-4 w-72 max-w-full rounded bg-border" />
        <div className="mt-6 mb-2 h-4 w-32 rounded bg-border" />
      </div>
      <div aria-hidden>
        <EventGrid>
          {Array.from({ length: 6 }, (_, i) => (
            <CardSkeleton key={i} />
          ))}
        </EventGrid>
      </div>
    </div>
  );
}
