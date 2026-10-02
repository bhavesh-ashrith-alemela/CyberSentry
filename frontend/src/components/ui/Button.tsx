import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const variantStyles = {
    primary:
      "bg-cs-primary text-white hover:bg-cs-primary-hover shadow-xs active:translate-y-px focus-visible:ring-cs-primary/30",
    secondary:
      "bg-cs-primary-soft text-cs-primary hover:bg-blue-100/80 active:translate-y-px focus-visible:ring-cs-primary/20",
    outline:
      "border border-cs-border bg-cs-surface text-cs-text hover:bg-slate-50 hover:border-slate-300 shadow-xs active:translate-y-px focus-visible:ring-slate-300",
    ghost:
      "text-cs-muted hover:text-cs-text hover:bg-slate-100/70 focus-visible:ring-slate-200",
    danger:
      "bg-cs-danger text-white hover:bg-red-600 shadow-xs active:translate-y-px focus-visible:ring-red-200",
  };

  const sizeStyles = {
    sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
    md: "h-10 px-4 text-sm rounded-xl gap-2",
    lg: "h-12 px-6 text-base rounded-xl gap-2.5",
  };

  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all select-none focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-3.5 w-3.5 mr-1.5 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
