"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ArrowRight,
  GitCompare,
  Clock,
  ChevronRight,
  AlertCircle,
  Plus,
  Globe,
  X,
  FileText,
  RotateCw,
} from "lucide-react";
import { api } from "@/lib/api";
import { Scan } from "@/lib/types";
import { formatDate, formatDuration } from "@/lib/formatters";
import {
  Card,
  MetricCard,
  Badge,
  Button,
  Input,
} from "@/components/ui";

export default function ScanHistoryPage() {
  const router = useRouter();
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [scoreFilter, setScoreFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // Multi-select for scan comparison
  const [selectedScanIds, setSelectedScanIds] = useState<string[]>([]);

  const fetchScans = useCallback(() => {
    setLoading(true);
    setError(null);
    api
      .listScans({ page: 1, limit: 50 })
      .then((res) => {
        if (res.success && res.data) {
          setScans(res.data);
        } else {
          setError(res.error?.message || "Failed to load audit history.");
        }
      })
      .catch((err) => {
        setError(err.message || "Failed to load audit history.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchScans();
  }, [fetchScans]);

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

  // Summary Metrics calculated from actual loaded scan data
  const summaryMetrics = useMemo(() => {
    const total = scans.length;
    const uniqueDomains = new Set(
      scans.map((s) => s.website?.domain).filter(Boolean)
    ).size;
    const completedScans = scans.filter(
      (s) => s.status === "completed" && typeof s.score === "number"
    );
    const avgScore =
      completedScans.length > 0
        ? Math.round(
            completedScans.reduce((sum, s) => sum + (s.score || 0), 0) /
              completedScans.length
          )
        : null;
    const latestScan = scans[0];

    return {
      total,
      uniqueDomains,
      avgScore,
      latestDomain: latestScan?.website?.domain || "None",
      latestDate: latestScan ? formatDate(latestScan.createdAt) : "—",
    };
  }, [scans]);

  // Client-side filtering & sorting
  const filteredScans = useMemo(() => {
    return scans
      .filter((s) => {
        // 1. Search term
        const term = searchTerm.toLowerCase().trim();
        if (term) {
          const domain = (s.website?.domain || "").toLowerCase();
          const url = (s.website?.url || "").toLowerCase();
          const id = (s.id || "").toLowerCase();
          if (!domain.includes(term) && !url.includes(term) && !id.includes(term)) {
            return false;
          }
        }

        // 2. Status filter
        if (statusFilter !== "all" && s.status !== statusFilter) {
          return false;
        }

        // 3. Score filter
        if (scoreFilter !== "all") {
          if (s.score === null || s.score === undefined) return false;
          if (scoreFilter === "80-100" && s.score < 80) return false;
          if (scoreFilter === "60-79" && (s.score < 60 || s.score >= 80)) return false;
          if (scoreFilter === "40-59" && (s.score < 40 || s.score >= 60)) return false;
          if (scoreFilter === "0-39" && s.score >= 40) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
      });
  }, [scans, searchTerm, statusFilter, scoreFilter, sortOrder]);

  const getScoreBadge = (score: number | null) => {
    if (score === null || score === undefined) {
      return <span className="text-xs text-cs-muted font-mono">—</span>;
    }
    if (score >= 80) {
      return (
        <Badge variant="success" size="sm">
          ↑ {score}/100
        </Badge>
      );
    }
    if (score >= 60) {
      return (
        <Badge variant="primary" size="sm">
          {score}/100
        </Badge>
      );
    }
    if (score >= 40) {
      return (
        <Badge variant="warning" size="sm">
          {score}/100
        </Badge>
      );
    }
    return (
      <Badge variant="danger" size="sm">
        {score}/100
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="success" size="sm" dot>Completed</Badge>;
      case "scanning":
        return <Badge variant="primary" size="sm" dot>Scanning</Badge>;
      case "analyzing":
        return <Badge variant="purple" size="sm" dot>Analyzing</Badge>;
      case "failed":
        return <Badge variant="danger" size="sm" dot>Failed</Badge>;
      default:
        return <Badge variant="neutral" size="sm" dot>Pending</Badge>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      
      {/* ====================================================================
          1. PAGE HEADER (Title, Supporting text & CTA)
         ==================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cs-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-cs-text font-sans">
            Scan History
          </h1>
          <p className="text-xs sm:text-sm text-cs-muted mt-1 leading-relaxed">
            Review and revisit previous website privacy audits.
          </p>
        </div>

        <Link href="/">
          <Button variant="primary" size="md" className="gap-2 shadow-xs shrink-0 font-semibold">
            <Plus className="h-4 w-4" />
            <span>Scan Website</span>
          </Button>
        </Link>
      </div>

      {/* ====================================================================
          2. SUMMARY METRICS ROW (4 Cards Calculated from Real Data)
         ==================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Scans */}
        <MetricCard
          label="Total Scans"
          value={loading ? "—" : summaryMetrics.total}
          icon={<FileText className="h-4 w-4" />}
          delta="Across all audits"
        />

        {/* Metric 2: Unique Websites */}
        <MetricCard
          label="Unique Websites"
          value={loading ? "—" : summaryMetrics.uniqueDomains}
          icon={<Globe className="h-4 w-4" />}
          delta="Distinct domains audited"
        />

        {/* Metric 3: Average Score */}
        <MetricCard
          label="Average Privacy Score"
          value={loading || summaryMetrics.avgScore === null ? "—" : `${summaryMetrics.avgScore}/100`}
          icon={<Clock className="h-4 w-4" />}
          delta={summaryMetrics.avgScore !== null ? "Across completed scans" : "No completed scans"}
          deltaType={summaryMetrics.avgScore && summaryMetrics.avgScore >= 70 ? "positive" : "neutral"}
        />

        {/* Metric 4: Latest Scan */}
        <MetricCard
          label="Latest Audit"
          value={loading ? "—" : summaryMetrics.latestDomain}
          icon={<Clock className="h-4 w-4" />}
          delta={summaryMetrics.latestDate}
        />
      </div>

      {/* ====================================================================
          3. FLOATING / STICKY COMPARE ACTION BAR (When scans selected)
         ==================================================================== */}
      {selectedScanIds.length > 0 && (
        <div className="sticky top-20 z-40 p-4 rounded-2xl bg-cs-surface border border-cs-primary/40 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 text-xs text-cs-text">
            <div className="h-7 w-7 rounded-xl bg-cs-primary-soft text-cs-primary flex items-center justify-center shrink-0">
              <GitCompare className="h-4 w-4" />
            </div>
            <span>
              <strong className="text-cs-primary font-bold">{selectedScanIds.length}</strong> of 2 audits selected for comparison
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => setSelectedScanIds([])}
              className="text-xs text-cs-muted hover:text-cs-text px-3 py-1.5 transition-colors font-medium"
            >
              Clear Selection
            </button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCompare}
              disabled={selectedScanIds.length !== 2}
              className="shadow-xs font-semibold gap-1.5"
            >
              <span>Compare Audits</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* ====================================================================
          4. SEARCH & FILTER TOOLBAR
         ==================================================================== */}
      <Card padding="md" className="space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box with Clear Button */}
          <div className="flex-1 max-w-md relative">
            <Input
              type="text"
              placeholder="Search websites or scan IDs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
              className="h-9.5 text-xs"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-2.5 p-0.5 rounded-full text-cs-muted hover:text-cs-text hover:bg-slate-100 transition-colors"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by Status"
              className="h-9.5 px-3 rounded-xl bg-cs-surface border border-cs-border text-cs-text focus:border-cs-primary focus:outline-none shadow-xs font-medium"
            >
              <option value="all">Status: All</option>
              <option value="completed">Completed</option>
              <option value="scanning">Scanning</option>
              <option value="analyzing">Analyzing</option>
              <option value="failed">Failed</option>
            </select>

            {/* Score Filter */}
            <select
              value={scoreFilter}
              onChange={(e) => setScoreFilter(e.target.value)}
              aria-label="Filter by Score"
              className="h-9.5 px-3 rounded-xl bg-cs-surface border border-cs-border text-cs-text focus:border-cs-primary focus:outline-none shadow-xs font-medium"
            >
              <option value="all">Score: All</option>
              <option value="80-100">80–100 (High)</option>
              <option value="60-79">60–79 (Moderate)</option>
              <option value="40-59">40–59 (Elevated)</option>
              <option value="0-39">0–39 (Critical)</option>
            </select>

            {/* Sort Order */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "desc" | "asc")}
              aria-label="Sort Order"
              className="h-9.5 px-3 rounded-xl bg-cs-surface border border-cs-border text-cs-text focus:border-cs-primary focus:outline-none shadow-xs font-medium"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>
      </Card>

      {/* ====================================================================
          5. HISTORY TABLE / LIST
         ==================================================================== */}
      {loading ? (
        /* SKELETON LOADING STATE */
        <Card padding="none" className="divide-y divide-cs-border overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 flex items-center justify-between gap-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-slate-200" />
                <div className="space-y-1.5">
                  <div className="h-4 w-36 bg-slate-200 rounded" />
                  <div className="h-3 w-24 bg-slate-100 rounded" />
                </div>
              </div>
              <div className="h-6 w-16 bg-slate-200 rounded-full" />
              <div className="h-6 w-20 bg-slate-200 rounded-full hidden sm:block" />
            </div>
          ))}
        </Card>
      ) : error ? (
        /* ERROR STATE */
        <Card padding="lg" className="text-center py-12 space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-cs-danger-soft text-cs-danger flex items-center justify-center mx-auto border border-red-200/80">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-cs-text">Unable to load scan history</h3>
            <p className="text-xs text-cs-muted max-w-sm mx-auto">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchScans} className="gap-1.5">
            <RotateCw className="h-3.5 w-3.5" />
            <span>Retry</span>
          </Button>
        </Card>
      ) : filteredScans.length === 0 ? (
        /* EMPTY STATE */
        <Card padding="lg" className="text-center py-14 space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-slate-100 text-cs-muted flex items-center justify-center mx-auto">
            <FileText className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-cs-text">
              {searchTerm || statusFilter !== "all" || scoreFilter !== "all"
                ? "No matching scans found"
                : "No privacy scans yet"}
            </h3>
            <p className="text-xs text-cs-muted max-w-sm mx-auto leading-relaxed">
              {searchTerm || statusFilter !== "all" || scoreFilter !== "all"
                ? "Try adjusting your search criteria or clearing active filters."
                : "Run your first website audit to start building your scan history."}
            </p>
          </div>

          <div>
            {searchTerm || statusFilter !== "all" || scoreFilter !== "all" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setScoreFilter("all");
                }}
              >
                Reset Filters
              </Button>
            ) : (
              <Link href="/">
                <Button variant="primary" size="md" className="gap-1.5 shadow-xs font-semibold">
                  <span>Scan a Website</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            )}
          </div>
        </Card>
      ) : (
        /* TABLE (DESKTOP) & STACKED CARDS (MOBILE) */
        <Card padding="none" className="overflow-hidden shadow-xs">
          {/* Desktop Table View (>= 768px) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs" aria-label="Scan History Table">
              <thead className="bg-slate-50/70 border-b border-cs-border text-cs-muted uppercase text-[10px] font-semibold tracking-wider">
                <tr>
                  <th scope="col" className="py-3.5 px-4 w-12 text-center">Compare</th>
                  <th scope="col" className="py-3.5 px-5">Website</th>
                  <th scope="col" className="py-3.5 px-4">Privacy Score</th>
                  <th scope="col" className="py-3.5 px-4">Status</th>
                  <th scope="col" className="py-3.5 px-4">Scanned</th>
                  <th scope="col" className="py-3.5 px-4">Duration</th>
                  <th scope="col" className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cs-border">
                {filteredScans.map((s) => {
                  const domain = s.website?.domain || "Target Website";
                  const isSelected = selectedScanIds.includes(s.id);

                  return (
                    <tr
                      key={s.id}
                      className={`hover:bg-slate-50/80 transition-colors group ${
                        isSelected ? "bg-cs-primary-soft/30" : ""
                      }`}
                    >
                      {/* Compare Checkbox */}
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectScan(s.id)}
                          aria-label={`Select ${domain} for comparison`}
                          className="h-4 w-4 rounded border-cs-border text-cs-primary focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* Website Domain & URL */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="h-7 w-7 rounded-lg bg-cs-primary-soft text-cs-primary flex items-center justify-center shrink-0">
                            <Globe className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/scan/${s.id}`}
                              className="font-semibold text-sm text-cs-text group-hover:text-cs-primary transition-colors block truncate max-w-xs"
                            >
                              {domain}
                            </Link>
                            <span className="text-[11px] text-cs-muted font-mono block truncate max-w-xs">
                              {s.website?.url}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Score */}
                      <td className="py-3.5 px-4">
                        {getScoreBadge(s.score)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(s.status)}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-cs-muted font-mono text-[11px]">
                        {formatDate(s.createdAt)}
                      </td>

                      {/* Duration */}
                      <td className="py-3.5 px-4 text-cs-muted font-mono text-[11px]">
                        {formatDuration(s.durationMs)}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-5 text-right">
                        <Link
                          href={`/scan/${s.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-cs-primary hover:text-cs-primary-hover transition-colors"
                        >
                          <span>View report</span>
                          <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Card View (< 768px) */}
          <div className="md:hidden divide-y divide-cs-border">
            {filteredScans.map((s) => {
              const domain = s.website?.domain || "Target Website";
              const isSelected = selectedScanIds.includes(s.id);

              return (
                <div
                  key={s.id}
                  className={`p-4 space-y-3 transition-colors ${
                    isSelected ? "bg-cs-primary-soft/30" : ""
                  }`}
                >
                  {/* Top: Domain & Compare Checkbox */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-7 w-7 rounded-lg bg-cs-primary-soft text-cs-primary flex items-center justify-center shrink-0">
                        <Globe className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/scan/${s.id}`}
                          className="font-semibold text-sm text-cs-text block truncate"
                        >
                          {domain}
                        </Link>
                        <span className="text-[11px] text-cs-muted font-mono block truncate">
                          {s.website?.url}
                        </span>
                      </div>
                    </div>

                    <label className="flex items-center gap-1.5 text-xs text-cs-muted cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectScan(s.id)}
                        className="h-4 w-4 rounded border-cs-border text-cs-primary focus:ring-0"
                      />
                      <span>Compare</span>
                    </label>
                  </div>

                  {/* Middle: Badges & Timestamp */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center gap-2">
                      {getScoreBadge(s.score)}
                      {getStatusBadge(s.status)}
                    </div>

                    <span className="text-[11px] font-mono text-cs-muted">
                      {formatDate(s.createdAt)}
                    </span>
                  </div>

                  {/* Bottom: Action Link */}
                  <div className="pt-2 border-t border-cs-border flex items-center justify-between text-xs">
                    <span className="text-[11px] font-mono text-cs-muted">
                      Duration: {formatDuration(s.durationMs)}
                    </span>
                    <Link
                      href={`/scan/${s.id}`}
                      className="font-semibold text-cs-primary hover:text-cs-primary-hover inline-flex items-center gap-1"
                    >
                      <span>View report</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

    </div>
  );
}
