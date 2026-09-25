"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ArrowRight,
  GitCompare,
  Clock,
  Folder,
  ChevronRight,
  Check,
  AlertCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { api } from "@/lib/api";
import { Scan } from "@/lib/types";
import { formatDate, formatDuration } from "@/lib/formatters";
import {
  PaperCard,
  FolderTab,
  FolderCard,
  EditorialBadge,
  FileLabel,
  SectionHeader,
  StampBadge,
} from "@/components/ui";

const FOLDER_COLORS = ["denim", "olive", "pink", "paper"] as const;

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
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-cs-border/80 pb-5">
        <div>
          <div className="mb-2">
            <FileLabel brackets variant="denim">
              TELEMETRY ARCHIVE
            </FileLabel>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display text-cs-ink tracking-tight">
            Your Privacy{" "}
            <span className="editorial-italic text-cs-denim font-normal ml-1">
              Audits.
            </span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-cs-muted font-sans max-w-xl">
            A verified record of public websites analyzed with the CyberSentry transparency engine.
          </p>
        </div>

        {/* Search Input Box */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-cs-muted" />
          <input
            type="text"
            placeholder="Search privacy files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs font-mono bg-cs-paper border border-cs-border focus:border-cs-denim focus:outline-none text-cs-ink shadow-xs"
          />
        </div>
      </div>

      {/* Floating Compare Action Bar (when 1 or 2 selected) */}
      {selectedScanIds.length > 0 && (
        <div className="sticky top-20 z-40 p-4 rounded-2xl bg-cs-paper border border-cs-denim/40 shadow-folder flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs font-mono text-cs-ink">
            <div className="h-6 w-6 rounded-lg bg-cs-denim-light text-cs-denim flex items-center justify-center">
              <GitCompare className="h-3.5 w-3.5" />
            </div>
            <span>
              <strong className="text-cs-denim font-bold">{selectedScanIds.length}</strong> OF 2 FILES SELECTED FOR COMPARISON
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={() => setSelectedScanIds([])}
              className="text-xs font-mono text-cs-muted hover:text-cs-ink px-3 py-1.5"
            >
              Clear Selection
            </button>
            <button
              onClick={handleCompare}
              disabled={selectedScanIds.length !== 2}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold text-white bg-cs-denim hover:bg-cs-denim-dark disabled:opacity-40 transition-all shadow-xs"
            >
              <span>Compare Dossiers →</span>
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center p-8 rounded-2xl border border-cs-border bg-cs-paper text-center">
          <Loader2 className="h-8 w-8 text-cs-denim animate-spin mb-3" />
          <p className="text-xs font-mono text-cs-muted">Loading telemetry archives from database...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center rounded-2xl border border-cs-pink bg-cs-pink-light/40 text-cs-danger">
          <AlertCircle className="h-8 w-8 text-cs-danger mx-auto mb-2" />
          <p className="text-sm font-bold font-sans">{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        /* Empty State */
        <div className="p-12 sm:p-16 text-center rounded-2xl border border-cs-border bg-cs-paper shadow-paper space-y-4">
          <Folder className="h-12 w-12 text-cs-muted/80 mx-auto stroke-[1.5]" />
          <div>
            <h3 className="text-lg font-bold text-cs-ink font-sans">
              No Privacy Files Found
            </h3>
            <p className="text-xs sm:text-sm text-cs-muted max-w-sm mx-auto mt-1 font-sans">
              {searchTerm
                ? `No archive records match "${searchTerm}".`
                : "Submit a website URL from the scanner to create your first privacy dossier."}
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono font-semibold bg-cs-denim text-white hover:bg-cs-denim-dark transition-colors shadow-xs"
          >
            <span>Scan First Website</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-10">
          
          {/* Top Section: Recent Privacy Dossiers (Folder Cards) */}
          {!searchTerm && filtered.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-cs-border/60 pb-2">
                <FileLabel code="RECENT_FILES" variant="muted" />
                <span className="font-mono text-xs text-cs-muted">
                  Showing latest {Math.min(4, filtered.length)} records
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {filtered.slice(0, 4).map((s, idx) => {
                  const color = FOLDER_COLORS[idx % FOLDER_COLORS.length];
                  const isSelected = selectedScanIds.includes(s.id);
                  const domain = s.website?.domain || "Target Website";

                  return (
                    <div key={`recent-${s.id}`} className="relative group">
                      <FolderCard
                        tabLabel={domain}
                        tabColor={color}
                        bodyColor={color}
                        interactive
                        tabRight={
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleSelectScan(s.id);
                            }}
                            className={`p-1 rounded-md text-[10px] font-mono border transition-colors ${
                              isSelected
                                ? "bg-cs-denim text-white border-cs-denim"
                                : "bg-cs-paper/80 border-cs-border text-cs-muted hover:text-cs-ink"
                            }`}
                            title="Select for comparison"
                          >
                            {isSelected ? "✓ Selected" : "+ Compare"}
                          </button>
                        }
                      >
                        <Link href={`/scan/${s.id}`} className="block focus:outline-none">
                          <div className="flex items-center gap-1.5 text-[11px] font-mono opacity-80 mb-2">
                            <Clock className="h-3 w-3 shrink-0" />
                            <span>{formatDate(s.createdAt)}</span>
                          </div>

                          <p className="text-xs truncate font-mono opacity-70 mb-4">
                            {s.website?.url}
                          </p>

                          <div className="pt-3 border-t border-current/15 flex items-center justify-between">
                            <div className="flex items-baseline gap-1.5 font-mono">
                              <span className="text-base font-black">
                                {s.score !== null ? `${s.score}` : "—"}
                              </span>
                              <span className="text-[10px] opacity-75">/ 100</span>
                              {s.grade && (
                                <span className="ml-1 px-1.5 py-0.2 rounded text-[10px] font-bold uppercase bg-black/10 dark:bg-white/10">
                                  {s.grade}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1 text-xs font-mono font-semibold group-hover:translate-x-1 transition-transform">
                              <span>Open Dossier</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </div>
                          </div>
                        </Link>
                      </FolderCard>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Complete Ledger Archive Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-cs-border/60 pb-2">
              <FileLabel code="ARCHIVE_LEDGER" variant="muted" />
              <span className="font-mono text-xs text-cs-muted">
                {filtered.length} total entries stored
              </span>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block rounded-2xl border border-cs-border bg-cs-paper shadow-paper overflow-hidden">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-cs-border text-cs-muted uppercase tracking-wider text-[10px] bg-cs-cream/40">
                    <th className="p-4 w-12 text-center">Compare</th>
                    <th className="p-4">Target Domain</th>
                    <th className="p-4">Audit Date</th>
                    <th className="p-4">Duration</th>
                    <th className="p-4 text-center">Score</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cs-border/60">
                  {filtered.map((s) => {
                    const isSelected = selectedScanIds.includes(s.id);

                    return (
                      <tr
                        key={s.id}
                        className={`hover:bg-cs-cream-deep/20 transition-colors ${
                          isSelected ? "bg-cs-denim-light/40" : ""
                        }`}
                      >
                        {/* Checkbox for Comparison */}
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectScan(s.id)}
                            aria-label={`Select ${s.website?.domain || "scan"} for comparison`}
                            className="h-4 w-4 rounded border-cs-border text-cs-denim focus:ring-0 cursor-pointer"
                          />
                        </td>

                        {/* Domain / URL */}
                        <td className="p-4">
                          <div className="font-bold text-cs-ink text-sm font-sans">
                            {s.website?.domain || "Unknown Domain"}
                          </div>
                          <div className="text-cs-muted text-[11px] truncate max-w-xs">
                            {s.website?.url}
                          </div>
                        </td>

                        {/* Date */}
                        <td className="p-4 text-cs-muted">
                          {formatDate(s.createdAt)}
                        </td>

                        {/* Duration */}
                        <td className="p-4 text-cs-muted">
                          {formatDuration(s.durationMs)}
                        </td>

                        {/* Score & Grade */}
                        <td className="p-4 text-center">
                          {s.score !== null ? (
                            <div className="inline-flex items-center gap-1.5 font-mono">
                              <span className="font-bold text-sm text-cs-ink">
                                {s.score}
                              </span>
                              <EditorialBadge
                                variant={s.score >= 80 ? "safe" : s.score >= 60 ? "olive" : "warning"}
                                size="xs"
                              >
                                {s.grade || "B"}
                              </EditorialBadge>
                            </div>
                          ) : (
                            <span className="text-cs-muted">—</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="p-4 text-center">
                          <EditorialBadge
                            variant={s.status === "completed" ? "safe" : s.status === "failed" ? "danger" : "denim"}
                            size="xs"
                            className="uppercase"
                          >
                            {s.status}
                          </EditorialBadge>
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right">
                          <Link
                            href={`/scan/${s.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cs-paper border border-cs-border hover:border-cs-denim hover:text-cs-denim text-cs-ink transition-colors text-xs font-mono shadow-xs"
                          >
                            <span>Open Dossier</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Cards (< 768px) */}
            <div className="block md:hidden space-y-3">
              {filtered.map((s) => {
                const isSelected = selectedScanIds.includes(s.id);

                return (
                  <div
                    key={`mob-${s.id}`}
                    className={`p-4 rounded-xl border border-cs-border bg-cs-paper shadow-xs text-xs font-mono space-y-3 ${
                      isSelected ? "border-cs-denim bg-cs-denim-light/20" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-sm text-cs-ink font-sans">
                          {s.website?.domain || "Target"}
                        </h4>
                        <p className="text-[11px] text-cs-muted truncate max-w-[200px]">
                          {s.website?.url}
                        </p>
                      </div>

                      <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectScan(s.id)}
                          className="h-4 w-4 rounded border-cs-border text-cs-denim focus:ring-0"
                        />
                        <span className="text-cs-muted">Compare</span>
                      </label>
                    </div>

                    <div className="pt-2 border-t border-cs-border/60 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-cs-ink text-sm">
                          {s.score !== null ? `${s.score}/100` : "—"}
                        </span>
                        {s.grade && (
                          <span className="ml-1 text-[10px] text-cs-muted">
                            ({s.grade})
                          </span>
                        )}
                      </div>

                      <EditorialBadge
                        variant={s.status === "completed" ? "safe" : s.status === "failed" ? "danger" : "denim"}
                        size="xs"
                      >
                        {s.status}
                      </EditorialBadge>

                      <Link
                        href={`/scan/${s.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cs-paper border border-cs-border text-cs-denim font-semibold"
                      >
                        <span>Open →</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
