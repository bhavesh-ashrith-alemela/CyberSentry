"use client";

import React, { useEffect, useState, useMemo, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  GitCompare,
  Clock,
  Globe,
  ExternalLink,
  AlertCircle,
  RotateCw,
  Check,
  X,
  FileText,
  Sliders,
  Cookie,
  Radio,
  Lightbulb,
} from "lucide-react";
import { api } from "@/lib/api";
import { Scan, Report, Finding, ScanComparison } from "@/lib/types";
import { formatDate, formatDuration } from "@/lib/formatters";
import {
  Card,
  Badge,
  Button,
  SectionHeader,
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

  const fetchComparisonData = useCallback(() => {
    if (!scanAId || !scanBId) return;

    setLoading(true);
    setError(null);

    Promise.all([
      api.compareScans(scanAId, scanBId).catch(() => null),
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
          if (compRes?.success) setComparison(compRes.data);
          if (scanARes.success) setScanA(scanARes.data);
          if (scanBRes.success) setScanB(scanBRes.data);
          if (repARes?.success) setReportA(repARes.data);
          if (repBRes?.success) setReportB(repBRes.data);
          if (findARes?.success) setFindingsA(findARes.data.findings || []);
          if (findBRes?.success) setFindingsB(findBRes.data.findings || []);
        }
      )
      .catch((err: any) => {
        setError(err.message || "Failed to compare selected scans.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [scanAId, scanBId]);

  useEffect(() => {
    fetchComparisonData();
  }, [fetchComparisonData]);

  // Compute category scores for Site A and Site B
  const getCategoryScores = (findingsList: Finding[]) => {
    let trackingDed = 0;
    let consentDed = 0;
    let securityDed = 0;
    let userControlDed = 0;
    let educationDed = 0;

    for (const f of findingsList) {
      const cat = f.evidence?.category?.toLowerCase() || "";
      const rule = f.ruleId?.toLowerCase() || "";
      const deduction = f.scoreDeduction || 0;

      if (cat.includes("tracker") || rule.includes("track") || rule.includes("request")) {
        trackingDed += deduction;
      } else if (cat.includes("consent") || rule.includes("consent") || rule.includes("banner")) {
        consentDed += deduction;
      } else if (cat.includes("security") || rule.includes("secure") || rule.includes("http")) {
        securityDed += deduction;
      } else if (cat.includes("darkpattern") || rule.includes("reject") || rule.includes("asymmetric")) {
        userControlDed += deduction;
      } else {
        educationDed += deduction;
      }
    }

    return [
      { name: "Tracking Transparency", weight: "25%", score: Math.max(10, Math.min(100, Math.round(((25 - trackingDed) / 25) * 100))) },
      { name: "Consent Integrity", weight: "30%", score: Math.max(10, Math.min(100, Math.round(((30 - consentDed) / 30) * 100))) },
      { name: "Security Posture", weight: "15%", score: Math.max(10, Math.min(100, Math.round(((15 - securityDed) / 15) * 100))) },
      { name: "User Control", weight: "20%", score: Math.max(10, Math.min(100, Math.round(((20 - userControlDed) / 20) * 100))) },
      { name: "Education & Clarity", weight: "10%", score: Math.max(10, Math.min(100, Math.round(((10 - educationDed) / 10) * 100))) },
    ];
  };

  const categoriesA = useMemo(() => getCategoryScores(findingsA), [findingsA]);
  const categoriesB = useMemo(() => getCategoryScores(findingsB), [findingsB]);

  // Key differences derived from actual report data
  const keyDifferences = useMemo(() => {
    if (!scanA || !scanB) return [];
    const diffs: string[] = [];
    const domainA = scanA.website?.domain || "Website A";
    const domainB = scanB.website?.domain || "Website B";

    // 1. Score delta
    if (typeof scanA.score === "number" && typeof scanB.score === "number") {
      const diff = scanA.score - scanB.score;
      if (diff > 0) {
        diffs.push(`${domainA} recorded ${diff} points higher on overall privacy transparency than ${domainB}.`);
      } else if (diff < 0) {
        diffs.push(`${domainB} recorded ${Math.abs(diff)} points higher on overall privacy transparency than ${domainA}.`);
      } else {
        diffs.push(`Both websites registered an identical transparency score of ${scanA.score}/100.`);
      }
    }

    // 2. Trackers count
    const trackersA = reportA?.metrics?.totalTrackers ?? 0;
    const trackersB = reportB?.metrics?.totalTrackers ?? 0;
    if (trackersA !== trackersB) {
      if (trackersA < trackersB) {
        diffs.push(`${domainA} recorded ${trackersB - trackersA} fewer third-party tracker domains than ${domainB}.`);
      } else {
        diffs.push(`${domainB} recorded ${trackersA - trackersB} fewer third-party tracker domains than ${domainA}.`);
      }
    }

    // 3. Cookies count
    const cookiesA = reportA?.metrics?.totalCookies ?? 0;
    const cookiesB = reportB?.metrics?.totalCookies ?? 0;
    if (cookiesA !== cookiesB) {
      if (cookiesA < cookiesB) {
        diffs.push(`${domainA} deposited ${cookiesB - cookiesA} fewer browser cookies in storage than ${domainB}.`);
      } else {
        diffs.push(`${domainB} deposited ${cookiesA - cookiesB} fewer browser cookies in storage than ${domainA}.`);
      }
    }

    // 4. Reject button availability
    const rejectA = reportA?.consentBanner?.hasRejectButton ?? false;
    const rejectB = reportB?.consentBanner?.hasRejectButton ?? false;
    if (rejectA !== rejectB) {
      if (rejectA && !rejectB) {
        diffs.push(`${domainA} provided a single-click reject option on layer 1, whereas ${domainB} concealed or omitted it.`);
      } else {
        diffs.push(`${domainB} provided a single-click reject option on layer 1, whereas ${domainA} concealed or omitted it.`);
      }
    }

    // 5. Findings count
    if (findingsA.length !== findingsB.length) {
      if (findingsA.length < findingsB.length) {
        diffs.push(`${domainA} registered ${findingsB.length - findingsA.length} fewer rule deductions than ${domainB}.`);
      } else {
        diffs.push(`${domainB} registered ${findingsA.length - findingsB.length} fewer rule deductions than ${domainA}.`);
      }
    }

    return diffs;
  }, [scanA, scanB, reportA, reportB, findingsA, findingsB]);

  const scoreDiff =
    scanA?.score !== null && scanB?.score !== null && scanA?.score !== undefined && scanB?.score !== undefined
      ? scanB.score - scanA.score
      : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      
      {/* ====================================================================
          1. HEADER & AUDIT SELECTOR TOOLBAR
         ==================================================================== */}
      <Card padding="md" className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-medium text-cs-muted">
              <Link href="/history" className="hover:text-cs-primary transition-colors flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" />
                <span>Back to History</span>
              </Link>
              <span>/</span>
              <span className="text-cs-text font-semibold">Audit Comparison</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-cs-text font-sans">
              Compare Privacy Audits
            </h1>
            <p className="text-xs sm:text-sm text-cs-muted">
              Review and compare empirical telemetry observations side by side across two website audits.
            </p>
          </div>

          {/* Audit Selectors */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2 lg:pt-0">
            {/* Selector A */}
            <div className="w-full sm:w-52">
              <label htmlFor="select-baseline" className="sr-only">Select Baseline</label>
              <select
                id="select-baseline"
                value={scanAId}
                onChange={(e) => {
                  setScanAId(e.target.value);
                  router.push(`/compare?scanA=${e.target.value}&scanB=${scanBId}`);
                }}
                className="w-full h-9.5 px-3 rounded-xl text-xs font-medium bg-cs-surface border border-cs-border text-cs-text focus:border-cs-primary focus:outline-none shadow-xs truncate"
              >
                <option value="">Baseline Audit...</option>
                {availableScans.map((s) => (
                  <option key={`a-${s.id}`} value={s.id}>
                    {s.website?.domain} ({formatDate(s.createdAt)})
                  </option>
                ))}
              </select>
            </div>

            <span className="text-xs font-bold text-cs-muted text-center self-center hidden sm:inline">
              vs
            </span>

            {/* Selector B */}
            <div className="w-full sm:w-52">
              <label htmlFor="select-target" className="sr-only">Select Target</label>
              <select
                id="select-target"
                value={scanBId}
                onChange={(e) => {
                  setScanBId(e.target.value);
                  router.push(`/compare?scanA=${scanAId}&scanB=${e.target.value}`);
                }}
                className="w-full h-9.5 px-3 rounded-xl text-xs font-medium bg-cs-surface border border-cs-border text-cs-text focus:border-cs-primary focus:outline-none shadow-xs truncate"
              >
                <option value="">Target Audit...</option>
                {availableScans.map((s) => (
                  <option key={`b-${s.id}`} value={s.id}>
                    {s.website?.domain} ({formatDate(s.createdAt)})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* ====================================================================
          2. STATES: LOADING, ERROR, OR UNSELECTED
         ==================================================================== */}
      {loading ? (
        <Card padding="lg" className="min-h-[40vh] flex flex-col items-center justify-center text-center space-y-3">
          <div className="h-8 w-8 rounded-full border-2 border-cs-border border-t-cs-primary animate-spin" />
          <p className="text-xs text-cs-muted font-mono">Computing differential telemetry...</p>
        </Card>
      ) : error ? (
        <Card padding="lg" className="text-center py-12 space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-cs-danger-soft text-cs-danger flex items-center justify-center mx-auto border border-red-200/80">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-cs-text">Unable to load comparison</h3>
            <p className="text-xs text-cs-muted max-w-sm mx-auto">{error}</p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" size="sm" onClick={fetchComparisonData} className="gap-1.5">
              <RotateCw className="h-3.5 w-3.5" />
              <span>Retry</span>
            </Button>
            <Link href="/history">
              <Button variant="secondary" size="sm">
                Back to History
              </Button>
            </Link>
          </div>
        </Card>
      ) : !scanA || !scanB ? (
        <Card padding="lg" className="text-center py-16 space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-slate-100 text-cs-muted flex items-center justify-center mx-auto">
            <GitCompare className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-cs-text font-sans">
              Select two audits to compare
            </h3>
            <p className="text-xs sm:text-sm text-cs-muted max-w-md mx-auto leading-relaxed">
              Choose two completed audits from the selectors above or select two records from the Scan History archive.
            </p>
          </div>
          <Link href="/history">
            <Button variant="primary" size="md" className="gap-2 shadow-xs font-semibold">
              <span>Go to Scan History</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </Card>
      ) : (
        /* ====================================================================
            3. COMPARISON CONTENT (Symmetrical 2-Column Dashboard)
           ==================================================================== */
        <div className="space-y-8">
          
          {/* Section 1: Symmetrical Website Identity Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Website A Card */}
            <Card padding="md" className="space-y-3">
              <div className="flex items-center justify-between border-b border-cs-border pb-3">
                <span className="text-[11px] font-semibold text-cs-primary uppercase tracking-wider">
                  Baseline (Audit A)
                </span>
                <Badge variant="success" size="sm" dot>
                  {scanA.status}
                </Badge>
              </div>

              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-cs-text font-sans">
                    {scanA.website?.domain || "Target Website"}
                  </h3>
                  <p className="text-xs text-cs-muted font-mono truncate max-w-xs mt-0.5">
                    {scanA.website?.url}
                  </p>
                </div>

                <div className="text-right">
                  <div className="flex items-baseline justify-end gap-1">
                    <span className="text-2xl sm:text-3xl font-bold text-cs-text">
                      {scanA.score ?? "—"}
                    </span>
                    <span className="text-xs text-cs-muted">/100</span>
                  </div>
                  {scanA.grade && (
                    <Badge variant="primary" size="sm" className="mt-0.5">
                      Grade {scanA.grade}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-cs-border flex items-center justify-between text-xs text-cs-muted">
                <span>Scanned: {formatDate(scanA.createdAt)}</span>
                <Link
                  href={`/scan/${scanA.id}`}
                  className="font-medium text-cs-primary hover:text-cs-primary-hover inline-flex items-center gap-1"
                >
                  <span>Open Report</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </Card>

            {/* Website B Card */}
            <Card padding="md" className="space-y-3">
              <div className="flex items-center justify-between border-b border-cs-border pb-3">
                <span className="text-[11px] font-semibold text-cs-purple uppercase tracking-wider">
                  Comparison (Audit B)
                </span>
                <Badge variant="success" size="sm" dot>
                  {scanB.status}
                </Badge>
              </div>

              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-cs-text font-sans">
                    {scanB.website?.domain || "Target Website"}
                  </h3>
                  <p className="text-xs text-cs-muted font-mono truncate max-w-xs mt-0.5">
                    {scanB.website?.url}
                  </p>
                </div>

                <div className="text-right">
                  <div className="flex items-baseline justify-end gap-1">
                    <span className="text-2xl sm:text-3xl font-bold text-cs-text">
                      {scanB.score ?? "—"}
                    </span>
                    <span className="text-xs text-cs-muted">/100</span>
                  </div>
                  {scanB.grade && (
                    <Badge variant="purple" size="sm" className="mt-0.5">
                      Grade {scanB.grade}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-cs-border flex items-center justify-between text-xs text-cs-muted">
                <span>Scanned: {formatDate(scanB.createdAt)}</span>
                <Link
                  href={`/scan/${scanB.id}`}
                  className="font-medium text-cs-primary hover:text-cs-primary-hover inline-flex items-center gap-1"
                >
                  <span>Open Report</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </Card>
          </div>

          {/* Section 2: Score Comparison & Differential Banner */}
          <Card padding="md" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cs-border pb-3">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-cs-muted block">
                  PRIVACY TRANSPARENCY SCORE COMPARISON
                </span>
                <h3 className="text-lg font-bold text-cs-text font-sans">
                  {scanA.website?.domain} vs {scanB.website?.domain}
                </h3>
              </div>

              <Badge
                variant={scoreDiff > 0 ? "success" : scoreDiff < 0 ? "warning" : "neutral"}
                size="md"
              >
                {scoreDiff > 0 ? `+${scoreDiff} pts Delta (B higher)` : scoreDiff < 0 ? `${scoreDiff} pts Delta (A higher)` : "0 pts Delta (Equal)"}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Site A Score Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-cs-text">{scanA.website?.domain}</span>
                  <span className="font-mono font-bold text-sm text-cs-text">{scanA.score}/100</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-cs-primary transition-all duration-700"
                    style={{ width: `${scanA.score || 0}%` }}
                  />
                </div>
              </div>

              {/* Site B Score Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-cs-text">{scanB.website?.domain}</span>
                  <span className="font-mono font-bold text-sm text-cs-text">{scanB.score}/100</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-cs-purple transition-all duration-700"
                    style={{ width: `${scanB.score || 0}%` }}
                  />
                </div>
              </div>
            </div>

            <p className="text-[11px] text-cs-muted pt-2 border-t border-cs-border leading-tight">
              Deterministic transparency ratings based on observable tracking, consent, security, and user-control indicators.
            </p>
          </Card>

          {/* Section 3: Metric Comparison Table */}
          <Card padding="none" className="overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-cs-border">
              <h3 className="text-base font-bold text-cs-text font-sans">
                Key Telemetry Observations
              </h3>
              <p className="text-xs text-cs-muted mt-0.5">
                Side-by-side comparison of empirical crawler metrics.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs" aria-label="Comparison Table">
                <thead className="bg-slate-50/70 border-b border-cs-border text-cs-muted uppercase text-[10px] font-semibold tracking-wider">
                  <tr>
                    <th scope="col" className="py-3 px-5">Telemetry Metric</th>
                    <th scope="col" className="py-3 px-5 text-cs-primary">{scanA.website?.domain} (A)</th>
                    <th scope="col" className="py-3 px-5 text-cs-purple">{scanB.website?.domain} (B)</th>
                    <th scope="col" className="py-3 px-5 text-right">Observation Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cs-border font-sans">
                  {/* Cookies */}
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-5 font-medium text-cs-text flex items-center gap-2">
                      <Cookie className="h-3.5 w-3.5 text-cs-muted" />
                      <span>Total Cookies Deposited</span>
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-cs-text">
                      {reportA?.metrics?.totalCookies ?? 0}
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-cs-text">
                      {reportB?.metrics?.totalCookies ?? 0}
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono text-[11px] text-cs-muted">
                      {(reportB?.metrics?.totalCookies ?? 0) - (reportA?.metrics?.totalCookies ?? 0) > 0 ? `+${(reportB?.metrics?.totalCookies ?? 0) - (reportA?.metrics?.totalCookies ?? 0)}` : (reportB?.metrics?.totalCookies ?? 0) - (reportA?.metrics?.totalCookies ?? 0)}
                    </td>
                  </tr>

                  {/* 3rd Party Cookies */}
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-5 font-medium text-cs-text flex items-center gap-2 pl-8">
                      <span>External 3rd-Party Cookies</span>
                    </td>
                    <td className="py-3.5 px-5 text-cs-text">
                      {reportA?.metrics?.thirdPartyCookies ?? 0}
                    </td>
                    <td className="py-3.5 px-5 text-cs-text">
                      {reportB?.metrics?.thirdPartyCookies ?? 0}
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono text-[11px] text-cs-muted">
                      {(reportB?.metrics?.thirdPartyCookies ?? 0) - (reportA?.metrics?.thirdPartyCookies ?? 0) > 0 ? `+${(reportB?.metrics?.thirdPartyCookies ?? 0) - (reportA?.metrics?.thirdPartyCookies ?? 0)}` : (reportB?.metrics?.thirdPartyCookies ?? 0) - (reportA?.metrics?.thirdPartyCookies ?? 0)}
                    </td>
                  </tr>

                  {/* Trackers */}
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-5 font-medium text-cs-text flex items-center gap-2">
                      <Radio className="h-3.5 w-3.5 text-cs-muted" />
                      <span>Third-Party Tracker Domains</span>
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-cs-text">
                      {reportA?.metrics?.totalTrackers ?? 0}
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-cs-text">
                      {reportB?.metrics?.totalTrackers ?? 0}
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono text-[11px] text-cs-muted">
                      {(reportB?.metrics?.totalTrackers ?? 0) - (reportA?.metrics?.totalTrackers ?? 0) > 0 ? `+${(reportB?.metrics?.totalTrackers ?? 0) - (reportA?.metrics?.totalTrackers ?? 0)}` : (reportB?.metrics?.totalTrackers ?? 0) - (reportA?.metrics?.totalTrackers ?? 0)}
                    </td>
                  </tr>

                  {/* Requests */}
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-5 font-medium text-cs-text flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5 text-cs-muted" />
                      <span>Outbound Telemetry Calls</span>
                    </td>
                    <td className="py-3.5 px-5 text-cs-text">
                      {reportA?.metrics?.thirdPartyRequests ?? 0}
                    </td>
                    <td className="py-3.5 px-5 text-cs-text">
                      {reportB?.metrics?.thirdPartyRequests ?? 0}
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono text-[11px] text-cs-muted">
                      {(reportB?.metrics?.thirdPartyRequests ?? 0) - (reportA?.metrics?.thirdPartyRequests ?? 0) > 0 ? `+${(reportB?.metrics?.thirdPartyRequests ?? 0) - (reportA?.metrics?.thirdPartyRequests ?? 0)}` : (reportB?.metrics?.thirdPartyRequests ?? 0) - (reportA?.metrics?.thirdPartyRequests ?? 0)}
                    </td>
                  </tr>

                  {/* Consent Banner */}
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-5 font-medium text-cs-text flex items-center gap-2">
                      <Sliders className="h-3.5 w-3.5 text-cs-muted" />
                      <span>Consent Banner Detected</span>
                    </td>
                    <td className="py-3.5 px-5">
                      <Badge variant={reportA?.consentBanner?.detected ? "success" : "neutral"} size="sm">
                        {reportA?.consentBanner?.detected ? "Yes" : "No"}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-5">
                      <Badge variant={reportB?.consentBanner?.detected ? "success" : "neutral"} size="sm">
                        {reportB?.consentBanner?.detected ? "Yes" : "No"}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-5 text-right text-cs-muted">
                      {reportA?.consentBanner?.detected === reportB?.consentBanner?.detected ? "Same" : "Differs"}
                    </td>
                  </tr>

                  {/* Reject Button */}
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-5 font-medium text-cs-text flex items-center gap-2 pl-8">
                      <span>Reject Option on Layer 1</span>
                    </td>
                    <td className="py-3.5 px-5">
                      <Badge variant={reportA?.consentBanner?.hasRejectButton ? "success" : "warning"} size="sm">
                        {reportA?.consentBanner?.hasRejectButton ? "Available" : "Missing / Sub-menu"}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-5">
                      <Badge variant={reportB?.consentBanner?.hasRejectButton ? "success" : "warning"} size="sm">
                        {reportB?.consentBanner?.hasRejectButton ? "Available" : "Missing / Sub-menu"}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-5 text-right text-cs-muted">
                      {reportA?.consentBanner?.hasRejectButton === reportB?.consentBanner?.hasRejectButton ? "Same" : "Differs"}
                    </td>
                  </tr>

                  {/* Findings */}
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-5 font-medium text-cs-text flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-cs-muted" />
                      <span>Audit Rule Findings</span>
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-cs-text">
                      {findingsA.length} observations
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-cs-text">
                      {findingsB.length} observations
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono text-[11px] text-cs-muted">
                      {findingsB.length - findingsA.length > 0 ? `+${findingsB.length - findingsA.length}` : findingsB.length - findingsA.length}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Section 4: Score Category Breakdown (Side-by-Side) */}
          <Card padding="md" className="space-y-5">
            <div className="border-b border-cs-border pb-3">
              <h3 className="text-base font-bold text-cs-text font-sans">
                Category Score Breakdown
              </h3>
              <p className="text-xs text-cs-muted mt-0.5">
                Deterministic weighting across the five standard CyberSentry evaluation pillars.
              </p>
            </div>

            <div className="space-y-4">
              {categoriesA.map((catA, i) => {
                const catB = categoriesB[i];

                return (
                  <div key={catA.name} className="p-3.5 rounded-xl bg-slate-50/70 border border-cs-border space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-cs-text">
                        {catA.name} <span className="font-normal text-cs-muted">({catA.weight})</span>
                      </span>

                      <div className="flex items-center gap-4 text-xs font-mono font-medium">
                        <span className="text-cs-primary">{scanA.website?.domain}: {catA.score}</span>
                        <span className="text-cs-border">|</span>
                        <span className="text-cs-purple">{scanB.website?.domain}: {catB.score}</span>
                      </div>
                    </div>

                    {/* Comparative Dual Bars */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-cs-primary transition-all duration-700"
                          style={{ width: `${catA.score}%` }}
                        />
                      </div>
                      <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-cs-purple transition-all duration-700"
                          style={{ width: `${catB.score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Section 5: Key Differences (Objective & Data-Backed) */}
          <Card padding="md" className="space-y-4">
            <div className="flex items-center gap-2.5 border-b border-cs-border pb-3">
              <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Lightbulb className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-cs-text font-sans">
                  Key Empirical Differences
                </h3>
                <p className="text-xs text-cs-muted">
                  Deterministic variance observed between the two audited targets.
                </p>
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              {keyDifferences.length === 0 ? (
                <p className="text-xs text-cs-muted py-2">
                  No substantial variance was detected between these two audits.
                </p>
              ) : (
                keyDifferences.map((diffText, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 border border-cs-border flex items-start gap-3"
                  >
                    <span className="h-5 w-5 rounded-full bg-cs-primary-soft text-cs-primary flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs text-cs-text leading-relaxed">
                      {diffText}
                    </p>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Section 6: Action Footer */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
            <Link href="/history">
              <Button variant="outline" size="md" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to History</span>
              </Button>
            </Link>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link href={`/scan/${scanA.id}`}>
                <Button variant="secondary" size="md" className="gap-2">
                  <span>View {scanA.website?.domain} Report</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </Link>

              <Link href={`/scan/${scanB.id}`}>
                <Button variant="primary" size="md" className="gap-2 shadow-xs font-semibold">
                  <span>View {scanB.website?.domain} Report</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </Link>
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
          <div className="h-8 w-8 rounded-full border-2 border-cs-border border-t-cs-primary animate-spin mb-3" />
          <p className="text-xs font-mono text-cs-muted">Loading comparison data...</p>
        </div>
      }
    >
      <CompareContent />
    </Suspense>
  );
}
