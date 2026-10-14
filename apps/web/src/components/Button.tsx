import React from "react";

// Hover/pressed states use `enabled:` so a disabled button doesn't react.
const variants = {
  primary:
    "border border-transparent bg-primary text-on-primary enabled:hover:bg-red-500 enabled:active:bg-red-600",
  secondary:
    "border border-border-strong bg-surface text-foreground enabled:hover:bg-background",
  danger:
    "border border-transparent bg-red-600 text-white enabled:hover:bg-red-600/90 enabled:active:bg-red-600/80",
  "danger-outline":
    "border border-red-400 bg-surface text-danger enabled:hover:bg-background",
  ghost:
    "border border-transparent bg-transparent text-foreground enabled:hover:bg-background",
} as const;

const sizes = {
  sm: "min-h-9",
  md: "min-h-11",
} as const;

type ButtonVariant = keyof typeof variants;
type ButtonSize = keyof typeof sizes;

type Props = React.ComponentProps<"button"> & { variant?: ButtonVariant; size?: ButtonSize, className?: string };
export default function Button({
                                 variant = "primary",
                                 size = "md",
                                 className = "",
                                 ...props
                               }:
                               Props
) {
  return (<button className={buttonStyles({variant, size, className})} {...props} />)
}

export function buttonStyles({
  variant = "primary",
  size = "md",
  className = "",
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}): string {
  return `inline-flex items-center justify-center gap-2 align-middle [&_svg]:size-[18px] px-3.5 rounded-control text-sm font-semibold no-underline cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`
}
