"use client";

import { useEffect, useState, useCallback } from "react";
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
  CheckCircle2,
  AlertTriangle,
  Cookie,
  Radio,
  Sliders,
  ListOrdered,
  Layers,
  ChevronRight,
  Barcode,
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
  PaperCard,
  FolderTab,
  FolderCard,
  EditorialBadge,
  FileLabel,
  SectionHeader,
  StampBadge,
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
  const [activeNav, setActiveNav] = useState("overview");

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
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `cybersentry-${scan?.website?.domain || "audit"}-${scanId.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(downloadUrl);
  };

  const handlePrintPdf = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="h-10 w-10 rounded-full border-2 border-cs-border border-t-cs-denim animate-spin mb-4" />
        <p className="text-xs font-mono text-cs-muted">Loading audit profile...</p>
      </div>
    );
  }

  // If scan is still running or failed, show the redesigned StatusStepper
  if (!scan || scan.status !== "completed") {
    return (
      <div className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-cs-muted hover:text-cs-ink transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to URL Scanner</span>
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

  // Scan is COMPLETED -> Render Full Privacy Dossier
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

  const recommendations =
    report?.recommendations && report.recommendations.length > 0
      ? report.recommendations
      : [
          "Deploy a standardized Consent Management Platform with balanced choices.",
          "Ensure third-party advertising scripts remain deferred until affirmative consent is given.",
          "Add Secure and HttpOnly flags to server-managed persistent cookies.",
          "Limit advertising and tracker cookie lifespans to 12 months or less.",
        ];

  const navSections = [
    { id: "overview", label: "Overview", icon: FileText },
    { id: "cookies", label: "Cookies", count: metrics.totalCookies, icon: Cookie },
    { id: "trackers", label: "Trackers", count: metrics.totalTrackers, icon: Radio },
    { id: "consent", label: "Consent", icon: Sliders },
    { id: "findings", label: "Findings", count: findings.length, icon: AlertTriangle },
    { id: "recommendations", label: "Recommendations", count: recommendations.length, icon: ListOrdered },
  ];

  const scrollToSection = (id: string) => {
    setActiveNav(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* ====================================================================
          1. REPORT DOSSIER HEADER
         ==================================================================== */}
      <div className="space-y-2">
        {/* Top Folder Tab Header */}
        <div className="flex items-end justify-between px-1">
          <FolderTab color="denim" size="md">
            PRIVACY DOSSIER
          </FolderTab>
          <div className="hidden sm:flex items-center gap-3 pb-1">
            <span className="font-mono text-xs text-cs-muted">
              SCAN ID: #{scan.id.slice(0, 8).toUpperCase()}
            </span>
            <StampBadge color="denim" rotate="none">
              EVIDENCE VERIFIED
            </StampBadge>
          </div>
        </div>

        {/* Dossier Card Container */}
        <div className="rounded-2xl rounded-tl-none border border-cs-border bg-cs-paper p-6 sm:p-8 shadow-paper text-cs-ink space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Target Identity */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Link
                  href="/history"
                  className="text-xs font-mono text-cs-muted hover:text-cs-denim transition-colors flex items-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" />
                  <span>Audits</span>
                </Link>
                <span className="text-cs-muted/60">/</span>
                <span className="text-xs font-mono text-cs-denim font-semibold">
                  {website?.domain || "Report"}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display text-cs-ink flex items-center gap-3">
                <span>{metrics.websiteTitle || website?.domain}</span>
                {website?.url && (
                  <a
                    href={website.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cs-muted hover:text-cs-denim transition-colors"
                    title="Open website in new tab"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </h1>

              <p className="text-xs font-mono text-cs-muted mt-1 break-all">
                Target URL: {website?.url}
              </p>
            </div>

            {/* Audit Metadata & Actions */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
              <div className="px-3 py-1.5 rounded-lg bg-cs-cream/60 border border-cs-border text-cs-ink flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-cs-muted" />
                <span>{formatDate(scan.createdAt)}</span>
              </div>

              <div className="px-3 py-1.5 rounded-lg bg-cs-cream/60 border border-cs-border text-cs-ink flex items-center gap-1.5">
                <span className="text-cs-muted">Duration:</span>
                <span className="font-bold text-cs-denim">
                  {formatDuration(scan.durationMs)}
                </span>
              </div>

              {/* Re-Audit Button */}
              <button
                onClick={handleRetry}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cs-paper border border-cs-border hover:border-cs-denim hover:text-cs-denim text-cs-ink transition-colors shadow-xs"
              >
                <RotateCw className="h-3.5 w-3.5" />
                <span>Re-Audit</span>
              </button>

              {/* Export JSON Button */}
              <button
                onClick={handleExportJson}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cs-paper border border-cs-border hover:border-cs-denim hover:text-cs-denim text-cs-ink transition-colors shadow-xs"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export JSON</span>
              </button>

              {/* Print / PDF Button */}
              <button
                onClick={handlePrintPdf}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cs-denim text-white hover:bg-cs-denim-dark transition-colors shadow-xs font-semibold"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print / PDF →</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          2. ASYMMETRIC MAIN DOSSIER LAYOUT (Sticky Index + Report Stream)
         ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Dossier Index / Sidebar (Desktop Only) */}
        <div className="hidden lg:block lg:col-span-3 sticky top-24 space-y-4">
          <div className="rounded-2xl border border-cs-border bg-cs-paper p-4 shadow-paper">
            <div className="border-b border-cs-border/80 pb-2 mb-3">
              <FileLabel code="DOSSIER INDEX" variant="muted" />
            </div>

            <nav className="space-y-1">
              {navSections.map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all text-left ${
                      isActive
                        ? "bg-cs-denim-light text-cs-denim font-bold border-l-3 border-cs-denim"
                        : "text-cs-muted hover:text-cs-ink hover:bg-cs-cream/50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      <span>{item.label}</span>
                    </div>

                    {item.count !== undefined && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-cs-border/50 text-cs-ink">
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="mt-6 pt-4 border-t border-cs-border/60 text-[10px] font-mono text-cs-muted/80 leading-relaxed">
              Empirical privacy evaluation. Observable telemetry recorded live.
            </div>
          </div>
        </div>

        {/* Right Main Column: Full Report Feed */}
        <div className="lg:col-span-9 space-y-10">
          
          {/* Mobile Horizontal Scrollable Index Bar */}
          <div className="block lg:hidden overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
            <div className="flex items-center gap-1.5 w-max">
              {navSections.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap border select-none transition-colors ${
                    activeNav === item.id
                      ? "bg-cs-denim text-white border-cs-denim font-bold"
                      : "bg-cs-paper border-cs-border text-cs-muted"
                  }`}
                >
                  {item.label}
                  {item.count !== undefined && ` (${item.count})`}
                </button>
              ))}
            </div>
          </div>

          {/* Section 1: Score & Executive Verdict */}
          <section id="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Score Gauge */}
              <div className="md:col-span-5">
                <ScoreGauge
                  score={scan.score ?? 0}
                  grade={scan.grade ?? "F"}
                  className="h-full"
                />
              </div>

              {/* Executive Privacy Verdict Box */}
              <div className="md:col-span-7 rounded-2xl border border-cs-border bg-cs-paper p-6 sm:p-7 shadow-paper text-cs-ink flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between border-b border-cs-border/70 pb-3 mb-3">
                    <FileLabel code="EXECUTIVE_VERDICT" variant="muted" />
                    <EditorialBadge variant="denim" size="xs">
                      Empirical Telemetry
                    </EditorialBadge>
                  </div>

                  <h3 className="text-xl font-bold font-display text-cs-ink">
                    Privacy Transparency Verdict
                  </h3>

                  <p className="mt-3 text-sm text-cs-ink leading-relaxed font-sans">
                    {report?.summary ||
                      `Privacy transparency audit for ${website?.domain}: Score ${scan.score}/100, Grade ${scan.grade}. Telemetry indicates observable tracker volume and consent choice balance.`}
                  </p>

                  {/* High-Level Counter Badges */}
                  <div className="mt-5 grid grid-cols-3 gap-2.5 text-center font-mono">
                    <div className="p-2.5 rounded-xl bg-cs-cream/50 border border-cs-border">
                      <span className="text-[10px] text-cs-muted uppercase block">
                        First-Party
                      </span>
                      <span className="text-lg font-bold text-cs-ink">
                        {Math.max(0, (metrics.totalCookies || 0) - (metrics.thirdPartyCookies || 0))}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-cs-cream/50 border border-cs-border">
                      <span className="text-[10px] text-cs-muted uppercase block">
                        3rd-Party
                      </span>
                      <span className="text-lg font-bold text-cs-warning">
                        {metrics.thirdPartyCookies}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-cs-cream/50 border border-cs-border">
                      <span className="text-[10px] text-cs-muted uppercase block">
                        Trackers
                      </span>
                      <span className="text-lg font-bold text-cs-danger">
                        {metrics.totalTrackers}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-cs-border/60 text-[11px] font-sans text-cs-muted flex items-start gap-2">
                  <Shield className="h-4 w-4 text-cs-muted shrink-0 mt-0.5" />
                  <span>
                    Disclaimer: This assessment measures observable client-side telemetry and banner choice friction. It does not constitute a formal legal audit or GDPR compliance certification.
                  </span>
                </div>
              </div>
            </div>

            {/* Summary Metrics Grid */}
            <MetricsGrid
              metrics={metrics}
              bannerDetected={bannerDetected}
              cmpName={cmpName}
              banner={banner}
              findings={findings}
            />
          </section>

          {/* Section 2: Tracker Directory */}
          <section id="trackers">
            <TrackerChart requests={trackers} />
          </section>

          {/* Section 3: Consent Audit */}
          <section id="consent">
            <ConsentCard banner={banner} metrics={metrics} />
          </section>

          {/* Section 4: Evidence-Based Findings */}
          <section id="findings">
            <FindingsList findings={findings} />
          </section>

          {/* Section 5: Actionable Recommendations */}
          <section id="recommendations" className="rounded-2xl border border-cs-border bg-cs-paper p-6 sm:p-7 shadow-paper text-cs-ink space-y-5">
            <div className="flex items-center justify-between border-b border-cs-border/80 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <FileLabel code="REMEDIATION_GUIDE" variant="muted" />
                  <EditorialBadge variant="olive" size="xs">
                    {recommendations.length} Action Items
                  </EditorialBadge>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold font-display text-cs-ink">
                  Actionable Recommendations
                </h3>
                <p className="text-xs text-cs-muted font-sans mt-0.5">
                  Remediation steps tied directly to the observed score deductions and tracking behaviors.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-cs-border bg-cs-paper hover:bg-cs-cream/30 transition-colors flex items-start gap-3.5 text-xs font-sans text-cs-ink"
                >
                  <div className="h-6 w-6 rounded-full bg-cs-olive-light text-cs-olive border border-cs-olive/30 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="flex-1 leading-relaxed">
                    {rec}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-cs-border/60 text-center text-xs font-mono text-cs-muted">
              Applying these changes directly addresses observed privacy friction and improves site transparency.
            </div>
          </section>

          {/* Section 6: Stored Cookie Ledger */}
          <section id="cookies">
            <CookieTable cookies={cookies} />
          </section>

          {/* Bottom Export Bar */}
          <div className="p-6 rounded-2xl border border-cs-border bg-cs-cream/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-cs-ink font-sans">
                Export & Archive Audit Dossier
              </h4>
              <p className="text-xs text-cs-muted font-mono mt-0.5">
                Download verified audit JSON artifact or print full dossier report.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleExportJson}
                className="px-4 py-2 rounded-xl text-xs font-mono font-semibold bg-cs-paper border border-cs-border hover:border-cs-denim text-cs-ink transition-colors shadow-xs"
              >
                EXPORT JSON →
              </button>
              <button
                onClick={handlePrintPdf}
                className="px-4 py-2 rounded-xl text-xs font-mono font-semibold bg-cs-denim text-white hover:bg-cs-denim-dark transition-colors shadow-xs"
              >
                PRINT / PDF →
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
