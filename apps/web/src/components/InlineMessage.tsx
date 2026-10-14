import { CircleAlert, CircleCheck, Info, type LucideIcon } from "lucide-react";

// success and error use raw palette names on purpose: the tint backgrounds have no
// semantic token, so each variant sets its own dark-mode colors with dark:.
const variants = {
  info: "bg-surface border-border-strong",
  success: "bg-gold-tint dark:bg-yellow-600 border-yellow-400  text-gray-900",
  error:
    "bg-red-tint dark:bg-red-600 dark:text-foreground border-red-400 text-red-600 ",
};

const icons: Record<MessageVariant, LucideIcon> = {
  info: Info,
  success: CircleCheck,
  error: CircleAlert,
};
type MessageVariant = keyof typeof variants;
export default function InlineMessage({
  variant = "info",
  title,
  body,
}: {
  variant?: MessageVariant;
  title: string;
  body?: string;
}) {
  const Icon = icons[variant];
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-row items-start gap-2.5 px-3 py-3.5 rounded-card border ${variants[variant]}`}
    >
      <span className="flex mt-0.5">
        <Icon aria-hidden size={18} />
      </span>
      <div>
        <div className={"text-sm font-semibold"}>{title}</div>
        {body && <div className={"text-sm mt-0.5"}>{body}</div>}
      </div>
    </div>
  );
}
