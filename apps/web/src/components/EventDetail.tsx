import {formatDateLong, formatEyebrow, formatTimeRange} from "@/lib/time";
import type { Event } from "@/lib/types";
import {Clock, MapPin, Calendar} from "lucide-react";
import SpotsBadge from "@/components/SpotsBadge";
import CapacityBar from "@/components/CapacityBar";
import {getSignupSummary, getSpots} from "@/lib/spots";
import {ReactNode} from "react";
import SignupSummaryText from "@/components/SignupSummaryText";
import InlineMessage from "@/components/InlineMessage";
import {buttonStyles} from "@/components/Button";
import Link from "next/link";

export default function EventDetail({event, timeZone, now, children}:{event: Event, timeZone: string, now: Date, children?: ReactNode}) {

  const spots = getSpots(event, now);
  return (
      <div className="grid  grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6">

        <header className={'flex flex-col gap-3 lg:col-start-1'}>
          <span className="text-xs font-semibold tracking-wider text-eyebrow">
          { formatEyebrow(event.startsAt, timeZone)}
          </span>
          <h1 className={'text-2xl lg:text-4xl font-semibold wrap-break-word'}>{event.title}</h1>
          <div className="flex flex-col gap-1.5 text-foreground-secondary">
            <div className="flex items-start gap-2">
              <Calendar size={16} aria-hidden className="mt-0.5 shrink-0 text-muted" />
              <span>{formatDateLong(event.startsAt, timeZone)}</span>
            </div>
            <div className="flex items-start gap-2">
              <Clock size={16} aria-hidden className="mt-0.5 shrink-0 text-muted" />
              <span>{formatTimeRange(event.startsAt, event.endsAt, timeZone)}</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin size={16} aria-hidden className="mt-0.5 shrink-0 text-muted" />
              <span className="min-w-0 wrap-break-word">{event.location}</span>
            </div>
          </div>

        </header>
        {/*Start Availability Card*/}
        <aside  aria-label="Availability" className={'flex flex-col gap-4 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:self-start lg:sticky lg:top-6 p-5 bg-surface border border-border shadow-card rounded-card'}>
          <div className="flex items-center justify-between gap-2">
          <span className="text-sm tabular-nums">
            <SignupSummaryText summary={getSignupSummary(event, spots)} />
          </span>
            <SpotsBadge spots={spots} />
          </div>
          {spots.kind !== "ended" && <CapacityBar taken={event.signupCount} capacity={event.capacity} size={'lg'} />}

          {spots.kind === "full" && (
            <>
              <InlineMessage
                title="This event is full"
                body="Spots open up if someone cancels, so check back later."
              />
              <Link href="/events" className={buttonStyles({variant: "secondary", className: "w-full"})}>
                Browse other events
              </Link>
            </>
          )}
          {spots.kind === "ended" && (
            <InlineMessage
              title="This event has ended."
              body="Sign-ups and cancellations are closed."
            />
          )}

          {children}
        </aside>

        {event.description && (<section className="lg:col-start-1">
          <h2 className={'text-lg font-semibold'}>About this event</h2>
          <div className={"leading-relaxed text-foreground-secondary whitespace-pre-line"}>
            {event.description}
          </div>
        </section>)
        }
      </div>


  )
}