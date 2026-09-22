"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  History,
  Search,
  ArrowRight,
  GitCompare,
  Clock,
  Globe,
  CheckCircle2,
  AlertOctagon,
  Loader2,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { api } from "@/lib/api";
import { Scan } from "@/lib/types";
import { formatDate, formatDuration, formatScoreColor } from "@/lib/formatters";

export default function ScanHistoryPage() {
  const router = useRouter();
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedScanIds, setSelectedScanIds] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;
    api
      .listScans({ page: 1, limit: 50 })
      .then((res) => {
        if (isMounted && res.success) {
          setScans(res.data || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || "Failed to load audit history.");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleSelectScan = (id: string) => {
    setSelectedScanIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      if (prev.length >= 2) {
        // Replace second or push up to 2
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  const handleCompare = () => {
    if (selectedScanIds.length === 2) {
      router.push(`/compare?scanA=${selectedScanIds[0]}&scanB=${selectedScanIds[1]}`);
    }
  };

  const filtered = scans.filter((s) => {
    const domain = s.website?.domain || "";
    const url = s.website?.url || "";
    return (
      domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      url.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-sand-300 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-forest-950 flex items-center gap-3">
            <History className="h-6 w-6 text-forest-800" />
            <span>Privacy Audit History</span>
          </h1>
          <p className="text-xs text-sand-600 font-mono mt-1">
            Historical website scans, privacy grades, and comparative records stored in PostgreSQL.
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-sand-400" />
          <input
            type="text"
            placeholder="Search domain..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-xl text-xs font-mono bg-sand-50 border border-sand-300 focus:border-forest-700 focus:outline-none text-forest-950 w-64 placeholder:text-sand-400"
          />
        </div>
      </div>

      {/* Floating Compare Action Bar (when 2 selected) */}
      {selectedScanIds.length > 0 && (
        <div className="sticky top-20 z-40 p-4 rounded-xl bg-forest-900 text-sand-50 border border-forest-800 shadow-md flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-mono text-sand-200">
            <GitCompare className="h-4 w-4 text-sand-100" />
            <span>
              {selectedScanIds.length} of 2 scans selected for differential analysis
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedScanIds([])}
              className="text-xs font-mono text-sand-400 hover:text-sand-100 underline decoration-sand-600"
            >
              Clear
            </button>
            <button
              onClick={handleCompare}
              disabled={selectedScanIds.length !== 2}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-forest-950 bg-sand-100 hover:bg-white disabled:opacity-50 transition-all shadow-xs"
            >
              <span>Compare Audits</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-white border border-sand-300">
          <Loader2 className="h-8 w-8 text-forest-800 animate-spin mb-3" />
          <p className="text-xs font-mono text-sand-600">Loading audit history from database...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center rounded-2xl bg-white border border-rust-200 text-rust-800">
          <AlertOctagon className="h-8 w-8 text-rust-700 mx-auto mb-2" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-sand-300">
          <Globe className="h-10 w-10 text-sand-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-forest-950">No Audits Found</h3>
          <p className="text-xs text-sand-600 mt-1 max-w-sm mx-auto">
            {searchTerm
              ? `No scan records match "${searchTerm}".`
              : "No website audits have been executed yet. Submit a URL to begin."}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl text-xs font-semibold bg-forest-900 text-sand-50 hover:bg-forest-800 transition-colors shadow-sm"
          >
            <span>Scan First Website</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-sand-300 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-sand-200 text-sand-600 uppercase tracking-wider text-[10px] bg-sand-50 font-semibold">
                  <th className="p-4 w-12 text-center">Compare</th>
                  <th className="p-4">Target Domain</th>
                  <th className="p-4">Audit Date</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4 text-center">Score</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-200">
                {filtered.map((s) => {
                  const color = formatScoreColor(s.score);
                  const isSelected = selectedScanIds.includes(s.id);

                  return (
                    <tr
                      key={s.id}
                      className={`hover:bg-sand-50/70 transition-colors ${
                        isSelected ? "bg-forest-50/60" : ""
                      }`}
                    >
                      {/* Checkbox for Comparison */}
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectScan(s.id)}
                          aria-label={`Select ${s.website?.domain || "scan"} for comparison`}
                          className="h-4 w-4 rounded bg-white border-sand-300 text-forest-800 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-forest-800"
                        />
                      </td>

                      {/* Domain / URL */}
                      <td className="p-4">
                        <div className="font-bold text-forest-950 text-sm">
                          {s.website?.domain || "Unknown Domain"}
                        </div>
                        <div className="text-sand-500 text-[11px] truncate max-w-xs">
                          {s.website?.url}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="p-4 text-sand-600">
                        {formatDate(s.createdAt)}
                      </td>

                      {/* Duration */}
                      <td className="p-4 text-sand-600">
                        {formatDuration(s.durationMs)}
                      </td>

                      {/* Score & Grade */}
                      <td className="p-4 text-center">
                        {s.score !== null ? (
                          <div className="inline-flex items-center gap-1.5">
                            <span className={`font-bold text-sm ${color.text}`}>
                              {s.score}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${color.badge}`}
                            >
                              {s.grade}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sand-400">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold border ${
                            s.status === "completed"
                              ? "bg-forest-50 text-forest-800 border-forest-200"
                              : s.status === "failed"
                              ? "bg-rust-50 text-rust-800 border-rust-200"
                              : "bg-sand-100 text-sand-800 border-sand-200"
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <Link
                          href={`/scan/${s.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-sand-100 border border-sand-300 text-forest-900 hover:bg-sand-200 transition-colors text-xs font-mono font-medium"
                        >
                          <span>View Report</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
