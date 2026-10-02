import React from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: React.ReactNode;
  count?: number | string;
  icon?: React.ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  variant?: "underline" | "pills";
  className?: string;
}

export function Tabs({
  items,
  activeId,
  onChange,
  variant = "underline",
  className,
}: TabsProps) {
  if (variant === "pills") {
    return (
      <div
        className={cn(
          "inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200/80 gap-1",
          className
        )}
        role="tablist"
      >
        {items.map((tab) => {
          const isActive = tab.id === activeId;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={cn(
                "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all select-none",
                isActive
                  ? "bg-cs-surface text-cs-primary shadow-xs font-semibold"
                  : "text-cs-muted hover:text-cs-text hover:bg-slate-200/60"
              )}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={cn(
                    "px-1.5 py-0.2 rounded-full text-[10px] font-mono",
                    isActive
                      ? "bg-cs-primary-soft text-cs-primary"
                      : "bg-slate-200 text-cs-muted"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Default "underline" variant matching the approved report mockup
  return (
    <div
      className={cn(
        "flex items-center gap-6 border-b border-cs-border overflow-x-auto",
        className
      )}
      role="tablist"
    >
      {items.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center gap-2 py-3 text-sm font-medium border-b-2 transition-all select-none whitespace-nowrap",
              isActive
                ? "border-cs-primary text-cs-primary font-semibold"
                : "border-transparent text-cs-muted hover:text-cs-text hover:border-slate-300"
            )}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  "px-1.5 py-0.2 rounded-full text-[10px] font-mono",
                  isActive
                    ? "bg-cs-primary-soft text-cs-primary"
                    : "bg-slate-100 text-cs-muted"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
