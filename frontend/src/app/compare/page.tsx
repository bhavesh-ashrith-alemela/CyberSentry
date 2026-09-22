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

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-cyber-card border border-cyber-border shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/history"
              className="text-xs font-mono text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>History</span>
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-xs font-mono text-cyan-400">Comparison</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 flex items-center gap-3">
            <GitCompare className="h-7 w-7 text-cyber-accent" />
            <span>Side-by-Side Scan Comparison</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Compare privacy transparency metrics, tracker exposures, and score differentials.
          </p>
        </div>

        {/* Scan Selectors */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Selector A */}
          <div className="w-full sm:w-56">
            <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
              Baseline Scan (A)
            </label>
            <select
              value={scanAId}
              onChange={(e) => {
                setScanAId(e.target.value);
                router.push(`/compare?scanA=${e.target.value}&scanB=${scanBId}`);
              }}
              className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:outline-none text-slate-200"
            >
              <option value="">Select Baseline...</option>
              {availableScans.map((s) => (
                <option key={`a-${s.id}`} value={s.id}>
                  {s.website?.domain} ({formatDate(s.createdAt)})
                </option>
              ))}
            </select>
          </div>

          <div className="text-slate-600 font-mono hidden sm:block pt-4">vs</div>

          {/* Selector B */}
          <div className="w-full sm:w-56">
            <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
              Comparison Scan (B)
            </label>
            <select
              value={scanBId}
              onChange={(e) => {
                setScanBId(e.target.value);
                router.push(`/compare?scanA=${scanAId}&scanB=${e.target.value}`);
              }}
              className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:outline-none text-slate-200"
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
        <div className="min-h-[40vh] flex flex-col items-center justify-center p-8 rounded-2xl bg-cyber-card border border-cyber-border text-center">
          <Loader2 className="h-8 w-8 text-cyan-400 animate-spin mb-3" />
          <p className="text-xs font-mono text-slate-400">Computing differential audit telemetry...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center rounded-2xl bg-cyber-card border border-rose-500/40 text-rose-300">
          <AlertTriangle className="h-8 w-8 text-rose-400 mx-auto mb-2" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      ) : !scanA || !scanB ? (
        <div className="p-12 text-center rounded-2xl bg-cyber-card border border-cyber-border">
          <GitCompare className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-200">Select Two Audits to Compare</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Choose a baseline audit and a comparison audit from the dropdowns above or select two entries in the Scan History table.
          </p>
        </div>
      ) : (
        <>
          {/* Differential Metrics Summary Card */}
          <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border shadow-xl">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-4">
              Differential Audit Summary (Scan B vs Scan A)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Score Delta */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono text-slate-400 uppercase block">
                    Score Difference
                  </span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span
                      className={`text-2xl font-black ${
                        scoreDiff > 0
                          ? "text-emerald-400"
                          : scoreDiff < 0
                          ? "text-rose-400"
                          : "text-slate-300"
                      }`}
                    >
                      {scoreDiff > 0 ? `+${scoreDiff}` : scoreDiff} pts
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      ({scanA.grade} → {scanB.grade})
                    </span>
                  </div>
                </div>

                <div
                  className={`p-2.5 rounded-xl border ${
                    scoreDiff > 0
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : scoreDiff < 0
                      ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                      : "bg-slate-800 text-slate-400 border-slate-700"
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
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono text-slate-400 uppercase block">
                    Cookies Change
                  </span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span
                      className={`text-2xl font-black ${
                        cookiesDiff < 0
                          ? "text-emerald-400"
                          : cookiesDiff > 0
                          ? "text-rose-400"
                          : "text-slate-300"
                      }`}
                    >
                      {cookiesDiff > 0 ? `+${cookiesDiff}` : cookiesDiff}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      ({reportA?.metrics?.totalCookies || 0} vs {reportB?.metrics?.totalCookies || 0})
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800 text-cyan-400 border border-slate-700">
                  <Cookie className="h-5 w-5" />
                </div>
              </div>

              {/* Trackers Delta */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono text-slate-400 uppercase block">
                    Trackers Change
                  </span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span
                      className={`text-2xl font-black ${
                        trackersDiff < 0
                          ? "text-emerald-400"
                          : trackersDiff > 0
                          ? "text-rose-400"
                          : "text-slate-300"
                      }`}
                    >
                      {trackersDiff > 0 ? `+${trackersDiff}` : trackersDiff}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      ({reportA?.metrics?.totalTrackers || 0} vs {reportB?.metrics?.totalTrackers || 0})
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800 text-orange-400 border border-slate-700">
                  <Radio className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>

          {/* Side-by-Side Detailed Profile Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Column A */}
            <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-cyber-border pb-3">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">
                    Scan A (Baseline)
                  </span>
                  <h4 className="text-lg font-bold text-slate-100">
                    {scanA.website?.domain}
                  </h4>
                </div>
                <div className="text-right text-xs font-mono text-slate-400">
                  {formatDate(scanA.createdAt)}
                </div>
              </div>

              {/* Score Pill */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs text-slate-400">Transparency Score</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-slate-100">
                    {scanA.score}/100
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-800 text-cyan-400 border border-slate-700">
                    {scanA.grade}
                  </span>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800">
                  <span className="text-slate-500 block">Total Cookies:</span>
                  <span className="font-bold text-slate-200">
                    {reportA?.metrics?.totalCookies || 0}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800">
                  <span className="text-slate-500 block">3rd-Party Cookies:</span>
                  <span className="font-bold text-orange-400">
                    {reportA?.metrics?.thirdPartyCookies || 0}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800">
                  <span className="text-slate-500 block">Total Trackers:</span>
                  <span className="font-bold text-rose-400">
                    {reportA?.metrics?.totalTrackers || 0}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800">
                  <span className="text-slate-500 block">Network Requests:</span>
                  <span className="font-bold text-slate-200">
                    {reportA?.metrics?.thirdPartyRequests || 0}
                  </span>
                </div>
              </div>

              {/* Findings */}
              <div>
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2">
                  Findings ({findingsA.length})
                </span>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {findingsA.map((f) => (
                    <div
                      key={f.id}
                      className="p-2.5 rounded-lg bg-slate-900/30 border border-slate-800 text-xs font-mono flex items-center justify-between"
                    >
                      <span className="text-slate-300 truncate pr-2">{f.title}</span>
                      <span className="text-rose-400 font-bold shrink-0">
                        -{f.scoreDeduction} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Column B */}
            <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-cyber-border pb-3">
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">
                    Scan B (Comparison)
                  </span>
                  <h4 className="text-lg font-bold text-slate-100">
                    {scanB.website?.domain}
                  </h4>
                </div>
                <div className="text-right text-xs font-mono text-slate-400">
                  {formatDate(scanB.createdAt)}
                </div>
              </div>

              {/* Score Pill */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs text-slate-400">Transparency Score</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-slate-100">
                    {scanB.score}/100
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-800 text-cyan-400 border border-slate-700">
                    {scanB.grade}
                  </span>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800">
                  <span className="text-slate-500 block">Total Cookies:</span>
                  <span className="font-bold text-slate-200">
                    {reportB?.metrics?.totalCookies || 0}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800">
                  <span className="text-slate-500 block">3rd-Party Cookies:</span>
                  <span className="font-bold text-orange-400">
                    {reportB?.metrics?.thirdPartyCookies || 0}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800">
                  <span className="text-slate-500 block">Total Trackers:</span>
                  <span className="font-bold text-rose-400">
                    {reportB?.metrics?.totalTrackers || 0}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800">
                  <span className="text-slate-500 block">Network Requests:</span>
                  <span className="font-bold text-slate-200">
                    {reportB?.metrics?.thirdPartyRequests || 0}
                  </span>
                </div>
              </div>

              {/* Findings */}
              <div>
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2">
                  Findings ({findingsB.length})
                </span>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {findingsB.map((f) => (
                    <div
                      key={f.id}
                      className="p-2.5 rounded-lg bg-slate-900/30 border border-slate-800 text-xs font-mono flex items-center justify-between"
                    >
                      <span className="text-slate-300 truncate pr-2">{f.title}</span>
                      <span className="text-rose-400 font-bold shrink-0">
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
          <Loader2 className="h-8 w-8 text-cyan-400 animate-spin mb-3" />
          <p className="text-xs font-mono text-slate-400">Loading comparison module...</p>
        </div>
      }
    >
      <CompareContent />
    </Suspense>
  );
}
