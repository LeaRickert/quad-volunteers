import { Clock, MapPin } from "lucide-react";
import Link from "next/link";
import CapacityBar from "@/components/CapacityBar";
import SpotsBadge from "@/components/SpotsBadge";
import { getSpots } from "@/lib/spots";
import { formatEyebrow, formatTimeRange } from "@/lib/time";
import type { Event } from "@/lib/types";

export default function EventCard({
  event,
  timeZone,
  now,
}: {
  event: Event;
  timeZone: string;
  now: Date;
}) {
  const spots = getSpots(event, now);

  return (
    <div className="relative flex min-w-0 flex-col gap-3.5 rounded-card border border-border bg-surface p-5 shadow-card hover:border-border-strong">
      <div className="flex min-h-6 items-center justify-between gap-3">
        <span className="text-xs font-semibold tracking-wider text-eyebrow">
          {formatEyebrow(event.startsAt, timeZone)}
        </span>
        {/* TODO "You're in" badge (M3) */}
      </div>

      {/* The title link stretches over the whole card, so the card is one link. */}
      <h2 className="text-lg font-semibold">
        <Link href={`/events/${event.id}`} className="after:absolute after:inset-0">
          {event.title}
        </Link>
      </h2>

      <div className="flex flex-col gap-1.5 text-sm text-foreground-secondary">
        <div className="flex items-start gap-2">
          <Clock size={16} aria-hidden className="mt-0.5 shrink-0 text-muted" />
          <span>{formatTimeRange(event.startsAt, event.endsAt, timeZone)}</span>
        </div>
        <div className="flex items-start gap-2">
          <MapPin size={16} aria-hidden className="mt-0.5 shrink-0 text-muted" />
          <span className="min-w-0 break-words">{event.location}</span>
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-3 border-t border-border pt-3.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-foreground-secondary tabular-nums">
            {event.capacity === null
              ? `${event.signupCount} signed up`
              : `${event.signupCount} of ${event.capacity} signed up`}
          </span>
          <SpotsBadge spots={spots} />
        </div>
        <CapacityBar taken={event.signupCount} capacity={event.capacity} />
      </div>
    </div>
  );
}
