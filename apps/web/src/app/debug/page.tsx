import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Fragment, ReactNode } from "react";
import {
  CalendarX,
  Check,
  Clock,
  History,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import Badge from "@/components/Badge";
import Button, { buttonStyles } from "@/components/Button";
import CapacityBar from "@/components/CapacityBar";
import EmptyState from "@/components/EmptyState";
import EventCard from "@/components/EventCard";
import SpotsBadge from "@/components/SpotsBadge";
import { getAppTimeZone } from "@/lib/app-config";
import { getSignupSummary, getSpots, type Spots } from "@/lib/spots";
import { DEBUG_NOW, sampleEvents, summaryEvents } from "./sample-events";
import InlineMessage from "@/components/InlineMessage";
import SignupSummaryText from "@/components/SignupSummaryText";

export const metadata: Metadata = { title: "Debug" };

const buttonVariants = [
  "primary",
  "secondary",
  "danger-outline",
  "danger",
  "ghost",
] as const;

const badgeVariants = [
  "neutral",
  "outline",
  "warning",
  "full",
  "ended",
] as const;

const spotsStates: { label: string; spots: Spots }[] = [
  { label: "plenty", spots: { kind: "plenty", left: 13 } },
  { label: "few (3)", spots: { kind: "few", left: 3 } },
  { label: "few (2)", spots: { kind: "few", left: 2 } },
  { label: "few (1)", spots: { kind: "few", left: 1 } },
  { label: "full", spots: { kind: "full" } },
  { label: "open", spots: { kind: "open" } },
  { label: "ended", spots: { kind: "ended" } },
];

const barStates: {
  label: string;
  taken: number;
  capacity: number | null;
  size?: "md" | "lg";
}[] = [
  { label: "0 of 10", taken: 0, capacity: 10 },
  { label: "1 of 10", taken: 1, capacity: 10 },
  { label: "7 of 20", taken: 7, capacity: 20 },
  { label: "9 of 10", taken: 9, capacity: 10 },
  { label: "10 of 10 (full)", taken: 10, capacity: 10 },
  { label: "12 of 10 (over capacity, clamped)", taken: 12, capacity: 10 },
  { label: "unlimited (renders nothing)", taken: 5, capacity: null },
  { label: "7 of 20 large", taken: 7, capacity: 20, size: "lg" },
];
function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && <p className="text-sm text-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function Panel({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-card border border-border bg-surface p-5 shadow-card">
      {children}
    </div>
  );
}

function Label({ children }: { children: ReactNode }) {
  return <span className="text-xs text-muted">{children}</span>;
}

