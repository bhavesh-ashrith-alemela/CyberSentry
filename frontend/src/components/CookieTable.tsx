"use client";

import { useState } from "react";
import { Cookie, Search, Clock, AlertTriangle } from "lucide-react";
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
    <div className="rounded-2xl bg-white border border-sand-300 p-6 sm:p-8 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sand-200 pb-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-forest-950 flex items-center gap-2">
            <Cookie className="h-4 w-4 text-forest-700" />
            <span>Stored Cookie Ledger</span>
            <span className="px-2 py-0.5 rounded text-xs font-mono bg-sand-100 text-forest-800 border border-sand-300">
              {filtered.length} of {cookies.length}
            </span>
          </h3>
          <p className="text-xs text-forest-600 font-mono mt-1">
            Complete inventory of cookies deposited in browser storage during audit.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-forest-400" />
            <input
              type="text"
              placeholder="Search name or domain..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg text-xs font-mono bg-sand-50 border border-sand-300 focus:border-forest-700 focus:outline-none text-forest-950 w-48"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-mono bg-sand-50 border border-sand-300 focus:border-forest-700 focus:outline-none text-forest-800"
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
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors border ${
              thirdPartyOnly
                ? "bg-rust-50 text-rust-800 border-rust-200 font-semibold"
                : "bg-sand-50 border-sand-300 text-forest-700 hover:bg-sand-100"
            }`}
          >
            Third-Party Only
          </button>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="p-8 text-center rounded-xl bg-sand-50 border border-sand-200 text-xs text-forest-600 font-mono">
          No cookies match your filter criteria.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-sand-300 text-forest-500 uppercase tracking-wider text-[10px]">
                <th className="pb-3 font-semibold">Cookie Name</th>
                <th className="pb-3 font-semibold">Domain</th>
                <th className="pb-3 font-semibold">Category</th>
                <th className="pb-3 font-semibold">Lifespan / Expiry</th>
                <th className="pb-3 font-semibold text-center">Flags</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-200">
              {filtered.map((c, i) => {
                const isExcessive =
                  !c.isSession &&
                  c.expires > currentTimestamp &&
                  c.expires - currentTimestamp > oneYearSeconds;

                return (
                  <tr key={`${c.name}-${i}`} className="hover:bg-sand-50/80 transition-colors">
                    <td className="py-3 pr-4 font-bold text-forest-950 max-w-[200px] truncate">
                      {c.name}
                    </td>
                    <td className="py-3 pr-4 text-forest-700 max-w-[160px] truncate">
                      <span className={c.isThirdParty ? "text-rust-800 font-semibold" : "text-forest-700"}>
                        {c.domain}
                      </span>
                      {c.isThirdParty && (
                        <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] bg-rust-50 text-rust-800 border border-rust-200 font-semibold">
                          3rd-Party
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          c.category === "Advertising"
                            ? "bg-rust-50 text-rust-800 border-rust-200"
                            : c.category === "Analytics"
                            ? "bg-forest-50 text-forest-800 border-forest-200"
                            : c.category === "Essential"
                            ? "bg-sand-100 text-forest-800 border-sand-300"
                            : c.category === "Functional"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-sand-100 text-forest-600 border-sand-200"
                        }`}
                      >
                        {c.category}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      {c.isSession ? (
                        <span className="text-forest-600 flex items-center gap-1">
                          <Clock className="h-3 w-3 text-forest-400" />
                          Session
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="text-forest-800">
                            {new Date(c.expires * 1000).toLocaleDateString()}
                          </span>
                          {isExcessive && (
                            <span
                              title="Lifespan exceeds 1 year recommended limit"
                              className="text-amber-700"
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
                              ? "bg-forest-50 text-forest-800 border-forest-200"
                              : "bg-rust-50 text-rust-800 border-rust-200"
                          }`}
                        >
                          SEC
                        </span>
                        <span
                          title={c.isHttpOnly ? "HttpOnly (Protected from XSS script theft)" : "Missing HttpOnly (Accessible by scripts)"}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                            c.isHttpOnly
                              ? "bg-forest-50 text-forest-800 border-forest-200"
                              : "bg-amber-50 text-amber-800 border-amber-200"
                          }`}
                        >
                          HTTP
                        </span>
                        <span
                          title={`SameSite: ${c.sameSite}`}
                          className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-sand-100 text-forest-700 border border-sand-300"
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
