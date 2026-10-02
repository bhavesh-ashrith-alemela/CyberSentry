"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  Home,
  Clock,
  FileText,
  Settings,
  GitCompare,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      label: "Scan History",
      href: "/history",
      icon: Clock,
      isActive: pathname === "/history",
    },
    {
      label: "Reports",
      href: "/history",
      icon: FileText,
      isActive: pathname.startsWith("/scan"),
    },
    {
      label: "Compare",
      href: "/compare",
      icon: GitCompare,
      isActive: pathname === "/compare",
    },
  ];

  return (
    <aside
      className={cn(
        "flex flex-col justify-between h-full bg-cs-surface border-r border-cs-border w-60 py-6 px-4 select-none",
        className
      )}
    >
      {/* Top Brand & Nav */}
      <div className="space-y-7">
        {/* Brand */}
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-2.5 px-2 group"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cs-primary text-white shadow-xs group-hover:scale-105 transition-transform">
            <Shield className="h-5 w-5 fill-white/20 stroke-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight text-cs-text font-sans leading-none">
              CyberSentry
            </span>
            <span className="text-[10px] font-mono text-cs-muted mt-0.5">
              Privacy Platform v1.0
            </span>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="space-y-1" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  item.isActive
                    ? "bg-cs-primary-soft text-cs-primary font-semibold shadow-xs"
                    : "text-cs-muted hover:text-cs-text hover:bg-slate-100/70"
                )}
                aria-current={item.isActive ? "page" : undefined}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    item.isActive ? "text-cs-primary" : "text-cs-muted"
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Settings Placeholder Item */}
          <button
            type="button"
            onClick={() => {
              if (onNavigate) onNavigate();
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-cs-muted hover:text-cs-text hover:bg-slate-100/70 transition-colors text-left"
            title="Settings (Default Environment)"
          >
            <Settings className="h-4 w-4 shrink-0 text-cs-muted" />
            <span>Settings</span>
          </button>
        </nav>
      </div>

      {/* Bottom Privacy Tagline */}
      <div className="pt-4 border-t border-cs-border px-2">
        <div className="flex items-center gap-2.5 text-cs-muted">
          <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-cs-muted">
            <Shield className="h-3.5 w-3.5" />
          </div>
          <p className="text-[11px] leading-tight text-cs-muted">
            More transparency.<br />
            <span className="text-cs-text font-medium">Safer web.</span>
          </p>
        </div>
      </div>
    </aside>
  );
}
