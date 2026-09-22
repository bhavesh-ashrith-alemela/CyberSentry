"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  Clock,
  RotateCw,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  FileText,
} from "lucide-react";
import { api } from "@/lib/api";
import {
  Scan,
  Report,
  Finding,
  CookieRecord,
  NetworkRequest,
  ConsentBanner,
} from "@/lib/types";
import { formatDate, formatDuration } from "@/lib/formatters";
import { ScoreGauge } from "@/components/ScoreGauge";
import { MetricsGrid } from "@/components/MetricsGrid";
import { ConsentCard } from "@/components/ConsentCard";
import { FindingsList } from "@/components/FindingsList";
import { TrackerChart } from "@/components/TrackerChart";
import { CookieTable } from "@/components/CookieTable";
import { StatusStepper } from "@/components/StatusStepper";

export default function ScanReportPage() {
  const params = useParams();
  const router = useRouter();
  const scanId = params.id as string;

  const [scan, setScan] = useState<Scan | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [cookies, setCookies] = useState<CookieRecord[]>([]);
  const [trackers, setTrackers] = useState<NetworkRequest[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [banner, setBanner] = useState<ConsentBanner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch full report data once scan completes
  const fetchCompletedReportData = useCallback(async (id: string) => {
    try {
      const [reportRes, cookiesRes, trackersRes, findingsRes] = await Promise.all([
        api.getReport(id).catch(() => null),
        api.getCookies(id).catch(() => ({ success: true, data: { cookies: [], count: 0 } })),
        api.getTrackers(id).catch(() => ({ success: true, data: { requests: [], count: 0 } })),
        api.getFindings(id).catch(() => ({ success: true, data: { findings: [], count: 0 } })),
      ]);

      if (reportRes?.success) setReport(reportRes.data);
      if (cookiesRes?.success) setCookies(cookiesRes.data.cookies || []);
      if (trackersRes?.success) setTrackers(trackersRes.data.requests || []);
      if (findingsRes?.success) setFindings(findingsRes.data.findings || []);
    } catch (err: any) {
      console.error("Error loading completed report elements:", err);
    }
  }, []);

  // Poll scan state
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    let isMounted = true;

    const checkStatus = async () => {
      try {
        const res = await api.getScan(scanId);
        if (!isMounted) return;

        if (res.success && res.data) {
          const currentScan = res.data;
          setScan(currentScan);
          setLoading(false);

          if (currentScan.status === "completed") {
            if (interval) clearInterval(interval);
            await fetchCompletedReportData(scanId);
          } else if (currentScan.status === "failed") {
            if (interval) clearInterval(interval);
            setError(currentScan.errorMessage || "Scan failed during crawl.");
          }
        }
      } catch (err: any) {
        if (!isMounted) return;
        setError(err.message || "Failed to retrieve scan status.");
        setLoading(false);
        if (interval) clearInterval(interval);
      }
    };

    checkStatus();

    // Poll every 1.5 seconds if scan is in progress
    interval = setInterval(() => {
      checkStatus();
    }, 1500);

    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
    };
  }, [scanId, fetchCompletedReportData]);

  const handleRetry = async () => {
    if (!scan?.website?.url) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.createScan(scan.website.url);
      if (res.success && res.data.scan.id) {
        router.push(`/scan/${res.data.scan.id}`);
      }
    } catch (err: any) {
      setError(err.message || "Retry failed.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="h-10 w-10 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin mb-4" />
        <p className="text-sm font-mono text-slate-400">Loading scan profile...</p>
      </div>
    );
  }

  // If scan is still running or failed, show the StatusStepper
  if (!scan || scan.status !== "completed") {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-300 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to URL Submission</span>
          </Link>
        </div>

        <StatusStepper
          status={scan?.status || "pending"}
          url={scan?.website?.url || "Target Website"}
          errorMessage={error || scan?.errorMessage}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  // Scan is COMPLETED -> Render Full Privacy Report
  const website = scan.website;
  const metrics = report?.metrics || {
    totalCookies: cookies.length,
    thirdPartyCookies: cookies.filter((c) => c.isThirdParty).length,
    totalTrackers: 0,
    thirdPartyRequests: trackers.filter((t) => t.isThirdParty).length,
    durationMs: scan.durationMs || 0,
  };

  const bannerDetected = findings.some((f) => f.ruleId === "RULE_BANNER_FOUND");
  const bannerFinding = findings.find((f) => f.ruleId === "RULE_BANNER_FOUND");
  const cmpName = bannerFinding?.evidence?.cmpName || null;

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-cyber-card border border-cyber-border shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/"
              className="text-xs font-mono text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Audits</span>
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-xs font-mono text-cyan-400">
              {website?.domain || "Report"}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 flex items-center gap-3">
            <span>{metrics.websiteTitle || website?.domain}</span>
            <a
              href={website?.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-slate-300 transition-colors"
              title="Open Target Website in New Tab"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </h1>

          <p className="text-xs font-mono text-slate-400 mt-1 break-all">
            Target URL: {website?.url}
          </p>
        </div>

        {/* Metadata Badges */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>{formatDate(scan.createdAt)}</span>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1.5">
            <span>Duration:</span>
            <span className="text-cyan-400 font-bold">
              {formatDuration(scan.durationMs)}
            </span>
          </div>

          <button
            onClick={handleRetry}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 transition-colors"
          >
            <RotateCw className="h-3.5 w-3.5" />
            <span>Re-Audit</span>
          </button>
        </div>
      </div>

      {/* Hero Score + Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Gauge */}
        <ScoreGauge
          score={scan.score ?? 0}
          grade={scan.grade ?? "F"}
          className="lg:col-span-1"
        />

        {/* Executive Summary & Transparency Notice */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-cyber-card border border-cyber-border flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-cyan-400" />
                <span>Executive Privacy Audit Summary</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Deterministic
              </span>
            </div>

            <p className="text-sm text-slate-200 leading-relaxed font-sans">
              {report?.summary ||
                `Privacy transparency audit for ${website?.domain}: Score ${scan.score}/100, Grade ${scan.grade}.`}
            </p>

            {/* Quick Metrics Pills */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">
                  First-Party Cookies
                </span>
                <span className="text-lg font-bold text-slate-200">
                  {metrics.totalCookies - metrics.thirdPartyCookies}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">
                  Third-Party Cookies
                </span>
                <span className="text-lg font-bold text-orange-400">
                  {metrics.thirdPartyCookies}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 col-span-2 sm:col-span-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">
                  Known Trackers
                </span>
                <span className="text-lg font-bold text-rose-400">
                  {metrics.totalTrackers}
                </span>
              </div>
            </div>
          </div>

          {/* Legal Notice Callout */}
          <div className="mt-6 pt-4 border-t border-cyber-border text-[11px] font-mono text-slate-500 flex items-start gap-2">
            <Shield className="h-4 w-4 text-slate-600 shrink-0 mt-0.5" />
            <span>
              Disclaimer: This assessment measures observable client-side telemetry and
              transparency heuristics. It does NOT constitute formal legal advice or GDPR/CCPA
              certification.
            </span>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <MetricsGrid
        metrics={metrics}
        bannerDetected={bannerDetected}
        cmpName={cmpName}
        findingsCount={findings.length}
      />

      {/* Consent Banner & Dark Pattern Heuristics Card */}
      <ConsentCard banner={banner} metrics={metrics} />

      {/* Tracker Visualizer & Actionable Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Outbound Network Request Distribution */}
        <TrackerChart requests={trackers} />

        {/* Actionable Recommendations Checklist */}
        <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border shadow-xl flex flex-col justify-between">
          <div>
            <div className="border-b border-cyber-border/80 pb-4 mb-4">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Technical Recommendations</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Remediation steps for developers and site operators to elevate privacy posture.
              </p>
            </div>

            <ul className="space-y-3">
              {(report?.recommendations || [
                "Deploy a standardized Consent Management Platform.",
                "Ensure all marketing pixels remain deferred until affirmative consent is given.",
                "Add Secure and HttpOnly flags to server-managed cookies.",
              ]).map((rec, i) => (
                <li
                  key={i}
                  className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5"
                >
                  <span className="h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 pt-3 border-t border-cyber-border text-center text-[11px] font-mono text-slate-500">
            Applying these remediations directly mitigates the identified score deductions.
          </div>
        </div>
      </div>

      {/* Evidence-based Findings List */}
      <FindingsList findings={findings} />

      {/* Stored Cookie Ledger Table */}
      <CookieTable cookies={cookies} />
    </div>
  );
}
