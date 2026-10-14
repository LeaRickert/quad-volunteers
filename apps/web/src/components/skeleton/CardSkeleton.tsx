// Placeholder shaped like EventCard. Each row has the same height as its real
// counterpart (eyebrow, title, two meta rows, footer), so the page doesn't shift when the
// events arrive.
export default function CardSkeleton() {
  return (
    <div className="flex min-w-0 animate-pulse flex-col gap-3.5 rounded-card border border-border bg-surface p-5 shadow-card">
      <div className="flex min-h-6 items-center">
        <div className="h-3 w-24 rounded bg-border" />
      </div>
      <div className="flex h-7 items-center">
        <div className="h-[18px] w-3/4 rounded bg-border" />
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex h-5 items-center">
          <div className="h-3.5 w-1/2 rounded bg-border" />
        </div>
        <div className="flex h-5 items-center">
          <div className="h-3.5 w-2/3 rounded bg-border" />
        </div>
      </div>
      <div className="mt-auto flex flex-col gap-3 border-t border-border pt-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="h-3 w-24 rounded bg-border" />
          <div className="h-6 w-20 rounded-full bg-border" />
        </div>
        <div className="h-1.5 w-full rounded-full bg-border" />
      </div>
    </div>
  );
}
