import React from "react";
import { cn } from "@/lib/utils";

export interface StampBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: "ink" | "denim" | "olive" | "rose" | "muted";
  rotate?: "left" | "right" | "none";
}

export function StampBadge({
  color = "ink",
  rotate = "left",
  className,
  children,
  ...props
}: StampBadgeProps) {
  const colorStyles = {
    ink: "border-cs-ink/70 text-cs-ink",
    denim: "border-cs-denim/70 text-cs-denim",
    olive: "border-cs-olive/80 text-cs-olive",
    rose: "border-cs-danger/70 text-cs-danger",
    muted: "border-cs-muted/70 text-cs-muted",
  };

  const rotateStyles = {
    left: "-rotate-2",
    right: "rotate-2",
    none: "",
  };

  return (
    <span
      className={cn(
        "rubber-stamp select-none transition-transform duration-200",
        colorStyles[color],
        rotateStyles[rotate],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
