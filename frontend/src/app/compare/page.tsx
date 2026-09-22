"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  GitCompare,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Shield,
  Cookie,
  Radio,
  AlertTriangle,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Check,
  Info,
} from "lucide-react";
import { api } from "@/lib/api";
import { Scan, Report, Finding, ScanComparison } from "@/lib/types";
import { formatDate, formatScoreColor } from "@/lib/formatters";

function CompareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialScanA = searchParams.get("scanA") || "";
  const initialScanB = searchParams.get("scanB") || "";

  const [availableScans, setAvailableScans] = useState<Scan[]>([]);
  const [scanAId, setScanAId] = useState(initialScanA);
  const [scanBId, setScanBId] = useState(initialScanB);

  const [scanA, setScanA] = useState<Scan | null>(null);
  const [scanB, setScanB] = useState<Scan | null>(null);
  const [reportA, setReportA] = useState<Report | null>(null);
  const [reportB, setReportB] = useState<Report | null>(null);
  const [findingsA, setFindingsA] = useState<Finding[]>([]);
  const [findingsB, setFindingsB] = useState<Finding[]>([]);
  const [comparison, setComparison] = useState<ScanComparison | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load scan list for dropdowns
  useEffect(() => {
    api
      .listScans({ limit: 50 })
      .then((res) => {
        if (res.success && res.data) {
          const completed = res.data.filter((s) => s.status === "completed");
          setAvailableScans(completed);
        }
      })
      .catch(() => {});
  }, []);

  // Execute comparison when both IDs exist
  useEffect(() => {
    if (!scanAId || !scanBId) return;

    setLoading(true);
    setError(null);

    Promise.all([
      api.compareScans(scanAId, scanBId),
      api.getScan(scanAId),
      api.getScan(scanBId),
      api.getReport(scanAId).catch(() => null),
      api.getReport(scanBId).catch(() => null),
      api.getFindings(scanAId).catch(() => ({ success: true, data: { findings: [] } })),
      api.getFindings(scanBId).catch(() => ({ success: true, data: { findings: [] } })),
    ])
      .then(
        ([
          compRes,
          scanARes,
          scanBRes,
          repARes,
          repBRes,
          findARes,
          findBRes,
        ]) => {
          if (compRes.success) setComparison(compRes.data);
          if (scanARes.success) setScanA(scanARes.data);
          if (scanBRes.success) setScanB(scanBRes.data);
          if (repARes?.success) setReportA(repARes.data);
          if (repBRes?.success) setReportB(repBRes.data);
          if (findARes?.success) setFindingsA(findARes.data.findings || []);
          if (findBRes?.success) setFindingsB(findBRes.data.findings || []);
          setLoading(false);
        }
      )
      .catch((err: any) => {
        setError(err.message || "Failed to compare selected scans.");
        setLoading(false);
      });
  }, [scanAId, scanBId]);

  const scoreDiff =
    scanA?.score !== null && scanB?.score !== null && scanA?.score !== undefined && scanB?.score !== undefined
      ? scanB.score - scanA.score
      : 0;

  const cookiesDiff = (reportB?.metrics?.totalCookies || 0) - (reportA?.metrics?.totalCookies || 0);
  const trackersDiff = (reportB?.metrics?.totalTrackers || 0) - (reportA?.metrics?.totalTrackers || 0);

  const ruleIdsA = new Set(findingsA.map((f) => f.ruleId));
  const ruleIdsB = new Set(findingsB.map((f) => f.ruleId));

  const newFindingsInB = findingsB.filter((f) => !ruleIdsA.has(f.ruleId));
  const resolvedFindingsInB = findingsA.filter((f) => !ruleIdsB.has(f.ruleId));

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-sand-300 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/history"
              className="text-xs font-mono text-sand-600 hover:text-forest-900 transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>History</span>
            </Link>
            <span className="text-sand-400">/</span>
            <span className="text-xs font-mono text-forest-800 font-semibold">Comparison</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-forest-950 flex items-center gap-3">
            <GitCompare className="h-6 w-6 text-forest-800" />
            <span>Side-by-Side Scan Comparison</span>
          </h1>
          <p className="text-xs text-sand-600 font-mono mt-1">
            Compare privacy transparency metrics, tracker exposures, and score differentials.
          </p>
        </div>

        {/* Scan Selectors */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Selector A */}
          <div className="w-full sm:w-56">
            <label className="text-[10px] font-mono text-sand-600 uppercase block mb-1 font-semibold">
              Baseline Scan (A)
            </label>
            <select
              value={scanAId}
              onChange={(e) => {
                setScanAId(e.target.value);
                router.push(`/compare?scanA=${e.target.value}&scanB=${scanBId}`);
              }}
              className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-sand-50 border border-sand-300 focus:border-forest-700 focus:outline-none text-forest-950"
            >
              <option value="">Select Baseline...</option>
              {availableScans.map((s) => (
                <option key={`a-${s.id}`} value={s.id}>
                  {s.website?.domain} ({formatDate(s.createdAt)})
                </option>
              ))}
            </select>
          </div>

          <div className="text-sand-400 font-mono hidden sm:block pt-4 font-semibold">vs</div>

          {/* Selector B */}
          <div className="w-full sm:w-56">
            <label className="text-[10px] font-mono text-sand-600 uppercase block mb-1 font-semibold">
              Comparison Scan (B)
            </label>
            <select
              value={scanBId}
              onChange={(e) => {
                setScanBId(e.target.value);
                router.push(`/compare?scanA=${scanAId}&scanB=${e.target.value}`);
              }}
              className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-sand-50 border border-sand-300 focus:border-forest-700 focus:outline-none text-forest-950"
            >
              <option value="">Select Target...</option>
              {availableScans.map((s) => (
                <option key={`b-${s.id}`} value={s.id}>
                  {s.website?.domain} ({formatDate(s.createdAt)})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center p-8 rounded-2xl bg-white border border-sand-300 text-center">
          <Loader2 className="h-8 w-8 text-forest-800 animate-spin mb-3" />
          <p className="text-xs font-mono text-sand-600">Computing differential audit telemetry...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center rounded-2xl bg-white border border-rust-200 text-rust-800">
          <AlertTriangle className="h-8 w-8 text-rust-700 mx-auto mb-2" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      ) : !scanA || !scanB ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-sand-300">
          <GitCompare className="h-10 w-10 text-sand-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-forest-950">Select Two Audits to Compare</h3>
          <p className="text-xs text-sand-600 mt-1 max-w-md mx-auto">
            Choose a baseline audit and a comparison audit from the dropdowns above or select two entries in the Scan History table.
          </p>
        </div>
      ) : (
        <>
          {/* Differential Metrics Summary Card */}
          <div className="p-6 rounded-2xl bg-white border border-sand-300 shadow-sm">
            <h3 className="text-xs font-mono uppercase tracking-wider text-sand-600 mb-4 font-semibold">
              Differential Audit Summary (Scan B vs Scan A)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Score Delta */}
              <div className="p-4 rounded-xl bg-sand-50 border border-sand-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono text-sand-600 uppercase block font-semibold">
                    Score Difference
                  </span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span
                      className={`text-2xl font-black ${
                        scoreDiff > 0
                          ? "text-forest-800"
                          : scoreDiff < 0
                          ? "text-rust-800"
                          : "text-forest-950"
                      }`}
                    >
                      {scoreDiff > 0 ? `+${scoreDiff}` : scoreDiff} pts
                    </span>
                    <span className="text-xs font-mono text-sand-600">
                      ({scanA.grade} → {scanB.grade})
                    </span>
                  </div>
                </div>

                <div
                  className={`p-2.5 rounded-xl border ${
                    scoreDiff > 0
                      ? "bg-forest-50 text-forest-800 border-forest-200"
                      : scoreDiff < 0
                      ? "bg-rust-50 text-rust-800 border-rust-200"
                      : "bg-sand-100 text-sand-700 border-sand-200"
                  }`}
                >
                  {scoreDiff > 0 ? (
                    <TrendingUp className="h-5 w-5" />
                  ) : scoreDiff < 0 ? (
                    <TrendingDown className="h-5 w-5" />
                  ) : (
                    <Minus className="h-5 w-5" />
                  )}
                </div>
              </div>

              {/* Cookies Delta */}
              <div className="p-4 rounded-xl bg-sand-50 border border-sand-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono text-sand-600 uppercase block font-semibold">
                    Cookies Change
                  </span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span
                      className={`text-2xl font-black ${
                        cookiesDiff < 0
                          ? "text-forest-800"
                          : cookiesDiff > 0
                          ? "text-amber-800"
                          : "text-forest-950"
                      }`}
                    >
                      {cookiesDiff > 0 ? `+${cookiesDiff}` : cookiesDiff}
                    </span>
                    <span className="text-xs font-mono text-sand-600">
                      ({reportA?.metrics?.totalCookies || 0} vs {reportB?.metrics?.totalCookies || 0})
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-sand-100 text-forest-800 border border-sand-200">
                  <Cookie className="h-5 w-5" />
                </div>
              </div>

              {/* Trackers Delta */}
              <div className="p-4 rounded-xl bg-sand-50 border border-sand-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono text-sand-600 uppercase block font-semibold">
                    Trackers Change
                  </span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span
                      className={`text-2xl font-black ${
                        trackersDiff < 0
                          ? "text-forest-800"
                          : trackersDiff > 0
                          ? "text-rust-800"
                          : "text-forest-950"
                      }`}
                    >
                      {trackersDiff > 0 ? `+${trackersDiff}` : trackersDiff}
                    </span>
                    <span className="text-xs font-mono text-sand-600">
                      ({reportA?.metrics?.totalTrackers || 0} vs {reportB?.metrics?.totalTrackers || 0})
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-sand-100 text-rust-800 border border-sand-200">
                  <Radio className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>

          {/* Contextual Guidance Callout */}
          <div className="p-4 sm:p-5 rounded-2xl bg-sand-100 border border-sand-300 text-xs font-mono flex items-start gap-3.5 shadow-subtle">
            <Info className="h-5 w-5 text-forest-800 shrink-0 mt-0.5" />
            <div className="text-forest-800 font-sans text-xs sm:text-sm leading-relaxed">
              <span className="font-bold text-forest-950 block mb-0.5 font-mono text-xs uppercase tracking-wide">
                Contextual Evaluation Guidance
              </span>
              A score differential reflects observable shifts in detected cookies, network telemetry, or consent dark patterns between audits. A score change does not necessarily mean a website became safer or less safe in absolute terms without considering the underlying technical evidence and context.
            </div>
          </div>

          {/* Differential Findings Delta Card */}
          <div className="p-6 rounded-2xl bg-white border border-sand-300 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-sand-200 pb-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-forest-700 font-semibold">
                Findings Differential (Added vs. Resolved)
              </h3>
              <span className="text-[11px] font-mono text-sand-600">
                {newFindingsInB.length} new • {resolvedFindingsInB.length} resolved
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* New Findings in Scan B */}
              <div className="p-4 rounded-xl bg-sand-50 border border-sand-200 space-y-2">
                <span className="text-xs font-mono font-semibold text-rust-800 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-rust-700" />
                  <span>New Observations in Scan B ({newFindingsInB.length})</span>
                </span>
                {newFindingsInB.length === 0 ? (
                  <p className="text-xs text-forest-600 font-mono py-2">
                    No new violations triggered in Scan B.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {newFindingsInB.map((f) => (
                      <div
                        key={`new-${f.id}`}
                        className="p-2.5 rounded-lg bg-white border border-rust-200 text-xs font-mono flex items-center justify-between"
                      >
                        <span className="text-forest-950 truncate pr-2">{f.title}</span>
                        <span className="text-rust-800 font-bold shrink-0">
                          -{f.scoreDeduction} pts
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Resolved / Absent Findings in Scan B */}
              <div className="p-4 rounded-xl bg-sand-50 border border-sand-200 space-y-2">
                <span className="text-xs font-mono font-semibold text-forest-800 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-forest-700" />
                  <span>Resolved / Absent in Scan B ({resolvedFindingsInB.length})</span>
                </span>
                {resolvedFindingsInB.length === 0 ? (
                  <p className="text-xs text-forest-600 font-mono py-2">
                    No previously observed violations were resolved.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {resolvedFindingsInB.map((f) => (
                      <div
                        key={`resolved-${f.id}`}
                        className="p-2.5 rounded-lg bg-white border border-forest-200 text-xs font-mono flex items-center justify-between"
                      >
                        <span className="text-forest-950 truncate pr-2">{f.title}</span>
                        <span className="text-forest-800 font-bold shrink-0">
                          +{f.scoreDeduction} pts resolved
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Side-by-Side Detailed Profile Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Column A */}
            <div className="p-6 rounded-2xl bg-white border border-sand-300 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-sand-200 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-forest-800 uppercase font-semibold">
                    Scan A (Baseline)
                  </span>
                  <h4 className="text-lg font-bold text-forest-950 tracking-tight">
                    {scanA.website?.domain}
                  </h4>
                </div>
                <div className="text-right text-xs font-mono text-sand-600">
                  {formatDate(scanA.createdAt)}
                </div>
              </div>

              {/* Score Pill */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-sand-50 border border-sand-200">
                <span className="text-xs text-sand-600 font-medium">Transparency Score</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-forest-950">
                    {scanA.score}/100
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-white text-forest-800 border border-sand-300">
                    {scanA.grade}
                  </span>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-sand-50 border border-sand-200">
                  <span className="text-sand-600 block text-[11px]">Total Cookies:</span>
                  <span className="font-bold text-forest-950">
                    {reportA?.metrics?.totalCookies || 0}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-sand-50 border border-sand-200">
                  <span className="text-sand-600 block text-[11px]">3rd-Party Cookies:</span>
                  <span className="font-bold text-amber-800">
                    {reportA?.metrics?.thirdPartyCookies || 0}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-sand-50 border border-sand-200">
                  <span className="text-sand-600 block text-[11px]">Total Trackers:</span>
                  <span className="font-bold text-rust-800">
                    {reportA?.metrics?.totalTrackers || 0}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-sand-50 border border-sand-200">
                  <span className="text-sand-600 block text-[11px]">Network Requests:</span>
                  <span className="font-bold text-forest-950">
                    {reportA?.metrics?.thirdPartyRequests || 0}
                  </span>
                </div>
              </div>

              {/* Findings */}
              <div>
                <span className="text-xs font-mono text-sand-600 uppercase tracking-wider block mb-2 font-semibold">
                  Findings ({findingsA.length})
                </span>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {findingsA.map((f) => (
                    <div
                      key={f.id}
                      className="p-2.5 rounded-lg bg-sand-50 border border-sand-200 text-xs font-mono flex items-center justify-between"
                    >
                      <span className="text-forest-900 truncate pr-2">{f.title}</span>
                      <span className="text-rust-800 font-bold shrink-0">
                        -{f.scoreDeduction} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Column B */}
            <div className="p-6 rounded-2xl bg-white border border-sand-300 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-sand-200 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-forest-800 uppercase font-semibold">
                    Scan B (Comparison)
                  </span>
                  <h4 className="text-lg font-bold text-forest-950 tracking-tight">
                    {scanB.website?.domain}
                  </h4>
                </div>
                <div className="text-right text-xs font-mono text-sand-600">
                  {formatDate(scanB.createdAt)}
                </div>
              </div>

              {/* Score Pill */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-sand-50 border border-sand-200">
                <span className="text-xs text-sand-600 font-medium">Transparency Score</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-forest-950">
                    {scanB.score}/100
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-white text-forest-800 border border-sand-300">
                    {scanB.grade}
                  </span>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-sand-50 border border-sand-200">
                  <span className="text-sand-600 block text-[11px]">Total Cookies:</span>
                  <span className="font-bold text-forest-950">
                    {reportB?.metrics?.totalCookies || 0}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-sand-50 border border-sand-200">
                  <span className="text-sand-600 block text-[11px]">3rd-Party Cookies:</span>
                  <span className="font-bold text-amber-800">
                    {reportB?.metrics?.thirdPartyCookies || 0}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-sand-50 border border-sand-200">
                  <span className="text-sand-600 block text-[11px]">Total Trackers:</span>
                  <span className="font-bold text-rust-800">
                    {reportB?.metrics?.totalTrackers || 0}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-sand-50 border border-sand-200">
                  <span className="text-sand-600 block text-[11px]">Network Requests:</span>
                  <span className="font-bold text-forest-950">
                    {reportB?.metrics?.thirdPartyRequests || 0}
                  </span>
                </div>
              </div>

              {/* Findings */}
              <div>
                <span className="text-xs font-mono text-sand-600 uppercase tracking-wider block mb-2 font-semibold">
                  Findings ({findingsB.length})
                </span>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {findingsB.map((f) => (
                    <div
                      key={f.id}
                      className="p-2.5 rounded-lg bg-sand-50 border border-sand-200 text-xs font-mono flex items-center justify-between"
                    >
                      <span className="text-forest-900 truncate pr-2">{f.title}</span>
                      <span className="text-rust-800 font-bold shrink-0">
                        -{f.scoreDeduction} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[40vh] flex flex-col items-center justify-center p-8 text-center">
          <Loader2 className="h-8 w-8 text-forest-800 animate-spin mb-3" />
          <p className="text-xs font-mono text-sand-600">Loading comparison module...</p>
        </div>
      }
    >
      <CompareContent />
    </Suspense>
  );
}
