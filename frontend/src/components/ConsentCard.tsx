"use client";

import React from "react";
import { Check, X, MousePointerClick, AlertCircle, ShieldAlert } from "lucide-react";
import { ConsentBanner, ReportMetrics } from "@/lib/types";
import { Card, Badge } from "@/components/ui";

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
  const preConsentTracking = (consentTest?.observedNewCookies ?? 0) === 0 && metrics.totalCookies > 0;

  const checklistItems = [
    {
      label: "Consent Banner Detected",
      status: isDetected ? "Detected" : "None Detected",
      subtext: isDetected ? (cmpName || "Generic Consent UI") : "No cookie banner observed",
      positive: isDetected,
    },
    {
      label: "Affirmative Accept Option",
      status: hasAccept ? "Available" : "Missing",
      subtext: hasAccept ? `Label: "${raw?.acceptButtonText || "Accept All"}"` : "No explicit accept button",
      positive: hasAccept,
    },
    {
      label: "Single-Click Reject Option",
      status: hasReject ? "Available" : "Missing on Layer 1",
      subtext: hasReject ? `Label: "${raw?.rejectButtonText || "Reject All"}"` : "Cannot decline with single click",
      positive: hasReject,
    },
    {
      label: "Granular Preferences",
      status: hasSettings ? "Available" : "Not Provided",
      subtext: hasSettings ? `Label: "${raw?.settingsButtonText || "Manage"}"` : "No secondary options modal",
      positive: hasSettings,
    },
    {
      label: "Preselected Categories",
      status: raw?.optionIndicators?.detected ? "Observed" : "None Observed",
      subtext: raw?.optionIndicators?.detected ? "Default tracking checkboxes active" : "No pre-ticked tracking boxes",
      positive: !raw?.optionIndicators?.detected,
    },
    {
      label: "Pre-Consent Telemetry",
      status: preConsentTracking ? "Immediate Storage" : "Deferred / Safe",
      subtext: preConsentTracking ? "Cookies set prior to user interaction" : "No telemetry fired prior to choice",
      positive: !preConsentTracking,
    },
  ];

  return (
    <Card padding="lg" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cs-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl sm:text-2xl font-bold font-sans text-cs-text">
              Consent Audit
            </h3>
            <Badge
              variant={isDetected ? (isAsymmetric ? "warning" : "success") : "danger"}
              size="sm"
              dot
            >
              {isDetected ? (isAsymmetric ? "Asymmetric Choices" : "Balanced Banner") : "No Notice Observed"}
            </Badge>
          </div>
          <p className="text-xs text-cs-muted">
            Evaluates presence of affirmative consent triggers, choice symmetry, and pre-consent tracking behaviour.
          </p>
        </div>

        <div className="text-left sm:text-right font-mono text-xs text-cs-muted shrink-0">
          Visibility:{" "}
          <span className="font-semibold text-cs-text">
            {raw?.visibility || (isDetected ? "Visible on load" : "Unobserved")}
          </span>
        </div>
      </div>

      {/* Checklist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {checklistItems.map((item, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-xl border transition-colors ${
              item.positive
                ? "bg-cs-surface border-cs-border"
                : "bg-red-50/40 border-red-200/60"
            }`}
          >
            <div className="flex items-center justify-between text-xs text-cs-muted mb-1.5">
              <span className="font-medium">{item.label}</span>
              {item.positive ? (
                <div className="h-4 w-4 rounded-full bg-cs-success-soft text-cs-success flex items-center justify-center shrink-0">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
              ) : (
                <div className="h-4 w-4 rounded-full bg-cs-danger-soft text-cs-danger flex items-center justify-center shrink-0">
                  <X className="h-3 w-3 stroke-[3]" />
                </div>
              )}
            </div>

            <div className="font-bold text-sm text-cs-text">
              {item.status}
            </div>
            <p className="text-[11px] text-cs-muted mt-0.5 truncate">
              {item.subtext}
            </p>
          </div>
        ))}
      </div>

      {/* Choice Friction Callout */}
      {isAsymmetric && (
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-cs-text">
              Choice Friction Observed: Asymmetric Architecture
            </h4>
            <p className="text-xs text-cs-muted leading-relaxed">
              The consent banner allows visitors to accept all tracking with a single click, but conceals or excludes an equally prominent &quot;Reject All&quot; button on layer 1, requiring visitors wishing to decline to navigate into secondary preferences menus.
            </p>
          </div>
        </div>
      )}

      {/* Controlled Interaction Test Result */}
      {consentTest && (
        <div className="p-4 rounded-xl bg-slate-50 border border-cs-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-cs-text flex items-center gap-1.5">
              <MousePointerClick className="h-4 w-4 text-cs-primary" />
              <span>Controlled Interaction Test</span>
            </span>
            <Badge variant={consentTest.tested ? "success" : "neutral"} size="sm">
              {consentTest.tested ? "Interaction Tested" : "Untested"}
            </Badge>
          </div>

          <p className="text-xs text-cs-muted leading-relaxed">
            {consentTest.details ||
              (consentTest.tested
                ? `Automated click dispatched on "${consentTest.buttonText || "Accept"}". Observed ${consentTest.observedNewCookies} additional cookies deposited and ${consentTest.observedNewRequests} additional network requests after consent.`
                : "No unambiguous consent button could be verified for interaction testing.")}
          </p>

          {consentTest.tested && (
            <div className="flex items-center gap-6 pt-1 text-xs">
              <div>
                <span className="text-cs-muted">Post-Consent Cookies: </span>
                <span className="font-bold text-cs-text">+{consentTest.observedNewCookies}</span>
              </div>
              <div>
                <span className="text-cs-muted">Post-Consent Requests: </span>
                <span className="font-bold text-cs-text">+{consentTest.observedNewRequests}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
