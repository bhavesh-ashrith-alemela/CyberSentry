import { CheckCircle2, XCircle, AlertCircle, MousePointerClick, Sliders } from "lucide-react";
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

  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-white border border-sand-300 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sand-200 pb-5">
        <div>
          <h3 className="text-lg font-bold text-forest-950 flex items-center gap-2.5">
            <span>Consent Architecture & Dark Pattern Audit</span>
            {isDetected ? (
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-forest-50 text-forest-800 border border-forest-200">
                CMP: {cmpName}
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-rust-50 text-rust-800 border border-rust-200">
                No Banner Detected
              </span>
            )}
          </h3>
          <p className="text-xs text-forest-600 font-mono mt-1">
            Evaluates initial presence, button choice symmetry, and controlled interaction deltas.
          </p>
        </div>

        <div className="text-xs font-mono text-forest-500">
          Visibility:{" "}
          <span className="font-semibold text-forest-900 uppercase">
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
              ? "bg-forest-50/60 border-forest-200 text-forest-800"
              : "bg-sand-100/50 border-sand-300 text-forest-500"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-forest-500">
              Accept Button
            </span>
            {hasAccept ? (
              <CheckCircle2 className="h-4 w-4 text-forest-700" />
            ) : (
              <XCircle className="h-4 w-4 text-forest-400" />
            )}
          </div>
          <div className="mt-2 font-semibold text-forest-950">
            {hasAccept ? `"${raw?.acceptButtonText || "Accept All"}"` : "Not Detected"}
          </div>
          <p className="mt-1 text-[11px] text-forest-600">
            {hasAccept ? "Affirmative consent trigger detected." : "No explicit accept button."}
          </p>
        </div>

        {/* Reject Button */}
        <div
          className={`p-4 rounded-xl border ${
            hasReject
              ? "bg-forest-50/60 border-forest-200 text-forest-800"
              : "bg-rust-50/60 border-rust-200 text-rust-800"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-forest-500">
              Reject Button
            </span>
            {hasReject ? (
              <CheckCircle2 className="h-4 w-4 text-forest-700" />
            ) : (
              <XCircle className="h-4 w-4 text-rust-700" />
            )}
          </div>
          <div className="mt-2 font-semibold text-forest-950">
            {hasReject ? `"${raw?.rejectButtonText || "Reject All"}"` : "Missing on Primary View"}
          </div>
          <p className="mt-1 text-[11px] text-forest-600">
            {hasReject
              ? "1-click refusal available to visitors."
              : "Visitors cannot decline with equal ease."}
          </p>
        </div>

        {/* Settings / Preferences Button */}
        <div
          className={`p-4 rounded-xl border ${
            hasSettings
              ? "bg-sand-100 border-sand-300 text-forest-800"
              : "bg-sand-50 border-sand-200 text-forest-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-forest-500">
              Preferences Menu
            </span>
            <Sliders className="h-4 w-4 text-forest-600" />
          </div>
          <div className="mt-2 font-semibold text-forest-950">
            {hasSettings ? `"${raw?.settingsButtonText || "Preferences"}"` : "None"}
          </div>
          <p className="mt-1 text-[11px] text-forest-600">
            {hasSettings ? "Secondary settings dialog provided." : "No granular options button."}
          </p>
        </div>
      </div>

      {/* Dark Pattern Alert Callout (If Asymmetric) */}
      {isAsymmetric && (
        <div className="mt-5 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-amber-900">
              Dark Pattern Detected: Asymmetric Choice Architecture
            </h4>
            <p className="mt-1 text-xs text-amber-800 leading-relaxed">
              The consent banner allows visitors to accept all tracking with a single click, but forces users wishing to decline into a secondary &quot;Settings&quot; menu. Under EDPB and CNIL regulatory guidance, rejecting cookies must be as effortless as accepting them.
            </p>
          </div>
        </div>
      )}

      {/* Controlled Interaction Testing Result */}
      {consentTest && (
        <div className="mt-6 p-5 rounded-xl bg-sand-50 border border-sand-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-forest-700 flex items-center gap-1.5 font-semibold">
              <MousePointerClick className="h-3.5 w-3.5 text-forest-700" />
              <span>Controlled Interaction Test</span>
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                consentTest.tested
                  ? "bg-forest-100 text-forest-900 border-forest-300"
                  : "bg-sand-200 text-forest-600 border-sand-300"
              }`}
            >
              {consentTest.tested ? "Interaction Tested" : "Untested"}
            </span>
          </div>

          <p className="text-xs text-forest-700 leading-relaxed">
            {consentTest.details ||
              (consentTest.tested
                ? `Automated click executed on "${consentTest.buttonText || "Accept"}". Recorded ${consentTest.observedNewCookies} additional cookies and ${consentTest.observedNewRequests} telemetry calls post-consent.`
                : "No unambiguous consent button could be verified for interaction testing.")}
          </p>

          {consentTest.tested && (
            <div className="mt-3 flex items-center gap-6 text-xs font-mono">
              <div>
                <span className="text-forest-500">Post-Consent Cookies: </span>
                <span className="font-bold text-forest-950">
                  +{consentTest.observedNewCookies}
                </span>
              </div>
              <div>
                <span className="text-forest-500">Telemetry Beacons: </span>
                <span className="font-bold text-forest-950">
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
