"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  ArrowRight,
  Globe,
  Sliders,
  FileCheck2,
  AlertTriangle,
  Cpu,
  Layers,
  CheckCircle2,
  Lock,
  Compass,
} from "lucide-react";
import { api } from "@/lib/api";

const QUICK_SITES = [
  { name: "Example Domain", url: "https://example.com" },
  { name: "Wikipedia", url: "https://www.wikipedia.org" },
  { name: "GitHub", url: "https://github.com" },
  { name: "BBC News", url: "https://www.bbc.com" },
];

const AUDIT_STAGES = [
  { step: "01", title: "Target & SSRF Validation", desc: "DNS resolution, protocol verification, and strict RFC-1918 CIDR IP restrictions." },
  { step: "02", title: "Isolated Browser Sandbox", desc: "Controlled headless Chromium session launched with clean storage and media blockers." },
  { step: "03", title: "Telemetry Interception", desc: "Real-time capture of cookies, third-party requests, and outbound tracking beacons." },
  { step: "04", title: "Consent Architecture Audit", desc: "Inspection of CMP presence, button parity, and option preselection heuristics." },
  { step: "05", title: "Deterministic Scoring", desc: "Rule-based mathematical evaluation yielding an explainable score from 0 to 100." },
];

export default function HomePage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let targetUrl = url.trim();
    if (!targetUrl) {
      setError("Please enter a website URL to scan.");
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
      setError(err.message || "Failed to start website audit. Please verify the URL and try again.");
      setLoading(false);
    }
  };

  const handleQuickSelect = (siteUrl: string) => {
    setUrl(siteUrl);
    setError(null);
  };

  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Hero Section */}
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-50 border border-forest-200 text-xs font-mono text-forest-800 mb-8 shadow-subtle">
            <Shield className="h-3.5 w-3.5 text-forest-700" />
            <span className="tracking-wide">EXPLAINABLE WEB PRIVACY & TRACKING INTELLIGENCE</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-forest-950 leading-[1.12]">
            Auditing Web Privacy Through Observable Telemetry &{" "}
            <span className="text-forest-700 underline decoration-forest-300 underline-offset-8">
              Deterministic Proof
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-base sm:text-lg text-forest-700 leading-relaxed max-w-2xl mx-auto font-sans">
            Submit any public website URL. CyberSentry launches a controlled Playwright
            headless browser session, collects tracking scripts and cookies, analyzes CMP
            consent choices, and delivers an evidence-based audit.
          </p>

          {/* URL Input Form Console */}
          <form
            onSubmit={handleSubmit}
            className="mt-10 max-w-2xl mx-auto"
            noValidate
          >
            <div className="relative flex flex-col sm:flex-row items-stretch gap-2 p-2 rounded-2xl bg-white border border-sand-400 shadow-card focus-within:border-forest-700 focus-within:ring-2 focus-within:ring-forest-700/10 transition-all">
              <div className="relative flex-1 flex items-center">
                <Globe className="absolute left-4 h-5 w-5 text-forest-500" />
                <input
                  type="url"
                  id="target-url"
                  aria-label="Website URL"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (error) setError(null);
                  }}
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-3 bg-transparent text-sm font-mono text-forest-950 placeholder-forest-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-white bg-forest-800 hover:bg-forest-900 active:bg-forest-950 disabled:opacity-50 transition-all shadow-subtle shrink-0"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>Launching Sandbox...</span>
                  </>
                ) : (
                  <>
                    <span>Run Privacy Audit</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>

            {/* Validation Feedback */}
            {error && (
              <div className="mt-4 p-3.5 rounded-xl bg-rust-50 border border-rust-200 text-xs font-mono text-rust-800 text-left flex items-center gap-2.5">
                <AlertTriangle className="h-4 w-4 text-rust-700 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </form>

          {/* Quick-Audit Chips */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-forest-600">
            <span className="text-forest-500">Sample Audits:</span>
            {QUICK_SITES.map((site) => (
              <button
                key={site.url}
                type="button"
                onClick={() => handleQuickSelect(site.url)}
                className="px-3 py-1 rounded-full bg-sand-100 border border-sand-300 text-forest-700 hover:bg-sand-200 hover:text-forest-950 hover:border-sand-400 transition-colors shadow-subtle"
              >
                {site.name}
              </button>
            ))}
          </div>
        </div>

        {/* Section Divider */}
        <div className="my-20 border-t border-sand-300" />

        {/* Core Architectural Pillars */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-mono uppercase tracking-widest text-forest-600">
              Platform Architecture
            </h2>
            <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-forest-950">
              Engineered for Transparent Research
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1 */}
            <div className="p-6 rounded-2xl bg-white border border-sand-300 shadow-subtle hover:border-forest-600 transition-all flex flex-col justify-between">
              <div>
                <div className="h-10 w-10 rounded-xl bg-sand-100 text-forest-800 border border-sand-300 flex items-center justify-center mb-4">
                  <Cpu className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-forest-950">Playwright Sandbox</h3>
                <p className="mt-2 text-xs text-forest-700 leading-relaxed">
                  Crawl runs in an ephemeral, incognito Chromium session with full route guards, active redirect defense, and internal CIDR SSRF rejection.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-sand-200 text-[11px] font-mono text-forest-500">
                Sandboxed Execution
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 rounded-2xl bg-white border border-sand-300 shadow-subtle hover:border-forest-600 transition-all flex flex-col justify-between">
              <div>
                <div className="h-10 w-10 rounded-xl bg-sand-100 text-forest-800 border border-sand-300 flex items-center justify-center mb-4">
                  <Sliders className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-forest-950">Dark Pattern Heuristics</h3>
                <p className="mt-2 text-xs text-forest-700 leading-relaxed">
                  Detects choice asymmetry: banners presenting prominent 1-click &quot;Accept All&quot; buttons while burying refusal options behind settings layers.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-sand-200 text-[11px] font-mono text-forest-500">
                Choice Architecture
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 rounded-2xl bg-white border border-sand-300 shadow-subtle hover:border-forest-600 transition-all flex flex-col justify-between">
              <div>
                <div className="h-10 w-10 rounded-xl bg-sand-100 text-forest-800 border border-sand-300 flex items-center justify-center mb-4">
                  <Layers className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-forest-950">Pre-Consent Auditing</h3>
                <p className="mt-2 text-xs text-forest-700 leading-relaxed">
                  Isolates third-party cookies and advertising telemetry beacons executing on initial page landing prior to explicit visitor agreement.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-sand-200 text-[11px] font-mono text-forest-500">
                ePrivacy Compliance
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="p-6 rounded-2xl bg-white border border-sand-300 shadow-subtle hover:border-forest-600 transition-all flex flex-col justify-between">
              <div>
                <div className="h-10 w-10 rounded-xl bg-sand-100 text-forest-800 border border-sand-300 flex items-center justify-center mb-4">
                  <FileCheck2 className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-forest-950">100% Explainable</h3>
                <p className="mt-2 text-xs text-forest-700 leading-relaxed">
                  Every deduction is calculated through open, rule-based algorithms with audit trails persisted in PostgreSQL. Zero generative hallucinations.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-sand-200 text-[11px] font-mono text-forest-500">
                Deterministic Scoring
              </div>
            </div>
          </div>
        </div>

        {/* Audit Pipeline Stages */}
        <div className="mt-24 p-8 sm:p-10 rounded-3xl bg-sand-100/70 border border-sand-300">
          <div className="max-w-2xl mb-8">
            <h3 className="text-xs font-mono uppercase tracking-widest text-forest-600">
              Inspection Lifecycle
            </h3>
            <h4 className="text-2xl font-bold text-forest-950 mt-1">
              Five-Stage Autonomous Audit Pipeline
            </h4>
            <p className="text-xs text-forest-700 font-mono mt-1">
              Each URL undergoes a standardized sequence of security verification, browser execution, and deterministic evaluation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {AUDIT_STAGES.map((stg) => (
              <div key={stg.step} className="p-5 rounded-xl bg-white border border-sand-300 shadow-subtle flex flex-col justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-forest-700 block mb-2">
                    {stg.step}
                  </span>
                  <h5 className="text-sm font-bold text-forest-950">{stg.title}</h5>
                  <p className="text-xs text-forest-600 mt-2 leading-relaxed">
                    {stg.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
