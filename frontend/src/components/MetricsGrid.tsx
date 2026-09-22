import { Cookie, Radio, Eye, AlertTriangle } from "lucide-react";
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
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* 1. Cookies Card */}
      <div className="p-6 rounded-2xl bg-white border border-sand-300 shadow-subtle hover:border-forest-600 transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-forest-500">
              Cookies Stored
            </span>
            <div className="p-2 rounded-xl bg-sand-100 text-forest-800 border border-sand-300">
              <Cookie className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-forest-950">
              {metrics.totalCookies}
            </span>
            <span className="text-xs text-forest-500 font-mono">
              ({metrics.thirdPartyCookies} third-party)
            </span>
          </div>
        </div>
        <p className="mt-3 text-xs text-forest-600 leading-relaxed">
          {metrics.totalCookies === 0
            ? "No initial cookies deposited."
            : `${metrics.totalCookies - metrics.thirdPartyCookies} first-party, ${metrics.thirdPartyCookies} cross-domain.`}
        </p>
      </div>

      {/* 2. Trackers Card */}
      <div className="p-6 rounded-2xl bg-white border border-sand-300 shadow-subtle hover:border-forest-600 transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-forest-500">
              Third-Party Trackers
            </span>
            <div className="p-2 rounded-xl bg-sand-100 text-forest-800 border border-sand-300">
              <Radio className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-forest-950">
              {metrics.totalTrackers}
            </span>
            <span className="text-xs text-forest-500 font-mono">
              in {metrics.thirdPartyRequests} calls
            </span>
          </div>
        </div>
        <p className="mt-3 text-xs text-forest-600 leading-relaxed">
          {metrics.totalTrackers === 0
            ? "Zero known advertising or analytics trackers."
            : "Observed domains identified across known tracker registries."}
        </p>
      </div>

      {/* 3. Consent Banner Card */}
      <div className="p-6 rounded-2xl bg-white border border-sand-300 shadow-subtle hover:border-forest-600 transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-forest-500">
              Consent Banner
            </span>
            <div
              className={`p-2 rounded-xl border ${
                bannerDetected
                  ? "bg-forest-50 text-forest-800 border-forest-200"
                  : "bg-rust-50 text-rust-800 border-rust-200"
              }`}
            >
              <Eye className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-black text-forest-950">
              {bannerDetected ? (cmpName || "Identified") : "Missing"}
            </span>
          </div>
        </div>
        <p className="mt-3 text-xs text-forest-600 leading-relaxed">
          {bannerDetected
            ? "Consent management interface detected on page load."
            : "No identifiable cookie banner detected before load."}
        </p>
      </div>

      {/* 4. Findings / Audit Items */}
      <div className="p-6 rounded-2xl bg-white border border-sand-300 shadow-subtle hover:border-forest-600 transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-forest-500">
              Privacy Findings
            </span>
            <div className="p-2 rounded-xl bg-sand-100 text-amber-800 border border-sand-300">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-forest-950">
              {findingsCount}
            </span>
            <span className="text-xs text-forest-500 font-mono">
              Deductions
            </span>
          </div>
        </div>
        <p className="mt-3 text-xs text-forest-600 leading-relaxed">
          {findingsCount === 0
            ? "Zero privacy deductions recorded."
            : "Rule violations verified with empirical evidence."}
        </p>
      </div>
    </div>
  );
}
