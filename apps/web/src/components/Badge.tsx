import React from "react";

const variants = {
  neutral: " bg-background text-foreground-secondary border-border",
  full: "border-transparent bg-foreground text-background",
  warning: "border-red-400 dark:border-yellow-600 text-eyebrow",
  outline: "border-border-strong bg-surface text-foreground-secondary",
  ended: "bg-background text-muted border-border",
} as const;

type BadgeVariant = keyof typeof variants;

export default function Badge({
                                variant = "neutral",
                                children,
                              }: {
  variant?: BadgeVariant;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex h-6 items-center gap-1 [&_svg]:size-[13px] rounded-full px-2.5 text-xs font-semibold whitespace-nowrap border  ${variants[variant]}`}
    >
      {children}
    </span>
  );
}