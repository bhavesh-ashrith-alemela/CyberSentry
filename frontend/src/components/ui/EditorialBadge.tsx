import React from "react";
import { cn } from "@/lib/utils";

export interface EditorialBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "denim"
    | "olive"
    | "pink"
    | "safe"
    | "warning"
    | "danger"
    | "dark"
    | "sand";
  size?: "xs" | "sm" | "md";
  dot?: boolean;
}

export function EditorialBadge({
  variant = "default",
  size = "sm",
  dot = false,
  className,
  children,
  ...props
}: EditorialBadgeProps) {
  const variantStyles = {
    default: "border-cs-border bg-cs-paper text-cs-ink",
    denim: "border-cs-denim/30 bg-cs-denim-light text-cs-denim font-semibold",
    olive: "border-cs-olive/30 bg-cs-olive-light text-cs-olive font-semibold",
    pink: "border-cs-pink/40 bg-cs-pink-light text-[#A84B60] font-semibold",
    safe: "border-cs-safe/30 bg-cs-safe-bg text-cs-safe font-semibold",
    warning: "border-cs-warning/30 bg-cs-warning-bg text-cs-warning font-semibold",
    danger: "border-cs-danger/30 bg-cs-danger-bg text-cs-danger font-semibold",
    dark: "border-cs-ink bg-cs-ink text-cs-paper font-semibold",
    sand: "border-cs-border bg-cs-sand text-cs-ink",
  };

  const dotStyles = {
    default: "bg-cs-muted",
    denim: "bg-cs-denim",
    olive: "bg-cs-olive",
    pink: "bg-cs-pink-dark",
    safe: "bg-cs-safe",
    warning: "bg-cs-warning",
    danger: "bg-cs-danger",
    dark: "bg-cs-paper",
    sand: "bg-cs-muted",
  };

  const sizeStyles = {
    xs: "px-2 py-0.5 text-[10px] rounded-md",
    sm: "px-2.5 py-1 text-xs rounded-lg",
    md: "px-3 py-1.5 text-xs rounded-lg",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-mono border tracking-wider select-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotStyles[variant])}
        />
      )}
      <span>{children}</span>
    </span>
  );
}
