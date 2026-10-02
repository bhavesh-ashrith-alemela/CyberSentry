import React from "react";
import { cn } from "@/lib/utils";
import { Card } from "./Card";

export interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: React.ReactNode;
  value: React.ReactNode;
  subvalue?: React.ReactNode;
  delta?: React.ReactNode;
  deltaType?: "positive" | "negative" | "neutral";
  icon?: React.ReactNode;
  status?: React.ReactNode;
  hover?: boolean;
}

export function MetricCard({
  label,
  value,
  subvalue,
  delta,
  deltaType = "neutral",
  icon,
  status,
  hover = false,
  className,
  children,
  ...props
}: MetricCardProps) {
  const deltaColorStyles = {
    positive: "text-cs-success font-semibold",
    negative: "text-cs-danger font-semibold",
    neutral: "text-cs-muted",
  };

  return (
    <Card
      hover={hover}
      padding="md"
      className={cn("flex flex-col justify-between", className)}
      {...props}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          {icon && (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cs-primary-soft text-cs-primary shrink-0">
              {icon}
            </div>
          )}
          {status && <div>{status}</div>}
        </div>

        <span className="text-xs font-medium text-cs-muted block tracking-tight">
          {label}
        </span>

        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-cs-text">
            {value}
          </span>
          {subvalue && (
            <span className="text-sm font-semibold text-cs-muted">
              {subvalue}
            </span>
          )}
        </div>
      </div>

      {(delta || children) && (
        <div className="mt-3 pt-3 border-t border-cs-border flex items-center justify-between text-xs text-cs-muted">
          {delta && (
            <span className={cn("text-xs", deltaColorStyles[deltaType])}>
              {delta}
            </span>
          )}
          {children}
        </div>
      )}
    </Card>
  );
}
