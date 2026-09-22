"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Shield, Activity, History, GitCompare } from "lucide-react";
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
    { href: "/", label: "New Audit", icon: Activity },
    { href: "/history", label: "Audit History", icon: History },
    { href: "/compare", label: "Comparison", icon: GitCompare },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-sand-300 bg-sand-50/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-forest-800 text-sand-50 group-hover:bg-forest-900 transition-colors shadow-subtle">
            <Shield className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-wider text-forest-950">
                CYBER<span className="text-forest-700 font-light">/SENTRY</span>
              </span>
              <span className="rounded px-1.5 py-0.5 text-[10px] font-mono bg-sand-200 text-forest-700 border border-sand-300">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-forest-500 font-mono hidden sm:block">
              Explainable Privacy Transparency
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                aria-label={item.label}
                className={`flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? "bg-sand-200 text-forest-950 border border-sand-400 font-semibold shadow-subtle"
                    : "text-forest-700 hover:text-forest-950 hover:bg-sand-100"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Backend Connectivity Status */}
        <div className="hidden md:flex items-center gap-2 text-xs font-mono">
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs ${
              backendOnline === true
                ? "bg-forest-50 text-forest-800 border-forest-200"
                : backendOnline === false
                ? "bg-rust-50 text-rust-800 border-rust-200"
                : "bg-sand-100 text-forest-500 border-sand-300"
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
              className={`h-1.5 w-1.5 rounded-full ${
                backendOnline === true
                  ? "bg-forest-600"
                  : backendOnline === false
                  ? "bg-rust-600"
                  : "bg-sand-400"
              }`}
            />
            <span>
              {backendOnline === true
                ? "API Operational"
                : backendOnline === false
                ? "API Offline"
                : "Checking..."}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
