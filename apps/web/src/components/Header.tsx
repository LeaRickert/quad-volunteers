import Link from "next/link";

const navItems = [
  { href: "/events", label: "Events" },
  { href: "/me/signups", label: "My sign-ups" },
];

export default function Header() {
  return (
    <header className="border-t-[3px] border-b border-t-primary border-b-border bg-surface">
      <div className="mx-auto flex h-14 max-w-[1160px] items-center justify-between gap-2 px-4 sm:h-16 sm:px-8">
        <Link href="/events" className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="relative flex size-[30px] items-center justify-center rounded-control bg-primary text-sm font-semibold text-on-primary"
          >
            qv
            <span className="absolute -right-0.5 -bottom-0.5 size-2 rounded-full bg-yellow-500" />
          </span>
          <span className="text-base font-semibold whitespace-nowrap sm:text-[17px]">
            Quad Volunteers
          </span>
        </Link>
        <nav aria-label="Main">
          <ul className="flex items-center gap-1 sm:gap-4">
            {navItems.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex min-h-11 items-center px-2 text-sm font-medium whitespace-nowrap text-foreground-secondary hover:text-foreground"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
