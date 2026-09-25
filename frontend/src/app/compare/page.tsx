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
  ExternalLink,
  ChevronRight,
  FileText,
} from "lucide-react";
import { api } from "@/lib/api";
import { Scan, Report, Finding, ScanComparison } from "@/lib/types";
import { formatDate } from "@/lib/formatters";
import {
  PaperCard,
  FolderTab,
  FolderCard,
  EditorialBadge,
  FileLabel,
  SectionHeader,
  StampBadge,
} from "@/components/ui";

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

  // Load scan list for dropdown selectors
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

  // Fetch comparison data whenever both scan IDs are provided
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
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      
      {/* Editorial Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-cs-border/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/history"
              className="text-xs font-mono text-cs-muted hover:text-cs-denim transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Archives</span>
            </Link>
            <span className="text-cs-muted/60">/</span>
            <FileLabel brackets variant="denim">
              DOSSIER COMPARISON
            </FileLabel>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold font-display text-cs-ink tracking-tight">
            Two Websites.{" "}
            <span className="editorial-italic text-cs-denim font-normal ml-1">
              One Evidence Set.
            </span>
          </h1>

          <p className="mt-1 text-xs sm:text-sm text-cs-muted font-sans max-w-xl">
            Compare empirical privacy transparency observations and telemetry deltas across two completed audits.
          </p>
        </div>

        {/* Scan Selector Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Selector A */}
          <div className="w-full sm:w-56 space-y-1">
            <label className="text-[10px] font-mono text-cs-muted uppercase font-bold block">
              Dossier A (Baseline)
            </label>
            <select
              value={scanAId}
              onChange={(e) => {
                setScanAId(e.target.value);
                router.push(`/compare?scanA=${e.target.value}&scanB=${scanBId}`);
              }}
              className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-cs-paper border border-cs-border focus:border-cs-denim focus:outline-none text-cs-ink shadow-xs"
            >
              <option value="">Select Baseline...</option>
              {availableScans.map((s) => (
                <option key={`a-${s.id}`} value={s.id}>
                  {s.website?.domain} ({formatDate(s.createdAt)})
                </option>
              ))}
            </select>
          </div>

          <div className="text-cs-muted font-mono font-bold text-xs self-center pt-3 hidden sm:block">
            vs
          </div>

          {/* Selector B */}
          <div className="w-full sm:w-56 space-y-1">
            <label className="text-[10px] font-mono text-cs-muted uppercase font-bold block">
              Dossier B (Target)
            </label>
            <select
              value={scanBId}
              onChange={(e) => {
                setScanBId(e.target.value);
                router.push(`/compare?scanA=${scanAId}&scanB=${e.target.value}`);
              }}
              className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-cs-paper border border-cs-border focus:border-cs-denim focus:outline-none text-cs-ink shadow-xs"
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
        <div className="min-h-[40vh] flex flex-col items-center justify-center p-8 rounded-2xl border border-cs-border bg-cs-paper text-center">
          <Loader2 className="h-8 w-8 text-cs-denim animate-spin mb-3" />
          <p className="text-xs font-mono text-cs-muted">Computing differential telemetry...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center rounded-2xl border border-cs-pink bg-cs-pink-light/40 text-cs-danger">
          <AlertTriangle className="h-8 w-8 text-cs-danger mx-auto mb-2" />
          <p className="text-sm font-bold font-sans">{error}</p>
        </div>
      ) : !scanA || !scanB ? (
        /* Empty / Unselected State */
        <div className="p-12 sm:p-16 text-center rounded-2xl border border-cs-border bg-cs-paper shadow-paper space-y-3">
          <GitCompare className="h-12 w-12 text-cs-muted/80 mx-auto stroke-[1.5]" />
          <h3 className="text-lg font-bold text-cs-ink font-sans">
            Select Two Audits to Compare
          </h3>
          <p className="text-xs sm:text-sm text-cs-muted max-w-md mx-auto font-sans">
            Choose a baseline audit and a target audit from the selectors above or select two records from the Privacy Files archive.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          
          {/* Section 1: Differential Summary Metrics Card */}
          <PaperCard variant="default" className="space-y-4">
            <div className="flex items-center justify-between border-b border-cs-border/80 pb-3">
              <FileLabel code="DIFFERENTIAL_SUMMARY" variant="muted" />
              <span className="font-mono text-xs text-cs-muted">
                Observed Difference (Dossier B vs Dossier A)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Score Difference */}
              <div className="p-4 rounded-xl bg-cs-cream/40 border border-cs-border flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-cs-muted uppercase block font-bold">
                    Score Difference
                  </span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span
                      className={`text-2xl sm:text-3xl font-black font-display ${
                        scoreDiff > 0
                          ? "text-cs-safe"
                          : scoreDiff < 0
                          ? "text-cs-danger"
                          : "text-cs-ink"
                      }`}
                    >
                      {scoreDiff > 0 ? `+${scoreDiff}` : scoreDiff} pts
                    </span>
                    <span className="text-xs font-mono text-cs-muted">
                      ({scanA.grade} → {scanB.grade})
                    </span>
                  </div>
                </div>

                <div
                  className={`p-2 rounded-xl border ${
                    scoreDiff > 0
                      ? "bg-cs-olive-light text-cs-olive border-cs-olive/30"
                      : scoreDiff < 0
                      ? "bg-cs-pink-light text-cs-danger border-cs-pink/40"
                      : "bg-cs-paper text-cs-muted border-cs-border"
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
              <div className="p-4 rounded-xl bg-cs-cream/40 border border-cs-border flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-cs-muted uppercase block font-bold">
                    Cookies Change
                  </span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black font-display text-cs-ink">
                      {cookiesDiff > 0 ? `+${cookiesDiff}` : cookiesDiff}
                    </span>
                    <span className="text-xs font-mono text-cs-muted">
                      ({reportA?.metrics?.totalCookies || 0} vs {reportB?.metrics?.totalCookies || 0})
                    </span>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-cs-paper text-cs-denim border border-cs-border">
                  <Cookie className="h-5 w-5" />
                </div>
              </div>

              {/* Trackers Delta */}
              <div className="p-4 rounded-xl bg-cs-cream/40 border border-cs-border flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-cs-muted uppercase block font-bold">
                    Trackers Change
                  </span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black font-display text-cs-ink">
                      {trackersDiff > 0 ? `+${trackersDiff}` : trackersDiff}
                    </span>
                    <span className="text-xs font-mono text-cs-muted">
                      ({reportA?.metrics?.totalTrackers || 0} vs {reportB?.metrics?.totalTrackers || 0})
                    </span>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-cs-paper text-cs-warning border border-cs-border">
                  <Radio className="h-5 w-5" />
                </div>
              </div>

            </div>
          </PaperCard>

          {/* Section 2: Side-by-Side Detailed Dossiers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            
            {/* Dossier A Column */}
            <div className="space-y-4">
              <div className="flex items-end justify-between px-1">
                <FolderTab color="denim" size="md">
                  FILE A: {scanA.website?.domain}
                </FolderTab>
                <Link
                  href={`/scan/${scanA.id}`}
                  className="font-mono text-xs text-cs-denim hover:underline pb-1 flex items-center gap-1"
                >
                  <span>Open Report</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>

              <div className="rounded-2xl rounded-tl-none border border-cs-border bg-cs-paper p-6 sm:p-7 shadow-paper text-cs-ink space-y-5">
                <div className="flex items-center justify-between border-b border-cs-border/80 pb-3">
                  <div>
                    <h3 className="text-lg font-bold font-sans text-cs-ink">
                      {scanA.website?.domain}
                    </h3>
                    <p className="text-xs font-mono text-cs-muted">
                      Audited: {formatDate(scanA.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-baseline gap-1 font-mono">
                    <span className="text-3xl font-black font-display text-cs-ink">
                      {scanA.score}
                    </span>
                    <span className="text-xs text-cs-muted">/100</span>
                    <EditorialBadge variant="denim" size="xs" className="ml-1">
                      {scanA.grade || "B"}
                    </EditorialBadge>
                  </div>
                </div>

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-cs-cream/40 border border-cs-border">
                    <span className="text-cs-muted block text-[10px] uppercase">Total Cookies</span>
                    <span className="font-bold text-base text-cs-ink">{reportA?.metrics?.totalCookies || 0}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-cs-cream/40 border border-cs-border">
                    <span className="text-cs-muted block text-[10px] uppercase">3rd-Party Cookies</span>
                    <span className="font-bold text-base text-cs-warning">{reportA?.metrics?.thirdPartyCookies || 0}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-cs-cream/40 border border-cs-border">
                    <span className="text-cs-muted block text-[10px] uppercase">Trackers</span>
                    <span className="font-bold text-base text-cs-danger">{reportA?.metrics?.totalTrackers || 0}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-cs-cream/40 border border-cs-border">
                    <span className="text-cs-muted block text-[10px] uppercase">Outbound Beacons</span>
                    <span className="font-bold text-base text-cs-ink">{reportA?.metrics?.thirdPartyRequests || 0}</span>
                  </div>
                </div>

                {/* Findings List A */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs font-mono text-cs-muted border-b border-cs-border/60 pb-1.5">
                    <span className="uppercase font-bold">Findings ({findingsA.length})</span>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {findingsA.length === 0 ? (
                      <p className="text-xs text-cs-muted font-sans py-2">No privacy findings recorded.</p>
                    ) : (
                      findingsA.map((f) => (
                        <div
                          key={`a-${f.id}`}
                          className="p-3 rounded-xl bg-cs-cream/30 border border-cs-border text-xs font-mono flex items-center justify-between gap-2"
                        >
                          <span className="text-cs-ink truncate">{f.title}</span>
                          <span className="text-cs-danger font-bold shrink-0">
                            -{f.scoreDeduction} pts
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Dossier B Column */}
            <div className="space-y-4">
              <div className="flex items-end justify-between px-1">
                <FolderTab color="olive" size="md">
                  FILE B: {scanB.website?.domain}
                </FolderTab>
                <Link
                  href={`/scan/${scanB.id}`}
                  className="font-mono text-xs text-cs-olive hover:underline pb-1 flex items-center gap-1"
                >
                  <span>Open Report</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>

              <div className="rounded-2xl rounded-tl-none border border-cs-border bg-cs-paper p-6 sm:p-7 shadow-paper text-cs-ink space-y-5">
                <div className="flex items-center justify-between border-b border-cs-border/80 pb-3">
                  <div>
                    <h3 className="text-lg font-bold font-sans text-cs-ink">
                      {scanB.website?.domain}
                    </h3>
                    <p className="text-xs font-mono text-cs-muted">
                      Audited: {formatDate(scanB.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-baseline gap-1 font-mono">
                    <span className="text-3xl font-black font-display text-cs-ink">
                      {scanB.score}
                    </span>
                    <span className="text-xs text-cs-muted">/100</span>
                    <EditorialBadge variant="olive" size="xs" className="ml-1">
                      {scanB.grade || "B"}
                    </EditorialBadge>
                  </div>
                </div>

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-cs-cream/40 border border-cs-border">
                    <span className="text-cs-muted block text-[10px] uppercase">Total Cookies</span>
                    <span className="font-bold text-base text-cs-ink">{reportB?.metrics?.totalCookies || 0}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-cs-cream/40 border border-cs-border">
                    <span className="text-cs-muted block text-[10px] uppercase">3rd-Party Cookies</span>
                    <span className="font-bold text-base text-cs-warning">{reportB?.metrics?.thirdPartyCookies || 0}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-cs-cream/40 border border-cs-border">
                    <span className="text-cs-muted block text-[10px] uppercase">Trackers</span>
                    <span className="font-bold text-base text-cs-danger">{reportB?.metrics?.totalTrackers || 0}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-cs-cream/40 border border-cs-border">
                    <span className="text-cs-muted block text-[10px] uppercase">Outbound Beacons</span>
                    <span className="font-bold text-base text-cs-ink">{reportB?.metrics?.thirdPartyRequests || 0}</span>
                  </div>
                </div>

                {/* Findings List B */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs font-mono text-cs-muted border-b border-cs-border/60 pb-1.5">
                    <span className="uppercase font-bold">Findings ({findingsB.length})</span>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {findingsB.length === 0 ? (
                      <p className="text-xs text-cs-muted font-sans py-2">No privacy findings recorded.</p>
                    ) : (
                      findingsB.map((f) => (
                        <div
                          key={`b-${f.id}`}
                          className="p-3 rounded-xl bg-cs-cream/30 border border-cs-border text-xs font-mono flex items-center justify-between gap-2"
                        >
                          <span className="text-cs-ink truncate">{f.title}</span>
                          <span className="text-cs-danger font-bold shrink-0">
                            -{f.scoreDeduction} pts
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[40vh] flex flex-col items-center justify-center p-8 text-center">
          <Loader2 className="h-8 w-8 text-cs-denim animate-spin mb-3" />
          <p className="text-xs font-mono text-cs-muted">Loading comparison dossiers...</p>
        </div>
      }
    >
      <CompareContent />
    </Suspense>
  );
}
