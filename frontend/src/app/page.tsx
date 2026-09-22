"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Globe,
  Sliders,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  Radio,
  Cookie,
  Eye,
  Info,
} from "lucide-react";
import { api } from "@/lib/api";

const QUICK_SITES = [
  { name: "Wikipedia", url: "https://www.wikipedia.org" },
  { name: "GitHub", url: "https://github.com" },
  { name: "BBC News", url: "https://www.bbc.com" },
  { name: "Example Domain", url: "https://example.com" },
];

const PRODUCT_VALUES = [
  {
    step: "01",
    label: "OBSERVABILITY",
    title: "Understand hidden tracking",
    description:
      "Inspect stealth third-party network requests, fingerprinting beacons, and ad telemetry scripts before they record visitor behaviour.",
    icon: Eye,
  },
  {
    step: "02",
    label: "STORAGE LIFECYCLE",
    title: "Inspect cookie behaviour",
    description:
      "Differentiate first-party vs third-party storage, verify expiration lifespans, and audit security flags including HttpOnly, Secure, and SameSite.",
    icon: Cookie,
  },
  {
    step: "03",
    label: "CHOICE ARCHITECTURE",
    title: "Evaluate consent transparency",
    description:
      "Detect manipulative dark patterns: asymmetric button prominence, buried refusal links, pre-ticked consent toggles, and missing reject mechanisms.",
    icon: Sliders,
  },
  {
    step: "04",
    label: "DETERMINISTIC PROOF",
    title: "Explore evidence-based findings",
    description:
      "Every transparency deduction is calculated through open, rule-based algorithms with audit trails persisted in PostgreSQL. Zero hallucinations.",
    icon: FileCheck2,
  },
];

const HOW_IT_WORKS_STEPS = [
  {
    num: "01",
    title: "Submit a Website",
    description: "Enter any public website URL into the audit console. Our engine validates protocols and prevents private-network SSRF risks.",
    subtext: "Ephemeral Incognito Session",
  },
  {
    num: "02",
    title: "Analyze Privacy Signals",
    description: "CyberSentry launches a controlled Chromium browser, intercepting observable cookies, outbound tracking beacons, and consent dialogs.",
    subtext: "Real-time Telemetry Interception",
  },
  {
    num: "03",
    title: "Explore the Report",
    description: "Review your comprehensive privacy score, itemized findings with raw evidence, and actionable technical remediation advice.",
    subtext: "Deterministic Scoring (0–100)",
  },
];

