"use client";

import React, { useState } from "react";
import { Cookie, Search, ShieldCheck, AlertTriangle } from "lucide-react";
import { CookieRecord } from "@/lib/types";
import { Card, Badge, Input } from "@/components/ui";

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
    <Card padding="lg" className="space-y-6">
      {/* Header & Controls Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cs-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl sm:text-2xl font-bold font-sans text-cs-text">
              Cookie Ledger
            </h3>
            <Badge variant="primary" size="sm">
              {filtered.length} of {cookies.length} Deposited
            </Badge>
          </div>
          <p className="text-xs text-cs-muted">
            Complete inventory of cookies deposited in browser storage during the controlled audit crawl.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="w-48 sm:w-56">
            <Input
              type="text"
              placeholder="Search cookie or domain..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="h-3.5 w-3.5" />}
              className="h-9 text-xs"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9 px-3 rounded-xl text-xs font-medium bg-cs-surface border border-cs-border focus:border-cs-primary focus:outline-none text-cs-text shadow-xs"
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
            className={`h-9 px-3 rounded-xl text-xs font-medium transition-colors border select-none ${
              thirdPartyOnly
                ? "bg-cs-primary text-white border-cs-primary font-semibold shadow-xs"
                : "bg-cs-surface border-cs-border text-cs-muted hover:text-cs-text hover:bg-slate-50"
            }`}
          >
            Third-Party Only
          </button>
        </div>
      </div>

      {/* Empty State */}
      {cookies.length === 0 ? (
        <div className="p-8 text-center rounded-xl bg-slate-50 border border-cs-border">
          <Cookie className="h-8 w-8 text-cs-muted mx-auto mb-2 opacity-50" />
          <p className="text-sm font-semibold text-cs-text">No cookies observed</p>
          <p className="text-xs text-cs-muted mt-1">
            Zero cookies were deposited in browser storage during the page crawl.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center rounded-xl bg-slate-50 border border-cs-border text-xs text-cs-muted">
          No cookies match your search and filter criteria.
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs" aria-label="Cookie Ledger Table">
              <thead className="bg-slate-50/70 border-b border-cs-border text-cs-muted uppercase text-[10px] font-semibold tracking-wider">
                <tr>
                  <th scope="col" className="py-3 px-4">Name</th>
                  <th scope="col" className="py-3 px-4">Domain</th>
                  <th scope="col" className="py-3 px-3">Category</th>
                  <th scope="col" className="py-3 px-3">Party</th>
                  <th scope="col" className="py-3 px-3">Security</th>
                  <th scope="col" className="py-3 px-3">SameSite</th>
                  <th scope="col" className="py-3 px-4 text-right">Expiration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cs-border">
                {filtered.map((c) => {
                  const isLongLived =
                    !c.isSession && c.expires > 0 && c.expires - currentTimestamp > oneYearSeconds;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name */}
                      <td className="py-3 px-4 font-mono font-medium text-cs-text max-w-[180px] truncate" title={c.name}>
                        {c.name}
                      </td>

                      {/* Domain */}
                      <td className="py-3 px-4 text-cs-muted font-mono max-w-[160px] truncate" title={c.domain}>
                        {c.domain}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3">
                        <Badge
                          variant={
                            c.category === "Essential"
                              ? "success"
                              : c.category === "Advertising"
                              ? "danger"
                              : c.category === "Analytics"
                              ? "primary"
                              : "neutral"
                          }
                          size="sm"
                        >
                          {c.category}
                        </Badge>
                      </td>

                      {/* Party */}
                      <td className="py-3 px-3">
                        <span
                          className={`font-semibold ${
                            c.isThirdParty ? "text-cs-danger" : "text-cs-muted"
                          }`}
                        >
                          {c.isThirdParty ? "3rd-Party" : "1st-Party"}
                        </span>
                      </td>

                      {/* Security Flags */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <span
                            className={c.isSecure ? "text-cs-success font-bold" : "text-slate-300"}
                            title={c.isSecure ? "Secure flag enabled" : "No Secure flag"}
                          >
                            SEC
                          </span>
                          <span className="text-cs-border">/</span>
                          <span
                            className={c.isHttpOnly ? "text-cs-success font-bold" : "text-slate-300"}
                            title={c.isHttpOnly ? "HttpOnly flag enabled" : "No HttpOnly flag"}
                          >
                            HTTP
                          </span>
                        </div>
                      </td>

                      {/* SameSite */}
                      <td className="py-3 px-3 font-mono text-cs-muted text-[11px]">
                        {c.sameSite || "None"}
                      </td>

                      {/* Expiration */}
                      <td className="py-3 px-4 text-right">
                        {c.isSession ? (
                          <span className="text-cs-muted font-mono text-[11px]">Session</span>
                        ) : isLongLived ? (
                          <span className="text-amber-600 font-semibold font-mono text-[11px] inline-flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            <span>&gt;1 Year</span>
                          </span>
                        ) : (
                          <span className="text-cs-muted font-mono text-[11px]">
                            {new Date(c.expires * 1000).toLocaleDateString()}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Card View */}
          <div className="md:hidden space-y-3">
            {filtered.map((c) => (
              <div
                key={c.id}
                className="p-3.5 rounded-xl border border-cs-border bg-cs-surface space-y-2 shadow-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="font-mono text-xs font-bold text-cs-text block truncate">
                      {c.name}
                    </span>
                    <span className="font-mono text-[11px] text-cs-muted block truncate">
                      {c.domain}
                    </span>
                  </div>

                  <Badge
                    variant={
                      c.category === "Essential"
                        ? "success"
                        : c.category === "Advertising"
                        ? "danger"
                        : c.category === "Analytics"
                        ? "primary"
                        : "neutral"
                    }
                    size="sm"
                  >
                    {c.category}
                  </Badge>
                </div>

                <div className="pt-2 border-t border-cs-border flex items-center justify-between text-xs text-cs-muted">
                  <span>{c.isThirdParty ? "3rd-Party" : "1st-Party"}</span>
                  <div className="flex items-center gap-2 font-mono text-[10px]">
                    <span className={c.isSecure ? "text-cs-success font-bold" : "text-slate-300"}>
                      SEC
                    </span>
                    <span className={c.isHttpOnly ? "text-cs-success font-bold" : "text-slate-300"}>
                      HTTP
                    </span>
                  </div>
                  <span className="font-mono text-[11px]">
                    {c.isSession ? "Session" : new Date(c.expires * 1000).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
