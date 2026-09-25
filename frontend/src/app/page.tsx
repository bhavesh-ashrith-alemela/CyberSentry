"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Globe,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Cookie,
  Radio,
  Sliders,
  FileCheck2,
  Barcode,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Loader2,
  Folder,
} from "lucide-react";
import { api } from "@/lib/api";
import { Scan } from "@/lib/types";
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

const QUICK_SITES = [
  { name: "example.com", url: "https://example.com" },
  { name: "wikipedia.org", url: "https://www.wikipedia.org" },
  { name: "github.com", url: "https://github.com" },
  { name: "bbc.com", url: "https://www.bbc.com" },
];

const FOLDER_COLORS = ["denim", "olive", "pink", "paper"] as const;

export default function HomePage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Real recent scan history loaded from the database
  const [recentScans, setRecentScans] = useState<Scan[]>([]);
  const [loadingScans, setLoadingScans] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api
      .listScans({ page: 1, limit: 4 })
      .then((res) => {
        if (isMounted && res.success) {
          setRecentScans(res.data || []);
        }
      })
      .catch((err) => {
        console.warn("Unable to fetch recent scans:", err.message);
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

  return (
    <div className="relative overflow-hidden py-10 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-24">
        
        {/* ====================================================================
            1. HERO SECTION (Asymmetric 55/45 Editorial Split)
           ==================================================================== */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column (55%): Headline & Scan Dossier Input */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            
            {/* Eyebrow Label */}
            <div className="mb-4 sm:mb-5">
              <EditorialBadge variant="default" size="sm" className="font-mono text-[11px] tracking-wider uppercase">
                PRIVACY ANALYSIS PLATFORM
              </EditorialBadge>
            </div>

            {/* Display Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-cs-ink font-display leading-[1.12]">
              See what a website is{" "}
              <span className="editorial-italic text-cs-denim block sm:inline font-normal">
                really doing.
              </span>
            </h1>

            {/* Supporting Editorial Copy */}
            <p className="mt-5 text-base sm:text-lg text-cs-muted leading-relaxed font-sans max-w-xl">
              Understand cookies, third-party trackers and consent behaviour with clear,
              evidence-based privacy reports.
            </p>

            {/* Scan URL Tool Box */}
            <form onSubmit={handleSubmit} className="mt-8 max-w-xl" noValidate>
              <div className="relative flex flex-col sm:flex-row items-stretch gap-2 p-2 rounded-2xl bg-cs-paper border border-cs-border shadow-paper focus-within:border-cs-denim focus-within:shadow-paper-hover transition-all duration-200">
                <div className="relative flex-1 flex items-center">
                  <Globe className="absolute left-3.5 h-4 w-4 text-cs-muted/70" />
                  <input
                    type="url"
                    id="target-url"
                    aria-label="Website URL"
                    placeholder="Enter website URL (e.g. example.com)"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      if (error) setError(null);
                    }}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-3 bg-transparent text-sm font-sans text-cs-ink placeholder-cs-muted/60 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-cs-denim hover:bg-cs-denim-dark disabled:opacity-50 transition-all duration-200 shadow-sm active:translate-y-0.5 shrink-0"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                      <span>Launching Crawler...</span>
                    </>
                  ) : (
                    <>
                      <span>Scan Website</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Validation Feedback Alert */}
              {error && (
                <div className="mt-3 p-3.5 rounded-xl bg-cs-danger-bg border border-cs-danger/30 text-xs font-mono text-cs-danger flex items-center gap-2.5">
                  <AlertTriangle className="h-4 w-4 text-cs-danger shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Privacy Reassurance Line */}
              <div className="mt-3 flex items-center gap-2 text-xs text-cs-muted font-sans select-none">
                <ShieldCheck className="h-4 w-4 text-cs-olive shrink-0" />
                <span>Your privacy matters. We only scan public websites.</span>
              </div>

              {/* Quick-test Suggestions */}
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-mono text-cs-muted">
                <span className="text-cs-muted/70">Quick Audits:</span>
                {QUICK_SITES.map((site) => (
                  <button
                    key={site.url}
                    type="button"
                    onClick={() => handleQuickSelect(site.url)}
                    className="px-2.5 py-1 rounded-md bg-cs-paper border border-cs-border hover:border-cs-denim hover:text-cs-denim text-cs-muted transition-colors shadow-xs"
                  >
                    {site.name}
                  </button>
                ))}
              </div>
            </form>
          </div>

          {/* Right Column (45%): Decorative Privacy Report Dossier Composition */}
          <div className="lg:col-span-5 relative mt-6 lg:mt-0 flex justify-center">
            
            {/* Editorial Handwritten Annotation */}
            <div className="absolute -top-7 right-4 sm:-top-8 sm:right-6 transform rotate-3 select-none pointer-events-none z-20">
              <span className="font-display italic text-lg sm:text-xl font-bold text-cs-ink drop-shadow-xs">
                Know Your Data ↗
              </span>
            </div>

            {/* Folder Shell (Tilted Denim Folder) */}
            <div className="w-full max-w-md transform rotate-1 hover:rotate-0 transition-transform duration-300 relative">
              
              {/* Stepped Top Tab */}
              <div className="flex items-end justify-between px-1">
                <FolderTab color="denim" size="md">
                  PRIVACY REPORT
                </FolderTab>
                <div className="pb-1">
                  <StampBadge color="denim" rotate="none">
                    SAMPLE REPORT
                  </StampBadge>
                </div>
              </div>

              {/* Outer Folder Body */}
              <div className="rounded-2xl rounded-tl-none bg-cs-denim p-3 sm:p-4 shadow-folder">
                
                {/* Inside Paper Document Sheet */}
                <div className="rounded-xl bg-cs-paper border border-cs-border p-5 sm:p-6 text-cs-ink shadow-sm relative overflow-hidden font-mono text-xs">
                  
                  {/* Top Header of Sample Card */}
                  <div className="flex items-start justify-between border-b border-cs-border/80 pb-3 mb-4">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-cs-muted block">
                        Target Dossier
                      </span>
                      <span className="font-bold text-base text-cs-ink font-sans">
                        example.com
                      </span>
                    </div>

                    {/* Stamped Box */}
                    <div className="border border-cs-ink/40 p-1.5 rounded text-[9px] font-bold text-center leading-tight tracking-wider text-cs-ink uppercase">
                      SCAN<br />
                      ANALYZE<br />
                      EXPLAIN
                    </div>
                  </div>

                  {/* Metadata Ledger */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-cs-muted">Privacy Score:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-cs-ink">78 / 100</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-cs-olive-light text-cs-olive border border-cs-olive/30">
                          Good
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-cs-muted">Transparency Rating:</span>
                      <span className="font-semibold text-cs-ink">Grade B+</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-cs-muted">Trackers Detected:</span>
                      <span className="font-bold text-cs-warning">5 detected</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-cs-muted">Cookies Deposited:</span>
                      <span className="font-bold text-cs-ink">12 observed</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-cs-muted">Pre-Consent State:</span>
                      <span className="text-cs-safe font-semibold">Safe (Deferred)</span>
                    </div>
                  </div>

                  {/* Bottom Strip: Barcode & Disclaimer */}
                  <div className="mt-5 pt-3 border-t border-cs-border/80 flex items-center justify-between text-[10px] text-cs-muted">
                    <div className="space-y-0.5">
                      <span className="block font-mono tracking-widest uppercase">
                        DOC ID #84920-E
                      </span>
                      <span className="block text-[9px] text-cs-muted/80">
                        * Visual preview only
                      </span>
                    </div>

                    <Barcode className="h-7 w-20 text-cs-ink/80 shrink-0" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================================
            2. PRIVACY FILES / RECENT SCANS (Real Database Records)
           ==================================================================== */}
        <section className="space-y-6">
          <SectionHeader
            eyebrow="AUDIT DOSSIER"
            title="Privacy Files"
            italicWord="Recent Scans"
            subtitle="Latest empirical website tracking and consent reports stored in the PostgreSQL database."
            action={
              <Link
                href="/history"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-cs-denim hover:text-cs-denim-dark transition-colors select-none"
              >
                <span>View All Audits</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />

          {/* Grid of Real Recent Scans */}
          {loadingScans ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="rounded-2xl border border-cs-border bg-cs-paper p-6 animate-pulse">
                  <div className="h-4 w-28 bg-cs-cream-deep/60 rounded mb-3" />
                  <div className="h-3 w-20 bg-cs-cream-deep/40 rounded mb-6" />
                  <div className="h-6 w-16 bg-cs-cream-deep/60 rounded" />
                </div>
              ))}
            </div>
          ) : recentScans.length === 0 ? (
            /* Empty State if DB has no scans yet */
            <PaperCard variant="default" className="text-center p-8 sm:p-12">
              <Folder className="h-10 w-10 text-cs-muted mx-auto mb-3 stroke-[1.5]" />
              <h3 className="text-base font-bold text-cs-ink font-sans">
                No Privacy Files Recorded Yet
              </h3>
              <p className="text-xs sm:text-sm text-cs-muted max-w-md mx-auto mt-1 font-sans">
                Enter any website address in the scanner above to generate the first
                transparency report.
              </p>
            </PaperCard>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {recentScans.map((scan, idx) => {
                const color = FOLDER_COLORS[idx % FOLDER_COLORS.length];
                const domain = scan.website?.domain || "Target Website";

                return (
                  <Link
                    key={scan.id}
                    href={`/scan/${scan.id}`}
                    className="block group focus:outline-none"
                  >
                    <FolderCard
                      tabLabel={domain}
                      tabColor={color}
                      bodyColor={color}
                      interactive
                      className="h-full"
                    >
                      <div className="flex flex-col justify-between h-full min-h-[105px]">
                        <div>
                          <div className="flex items-center gap-1.5 text-[11px] font-mono opacity-80 mb-2">
                            <Clock className="h-3 w-3 shrink-0" />
                            <span>{formatDate(scan.createdAt)}</span>
                          </div>
                          <p className="text-xs truncate font-mono opacity-70">
                            {scan.website?.url}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-current/15 flex items-center justify-between">
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-mono text-base font-black">
                              {scan.score !== null ? `${scan.score}` : "—"}
                            </span>
                            <span className="font-mono text-[10px] opacity-75">
                              / 100
                            </span>
                            {scan.grade && (
                              <span className="ml-1 px-1.5 py-0.2 rounded text-[10px] font-mono font-bold uppercase bg-black/10 dark:bg-white/10">
                                {scan.grade}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 text-xs font-mono font-semibold group-hover:translate-x-1 transition-transform">
                            <span>Report</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </div>
                        </div>
                      </div>
                    </FolderCard>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* ====================================================================
            3. WHAT CYBERSENTRY ANALYZES (4 Visual Categories)
           ==================================================================== */}
        <section className="space-y-6">
          <SectionHeader
            eyebrow="AUDIT SCOPE"
            title="What CyberSentry"
            italicWord="Analyzes."
            subtitle="Deterministic browser telemetry captured in real-time across four critical privacy vectors."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Vector 1: Cookies */}
            <PaperCard variant="default" interactive className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cs-olive-light border border-cs-olive/30 text-cs-olive">
                    <Cookie className="h-5 w-5" />
                  </div>
                  <FileLabel code="[ 01/STORAGE ]" variant="muted" />
                </div>
                <h3 className="text-lg font-bold text-cs-ink font-sans">Cookies</h3>
                <p className="mt-2 text-xs font-semibold text-cs-denim font-sans">
                  Understand what data is stored in the browser.
                </p>
                <p className="mt-2 text-xs text-cs-muted leading-relaxed font-sans">
                  Audits first vs. third-party cookie persistence, expiry duration, and HttpOnly / Secure transmission security flags.
                </p>
              </div>
            </PaperCard>

            {/* Vector 2: Trackers */}
            <PaperCard variant="default" interactive className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cs-denim-light border border-cs-denim/30 text-cs-denim">
                    <Radio className="h-5 w-5" />
                  </div>
                  <FileLabel code="[ 02/TELEMETRY ]" variant="muted" />
                </div>
                <h3 className="text-lg font-bold text-cs-ink font-sans">Trackers</h3>
                <p className="mt-2 text-xs font-semibold text-cs-denim font-sans">
                  Identify third-party domains and tracking activity.
                </p>
                <p className="mt-2 text-xs text-cs-muted leading-relaxed font-sans">
                  Captures real-time outbound beacons dispatched to advertising networks, CDNs, social widgets, and analytics platforms.
                </p>
              </div>
            </PaperCard>

            {/* Vector 3: Consent */}
            <PaperCard variant="default" interactive className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cs-pink-light border border-cs-pink/40 text-[#A84B60]">
                    <Sliders className="h-5 w-5" />
                  </div>
                  <FileLabel code="[ 03/CONSENT_UI ]" variant="muted" />
                </div>
                <h3 className="text-lg font-bold text-cs-ink font-sans">Consent</h3>
                <p className="mt-2 text-xs font-semibold text-cs-denim font-sans">
                  Examine whether consent choices are clear and balanced.
                </p>
                <p className="mt-2 text-xs text-cs-muted leading-relaxed font-sans">
                  Detects dark patterns where &quot;Accept All&quot; is single-click while refusing tracking is hidden behind nested menus.
                </p>
              </div>
            </PaperCard>

            {/* Vector 4: Privacy Indicators */}
            <PaperCard variant="default" interactive className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cs-cream-deep/60 border border-cs-border text-cs-ink">
                    <FileCheck2 className="h-5 w-5" />
                  </div>
                  <FileLabel code="[ 04/EVIDENCE ]" variant="muted" />
                </div>
                <h3 className="text-lg font-bold text-cs-ink font-sans">Privacy Indicators</h3>
                <p className="mt-2 text-xs font-semibold text-cs-denim font-sans">
                  Turn observed evidence into an explainable score.
                </p>
                <p className="mt-2 text-xs text-cs-muted leading-relaxed font-sans">
                  Every score deduction is mathematically deterministic and mapped to code evidence. Zero LLM hallucinations.
                </p>
              </div>
            </PaperCard>
          </div>
        </section>

        {/* ====================================================================
            4. HOW IT WORKS (3-Step Editorial Process)
           ==================================================================== */}
        <section className="space-y-6 pb-6">
          <SectionHeader
            eyebrow="AUDIT PIPELINE"
            title="How It"
            italicWord="Works."
            subtitle="The three-phase automated crawl, analysis, and forensic verification pipeline."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <PaperCard variant="default" className="relative">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-2xl font-black text-cs-denim">
                  01
                </span>
                <EditorialBadge variant="default" size="xs">
                  PHASE 1
                </EditorialBadge>
              </div>
              <h4 className="text-base font-bold text-cs-ink font-sans">
                Submit Public Website
              </h4>
              <p className="mt-2 text-xs text-cs-muted leading-relaxed font-sans">
                Provide a website address. CyberSentry launches an isolated, headless Chromium incognito sandbox with route-level SSRF defense.
              </p>
            </PaperCard>

            {/* Step 2 */}
            <PaperCard variant="default" className="relative">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-2xl font-black text-cs-denim">
                  02
                </span>
                <EditorialBadge variant="default" size="xs">
                  PHASE 2
                </EditorialBadge>
              </div>
              <h4 className="text-base font-bold text-cs-ink font-sans">
                Intercept Observable Telemetry
              </h4>
              <p className="mt-2 text-xs text-cs-muted leading-relaxed font-sans">
                The crawler records client-side storage, outbound tracking requests, and evaluates cookie banner layout balance and choices.
              </p>
            </PaperCard>

            {/* Step 3 */}
            <PaperCard variant="default" className="relative">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-2xl font-black text-cs-denim">
                  03
                </span>
                <EditorialBadge variant="default" size="xs">
                  PHASE 3
                </EditorialBadge>
              </div>
              <h4 className="text-base font-bold text-cs-ink font-sans">
                Explainable Privacy Report
              </h4>
              <p className="mt-2 text-xs text-cs-muted leading-relaxed font-sans">
                A deterministic score (0–100) and actionable remediation checklist are computed and stored with complete evidence in PostgreSQL.
              </p>
            </PaperCard>
          </div>
        </section>

      </div>
    </div>
  );
}