export default function HomePage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);

    let targetUrl = url.trim();
    if (!targetUrl) {
      setError("Please enter a website URL to scan.");
      inputRef.current?.focus();
      return;
    }

    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
      setUrl(targetUrl);
    }

    try {
      const parsed = new URL(targetUrl);
      if (!parsed.hostname.includes(".")) {
        setError("Please enter a valid domain name (e.g. example.com).");
        inputRef.current?.focus();
        return;
      }
    } catch {
      setError("Invalid URL format. Please enter a valid HTTP/HTTPS address.");
      inputRef.current?.focus();
      return;
    }

    setLoading(true);
    try {
      const res = await api.createScan(targetUrl);
      if (res.success && res.data?.scan?.id) {
        router.push(`/scan/${res.data.scan.id}`);
      } else {
        throw new Error(res.error?.message || "Failed to initiate scan.");
      }
    } catch (err: any) {
      setError(
        err.message || "Failed to start website audit. Please verify the URL and try again."
      );
      setLoading(false);
    }
  };

  const handleQuickSelect = (siteUrl: string) => {
    setUrl(siteUrl);
    setError(null);
    inputRef.current?.focus();
  };

  const handleScrollToInput = () => {
    const el = document.getElementById("scan-input");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      inputRef.current?.focus();
    }
  };

  return (
    <div className="space-y-24 sm:space-y-32 py-12 sm:py-20">
      {/* 2. HERO SECTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Subtle Visual Indicator */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-50 border border-forest-200 text-xs font-mono text-forest-800 mb-8 shadow-subtle">
            <span className="h-2 w-2 rounded-full bg-forest-600 animate-pulse" />
            <span className="font-medium tracking-wide">
              Deterministic Privacy Engine • Ready to inspect
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-forest-950 leading-[1.08]">
            See what websites do with your data.
          </h1>

          {/* Supporting Text */}
          <p className="mt-6 text-base sm:text-xl text-forest-700 leading-relaxed max-w-2xl mx-auto font-sans">
            Understand cookies, third-party trackers, and consent behaviour with clear,
            evidence-based privacy reports.
          </p>

          {/* URL Input Form Console (Main Focus) */}
          <form
            id="scan-input"
            onSubmit={handleSubmit}
            className="mt-10 max-w-2xl mx-auto text-left"
            noValidate
          >
            <div className="relative flex flex-col sm:flex-row items-stretch gap-2 p-2 rounded-2xl bg-white border border-sand-400 shadow-card focus-within:border-forest-700 focus-within:ring-2 focus-within:ring-forest-700/10 transition-all">
              <div className="relative flex-1 flex items-center">
                <Globe className="absolute left-4 h-5 w-5 text-forest-500 shrink-0" />
                <input
                  ref={inputRef}
                  type="url"
                  id="target-url"
                  aria-label="Target Website URL to inspect"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (error) setError(null);
                  }}
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-3 bg-transparent text-sm sm:text-base font-mono text-forest-950 placeholder-sand-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-sand-50 bg-forest-800 hover:bg-forest-900 active:bg-forest-950 disabled:opacity-50 transition-all shadow-subtle shrink-0 cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span>Scan Website</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>

            {/* Validation Feedback */}
            {error && (
              <div
                role="alert"
                className="mt-3 p-3.5 rounded-xl bg-rust-50 border border-rust-200 text-xs font-mono text-rust-800 flex items-center gap-2.5"
              >
                <AlertTriangle className="h-4 w-4 text-rust-700 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Small Privacy-focused Supporting Text */}
            <p className="mt-3 text-[11px] font-mono text-sand-600 text-center sm:text-left">
              Zero tracking of your credentials. Analysis is performed inside an isolated,
              ephemeral Chromium sandbox.
            </p>
          </form>

          {/* Quick-Audit Chips */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-forest-600">
            <span className="text-sand-600">Sample targets:</span>
            {QUICK_SITES.map((site) => (
              <button
                key={site.url}
                type="button"
                onClick={() => handleQuickSelect(site.url)}
                className="px-3 py-1 rounded-full bg-sand-100 border border-sand-300 text-forest-800 hover:bg-sand-200 hover:text-forest-950 transition-colors shadow-subtle cursor-pointer text-xs"
              >
                {site.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. TRUST / PRODUCT VALUE SECTION */}
      <section id="product" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="border-t border-sand-300 pt-16">
          <div className="max-w-2xl mb-12">
            <span className="text-[11px] font-mono uppercase tracking-widest text-forest-700 font-semibold block mb-2">
              Product Principles
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-forest-950">
              Clear principles for web privacy intelligence.
            </h2>
            <p className="mt-2 text-sm sm:text-base text-forest-700 leading-relaxed font-sans">
              CyberSentry transforms invisible network traffic and hidden consent choices into
              transparent, verifiable insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRODUCT_VALUES.map((val) => {
              const Icon = val.icon;
              return (
                <div
                  key={val.step}
                  className="p-6 sm:p-7 rounded-2xl bg-white border border-sand-300 shadow-subtle hover:border-forest-600 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-10 w-10 rounded-xl bg-forest-50 text-forest-800 border border-forest-200 flex items-center justify-center">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-[11px] font-mono font-bold text-sand-500">
                        {val.step}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-forest-950 tracking-tight">
                      {val.title}
                    </h3>
                    <p className="mt-2.5 text-xs sm:text-sm text-forest-700 leading-relaxed font-sans">
                      {val.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-sand-200 text-[10px] font-mono uppercase tracking-wider text-sand-600 font-semibold">
                    {val.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="border-t border-sand-300 pt-16">
          <div className="max-w-2xl mb-12">
            <span className="text-[11px] font-mono uppercase tracking-widest text-forest-700 font-semibold block mb-2">
              Audit Process
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-forest-950">
              How CyberSentry works in three simple steps.
            </h2>
            <p className="mt-2 text-sm sm:text-base text-forest-700 leading-relaxed font-sans">
              A fully automated, zero-configuration audit pipeline designed for speed and accuracy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_IT_WORKS_STEPS.map((stg) => (
              <div
                key={stg.num}
                className="p-8 rounded-2xl bg-white border border-sand-300 shadow-subtle flex flex-col justify-between"
              >
                <div>
                  <span className="text-3xl sm:text-4xl font-black font-mono text-sand-400 block mb-6">
                    {stg.num}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-forest-950 tracking-tight">
                    {stg.title}
                  </h3>
                  <p className="mt-3 text-xs sm:text-sm text-forest-700 leading-relaxed font-sans">
                    {stg.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-sand-200 flex items-center justify-between text-[11px] font-mono text-forest-700">
                  <span>{stg.subtext}</span>
                  <CheckCircle2 className="h-4 w-4 text-forest-700" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. PRIVACY REPORT PREVIEW */}
      <section id="sample-report" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="border-t border-sand-300 pt-16">
          <div className="max-w-3xl mb-8">
            <span className="text-[11px] font-mono uppercase tracking-widest text-forest-700 font-semibold block mb-2">
              Product Interface
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-forest-950">
              Interactive privacy reports built on observable evidence.
            </h2>
            <p className="mt-2 text-sm sm:text-base text-forest-700 leading-relaxed font-sans">
              Each completed audit generates a comprehensive transparency dashboard complete with
              cookie ledgers, tracker categories, and dark pattern heuristics.
            </p>
          </div>

          {/* Prominent Sample Label Notice */}
          <div className="mb-6 p-4 rounded-xl bg-sand-100 border border-sand-300 flex items-start gap-3">
            <Info className="h-5 w-5 text-forest-800 shrink-0 mt-0.5" />
            <div className="text-xs font-mono">
              <span className="font-bold text-forest-950 block mb-0.5 uppercase tracking-wide">
                Illustrative Privacy Transparency Report Preview — Based on Standard Web Heuristics (Sample Only)
              </span>
              <p className="text-sand-600">
                Note: This sample demonstrates the report layout and heuristic data structure. Live scans generate reports based strictly on real-time browser telemetry.
              </p>
            </div>
          </div>

          {/* Report Preview Window Mockup */}
          <div className="rounded-3xl bg-sand-100/70 border border-sand-300 p-4 sm:p-8 shadow-sm space-y-6">
            {/* Mock Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-sand-300 shadow-subtle">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-mono text-sand-500 uppercase">Target Domain</span>
                  <span className="text-sand-400">/</span>
                  <span className="text-xs font-mono text-forest-800 font-semibold">example-store.org</span>
                </div>
                <h4 className="text-xl font-bold text-forest-950">
                  Global Retail & Media Portal
                </h4>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="px-2.5 py-1 rounded-lg bg-sand-100 border border-sand-200 text-forest-800 font-medium">
                  Duration: 3.4s
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-forest-50 border border-forest-200 text-forest-800 font-medium">
                  Audit Completed
                </span>
              </div>
            </div>

            {/* Score + Metrics Grid Mockup */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Score Gauge Preview */}
              <div className="p-6 rounded-2xl bg-white border border-sand-300 shadow-subtle flex flex-col items-center justify-center text-center">
                <span className="text-[11px] font-mono uppercase tracking-wider text-sand-600 mb-4 font-semibold">
                  Sample Transparency Score
                </span>

                <div className="relative flex items-center justify-center h-36 w-36 mb-4">
                  {/* Circular SVG Track */}
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#E0E4E0"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#234A38"
                      strokeWidth="8"
                      strokeDasharray="251.2"
                      strokeDashoffset="65"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-black text-forest-950 tracking-tight">74</span>
                    <span className="text-[10px] font-mono text-sand-600">OUT OF 100</span>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-50 border border-forest-200 text-xs font-mono font-semibold text-forest-800">
                  <span>Rating: Grade B (Good)</span>
                </div>
              </div>

              {/* Cookie & Tracker Breakdown Preview */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Cookie Summary Card */}
                <div className="p-6 rounded-2xl bg-white border border-sand-300 shadow-subtle flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono uppercase text-sand-600 font-semibold flex items-center gap-1.5">
                        <Cookie className="h-4 w-4 text-forest-800" />
                        <span>Cookie Summary</span>
                      </span>
                      <span className="text-xs font-mono font-bold text-forest-950">22 Total</span>
                    </div>

                    <div className="space-y-2.5 text-xs font-mono mt-4">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-sand-50 border border-sand-200">
                        <span className="text-forest-700">First-Party Cookies</span>
                        <span className="font-bold text-forest-950">8</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-sand-50 border border-sand-200">
                        <span className="text-forest-700">Third-Party Cookies</span>
                        <span className="font-bold text-amber-800">14</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-sand-50 border border-sand-200">
                        <span className="text-forest-700">Secure Attribute Ratio</span>
                        <span className="font-bold text-forest-800">92%</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] font-mono text-sand-500 mt-4 pt-3 border-t border-sand-200">
                    Third-party cookies observed before consent interaction.
                  </p>
                </div>

                {/* Tracker Summary Card */}
                <div className="p-6 rounded-2xl bg-white border border-sand-300 shadow-subtle flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono uppercase text-sand-600 font-semibold flex items-center gap-1.5">
                        <Radio className="h-4 w-4 text-forest-800" />
                        <span>Tracker Summary</span>
                      </span>
                      <span className="text-xs font-mono font-bold text-rust-800">12 Trackers</span>
                    </div>

                    <div className="space-y-2.5 text-xs font-mono mt-4">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-sand-50 border border-sand-200">
                        <span className="text-forest-700">Advertising & Retargeting</span>
                        <span className="font-bold text-rust-800">4 domains</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-sand-50 border border-sand-200">
                        <span className="text-forest-700">Web Analytics</span>
                        <span className="font-bold text-amber-800">5 domains</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-sand-50 border border-sand-200">
                        <span className="text-forest-700">Social Graph Widgets</span>
                        <span className="font-bold text-sand-700">3 domains</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] font-mono text-sand-500 mt-4 pt-3 border-t border-sand-200">
                    Matched against curated DuckDuckGo & EasyPrivacy trackers database.
                  </p>
                </div>
              </div>
            </div>

            {/* Consent Findings & Evidence Mockup */}
            <div className="p-6 rounded-2xl bg-white border border-sand-300 shadow-subtle space-y-4">
              <div className="flex items-center justify-between border-b border-sand-200 pb-3">
                <span className="text-xs font-mono uppercase text-sand-600 font-semibold flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-forest-800" />
                  <span>Consent Architecture & Evidence Findings</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                  Choice Asymmetry Detected
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-sand-50 border border-sand-200">
                  <span className="text-[10px] text-sand-500 uppercase block mb-1">CMP Vendor</span>
                  <span className="font-bold text-forest-950">OneTrust CMP</span>
                </div>
                <div className="p-3 rounded-xl bg-sand-50 border border-sand-200">
                  <span className="text-[10px] text-sand-500 uppercase block mb-1">Accept vs Reject Parity</span>
                  <span className="font-bold text-rust-800">No Direct Reject Button</span>
                </div>
                <div className="p-3 rounded-xl bg-sand-50 border border-sand-200">
                  <span className="text-[10px] text-sand-500 uppercase block mb-1">Visual Prominence Ratio</span>
                  <span className="font-bold text-amber-800">2.8x (Asymmetric)</span>
                </div>
              </div>

              {/* Sample Evidence Finding Item */}
              <div className="p-4 rounded-xl bg-sand-50 border border-sand-200 text-xs font-mono space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rust-50 text-rust-800 border border-rust-200">
                      HIGH SEVERITY
                    </span>
                    <span className="font-semibold text-forest-950">RULE_PRE_CONSENT_TRACKING</span>
                  </div>
                  <span className="text-rust-800 font-bold">-15 pts deduction</span>
                </div>
                <p className="text-forest-700 text-xs font-sans">
                  Third-party analytics beacons from <code className="text-forest-900 bg-sand-200 px-1 py-0.5 rounded text-[11px]">google-analytics.com</code> executed prior to visitor consent interaction.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FINAL CALL TO ACTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-forest-900 text-sand-50 p-8 sm:p-14 text-center shadow-lg relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
              Make website privacy easier to understand.
            </h2>
            <p className="text-sm sm:text-base text-sand-300 font-sans leading-relaxed">
              Launch a deterministic privacy audit now to uncover tracking scripts, examine consent
              mechanisms, and evaluate compliance posture.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleScrollToInput}
                className="w-full sm:w-auto px-6 py-3.5 rounded-full text-xs sm:text-sm font-semibold text-forest-950 bg-sand-50 hover:bg-white active:bg-sand-100 transition-all shadow-subtle cursor-pointer"
              >
                Scan a Website Now
              </button>
              <Link
                href="/history"
                className="w-full sm:w-auto px-6 py-3.5 rounded-full text-xs sm:text-sm font-medium text-sand-200 hover:text-white hover:bg-forest-800/80 transition-colors border border-forest-700"
              >
                View Audit History
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
