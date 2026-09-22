"use client";

import { useState } from "react";
import { Cookie, Search, ShieldCheck, ShieldAlert, Clock, AlertTriangle } from "lucide-react";
import { CookieRecord } from "@/lib/types";

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
    <div className="rounded-2xl bg-cyber-card border border-cyber-border p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyber-border/80 pb-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Cookie className="h-4 w-4 text-cyan-400" />
            <span>Stored Cookie Ledger</span>
            <span className="px-2 py-0.5 rounded text-xs font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {filtered.length} of {cookies.length}
            </span>
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Complete inventory of cookies deposited in browser storage during audit.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search name or domain..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg text-xs font-mono bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:outline-none text-slate-200 w-48"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-mono bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:outline-none text-slate-300"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Third-Party Toggle */}
          <button
            type="button"
            onClick={() => setThirdPartyOnly(!thirdPartyOnly)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors border ${
              thirdPartyOnly
                ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            Third-Party Only
          </button>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="p-8 text-center rounded-xl bg-slate-900/30 border border-slate-800 text-xs text-slate-400">
          No cookies match your filter criteria.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="pb-3 font-semibold">Cookie Name</th>
                <th className="pb-3 font-semibold">Domain</th>
                <th className="pb-3 font-semibold">Category</th>
                <th className="pb-3 font-semibold">Lifespan / Expiry</th>
                <th className="pb-3 font-semibold text-center">Flags</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((c, i) => {
                const isExcessive =
                  !c.isSession &&
                  c.expires > currentTimestamp &&
                  c.expires - currentTimestamp > oneYearSeconds;

                return (
                  <tr key={`${c.name}-${i}`} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 pr-4 font-bold text-slate-200 max-w-[200px] truncate">
                      {c.name}
                    </td>
                    <td className="py-3 pr-4 text-slate-400 max-w-[160px] truncate">
                      <span className={c.isThirdParty ? "text-orange-400" : "text-slate-400"}>
                        {c.domain}
                      </span>
                      {c.isThirdParty && (
                        <span className="ml-1.5 px-1 py-0.2 rounded text-[9px] bg-orange-500/10 text-orange-400 border border-orange-500/20">
                          3rd-Party
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          c.category === "Advertising"
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                            : c.category === "Analytics"
                            ? "bg-sky-500/10 text-sky-400 border-sky-500/30"
                            : c.category === "Essential"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : c.category === "Functional"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : "bg-slate-800 text-slate-400 border-slate-700"
                        }`}
                      >
                        {c.category}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      {c.isSession ? (
                        <span className="text-slate-400 flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-500" />
                          Session
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-300">
                            {new Date(c.expires * 1000).toLocaleDateString()}
                          </span>
                          {isExcessive && (
                            <span
                              title="Lifespan exceeds 1 year recommended limit"
                              className="text-amber-400"
                            >
                              <AlertTriangle className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span
                          title={c.isSecure ? "Secure (HTTPS only)" : "Insecure (Can transmit over HTTP)"}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                            c.isSecure
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                          }`}
                        >
                          SEC
                        </span>
                        <span
                          title={c.isHttpOnly ? "HttpOnly (Protected from XSS script theft)" : "Missing HttpOnly (Accessible by scripts)"}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                            c.isHttpOnly
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          }`}
                        >
                          HTTP
                        </span>
                        <span
                          title={`SameSite: ${c.sameSite}`}
                          className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-400 border border-slate-700"
                        >
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
      )}
    </div>
  );
}
