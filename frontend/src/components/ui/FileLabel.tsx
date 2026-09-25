import React from "react";
import { cn } from "@/lib/utils";

export interface FileLabelProps extends React.HTMLAttributes<HTMLSpanElement> {
  code?: string;
  brackets?: boolean;
  variant?: "muted" | "ink" | "denim" | "olive" | "pink";
}

export function FileLabel({
  code,
  brackets = false,
  variant = "muted",
  className,
  children,
  ...props
}: FileLabelProps) {
  const variantStyles = {
    muted: "text-cs-muted",
    ink: "text-cs-ink font-semibold",
    denim: "text-cs-denim font-semibold",
    olive: "text-cs-olive font-semibold",
    pink: "text-cs-pink-dark font-semibold",
  };

  const content = children || code;

  return (
    <span
      className={cn(
        "inline-flex items-center font-mono text-[10px] sm:text-[11px] uppercase tracking-widest select-none",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {brackets && <span className="text-cs-muted/60 mr-1">[</span>}
      {code && !children && <span>{code}</span>}
      {children}
      {brackets && <span className="text-cs-muted/60 ml-1">]</span>}
    </span>
  );
}
