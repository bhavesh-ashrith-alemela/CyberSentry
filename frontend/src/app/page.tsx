"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Search,
  ArrowRight,
  Globe,
  Sliders,
  FileCheck2,
  AlertTriangle,
  Lock,
  Cpu,
  Layers,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";

const QUICK_SITES = [
  { name: "Example Domain", url: "https://example.com" },
  { name: "Wikipedia", url: "https://www.wikipedia.org" },
  { name: "GitHub", url: "https://github.com" },
  { name: "BBC News", url: "https://www.bbc.com" },
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

    // Auto-prefix https:// if missing
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
    <div className="relative overflow-hidden py-12 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-cyan-400 mb-6 shadow-sm">
            <Shield className="h-3.5 w-3.5" />
            <span>EXPLAINABLE PRIVACY TRANSPARENCY AUDIT</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-100 leading-tight">
            Uncover Hidden Web Trackers &{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
              Consent Dark Patterns
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Submit any public website URL. CyberSentry launches a controlled Playwright
            headless browser session, collects tracking scripts and cookies, analyzes CMP
            consent choices, and delivers an explainable, evidence-based audit.
          </p>

          {/* URL Input Form */}
          <form
            onSubmit={handleSubmit}
            className="mt-8 max-w-2xl mx-auto"
            noValidate
          >
            <div className="relative flex flex-col sm:flex-row items-stretch gap-2 p-2 rounded-2xl bg-cyber-card border border-cyber-border focus-within:border-cyan-500/50 shadow-2xl transition-all">
              <div className="relative flex-1 flex items-center">
                <Globe className="absolute left-4 h-5 w-5 text-slate-500" />
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
                  className="w-full pl-12 pr-4 py-3 bg-transparent text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 disabled:opacity-50 transition-all shadow-lg shadow-cyan-600/25 shrink-0"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
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

            {/* Validation Feedback */}
            {error && (
              <div className="mt-3 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs font-mono text-rose-300 text-left flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </form>

          {/* Quick-test Suggestions */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-slate-400">
            <span className="text-slate-500">Quick Audits:</span>
            {QUICK_SITES.map((site) => (
              <button
                key={site.url}
                type="button"
                onClick={() => handleQuickSelect(site.url)}
                className="px-2.5 py-1 rounded-md bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors"
              >
                {site.name}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border hover:border-cyan-500/30 transition-all">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center mb-4">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Playwright Crawler</h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Runs inside isolated, headless Chromium sandboxes with real-time network request interception and automated route-level SSRF defense.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border hover:border-emerald-500/30 transition-all">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-4">
              <Sliders className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Dark Pattern Heuristics</h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Identifies asymmetric consent friction where &quot;Accept All&quot; is prominent on layer 1, while &quot;Reject&quot; is hidden or buried behind settings.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border hover:border-orange-500/30 transition-all">
            <div className="h-10 w-10 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center mb-4">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Pre-Consent Auditing</h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Detects third-party cookies and tracking beacons executing immediately on page landing before the visitor gives affirmative consent.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border hover:border-purple-500/30 transition-all">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mb-4">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100">100% Explainable</h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Every score deduction is mathematically deterministic and mapped to code evidence stored in PostgreSQL. Zero LLM hallucinations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
