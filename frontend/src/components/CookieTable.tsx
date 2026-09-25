"use client";

import { useState } from "react";
import { Cookie, Search, Clock, AlertTriangle, ShieldCheck } from "lucide-react";
import { CookieRecord } from "@/lib/types";
import { FileLabel, EditorialBadge } from "@/components/ui";

interface CookieTableProps {
  cookies: CookieRecord[];
}

export function CookieTable({ cookies }: CookieTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [thirdPartyOnly, setThirdPartyOnly] = useState(false);

  const categories = ["ALL", "Essential", "Analytics", "Advertising", "Functional", "Unknown"];
  const oneYearSeconds = 365 * 24 * 60 * 60;
  const currentTimestamp = Math.floor(Date.now() / 1000);

  const filtered = cookies.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.domain.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat =
      categoryFilter === "ALL" ||
      c.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchesParty = !thirdPartyOnly || c.isThirdParty;
    return matchesSearch && matchesCat && matchesParty;
  });

  return (
    <div className="rounded-2xl border border-cs-border bg-cs-paper p-6 sm:p-7 shadow-paper text-cs-ink space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cs-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <FileLabel code="CLIENT_STORAGE" variant="muted" />
            <EditorialBadge variant="denim" size="xs">
              {filtered.length} of {cookies.length} Deposited
            </EditorialBadge>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-display text-cs-ink">
            Cookie Ledger
          </h3>
          <p className="text-xs text-cs-muted font-sans mt-0.5">
            Complete inventory of cookies deposited in browser storage during the controlled audit crawl.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-cs-muted" />
            <input
              type="text"
              placeholder="Search cookie or domain..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg text-xs font-mono bg-cs-paper border border-cs-border focus:border-cs-denim focus:outline-none text-cs-ink w-48 shadow-xs"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-mono bg-cs-paper border border-cs-border focus:border-cs-denim focus:outline-none text-cs-ink shadow-xs"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Third-Party Filter Toggle */}
          <button
            type="button"
            onClick={() => setThirdPartyOnly(!thirdPartyOnly)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors border select-none ${
              thirdPartyOnly
                ? "bg-cs-denim text-white border-cs-denim font-semibold shadow-xs"
                : "bg-cs-paper border-cs-border text-cs-muted hover:text-cs-ink hover:bg-cs-cream-deep/40"
            }`}
          >
            Third-Party Only
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 ? (
        <div className="p-8 text-center rounded-xl bg-cs-cream/40 border border-cs-border text-xs text-cs-muted font-mono">
          No cookies match your search and filter criteria.
        </div>
      ) : (
        <>
          {/* Desktop Table View (Hidden on mobile) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-cs-border text-cs-muted uppercase tracking-wider text-[10px]">
                  <th className="pb-3 font-semibold">Cookie Name</th>
                  <th className="pb-3 font-semibold">Domain</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Lifespan / Expiry</th>
                  <th className="pb-3 font-semibold text-center">Security Flags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cs-border/60">
                {filtered.map((c, i) => {
                  const isExcessive =
                    !c.isSession &&
                    c.expires > currentTimestamp &&
                    c.expires - currentTimestamp > oneYearSeconds;

                  return (
                    <tr key={`${c.name}-${i}`} className="hover:bg-cs-cream-deep/20 transition-colors">
                      <td className="py-3 pr-4 font-bold text-cs-ink max-w-[200px] truncate">
                        {c.name}
                      </td>
                      <td className="py-3 pr-4 text-cs-muted max-w-[160px] truncate">
                        <span>{c.domain}</span>
                        {c.isThirdParty && (
                          <span className="ml-1.5 px-1 py-0.2 rounded text-[9px] font-bold bg-cs-pink-light text-[#A84B60] border border-cs-pink/40">
                            3rd-Party
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        <EditorialBadge
                          variant={
                            c.category === "Advertising"
                              ? "danger"
                              : c.category === "Analytics"
                              ? "denim"
                              : c.category === "Essential"
                              ? "safe"
                              : "default"
                          }
                          size="xs"
                        >
                          {c.category}
                        </EditorialBadge>
                      </td>
                      <td className="py-3 pr-4 text-cs-muted">
                        {c.isSession ? (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-cs-muted" />
                            Session
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span>{new Date(c.expires * 1000).toLocaleDateString()}</span>
                            {isExcessive && (
                              <span title="Lifespan exceeds 1 year recommended limit" className="text-cs-warning">
                                <AlertTriangle className="h-3.5 w-3.5" />
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span
                            title={c.isSecure ? "Secure (HTTPS only)" : "Insecure (Can transmit unencrypted)"}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                              c.isSecure
                                ? "bg-cs-olive-light text-cs-olive border-cs-olive/30"
                                : "bg-cs-pink-light text-cs-danger border-cs-pink/40"
                            }`}
                          >
                            SEC
                          </span>
                          <span
                            title={c.isHttpOnly ? "HttpOnly (Protected from script access)" : "Missing HttpOnly (Accessible by JavaScript)"}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                              c.isHttpOnly
                                ? "bg-cs-olive-light text-cs-olive border-cs-olive/30"
                                : "bg-cs-warning-bg text-cs-warning border-cs-warning/30"
                            }`}
                          >
                            HTTP
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cs-cream-deep/40 text-cs-muted border border-cs-border">
                            {c.sameSite || "Lax"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Cards View (Shown on < 768px screens to eliminate horizontal scrolling) */}
          <div className="block md:hidden space-y-3">
            {filtered.map((c, i) => {
              const isExcessive =
                !c.isSession &&
                c.expires > currentTimestamp &&
                c.expires - currentTimestamp > oneYearSeconds;

              return (
                <div
                  key={`mobile-${c.name}-${i}`}
                  className="p-3.5 rounded-xl border border-cs-border bg-cs-paper shadow-xs text-xs font-mono space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-cs-ink break-all">
                      {c.name}
                    </span>
                    <EditorialBadge
                      variant={
                        c.category === "Advertising"
                          ? "danger"
                          : c.category === "Analytics"
                          ? "denim"
                          : c.category === "Essential"
                          ? "safe"
                          : "default"
                      }
                      size="xs"
                    >
                      {c.category}
                    </EditorialBadge>
                  </div>

                  <div className="text-[11px] text-cs-muted flex items-center justify-between">
                    <span className="truncate max-w-[200px]">{c.domain}</span>
                    {c.isThirdParty && (
                      <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-cs-pink-light text-[#A84B60] border border-cs-pink/40 shrink-0">
                        3rd-Party
                      </span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-cs-border/60 flex items-center justify-between text-[11px]">
                    <div className="text-cs-muted flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {c.isSession
                          ? "Session"
                          : new Date(c.expires * 1000).toLocaleDateString()}
                      </span>
                      {isExcessive && (
                        <AlertTriangle className="h-3 w-3 text-cs-warning ml-1" />
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <span
                        className={`px-1 py-0.5 rounded text-[8px] font-bold border ${
                          c.isSecure
                            ? "bg-cs-olive-light text-cs-olive border-cs-olive/30"
                            : "bg-cs-pink-light text-cs-danger border-cs-pink/40"
                        }`}
                      >
                        SEC
                      </span>
                      <span
                        className={`px-1 py-0.5 rounded text-[8px] font-bold border ${
                          c.isHttpOnly
                            ? "bg-cs-olive-light text-cs-olive border-cs-olive/30"
                            : "bg-cs-warning-bg text-cs-warning border-cs-warning/30"
                        }`}
                      >
                        HTTP
                      </span>
                      <span className="px-1 py-0.5 rounded text-[8px] font-bold bg-cs-cream-deep/40 text-cs-muted border border-cs-border">
                        {c.sameSite || "Lax"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
