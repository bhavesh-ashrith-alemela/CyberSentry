"use client";

import { Check, X, Sliders, MousePointerClick, AlertCircle } from "lucide-react";
import { ConsentBanner, ReportMetrics } from "@/lib/types";
import { FileLabel, EditorialBadge, PaperCard } from "@/components/ui";

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
  const isAsymmetric = hasAccept && !hasReject;
  const optionCount = raw?.optionIndicators?.count ?? 0;

  const checklistItems = [
    {
      label: "Consent Banner Detected",
      status: isDetected ? "YES" : "NO",
      subtext: isDetected ? (cmpName || "Generic Consent UI") : "No consent modal detected",
      positive: isDetected,
    },
    {
      label: "Affirmative 'Accept' Option",
      status: hasAccept ? "Detected" : "Missing",
      subtext: hasAccept ? `Label: "${raw?.acceptButtonText || "Accept All"}"` : "No explicit accept button",
      positive: hasAccept,
    },
    {
      label: "Single-Click 'Reject' Option",
      status: hasReject ? "Detected" : "Missing on Layer 1",
      subtext: hasReject ? `Label: "${raw?.rejectButtonText || "Reject All"}"` : "Cannot refuse with 1 click",
      positive: hasReject,
    },
    {
      label: "Granular Settings / Preferences",
      status: hasSettings ? "Detected" : "None",
      subtext: hasSettings ? `Label: "${raw?.settingsButtonText || "Manage"}"` : "No secondary options modal",
      positive: hasSettings,
    },
  ];

  return (
    <div className="rounded-2xl border border-cs-border bg-cs-paper p-6 sm:p-7 shadow-paper text-cs-ink space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cs-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <FileLabel code="CHOICE_ARCHITECTURE" variant="muted" />
            <EditorialBadge
              variant={isDetected ? (isAsymmetric ? "warning" : "safe") : "danger"}
              size="xs"
            >
              {isDetected ? (isAsymmetric ? "Asymmetry Detected" : "Balanced Banner") : "No Notice"}
            </EditorialBadge>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-display text-cs-ink">
            Consent & Choice Audit
          </h3>
          <p className="text-xs text-cs-muted font-sans mt-0.5">
            Evaluates presence of affirmative consent triggers, equal choice balance, and post-consent deltas.
          </p>
        </div>

        <div className="text-right font-mono text-xs text-cs-muted">
          Visibility:{" "}
          <span className="font-bold text-cs-ink uppercase">
            {raw?.visibility || (isDetected ? "Visible on load" : "Unobserved")}
          </span>
        </div>
      </div>

      {/* Evidence Checklist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {checklistItems.map((item, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-xl border ${
              item.positive
                ? "bg-cs-paper border-cs-border"
                : "bg-cs-pink-light/40 border-cs-pink/40"
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-mono uppercase text-cs-muted mb-2">
              <span>{item.label}</span>
              {item.positive ? (
                <div className="h-4 w-4 rounded-full bg-cs-olive-light text-cs-olive border border-cs-olive/30 flex items-center justify-center">
                  <Check className="h-2.5 w-2.5 stroke-[3]" />
                </div>
              ) : (
                <div className="h-4 w-4 rounded-full bg-cs-pink-light text-cs-danger border border-cs-pink/40 flex items-center justify-center">
                  <X className="h-2.5 w-2.5 stroke-[3]" />
                </div>
              )}
            </div>

            <div className="font-bold text-sm text-cs-ink font-sans">
              {item.status}
            </div>
            <p className="text-[11px] font-mono text-cs-muted mt-1 truncate">
              {item.subtext}
            </p>
          </div>
        ))}
      </div>

      {/* Asymmetric Choice Architecture Callout */}
      {isAsymmetric && (
        <div className="p-4 rounded-xl bg-cs-warning-bg/60 border border-cs-warning/30 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-cs-warning shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-cs-ink font-sans">
              Choice Friction Observed: Asymmetric Architecture
            </h4>
            <p className="mt-1 text-xs text-cs-muted leading-relaxed font-sans">
              The consent banner allows visitors to accept all tracking with a single click, but conceals or excludes an equally prominent &quot;Reject All&quot; button on layer 1, requiring visitors wishing to decline into secondary preferences menus.
            </p>
          </div>
        </div>
      )}

      {/* Controlled Interaction Testing Result */}
      {consentTest && (
        <div className="p-4 rounded-xl bg-cs-cream/50 border border-cs-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cs-ink flex items-center gap-1.5">
              <MousePointerClick className="h-4 w-4 text-cs-denim" />
              <span>Controlled Interaction Test</span>
            </span>
            <EditorialBadge
              variant={consentTest.tested ? "safe" : "default"}
              size="xs"
            >
              {consentTest.tested ? "Interaction Tested" : "Untested"}
            </EditorialBadge>
          </div>

          <p className="text-xs text-cs-muted leading-relaxed font-sans">
            {consentTest.details ||
              (consentTest.tested
                ? `Automated click dispatched on "${consentTest.buttonText || "Accept"}". Observed ${consentTest.observedNewCookies} additional cookies deposited and ${consentTest.observedNewRequests} additional network requests after consent.`
                : "No unambiguous consent button could be verified for interaction testing.")}
          </p>

          {consentTest.tested && (
            <div className="flex items-center gap-6 pt-2 text-xs font-mono">
              <div>
                <span className="text-cs-muted">Post-Consent Cookies: </span>
                <span className="font-bold text-cs-ink">+{consentTest.observedNewCookies}</span>
              </div>
              <div>
                <span className="text-cs-muted">Post-Consent Requests: </span>
                <span className="font-bold text-cs-ink">+{consentTest.observedNewRequests}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
