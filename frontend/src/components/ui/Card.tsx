import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export function Card({
  hover = false,
  padding = "md",
  className,
  children,
  ...props
}: CardProps) {
  const paddingStyles = {
    none: "",
    sm: "p-3 sm:p-4",
    md: "p-5 sm:p-6",
    lg: "p-6 sm:p-8",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-cs-border bg-cs-surface shadow-sm transition-all duration-200",
        hover && "hover:shadow-md hover:border-cs-border/80 cursor-pointer",
        paddingStyles[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
