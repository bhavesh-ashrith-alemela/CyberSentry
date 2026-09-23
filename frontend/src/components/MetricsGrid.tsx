import { Cookie, Radio, Eye, AlertTriangle, ShieldCheck, ShieldAlert } from "lucide-react";
import { ReportMetrics } from "@/lib/types";

interface MetricsGridProps {
  metrics: ReportMetrics;
  bannerDetected: boolean;
  cmpName: string | null;
  findingsCount: number;
}

export function MetricsGrid({
  metrics,
  bannerDetected,
  cmpName,
  findingsCount,
}: MetricsGridProps) {
  const preConsentCookies = metrics.consentTestSummary?.observedNewCookies ?? 0;
  const isPreConsentClean = metrics.thirdPartyCookies === 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Cookies Card */}
      <div className="p-5 rounded-xl bg-cyber-card border border-cyber-border hover:border-cyan-500/30 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Cookies Stored
          </span>
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Cookie className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-slate-100">
            {metrics.totalCookies}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            ({metrics.thirdPartyCookies} third-party)
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          {metrics.totalCookies === 0
            ? "No initial cookies deposited."
            : `${metrics.totalCookies - metrics.thirdPartyCookies} first-party, ${metrics.thirdPartyCookies} cross-domain.`}
        </p>
      </div>

      {/* 2. Trackers Card */}
      <div className="p-5 rounded-xl bg-cyber-card border border-cyber-border hover:border-orange-500/30 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Third-Party Trackers
          </span>
          <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <Radio className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-slate-100">
            {metrics.totalTrackers}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            in {metrics.thirdPartyRequests} calls
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          {metrics.totalTrackers === 0
            ? "Zero known advertising or analytics trackers."
            : "Domains identified across known tracker registries."}
        </p>
      </div>

      {/* 3. Consent Banner Card */}
      <div className="p-5 rounded-xl bg-cyber-card border border-cyber-border hover:border-emerald-500/30 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Consent Banner
          </span>
          <div
            className={`p-2 rounded-lg border ${
              bannerDetected
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
            }`}
          >
            <Eye className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-100">
            {bannerDetected ? (cmpName || "Identified") : "Missing"}
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          {bannerDetected
            ? "Consent management interface detected on page load."
            : "No identifiable cookie banner detected before load."}
        </p>
      </div>

      {/* 4. Findings / Audit Items */}
      <div className="p-5 rounded-xl bg-cyber-card border border-cyber-border hover:border-amber-500/30 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Privacy Findings
          </span>
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-slate-100">
            {findingsCount}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            Itemized Deductions
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          {findingsCount === 0
            ? "No privacy deductions identified."
            : "Rule violations with empirical evidence."}
        </p>
      </div>
    </div>
  );
}
