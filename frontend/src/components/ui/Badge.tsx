import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "neutral" | "primary" | "success" | "warning" | "danger" | "purple";
  size?: "sm" | "md";
  dot?: boolean;
}

export function Badge({
  variant = "neutral",
  size = "md",
  dot = false,
  className,
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    neutral: "bg-slate-100 text-cs-muted border-slate-200/80",
    primary: "bg-cs-primary-soft text-cs-primary border-blue-200/70",
    success: "bg-cs-success-soft text-cs-success border-emerald-200/70",
    warning: "bg-cs-warning-soft text-[#B8771B] border-amber-200/70",
    danger: "bg-cs-danger-soft text-cs-danger border-red-200/70",
    purple: "bg-cs-purple-soft text-cs-purple border-purple-200/70",
  };

  const dotStyles = {
    neutral: "bg-cs-muted",
    primary: "bg-cs-primary",
    success: "bg-cs-success",
    warning: "bg-cs-warning",
    danger: "bg-cs-danger",
    purple: "bg-cs-purple",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium select-none transition-colors",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotStyles[variant])}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
