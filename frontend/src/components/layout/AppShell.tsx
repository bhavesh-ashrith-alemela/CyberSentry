"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile drawer on route navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen bg-cs-bg flex flex-col lg:flex-row antialiased selection:bg-cs-primary-soft selection:text-cs-primary">
      {/* Desktop Sidebar (Fixed left, width 240px) */}
      <div className="hidden lg:block w-60 shrink-0 sticky top-0 h-screen z-30 print:hidden">
        <Sidebar className="w-60 h-screen" />
      </div>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        >
          <div
            className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-cs-surface z-50 shadow-xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Drawer"
          >
            {/* Mobile Close Button */}
            <div className="absolute top-4 right-4 z-10">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-cs-muted hover:text-cs-text hover:bg-slate-100 transition-colors"
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <Sidebar
              className="w-full border-r-0 h-full"
              onNavigate={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <div className="print:hidden">
          <Topbar onMenuClick={() => setMobileMenuOpen(true)} />
        </div>
        <main className="flex-1 bg-cs-bg overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
