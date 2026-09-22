"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Shield, Menu, X } from "lucide-react";
import { api } from "@/lib/api";

export function Navbar() {
  const pathname = usePathname();
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: "/#product", label: "Product" },
    { href: "/#how-it-works", label: "How It Works" },
    { href: "/#sample-report", label: "Privacy Insights" },
    { href: "/history", label: "Scan History" },
  ];

  const handleScanClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setMobileMenuOpen(false);
    if (pathname === "/") {
      e.preventDefault();
      const input = document.getElementById("scan-input");
      if (input) {
        input.scrollIntoView({ behavior: "smooth", block: "center" });
        (input.querySelector("input") || input)?.focus();
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-sand-300 bg-sand-50/90 backdrop-blur-md print:hidden">
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
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-sand-200 text-forest-950 border border-sand-400 font-semibold shadow-subtle"
                    : "text-forest-700 hover:text-forest-950 hover:bg-sand-100"
                }`}
              >
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Side: Scan a Website Button, Status Pill, and Mobile Menu Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/#scan-input"
            onClick={handleScanClick}
            className="flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-semibold text-sand-50 bg-forest-800 hover:bg-forest-900 active:bg-forest-950 transition-all shadow-subtle"
          >
            <span>Scan a Website</span>
          </Link>

          {/* Operational Pill */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-mono">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] ${
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
                  ? "Engine Ready"
                  : backendOnline === false
                  ? "Offline"
                  : "Checking..."}
              </span>
            </div>
          </div>

          {/* Mobile Menu Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open navigation menu"}
            className="md:hidden p-2 rounded-lg text-forest-700 hover:text-forest-950 hover:bg-sand-200 transition-colors border border-sand-300"
          >
            {mobileMenuOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-sand-300 bg-sand-50/95 px-4 py-3 space-y-1 shadow-sm font-mono text-xs">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-forest-800 hover:bg-sand-200 hover:text-forest-950 transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/compare"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-forest-800 hover:bg-sand-200 hover:text-forest-950 transition-colors"
          >
            Scan Comparison
          </Link>
        </div>
      )}
    </header>
  );
}
