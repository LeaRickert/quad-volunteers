import { Calendar, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export default function EmptyState({
  icon: Icon = Calendar,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode; // a Button or a link styled with buttonStyles()
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-border-strong bg-surface px-5 py-10 text-center">
      <span
        aria-hidden
        className="flex size-[52px] items-center justify-center rounded-full border border-border bg-background text-muted"
      >
        <Icon size={24} strokeWidth={1.75} />
      </span>
      <h2 className="text-[17px] font-semibold">{title}</h2>
      {description && (
        <p className="max-w-sm text-sm text-muted">{description}</p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
