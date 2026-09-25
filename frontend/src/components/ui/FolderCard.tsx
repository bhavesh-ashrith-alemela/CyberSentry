import React from "react";
import { cn } from "@/lib/utils";
import { FolderTab } from "./FolderTab";

export interface FolderCardProps extends React.HTMLAttributes<HTMLDivElement> {
  tabLabel: React.ReactNode;
  tabColor?: "denim" | "olive" | "pink" | "paper" | "dark" | "cream" | "sand";
  tabIcon?: React.ReactNode;
  tabRight?: React.ReactNode;
  bodyColor?: "paper" | "denim" | "olive" | "pink" | "sand";
  interactive?: boolean;
}

export function FolderCard({
  tabLabel,
  tabColor = "paper",
  tabIcon,
  tabRight,
  bodyColor = "paper",
  interactive = false,
  className,
  children,
  ...props
}: FolderCardProps) {
  const bodyStyles = {
    paper: "bg-cs-paper text-cs-ink border-cs-border",
    denim: "bg-cs-denim text-white border-cs-denim",
    olive: "bg-cs-olive text-white border-cs-olive",
    pink: "bg-cs-pink text-cs-ink border-cs-pink",
    sand: "bg-cs-sand text-cs-ink border-cs-border",
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col transition-all duration-200",
        interactive && "hover:-translate-y-0.5 cursor-pointer",
        className
      )}
      {...props}
    >
      {/* Top Tab Bar */}
      <div className="flex items-end justify-between px-1">
        <FolderTab color={tabColor} icon={tabIcon}>
          {tabLabel}
        </FolderTab>
        {tabRight && <div className="pb-1.5">{tabRight}</div>}
      </div>

      {/* Folder Card Body */}
      <div
        className={cn(
          "rounded-2xl rounded-tl-none border p-5 sm:p-6 shadow-paper transition-all",
          bodyStyles[bodyColor],
          interactive && "group-hover:shadow-paper-hover"
        )}
      >
        {children}
      </div>
    </div>
  );
}
