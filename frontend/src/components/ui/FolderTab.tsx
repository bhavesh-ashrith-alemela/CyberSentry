import React from "react";
import { cn } from "@/lib/utils";

export interface FolderTabProps extends React.HTMLAttributes<HTMLDivElement> {
  color?: "denim" | "olive" | "pink" | "paper" | "dark" | "cream" | "sand";
  active?: boolean;
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  count?: string | number;
}

export function FolderTab({
  color = "paper",
  active = true,
  size = "md",
  icon,
  count,
  className,
  children,
  ...props
}: FolderTabProps) {
  const colorStyles = {
    denim: active
      ? "bg-cs-denim text-white border-cs-denim shadow-sm"
      : "bg-cs-denim/20 text-cs-denim border-cs-denim/30 hover:bg-cs-denim/30",
    olive: active
      ? "bg-cs-olive text-white border-cs-olive shadow-sm"
      : "bg-cs-olive/20 text-cs-olive border-cs-olive/30 hover:bg-cs-olive/30",
    pink: active
      ? "bg-cs-pink text-cs-ink border-cs-pink shadow-sm"
      : "bg-cs-pink/30 text-cs-ink border-cs-pink/40 hover:bg-cs-pink/50",
    paper: active
      ? "bg-cs-paper text-cs-ink border-cs-border shadow-sm"
      : "bg-cs-cream-deep/60 text-cs-muted border-cs-border hover:bg-cs-paper",
    dark: active
      ? "bg-cs-ink text-cs-paper border-cs-ink shadow-sm"
      : "bg-cs-ink/10 text-cs-ink border-cs-ink/20 hover:bg-cs-ink/20",
    cream: "bg-cs-cream text-cs-ink border-cs-border",
    sand: "bg-cs-sand text-cs-ink border-cs-border",
  };

  const sizeStyles = {
    sm: "px-3 py-1 text-[11px] rounded-t-lg -mb-[1px]",
    md: "px-4 py-1.5 text-xs rounded-t-xl -mb-[1px]",
    lg: "px-5 py-2 text-sm rounded-t-xl -mb-[1px]",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 font-mono font-semibold uppercase tracking-wider border border-b-0 select-none transition-colors",
        colorStyles[color],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {count !== undefined && (
        <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 dark:bg-white/10 font-bold">
          {count}
        </span>
      )}
    </div>
  );
}
