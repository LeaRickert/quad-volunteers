import type { ReactNode } from "react";

// One column on phones, two and three as the page widens. Shared by the events page and
// its loading skeleton so nothing shifts when the real content arrives.
export default function EventGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {children}
    </div>
  );
}
