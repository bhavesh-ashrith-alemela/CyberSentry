import React from "react";
import { cn } from "@/lib/utils";
import { FileLabel } from "./FileLabel";

export interface SectionHeaderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  eyebrow?: string;
  title: React.ReactNode;
  italicWord?: string;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
}

export function SectionHeader({
  eyebrow,
  title,
  italicWord,
  subtitle,
  action,
  className,
  ...props
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-cs-border/80",
        className
      )}
      {...props}
    >
      <div>
        {eyebrow && (
          <div className="mb-2">
            <FileLabel brackets variant="denim">
              {eyebrow}
            </FileLabel>
          </div>
        )}

        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-cs-ink font-display">
          {title}
          {italicWord && (
            <span className="editorial-italic text-cs-denim ml-2 font-normal">
              {italicWord}
            </span>
          )}
        </h2>

        {subtitle && (
          <p className="mt-1.5 text-xs sm:text-sm text-cs-muted font-sans max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