export default function DebugPage() {
  // A scratch page: don't ship it.
  if (process.env.NODE_ENV === "production") notFound();

  const timeZone = getAppTimeZone();

  return (
    <div className="flex flex-col gap-10">
      <header>
        <h1 className="text-2xl font-semibold">UI debug</h1>
        <p className="text-foreground-secondary">
          Every component state with hand-made data. Development only. Dark mode
          follows the OS, so switch it (or emulate it in DevTools) to check
          both. Times are shown in {timeZone}; the page pretends it is{" "}
          {DEBUG_NOW.toISOString()}.{" "}
          Whole screens: <Link href="/debug/event-detail" className="underline">event detail</Link>.
        </p>
      </header>

      <Section title="Type" description="Geist">
        <Panel>
          <div className="flex flex-col gap-3">
            <div>
              <Label>Page title · 30 / 600</Label>
              <p className="text-3xl font-semibold tracking-tight">
                Upcoming events
              </p>
            </div>
            <div>
              <Label>Card title · 18 / 600</Label>
              <p className="text-lg font-semibold">Arboretum Trail Cleanup</p>
            </div>
            <div>
              <Label>Body · 15 / 400</Label>
              <p>Help restock shelves before the weekend rush.</p>
            </div>
            <div>
              <Label>Meta · 13–14 / 400</Label>
              <p className="text-sm text-foreground-secondary">
                9:00 AM – 12:00 PM · 7 of 20 signed up
              </p>
            </div>
            <div>
              <Label>Muted</Label>
              <p className="text-sm text-muted">Leave empty for unlimited.</p>
            </div>
            <div>
              <Label>Eyebrow · 12 / 600 / +6%</Label>
              <p className="text-xs font-semibold tracking-wider text-eyebrow">
                SAT · OCT 10
              </p>
            </div>
            <div>
              <Label>Tabular figures</Label>
              <p className="text-sm tabular-nums">
                111 / 888 · 7 of 20 · 10 of 10
              </p>
            </div>
          </div>
        </Panel>
      </Section>

      <Section
        title="Buttons"
        description="Tab through them to see the focus ring. Hover and press to see the states."
      >
        <Panel>
          <div className="flex flex-col gap-5">
            {(["md", "sm"] as const).map((size) => (
              <div key={size} className="flex flex-col gap-2">
                <Label>size {size}</Label>
                <div className="flex flex-wrap items-center gap-3">
                  {buttonVariants.map((variant) => (
                    <Button key={variant} variant={variant} size={size}>
                      {variant}
                    </Button>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex flex-col gap-2">
              <Label>with icons (children)</Label>
              <div className="flex flex-wrap items-center gap-3">
                <Button>
                  <Plus aria-hidden /> Create event
                </Button>
                <Button variant="secondary">
                  <Pencil aria-hidden /> Edit event
                </Button>
                <Button variant="danger-outline">
                  <Trash2 aria-hidden /> Cancel my spot
                </Button>
                <Button variant="danger">
                  <Trash2 aria-hidden /> Delete event
                </Button>
                <Button variant="secondary">
                  Continue <Check aria-hidden />
                </Button>
                <Button size="sm" variant="secondary">
                  <Pencil aria-hidden /> Edit
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>disabled</Label>
              <div className="flex flex-wrap items-center gap-3">
                {buttonVariants.map((variant) => (
                  <Button key={variant} variant={variant} disabled>
                    {variant}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>
                link styled as a button (buttonStyles) in a plain inline row
              </Label>
              <div>
                <Link
                  href="/events"
                  className={buttonStyles({
                    variant: "secondary",
                    size: "md",
                    className: "",
                  })}
                >
                  Back to events
                </Link>{" "}
                <Button variant="secondary">
                  <Pencil aria-hidden /> Inline sibling
                </Button>{" "}
                <Button>Inline sibling</Button>
              </div>
            </div>
          </div>
        </Panel>
      </Section>

      <Section
        title="Badges"
        description="States differ by lightness and icon, not hue alone."
      >
        <Panel>
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label>Badge variants</Label>
              <div className="flex flex-wrap items-center gap-3">
                {badgeVariants.map((variant) => (
                  <Badge key={variant} variant={variant}>
                    {variant}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label>with icons</Label>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="warning">
                  <Clock aria-hidden /> Only 2 left
                </Badge>
                <Badge variant="outline">
                  <Users aria-hidden /> Open to all
                </Badge>
                <Badge variant="ended">
                  <History aria-hidden /> Ended
                </Badge>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label>SpotsBadge (from getSpots)</Label>
              <div className="flex flex-wrap items-center gap-3">
                {spotsStates.map(({ label, spots }) => (
                  <div key={label} className="flex flex-col items-start gap-1">
                    <Label>{label}</Label>
                    <SpotsBadge spots={spots} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Panel>
      </Section>

      <Section
        title="Capacity bar"
        description="Gold fill; dark once full; hidden for unlimited."
      >
        <Panel>
          <div className="flex max-w-md flex-col gap-4">
            {barStates.map(({ label, taken, capacity, size }) => (
              <div key={label} className="flex flex-col gap-1.5">
                <Label>{label}</Label>
                <CapacityBar taken={taken} capacity={capacity} size={size} />
              </div>
            ))}
          </div>
        </Panel>
      </Section>

      <Section
        title="Event cards"
        description="One per state. Resize to 375px for one column, ~640px for two, ~1024px for three."
      >
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5">
          {sampleEvents.map(({ note, event }) => (
            <figure
              key={event.id}
              className="flex flex-col gap-1.5 [&>:last-child]:flex-1"
            >
              <figcaption className="text-xs text-muted">{note}</figcaption>
              <EventCard event={event} timeZone={timeZone} now={DEBUG_NOW} />
            </figure>
          ))}
        </div>
      </Section>

      <Section title="Empty states">
        <div className="grid gap-5 md:grid-cols-2">
          <EmptyState
            title="No upcoming events yet"
            description="Check back soon!"
          />
          <EmptyState
            icon={CalendarX}
            title="No events match “pottery”"
            description="Try a different word, or clear your search to see every upcoming event."
            action={<Button variant="secondary">Clear search</Button>}
          />
        </div>
      </Section>

      <Section title={"Inline Messages and Signup Summaries"}>
        <Panel>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label>variant: info</Label>
              <InlineMessage title="Title only message" />
              <Label>variant: info</Label>
              <InlineMessage
                title="Inline message"
                body={"Signups and cancellations are closed"}
              />
              <Label>variant: error</Label>
              <InlineMessage
                variant={"error"}
                title="This event is full"
                body="Someone toke the last spot a moment before you."
              />
              <Label>variant: success</Label>
              <InlineMessage
                variant={"success"}
                title="You're in! See you there"
                body="We'll see you at 9:00 AM"
              />
            </div>
            <div>
              <dl className={"grid grid-cols-[auto_1fr] gap-4"}>
                {summaryEvents.map(({ note, event }) => (
                  <Fragment key={event.id}>
                    <dt>{note}</dt>
                    <dd>
                      {
                        <SignupSummaryText
                          summary={getSignupSummary(
                            event,
                            getSpots(event, DEBUG_NOW),
                          )}
                        />
                      }
                    </dd>
                  </Fragment>
                ))}
              </dl>
            </div>
          </div>
        </Panel>
      </Section>
    </div>
  );
}
