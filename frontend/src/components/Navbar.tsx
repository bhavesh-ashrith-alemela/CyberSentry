"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Folder, History, GitCompare, Activity } from "lucide-react";
import { api } from "@/lib/api";

export function Navbar() {
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

  const navLinks = [
    { href: "/", label: "Scan", icon: Activity },
    { href: "/history", label: "Reports", icon: History },
    { href: "/compare", label: "Compare", icon: GitCompare },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-cs-border bg-cs-cream/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-2.5 group select-none">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cs-denim text-white shadow-sm group-hover:scale-105 transition-transform duration-200">
            <Folder className="h-5 w-5 fill-white/20 stroke-white" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-xl tracking-tight text-cs-ink font-sans">
              CyberSentry
            </span>
            <span className="hidden sm:inline-block rounded-md border border-cs-border bg-cs-paper px-1.5 py-0.2 text-[10px] font-mono text-cs-muted">
              v1.0
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-1.5">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                aria-label={item.label}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? "bg-cs-paper text-cs-denim font-semibold border border-cs-border shadow-xs"
                    : "text-cs-muted hover:text-cs-ink hover:bg-cs-cream-deep/50"
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Tagline & Backend Health Indicator */}
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-mono tracking-widest uppercase text-cs-muted/80 hidden xl:block select-none">
            MORE TRANSPARENCY. A SAFER INTERNET.
          </span>

          <div
            className={`flex items-center gap-2 px-2.5 py-1 rounded-full border text-xs font-mono shadow-xs select-none transition-colors ${
              backendOnline === true
                ? "bg-cs-paper text-cs-safe border-cs-border"
                : backendOnline === false
                ? "bg-cs-pink-light text-cs-danger border-cs-pink"
                : "bg-cs-paper text-cs-muted border-cs-border"
            }`}
            title={
              backendOnline === true
                ? "Backend API & PostgreSQL Connected"
                : backendOnline === false
                ? "Backend API Disconnected"
                : "Checking Backend Connectivity..."
            }
          >
            <span
              className={`h-2 w-2 rounded-full shrink-0 ${
                backendOnline === true
                  ? "bg-cs-safe animate-pulse"
                  : backendOnline === false
                  ? "bg-cs-danger"
                  : "bg-cs-muted"
              }`}
            />
            <span className="hidden sm:inline">
              {backendOnline === true
                ? "API Connected"
                : backendOnline === false
                ? "API Offline"
                : "Connecting..."}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
