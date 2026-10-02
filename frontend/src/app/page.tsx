"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Globe,
  ArrowRight,
  ShieldCheck,
  Shield,
  Cookie,
  Radio,
  Sliders,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";
import { Scan, Report } from "@/lib/types";
import { formatDate } from "@/lib/formatters";
import {
  Card,
  MetricCard,
  Badge,
  Button,
  Input,
  SectionHeader,
} from "@/components/ui";

const QUICK_SITES = [
  { name: "example.com", url: "https://example.com" },
  { name: "wikipedia.org", url: "https://www.wikipedia.org" },
  { name: "github.com", url: "https://github.com" },
  { name: "bbc.com", url: "https://www.bbc.com" },
];

export default function HomePage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Real scan history & metrics from backend
  const [recentScans, setRecentScans] = useState<Scan[]>([]);
  const [loadingScans, setLoadingScans] = useState(true);
  const [errorScans, setErrorScans] = useState<string | null>(null);
  const [latestReport, setLatestReport] = useState<Report | null>(null);
  const [prevReport, setPrevReport] = useState<Report | null>(null);

  useEffect(() => {
    let isMounted = true;
    api
      .listScans({ page: 1, limit: 5 })
      .then(async (res) => {
        if (!isMounted) return;
        if (res.success && res.data) {
          const scans = res.data;
          setRecentScans(scans);

          // Find completed scans to display real aggregate metrics
          const completedScans = scans.filter((s) => s.status === "completed");
          if (completedScans.length > 0) {
            try {
              const repRes = await api.getReport(completedScans[0].id);
              if (isMounted && repRes.success && repRes.data) {
                setLatestReport(repRes.data);
              }
              if (completedScans.length > 1) {
                const prevRes = await api.getReport(completedScans[1].id);
                if (isMounted && prevRes.success && prevRes.data) {
                  setPrevReport(prevRes.data);
                }
              }
            } catch {
              // Non-fatal, metrics will fall back cleanly
            }
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          setErrorScans(err.message || "Unable to fetch recent scans.");
        }
      })
      .finally(() => {
        if (isMounted) setLoadingScans(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let targetUrl = url.trim();
    if (!targetUrl) {
      setError("Please enter a website URL to scan.");
      return;
    }

    // Auto-prefix https:// if protocol is omitted
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
      setUrl(targetUrl);
    }

    // Basic domain validation
    try {
      const parsed = new URL(targetUrl);
      if (!parsed.hostname.includes(".")) {
        setError("Please enter a valid domain name (e.g. example.com).");
        return;
      }
    } catch {
      setError("Invalid URL format. Please enter a valid HTTP/HTTPS address.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.createScan(targetUrl);
      if (res.success && res.data.scan.id) {
        router.push(`/scan/${res.data.scan.id}`);
      } else {
        throw new Error(res.error?.message || "Failed to initiate scan.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to start website audit. Please try again.");
      setLoading(false);
    }
  };

  const handleQuickSelect = (siteUrl: string) => {
    setUrl(siteUrl);
    setError(null);
  };

  // Helper for score badge styling
  const getScoreBadge = (score: number | null) => {
    if (score === null || score === undefined) {
      return <Badge variant="neutral" size="sm">Pending</Badge>;
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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 sm:space-y-12">
      
      {/* ====================================================================
          1. HERO / SCANNER SECTION (Two-column Desktop Layout)
         ==================================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        {/* Left Column (7 cols): Eyebrow, Heading, Description & Scanner */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2.5">
            <span className="text-[11px] font-semibold tracking-wider text-cs-primary uppercase block">
              YOUR PRIVACY. YOUR VISIBILITY.
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-cs-text font-sans leading-tight">
              See what websites track about you.
            </h1>
            <p className="text-sm sm:text-base text-cs-muted max-w-xl leading-relaxed">
              Scan a public website to understand its cookies, trackers, consent
              behaviour and privacy transparency.
            </p>
          </div>

          {/* Scanner Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
              <div className="flex-1">
                <label htmlFor="url-input" className="sr-only">
                  Website URL
                </label>
                <Input
                  id="url-input"
                  type="text"
                  placeholder="Enter website URL (e.g. example.com)"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (error) setError(null);
                  }}
                  leftIcon={<Globe className="h-4 w-4" />}
                  error={!!error}
                  disabled={loading}
                  className="h-12 text-sm shadow-xs"
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="h-12 px-6 shrink-0 font-semibold shadow-sm"
              >
                Scan Website →
              </Button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-cs-danger-soft text-cs-danger text-xs font-medium border border-red-200/60">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Quick Suggestions Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-cs-muted">
              <span className="text-[11px] font-medium mr-1">Quick test:</span>
              {QUICK_SITES.map((site) => (
                <button
                  key={site.name}
                  type="button"
                  onClick={() => handleQuickSelect(site.url)}
                  disabled={loading}
                  className="px-2.5 py-1 rounded-lg bg-cs-surface border border-cs-border hover:border-cs-primary hover:text-cs-primary text-[11px] font-mono transition-colors shadow-xs"
                >
                  {site.name}
                </button>
              ))}
            </div>
          </form>
        </div>

        {/* Right Column (5 cols): Illustrative Preview Cards (Matching Approved Mockup) */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="relative w-full max-w-sm">
            {/* Background Soft Mesh Glow */}
            <div className="absolute -inset-2 bg-gradient-to-tr from-blue-100/50 via-indigo-50/30 to-purple-100/40 rounded-3xl blur-xl -z-10" />

            <div className="p-6 rounded-2xl border border-cs-border bg-gradient-to-b from-white to-slate-50/50 shadow-md space-y-4">
              {/* Illustrative Target URL Badge */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-cs-primary-soft/60 border border-blue-100 text-xs font-mono text-cs-primary">
                <div className="flex items-center gap-2 truncate">
                  <Globe className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">https://example.com</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-cs-success font-semibold shrink-0">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Audited</span>
                </div>
              </div>

              {/* Illustrative Score Card Card */}
              <div className="p-5 rounded-xl bg-cs-surface border border-cs-border shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="h-11 w-11 rounded-xl bg-cs-primary-soft text-cs-primary flex items-center justify-center shrink-0">
                    <Shield className="h-6 w-6 fill-cs-primary/20 stroke-cs-primary" />
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-cs-muted uppercase tracking-wider block">
                      Privacy Score
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-2xl font-bold text-cs-text">78</span>
                      <span className="text-xs font-medium text-cs-muted">/100</span>
                    </div>
                  </div>
                </div>

                <Badge variant="success" size="sm" dot>
                  Good
                </Badge>
              </div>

              {/* Sample Indicator Caption */}
              <div className="flex items-center justify-between pt-1 text-[11px] text-cs-muted">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-cs-primary" />
                  <span>Deterministic Audit Preview</span>
                </span>
                <span className="font-mono text-[10px]">Sample</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. FOUR QUICK METRIC CARDS (Backed by Real Database Data)
         ==================================================================== */}
      <section className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1: Total Cookies */}
          <MetricCard
            label="Total Cookies"
            value={latestReport ? latestReport.metrics.totalCookies : "—"}
            icon={<Cookie className="h-4 w-4" />}
            delta={
              latestReport && prevReport
                ? `${latestReport.metrics.totalCookies >= prevReport.metrics.totalCookies ? "+" : ""}${
                    latestReport.metrics.totalCookies - prevReport.metrics.totalCookies
                  } vs. last scan`
                : latestReport
                ? "Recent scan data"
                : "No scans yet"
            }
            deltaType={
              latestReport && prevReport
                ? latestReport.metrics.totalCookies <= prevReport.metrics.totalCookies
                  ? "positive"
                  : "negative"
                : "neutral"
            }
          />

          {/* Metric 2: Network Requests */}
          <MetricCard
            label="Network Requests"
            value={latestReport ? latestReport.metrics.thirdPartyRequests : "—"}
            icon={<Radio className="h-4 w-4" />}
            delta={
              latestReport && prevReport
                ? `${latestReport.metrics.thirdPartyRequests >= prevReport.metrics.thirdPartyRequests ? "+" : ""}${
                    latestReport.metrics.thirdPartyRequests - prevReport.metrics.thirdPartyRequests
                  } vs. last scan`
                : latestReport
                ? "Outbound third-party"
                : "No scans yet"
            }
            deltaType="neutral"
          />

          {/* Metric 3: Trackers Found */}
          <MetricCard
            label="Trackers Found"
            value={latestReport ? latestReport.metrics.totalTrackers : "—"}
            icon={<Globe className="h-4 w-4" />}
            delta={
              latestReport && prevReport
                ? `${latestReport.metrics.totalTrackers >= prevReport.metrics.totalTrackers ? "+" : ""}${
                    latestReport.metrics.totalTrackers - prevReport.metrics.totalTrackers
                  } vs. last scan`
                : latestReport
                ? "Observed domains"
                : "No scans yet"
            }
            deltaType={
              latestReport && prevReport
                ? latestReport.metrics.totalTrackers <= prevReport.metrics.totalTrackers
                  ? "positive"
                  : "negative"
                : "neutral"
            }
          />

          {/* Metric 4: Privacy Score */}
          <MetricCard
            label="Privacy Score"
            value={latestReport ? `${latestReport.totalScore}/100` : "—"}
            icon={<ShieldCheck className="h-4 w-4" />}
            delta={
              latestReport && prevReport
                ? `${latestReport.totalScore >= prevReport.totalScore ? "↑" : "↓"} ${Math.abs(
                    latestReport.totalScore - prevReport.totalScore
                  )} vs. last scan`
                : latestReport
                ? `Grade ${latestReport.grade}`
                : "No scans yet"
            }
            deltaType={
              latestReport && prevReport
                ? latestReport.totalScore >= prevReport.totalScore
                  ? "positive"
                  : "negative"
                : "neutral"
            }
          />
        </div>
      </section>

      {/* ====================================================================
          3. RECENT SCANS SECTION (Real Database Records & Table/Card View)
         ==================================================================== */}
      <section className="space-y-4">
        <SectionHeader
          title="Recent Scans"
          action={
            <Link
              href="/history"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-cs-primary hover:text-cs-primary-hover transition-colors group"
            >
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          }
        />

        {/* Loading Skeleton */}
        {loadingScans ? (
          <Card padding="none" className="divide-y divide-cs-border">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-slate-200" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-32 bg-slate-200 rounded" />
                    <div className="h-3 w-20 bg-slate-100 rounded" />
                  </div>
                </div>
                <div className="h-6 w-16 bg-slate-200 rounded-full" />
              </div>
            ))}
          </Card>
        ) : errorScans ? (
          /* Error State */
          <Card padding="md" className="text-center py-8">
            <AlertCircle className="h-7 w-7 text-cs-danger mx-auto mb-2" />
            <p className="text-sm font-semibold text-cs-text">Unable to load recent scans</p>
            <p className="text-xs text-cs-muted mt-1">{errorScans}</p>
          </Card>
        ) : recentScans.length === 0 ? (
          /* Empty State */
          <Card padding="lg" className="text-center py-12 space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-slate-100 text-cs-muted flex items-center justify-center mx-auto">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-cs-text">No privacy scans yet</h3>
              <p className="text-xs text-cs-muted mt-1 max-w-sm mx-auto">
                Enter a website URL above to initiate your first automated telemetry audit.
              </p>
            </div>
          </Card>
        ) : (
          /* Table View (Desktop) & Card View (Mobile) */
          <Card padding="none" className="overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs" aria-label="Recent Scans Table">
                <thead className="bg-slate-50/70 border-b border-cs-border text-cs-muted uppercase text-[10px] font-semibold tracking-wider">
                  <tr>
                    <th scope="col" className="py-3.5 px-5">Website</th>
                    <th scope="col" className="py-3.5 px-4">Scan Date</th>
                    <th scope="col" className="py-3.5 px-4">Privacy Score</th>
                    <th scope="col" className="py-3.5 px-4">Status</th>
                    <th scope="col" className="py-3.5 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cs-border">
                  {recentScans.map((scan) => {
                    const domain = scan.website?.domain || scan.website?.url || "Unknown Website";
                    const statusVariant =
                      scan.status === "completed"
                        ? "success"
                        : scan.status === "failed"
                        ? "danger"
                        : "primary";

                    return (
                      <tr
                        key={scan.id}
                        onClick={() => router.push(`/scan/${scan.id}`)}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      >
                        {/* Domain & Favicon */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="h-7 w-7 rounded-lg bg-cs-primary-soft text-cs-primary flex items-center justify-center shrink-0">
                              <Globe className="h-3.5 w-3.5" />
                            </div>
                            <span className="font-semibold text-cs-text group-hover:text-cs-primary transition-colors text-sm">
                              {domain}
                            </span>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-4 text-cs-muted font-mono text-[11px]">
                          {formatDate(scan.createdAt)}
                        </td>

                        {/* Score */}
                        <td className="py-3.5 px-4">
                          {getScoreBadge(scan.score)}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <Badge variant={statusVariant} size="sm" dot className="capitalize">
                            {scan.status}
                          </Badge>
                        </td>

                        {/* Action Chevron */}
                        <td className="py-3.5 px-5 text-right">
                          <ChevronRight className="h-4 w-4 text-cs-muted group-hover:text-cs-primary group-hover:translate-x-0.5 transition-all inline-block" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List (Hidden on desktop) */}
            <div className="sm:hidden divide-y divide-cs-border">
              {recentScans.map((scan) => {
                const domain = scan.website?.domain || scan.website?.url || "Unknown Website";
                const statusVariant =
                  scan.status === "completed"
                    ? "success"
                    : scan.status === "failed"
                    ? "danger"
                    : "primary";

                return (
                  <div
                    key={scan.id}
                    onClick={() => router.push(`/scan/${scan.id}`)}
                    className="p-4 flex items-center justify-between gap-3 active:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-cs-primary-soft text-cs-primary flex items-center justify-center shrink-0">
                        <Globe className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-sm text-cs-text truncate">
                          {domain}
                        </h4>
                        <span className="text-[11px] text-cs-muted font-mono block">
                          {formatDate(scan.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <div className="flex flex-col items-end gap-1">
                        {getScoreBadge(scan.score)}
                        <Badge variant={statusVariant} size="sm" dot className="capitalize">
                          {scan.status}
                        </Badge>
                      </div>
                      <ChevronRight className="h-4 w-4 text-cs-muted" />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </section>

      {/* ====================================================================
          4. UNDERSTAND YOUR PRIVACY SECTION (Compact 4-Card Overview)
         ==================================================================== */}
      <section className="space-y-4">
        <SectionHeader
          eyebrow="WHAT CYBERSENTRY ANALYZES"
          title="Understand your privacy. Clearly."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Cookie Analysis */}
          <Card hover padding="md" className="space-y-2.5">
            <div className="h-9 w-9 rounded-xl bg-cs-primary-soft text-cs-primary flex items-center justify-center">
              <Cookie className="h-4.5 w-4.5" />
            </div>
            <h4 className="text-sm font-bold text-cs-text">Cookie Analysis</h4>
            <p className="text-xs text-cs-muted leading-relaxed">
              See what cookies are stored and how they are classified across first and third parties.
            </p>
          </Card>

          {/* Card 2: Tracker Detection */}
          <Card hover padding="md" className="space-y-2.5">
            <div className="h-9 w-9 rounded-xl bg-cs-primary-soft text-cs-primary flex items-center justify-center">
              <Radio className="h-4.5 w-4.5" />
            </div>
            <h4 className="text-sm font-bold text-cs-text">Tracker Detection</h4>
            <p className="text-xs text-cs-muted leading-relaxed">
              Identify third-party domains and tracking activity intercepted during page load.
            </p>
          </Card>

          {/* Card 3: Consent Audit */}
          <Card hover padding="md" className="space-y-2.5">
            <div className="h-9 w-9 rounded-xl bg-cs-primary-soft text-cs-primary flex items-center justify-center">
              <Sliders className="h-4.5 w-4.5" />
            </div>
            <h4 className="text-sm font-bold text-cs-text">Consent Audit</h4>
            <p className="text-xs text-cs-muted leading-relaxed">
              Understand how consent choices are presented and evaluate choice symmetry.
            </p>
          </Card>

          {/* Card 4: Privacy Score */}
          <Card hover padding="md" className="space-y-2.5">
            <div className="h-9 w-9 rounded-xl bg-cs-primary-soft text-cs-primary flex items-center justify-center">
              <ShieldCheck className="h-4.5 w-4.5" />
            </div>
            <h4 className="text-sm font-bold text-cs-text">Privacy Score</h4>
            <p className="text-xs text-cs-muted leading-relaxed">
              Get a concise transparency assessment with deterministic rule evaluations.
            </p>
          </Card>
        </div>
      </section>

    </div>
  );
}
