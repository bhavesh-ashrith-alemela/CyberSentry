import { CheckCircle2, XCircle, AlertCircle, Sparkles, MousePointerClick, Sliders } from "lucide-react";
import { ConsentBanner, ReportMetrics } from "@/lib/types";

interface ConsentCardProps {
  banner?: ConsentBanner | null;
  metrics: ReportMetrics;
}

export function ConsentCard({ banner, metrics }: ConsentCardProps) {
  const isDetected = banner?.detected ?? false;
  const cmpName = banner?.cmpName || "Standard Cookie Banner";
  const raw = banner?.rawMetadata;
  const hasAccept = banner?.hasAcceptButton ?? false;
  const hasReject = banner?.hasRejectButton ?? false;
  const hasSettings = banner?.hasSettingsButton ?? false;
  const consentTest = metrics.consentTestSummary || raw?.consentTest;

  // Dark pattern analysis
  const isAsymmetric = hasAccept && !hasReject && hasSettings;
  const optionCount = raw?.optionIndicators?.count ?? 0;

  return (
    <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyber-border/80 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span>Consent Management & Banner Audit</span>
            {isDetected ? (
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                CMP: {cmpName}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-rose-500/20 text-rose-400 border border-rose-500/30">
                No Banner Detected
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Evaluates banner presence, choice asymmetry, and controlled post-consent deltas.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400">
          Visibility:{" "}
          <span className="font-semibold text-slate-200 uppercase">
            {raw?.visibility || (isDetected ? "visible" : "unobserved")}
          </span>
        </div>
      </div>

      {/* Button Choice Indicators */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Accept Button */}
        <div
          className={`p-4 rounded-xl border ${
            hasAccept
              ? "bg-slate-900/60 border-emerald-500/30 text-emerald-400"
              : "bg-slate-900/30 border-slate-800 text-slate-500"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Accept Button
            </span>
            {hasAccept ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : (
              <XCircle className="h-4 w-4 text-slate-500" />
            )}
          </div>
          <div className="mt-2 font-semibold text-slate-200">
            {hasAccept ? `"${raw?.acceptButtonText || "Accept All"}"` : "Not Detected"}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {hasAccept ? "Affirmative consent trigger present." : "No explicit accept button."}
          </p>
        </div>

        {/* Reject Button */}
        <div
          className={`p-4 rounded-xl border ${
            hasReject
              ? "bg-slate-900/60 border-emerald-500/30 text-emerald-400"
              : "bg-rose-950/20 border-rose-500/40 text-rose-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Reject Button
            </span>
            {hasReject ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : (
              <XCircle className="h-4 w-4 text-rose-400" />
            )}
          </div>
          <div className="mt-2 font-semibold text-slate-200">
            {hasReject ? `"${raw?.rejectButtonText || "Reject All"}"` : "Missing on Primary View"}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {hasReject
              ? "1-click refusal available to users."
              : "Users cannot decline with equal ease."}
          </p>
        </div>

        {/* Settings / Preferences Button */}
        <div
          className={`p-4 rounded-xl border ${
            hasSettings
              ? "bg-slate-900/60 border-cyan-500/30 text-cyan-400"
              : "bg-slate-900/30 border-slate-800 text-slate-500"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Preferences Menu
            </span>
            <Sliders className="h-4 w-4" />
          </div>
          <div className="mt-2 font-semibold text-slate-200">
            {hasSettings ? `"${raw?.settingsButtonText || "Preferences"}"` : "None"}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {hasSettings ? "Secondary settings modal provided." : "No granular settings button."}
          </p>
        </div>
      </div>

      {/* Dark Pattern Alert Callout (If Asymmetric) */}
      {isAsymmetric && (
        <div className="mt-4 p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-amber-300">
              Dark Pattern Detected: Asymmetric Choice Architecture
            </h4>
            <p className="mt-1 text-xs text-amber-200/80 leading-relaxed">
              The consent banner allows visitors to accept all tracking with a single click, but forces users wishing to decline into a secondary &quot;Settings&quot; menu. Under EDPB and CNIL guidelines, rejecting cookies must be as easy as accepting them.
            </p>
          </div>
        </div>
      )}

      {/* Controlled Interaction Testing Result */}
      {consentTest && (
        <div className="mt-6 p-4 rounded-xl bg-slate-900/80 border border-cyber-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <MousePointerClick className="h-3.5 w-3.5 text-cyber-accent" />
              <span>Controlled Interaction Test</span>
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                consentTest.tested
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-slate-800 text-slate-400 border-slate-700"
              }`}
            >
              {consentTest.tested ? "Interaction Tested" : "Untested"}
            </span>
          </div>

          <p className="text-xs text-slate-400">
            {consentTest.details ||
              (consentTest.tested
                ? `Automated click executed on "${consentTest.buttonText || "Accept"}". Recorded ${consentTest.observedNewCookies} additional cookies and ${consentTest.observedNewRequests} telemetry calls post-consent.`
                : "No unambiguous consent button could be verified for interaction testing.")}
          </p>

          {consentTest.tested && (
            <div className="mt-3 flex items-center gap-6 text-xs font-mono">
              <div>
                <span className="text-slate-500">Post-Consent Cookies: </span>
                <span className="font-bold text-slate-200">
                  +{consentTest.observedNewCookies}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Telemetry Beacons: </span>
                <span className="font-bold text-slate-200">
                  +{consentTest.observedNewRequests}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
