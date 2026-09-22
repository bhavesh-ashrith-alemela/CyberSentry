"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Shield, Activity, History, GitCompare, ExternalLink } from "lucide-react";
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
    { href: "/", label: "New Scan", icon: Activity },
    { href: "/history", label: "Scan History", icon: History },
    { href: "/compare", label: "Compare", icon: GitCompare },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-cyber-border/80 bg-cyber-dark/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-cyber-card border border-cyan-500/30 text-cyber-accent group-hover:border-cyan-400/60 transition-colors">
            <Shield className="h-5 w-5 transition-transform group-hover:scale-110" />
            <div className="absolute inset-0 rounded-lg bg-cyan-500/10 blur-sm -z-10" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-wider text-slate-100">
                CYBER<span className="text-cyber-accent">SENTRY</span>
              </span>
              <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-mono text-cyan-400 border border-cyan-500/20">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
              Web Tracking Transparency Platform
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
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Backend Connectivity Status */}
        <div className="hidden md:flex items-center gap-2 text-xs font-mono">
          <div
            className={`flex items-center gap-2 px-2.5 py-1 rounded-full border ${
              backendOnline === true
                ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/30"
                : backendOnline === false
                ? "bg-rose-950/40 text-rose-400 border-rose-500/30"
                : "bg-slate-900 text-slate-400 border-slate-700"
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
              className={`h-2 w-2 rounded-full ${
                backendOnline === true
                  ? "bg-emerald-400 animate-pulse"
                  : backendOnline === false
                  ? "bg-rose-400"
                  : "bg-slate-400"
              }`}
            />
            <span>
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
