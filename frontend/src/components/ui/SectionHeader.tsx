import React from "react";
import { cn } from "@/lib/utils";

export interface SectionHeaderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  eyebrow?: string;
  title: React.ReactNode;
  italicWord?: string;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}

export function SectionHeader({
  eyebrow,
  title,
  italicWord,
  subtitle,
  description,
  action,
  className,
  ...props
}: SectionHeaderProps) {
  const desc = description || subtitle;

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-3 border-b border-cs-border",
        className
      )}
      {...props}
    >
      <div>
        {eyebrow && (
          <span className="text-[11px] font-semibold tracking-wider text-cs-primary uppercase block mb-1">
            {eyebrow}
          </span>
        )}

        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-cs-text">
          {title}
          {italicWord && <span className="italic font-normal ml-1.5">{italicWord}</span>}
        </h2>

        {desc && (
          <p className="text-xs sm:text-sm text-cs-muted mt-1 leading-relaxed">
            {desc}
          </p>
        )}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
