import React from "react";
import { cn } from "@/lib/utils";

export interface PaperCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "sunken" | "denim" | "olive" | "pink" | "sand";
  interactive?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export function PaperCard({
  variant = "default",
  interactive = false,
  padding = "md",
  className,
  children,
  ...props
}: PaperCardProps) {
  const variantStyles = {
    default: "bg-cs-paper border-cs-border shadow-paper text-cs-ink",
    elevated: "bg-cs-paper border-cs-border/80 shadow-folder text-cs-ink",
    sunken: "bg-cs-cream/70 border-cs-border/80 shadow-inner text-cs-ink",
    denim: "bg-cs-denim-light border-cs-denim/30 text-cs-ink",
    olive: "bg-cs-olive-light border-cs-olive/30 text-cs-ink",
    pink: "bg-cs-pink-light border-cs-pink/40 text-cs-ink",
    sand: "bg-cs-sand border-cs-border text-cs-ink",
  };

  const paddingStyles = {
    none: "",
    sm: "p-3 sm:p-4",
    md: "p-5 sm:p-6",
    lg: "p-6 sm:p-8",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border transition-all duration-200",
        variantStyles[variant],
        paddingStyles[padding],
        interactive && "hover:-translate-y-0.5 hover:shadow-paper-hover cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
