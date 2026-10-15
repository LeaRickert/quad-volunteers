// Placeholder shaped like EventDetail and the back link above it. Each row has the same
// height as its real counterpart, so the page doesn't shift when the event arrives.
export default function DetailSkeleton() {
  return (
    <div aria-hidden className="animate-pulse">
      {/* back link */}
      <div className="mb-6 flex h-9 items-center">
        <div className="h-4 w-24 rounded bg-border" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <header className="flex flex-col gap-3 lg:col-start-1">
          {/* eyebrow */}
          <div className="flex h-4 items-center">
            <div className="h-3 w-24 rounded bg-border" />
          </div>
          {/* title */}
          <div className="flex h-8 items-center lg:h-10">
            <div className="h-6 w-3/4 rounded bg-border lg:h-8" />
          </div>
          {/* date, time, location */}
          <div className="flex flex-col gap-1.5">
            {["w-1/2", "w-1/3", "w-2/3"].map((width) => (
              <div key={width} className="flex h-[22.5px] items-center">
                <div className={`h-4 rounded bg-border ${width}`} />
              </div>
            ))}
          </div>
        </header>

        {/* availability card */}
        <div className="flex flex-col gap-4 rounded-card border border-border bg-surface p-5 shadow-card lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
          <div className="flex h-6 items-center justify-between gap-2">
            <div className="h-4 w-32 rounded bg-border" />
            <div className="h-6 w-20 rounded-full bg-border" />
          </div>
          <div className="h-3 w-full rounded-full bg-border" />
        </div>

        {/* about */}
        <section className="lg:col-start-1">
          <div className="flex h-7 items-center">
            <div className="h-[18px] w-48 rounded bg-border" />
          </div>
          {["w-full", "w-full", "w-5/6", "w-2/3"].map((width, i) => (
            <div key={i} className="flex h-[24.375px] items-center">
              <div className={`h-4 rounded bg-border ${width}`} />
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
