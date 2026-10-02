"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  Sun,
  User,
  Menu,
} from "lucide-react";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface TopbarProps {
  onMenuClick?: () => void;
  className?: string;
}

export function Topbar({ onMenuClick, className }: TopbarProps) {
  const pathname = usePathname();
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;
    api
      .getHealth()
      .then((res) => {
        if (isMounted) {
          setBackendOnline(res.success && res.data.database.status === "connected");
        }
      })
      .catch(() => {
        if (isMounted) setBackendOnline(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const isReportPage = pathname.startsWith("/scan/");

  return (
    <header
      className={cn(
        "h-14 sm:h-16 border-b border-cs-border bg-cs-surface px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30",
        className
      )}
    >
      {/* Left Context / Mobile Toggle */}
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open mobile navigation"
          className="lg:hidden p-2 rounded-lg text-cs-muted hover:text-cs-text hover:bg-slate-100 transition-colors -ml-1.5"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Page Context / Breadcrumbs */}
        {isReportPage ? (
          <Link
            href="/history"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-cs-muted hover:text-cs-text transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Reports</span>
          </Link>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-semibold text-cs-text font-sans">
              {pathname === "/" && "Website Scanner"}
              {pathname === "/history" && "Audit Archive"}
              {pathname === "/compare" && "Compare Audits"}
              {pathname !== "/" &&
                pathname !== "/history" &&
                pathname !== "/compare" &&
                "CyberSentry"}
            </span>
          </div>
        )}
      </div>

      {/* Right Controls: Health, Theme, Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Live Backend Health Status */}
        <Badge
          variant={
            backendOnline === true
              ? "success"
              : backendOnline === false
              ? "danger"
              : "neutral"
          }
          size="sm"
          dot
          className="hidden sm:inline-flex text-[11px] font-mono select-none"
        >
          {backendOnline === true
            ? "API Connected"
            : backendOnline === false
            ? "API Offline"
            : "Checking..."}
        </Badge>

        {/* Theme Icon Placeholder */}
        <button
          type="button"
          aria-label="Toggle theme"
          className="p-2 rounded-xl text-cs-muted hover:text-cs-text hover:bg-slate-100 transition-colors"
          title="Light theme (Active)"
        >
          <Sun className="h-4 w-4" />
        </button>

        {/* Profile / Avatar Placeholder */}
        <div
          className="h-8 w-8 rounded-full border border-cs-border bg-slate-100 flex items-center justify-center text-cs-muted hover:text-cs-text hover:border-slate-300 transition-colors cursor-pointer select-none"
          title="User Profile (Local Session)"
          aria-label="User Profile"
        >
          <User className="h-4 w-4" />
        </div>
      </div>
    </header>
  );
}
