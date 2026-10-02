"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  RotateCw,
  ExternalLink,
  Download,
  Printer,
  Shield,
  FileText,
  AlertTriangle,
  Cookie,
  Radio,
  Sliders,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Globe,
  Sparkles,
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
import {
  Card,
  Badge,
  Button,
  Tabs,
  TabItem,
  SectionHeader,
} from "@/components/ui";

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
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch full report data once scan completes
  const fetchCompletedReportData = useCallback(async (id: string) => {
    try {
      const [reportRes, cookiesRes, trackersRes, findingsRes] = await Promise.all([
        api.getReport(id).catch(() => null),
        api.getCookies(id).catch(() => ({ success: true, data: { cookies: [], count: 0 } })),
        api.getTrackers(id).catch(() => ({ success: true, data: { requests: [], count: 0 } })),
        api.getFindings(id).catch(() => ({ success: true, data: { findings: [], count: 0 } })),
      ]);

      if (reportRes?.success && reportRes.data) {
        setReport(reportRes.data);
        if (reportRes.data.consentBanner) {
          setBanner(reportRes.data.consentBanner);
        }
      }
      if (cookiesRes?.success) setCookies(cookiesRes.data.cookies || []);
      if (trackersRes?.success) setTrackers(trackersRes.data.requests || []);
      if (findingsRes?.success) setFindings(findingsRes.data.findings || []);
    } catch (err: any) {
      console.error("Error loading completed report elements:", err);
    }
  }, []);

  // Poll scan state every 1.5 seconds until done or failed
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

  const handleExportJson = () => {
    const payload = {
      scan,
      report,
      cookies,
      trackers,
      findings,
      banner,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cybersentry-audit-${scan?.website?.domain || scanId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintPdf = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // Compute scoring breakdown percentages based on project categories
  const categoryScores = useMemo(() => {
    let trackingDed = 0;
    let consentDed = 0;
    let securityDed = 0;
    let userControlDed = 0;
    let educationDed = 0;

    for (const f of findings) {
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

    const trackingPct = Math.max(10, Math.min(100, Math.round(((25 - trackingDed) / 25) * 100)));
    const consentPct = Math.max(10, Math.min(100, Math.round(((30 - consentDed) / 30) * 100)));
    const securityPct = Math.max(10, Math.min(100, Math.round(((15 - securityDed) / 15) * 100)));
    const userControlPct = Math.max(10, Math.min(100, Math.round(((20 - userControlDed) / 20) * 100)));
    const educationPct = Math.max(10, Math.min(100, Math.round(((10 - educationDed) / 10) * 100)));

    return [
      { name: "Tracking Transparency", weight: "25%", score: trackingPct },
      { name: "Consent Integrity", weight: "30%", score: consentPct },
      { name: "Security Posture", weight: "15%", score: securityPct },
      { name: "User Control", weight: "20%", score: userControlPct },
      { name: "Education & Clarity", weight: "10%", score: educationPct },
    ];
  }, [findings]);

  // Extract top 3-5 key findings for the executive insights card
  const keyInsights = useMemo(() => {
    if (findings.length === 0) return [];
    return [...findings]
      .sort((a, b) => (b.scoreDeduction || 0) - (a.scoreDeduction || 0))
      .slice(0, 4);
  }, [findings]);

  // Extract top 4 trackers for the preview box
  const topTrackers = useMemo(() => {
    const domainCounts = new Map<string, { count: number; category: string }>();
    for (const t of trackers) {
      if (t.isThirdParty) {
        let cat = "Other";
        if (/doubleclick|facebook|adnxs|criteo|amazon-ad/i.test(t.domain)) cat = "Advertising";
        else if (/analytics|google-analytics|segment|mixpanel/i.test(t.domain)) cat = "Analytics";
        else if (/twitter|linkedin|tiktok|instagram/i.test(t.domain)) cat = "Social";

        const current = domainCounts.get(t.domain) || { count: 0, category: cat };
        domainCounts.set(t.domain, { count: current.count + 1, category: cat });
      }
    }
    return Array.from(domainCounts.entries())
      .map(([domain, data]) => ({ domain, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [trackers]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="h-10 w-10 rounded-full border-2 border-cs-border border-t-cs-primary animate-spin mb-4" />
        <p className="text-xs font-mono text-cs-muted">Loading audit report...</p>
      </div>
    );
  }

  // If scan is still running or failed, show the StatusStepper
  if (!scan || scan.status !== "completed") {
    return (
      <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
        <StatusStepper
          status={scan?.status || "pending"}
          url={scan?.website?.url || "Target Website"}
          errorMessage={error || scan?.errorMessage}
          onRetry={handleRetry}
          cookiesCount={cookies.length}
          trackersCount={trackers.length}
          requestsCount={trackers.length}
          consentElementsCount={banner ? 1 : 0}
        />
      </div>
    );
  }

  // Scan is COMPLETED -> Render Screen 2 Approved Report
  const website = scan.website;
  const metrics = report?.metrics || {
    totalCookies: cookies.length,
    thirdPartyCookies: cookies.filter((c) => c.isThirdParty).length,
    totalTrackers: topTrackers.length,
    thirdPartyRequests: trackers.filter((t) => t.isThirdParty).length,
    durationMs: scan.durationMs || 0,
  };

  const bannerDetected = banner?.detected || findings.some((f) => f.ruleId === "RULE_BANNER_FOUND");
  const cmpName = banner?.cmpName || null;

  const recommendations =
    report?.recommendations && report.recommendations.length > 0
      ? report.recommendations
      : [
          "Deploy a standardized Consent Management Platform with balanced choices.",
          "Ensure third-party advertising scripts remain deferred until affirmative consent is given.",
          "Add Secure and HttpOnly flags to server-managed persistent cookies.",
          "Limit advertising and tracker cookie lifespans to 12 months or less.",
        ];

  const tabItems: TabItem[] = [
    { id: "overview", label: "Overview" },
    { id: "cookies", label: "Cookies", count: metrics.totalCookies },
    { id: "trackers", label: "Trackers", count: trackers.filter((t) => t.isThirdParty).length },
    { id: "consent", label: "Consent" },
    { id: "findings", label: "Findings", count: findings.length },
    { id: "recommendations", label: "Recommendations", count: recommendations.length },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      
      {/* ====================================================================
          1. REPORT HEADER CARD (Domain, URL, Metadata & Actions)
         ==================================================================== */}
      <Card padding="md" className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Identity & Breadcrumb */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-medium text-cs-muted">
              <Link href="/history" className="hover:text-cs-primary transition-colors flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" />
                <span>Reports</span>
              </Link>
              <span>/</span>
              <span className="text-cs-text font-semibold">
                {website?.domain || "Audit Report"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-cs-text font-sans">
                {website?.domain || "Target Website"}
              </h1>

              {website?.url && (
                <a
                  href={website.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cs-muted hover:text-cs-primary transition-colors"
                  title="Open site in new tab"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}

              <Badge variant="success" size="sm" dot>
                Completed
              </Badge>
            </div>

            <p className="text-xs text-cs-muted font-mono truncate max-w-xl">
              {website?.url}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 print:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="gap-1.5 text-xs shadow-xs"
            >
              <RotateCw className="h-3.5 w-3.5 text-cs-muted" />
              <span>Re-scan</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportJson}
              className="gap-1.5 text-xs shadow-xs"
            >
              <Download className="h-3.5 w-3.5 text-cs-muted" />
              <span>Export JSON</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handlePrintPdf}
              className="gap-1.5 text-xs shadow-xs font-semibold"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / PDF</span>
            </Button>
          </div>
        </div>

        {/* Metadata sub-bar */}
        <div className="pt-3 border-t border-cs-border flex flex-wrap items-center gap-4 text-xs text-cs-muted">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-cs-muted" />
            <span>Scanned: {formatDate(scan.createdAt)}</span>
          </div>
          <div>
            <span>Duration: </span>
            <span className="font-semibold text-cs-text">{formatDuration(scan.durationMs)}</span>
          </div>
          <div className="font-mono text-[11px]">
            <span>Scan ID: #{scan.id.slice(0, 8).toUpperCase()}</span>
          </div>
        </div>
      </Card>

      {/* ====================================================================
          2. EXECUTIVE SCORE CARD & SUMMARY METRICS
         ==================================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column (5 cols): Circular Score Gauge */}
        <div className="lg:col-span-4 flex flex-col">
          <ScoreGauge
            score={scan.score ?? 0}
            grade={scan.grade ?? "F"}
            className="h-full"
          />
        </div>

        {/* Right Column (8 cols): 4 Summary Metric Cards */}
        <div className="lg:col-span-8 flex flex-col justify-between">
          <MetricsGrid
            metrics={metrics}
            bannerDetected={bannerDetected}
            cmpName={cmpName}
            banner={banner}
            findings={findings}
          />
        </div>
      </section>

      {/* ====================================================================
          3. TAB NAVIGATION BAR
         ==================================================================== */}
      <div className="border-b border-cs-border print:hidden">
        <Tabs
          items={tabItems}
          activeId={activeTab}
          onChange={setActiveTab}
          variant="underline"
        />
      </div>

      {/* ====================================================================
          4. TAB CONTENTS
         ==================================================================== */}
      
      {/* TAB 1: OVERVIEW (Balanced 2-Column Grid Matching Screen 2) */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column (6 cols): Key Insights & Score Breakdown */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Card 1: Key Insights */}
              <Card padding="md" className="space-y-4">
                <div className="border-b border-cs-border pb-3">
                  <h3 className="text-base font-bold text-cs-text font-sans">
                    Key Insights
                  </h3>
                  <p className="text-xs text-cs-muted mt-0.5">
                    Highest-priority observations identified during the automated audit crawl.
                  </p>
                </div>

                {keyInsights.length === 0 ? (
                  <div className="p-6 text-center bg-slate-50 rounded-xl border border-cs-border">
                    <CheckCircle2 className="h-6 w-6 text-cs-success mx-auto mb-1.5" />
                    <p className="text-xs font-semibold text-cs-text">
                      No high-priority tracking risks detected
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {keyInsights.map((insight) => {
                      const isHigh =
                        insight.severity === "critical" || insight.severity === "high";

                      return (
                        <div
                          key={insight.id}
                          className="p-3.5 rounded-xl border border-cs-border bg-cs-surface flex items-start gap-3 hover:border-slate-300 transition-colors"
                        >
                          <div
                            className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                              isHigh
                                ? "bg-cs-danger-soft text-cs-danger"
                                : "bg-cs-primary-soft text-cs-primary"
                            }`}
                          >
                            <Shield className="h-4 w-4" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <h4 className="text-xs font-bold text-cs-text truncate">
                                {insight.title}
                              </h4>
                              <Badge
                                variant={isHigh ? "danger" : "warning"}
                                size="sm"
                                className="uppercase text-[10px]"
                              >
                                {insight.severity}
                              </Badge>
                            </div>
                            <p className="text-xs text-cs-muted leading-relaxed line-clamp-2">
                              {insight.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>

              {/* Card 2: Privacy Score Breakdown */}
              <Card padding="md" className="space-y-4">
                <div className="border-b border-cs-border pb-3">
                  <h3 className="text-base font-bold text-cs-text font-sans">
                    Privacy Score Breakdown
                  </h3>
                  <p className="text-xs text-cs-muted mt-0.5">
                    Deterministic category ratings based on observable client-side telemetry.
                  </p>
                </div>

                <div className="space-y-3.5">
                  {categoryScores.map((cat) => (
                    <div key={cat.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-cs-text">
                          {cat.name}{" "}
                          <span className="text-cs-muted font-normal">
                            ({cat.weight})
                          </span>
                        </span>
                        <span className="font-semibold text-cs-text">
                          {cat.score}/100
                        </span>
                      </div>

                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            cat.score >= 80
                              ? "bg-cs-success"
                              : cat.score >= 60
                              ? "bg-cs-primary"
                              : cat.score >= 40
                              ? "bg-amber-500"
                              : "bg-cs-danger"
                          }`}
                          style={{ width: `${cat.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

            </div>

            {/* Right Column (6 cols): Consent Banner Analysis & Top Trackers */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Card 3: Consent Banner Analysis */}
              <Card padding="md" className="space-y-4">
                <div className="border-b border-cs-border pb-3">
                  <h3 className="text-base font-bold text-cs-text font-sans">
                    Consent Banner Analysis
                  </h3>
                  <p className="text-xs text-cs-muted mt-0.5">
                    Choice architecture balance observed on page load.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50/70 border border-cs-border space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-cs-muted block text-[11px]">Notice Detected</span>
                      <span className="font-semibold text-cs-text">
                        {bannerDetected ? (cmpName || "Yes (CMP Detected)") : "No Notice"}
                      </span>
                    </div>

                    <div>
                      <span className="text-cs-muted block text-[11px]">Reject Button</span>
                      <span className="font-semibold text-cs-text">
                        {banner?.hasRejectButton ? "Available on Layer 1" : "Missing / Concealed"}
                      </span>
                    </div>

                    <div>
                      <span className="text-cs-muted block text-[11px]">Accept Button</span>
                      <span className="font-semibold text-cs-text">
                        {banner?.hasAcceptButton ? "Yes (1-Click)" : "None"}
                      </span>
                    </div>

                    <div>
                      <span className="text-cs-muted block text-[11px]">Preselected Checkboxes</span>
                      <span className="font-semibold text-cs-text">
                        {banner?.rawMetadata?.optionIndicators?.detected ? "Observed" : "None"}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Card 4: Top Trackers Overview */}
              <Card padding="md" className="space-y-4">
                <div className="flex items-center justify-between border-b border-cs-border pb-3">
                  <div>
                    <h3 className="text-base font-bold text-cs-text font-sans">
                      Top Trackers
                    </h3>
                    <p className="text-xs text-cs-muted mt-0.5">
                      Leading third-party telemetry domains observed.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab("trackers")}
                    className="text-xs font-semibold text-cs-primary hover:text-cs-primary-hover transition-colors"
                  >
                    View all →
                  </button>
                </div>

                {topTrackers.length === 0 ? (
                  <div className="p-6 text-center bg-slate-50 rounded-xl border border-cs-border">
                    <Radio className="h-6 w-6 text-cs-muted mx-auto mb-1 opacity-50" />
                    <p className="text-xs font-semibold text-cs-text">
                      No third-party trackers detected
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {topTrackers.map((t) => (
                      <div
                        key={t.domain}
                        className="p-3 rounded-xl border border-cs-border bg-cs-surface flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Globe className="h-4 w-4 text-cs-muted shrink-0" />
                          <span className="font-mono font-medium text-cs-text truncate">
                            {t.domain}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="neutral" size="sm">
                            {t.category}
                          </Badge>
                          <span className="text-[11px] font-mono text-cs-muted">
                            {t.count} calls
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

            </div>

          </div>

          {/* Full-Width Bottom: Recommendations */}
          <Card padding="md" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cs-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Lightbulb className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-cs-text font-sans">
                    Actionable Recommendations
                  </h3>
                  <p className="text-xs text-cs-muted">
                    Technical steps to improve privacy transparency and privacy posture.
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportJson}
                className="gap-1.5 text-xs shadow-xs self-start sm:self-auto print:hidden"
              >
                <Download className="h-3.5 w-3.5 text-cs-muted" />
                <span>Download Report</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-cs-border bg-slate-50/60 flex items-start gap-3"
                >
                  <span className="h-5 w-5 rounded-full bg-cs-primary-soft text-cs-primary flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs text-cs-text leading-relaxed">
                    {rec}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: COOKIES */}
      {activeTab === "cookies" && (
        <CookieTable cookies={cookies} />
      )}

      {/* TAB 3: TRACKERS */}
      {activeTab === "trackers" && (
        <TrackerChart requests={trackers} />
      )}

      {/* TAB 4: CONSENT */}
      {activeTab === "consent" && (
        <ConsentCard banner={banner} metrics={metrics} />
      )}

      {/* TAB 5: FINDINGS */}
      {activeTab === "findings" && (
        <FindingsList findings={findings} />
      )}

      {/* TAB 6: RECOMMENDATIONS */}
      {activeTab === "recommendations" && (
        <Card padding="lg" className="space-y-6">
          <SectionHeader
            title="Privacy Remediation Roadmap"
            description="Prioritized steps derived from empirical crawler deductions."
          />

          <div className="space-y-3.5">
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-cs-border bg-cs-surface flex items-start gap-4 shadow-xs"
              >
                <div className="h-7 w-7 rounded-lg bg-cs-primary-soft text-cs-primary flex items-center justify-center font-bold text-xs shrink-0">
                  {idx + 1}
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-cs-text">
                    Remediation Action #{idx + 1}
                  </h4>
                  <p className="text-xs text-cs-muted leading-relaxed">
                    {rec}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

    </div>
  );
}
