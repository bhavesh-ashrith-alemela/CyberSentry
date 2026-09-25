"use client";

import { Cookie, Radio, Sliders, ShieldCheck, AlertCircle } from "lucide-react";
import { ReportMetrics, ConsentBanner, Finding } from "@/lib/types";
import { PaperCard, EditorialBadge, FileLabel } from "@/components/ui";

interface MetricsGridProps {
  metrics: ReportMetrics;
  bannerDetected: boolean;
  cmpName: string | null;
  banner?: ConsentBanner | null;
  findings: Finding[];
}

export function MetricsGrid({
  metrics,
  bannerDetected,
  cmpName,
  banner,
  findings,
}: MetricsGridProps) {
  // 1. Cookies Computation
  const totalCookies = metrics.totalCookies || 0;
  const thirdPartyCookies = metrics.thirdPartyCookies || 0;
  const firstPartyCookies = Math.max(0, totalCookies - thirdPartyCookies);

  // 2. Trackers Computation
  const totalTrackers = metrics.totalTrackers || 0;
  const thirdPartyRequests = metrics.thirdPartyRequests || 0;

  // 3. Banner Computation
  const hasReject = banner?.hasRejectButton ?? false;
  const isAsymmetric = findings.some((f) => f.ruleId === "RULE_ASYMMETRIC_CONSENT");

  let bannerBadge: { text: string; variant: "safe" | "olive" | "warning" | "danger" | "default" };
  let bannerSummary = "No cookie notice observed.";
  if (!bannerDetected) {
    bannerBadge = { text: "Missing", variant: "danger" };
    bannerSummary = "Cookies set without informing visitors.";
  } else if (isAsymmetric || !hasReject) {
    bannerBadge = { text: "Asymmetric", variant: "warning" };
    bannerSummary = "Accept is 1-click; decline is hidden in settings.";
  } else {
    bannerBadge = { text: "Balanced", variant: "safe" };
    bannerSummary = "Accept & reject provided with equal ease.";
  }

  // 4. Pre-Consent Tracking Computation
  const hasPreConsent = findings.some((f) => f.ruleId === "RULE_PRE_CONSENT_TRACKING");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      
      {/* Metric 1: Cookies */}
      <PaperCard variant="default" className="flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3 border-b border-cs-border/70 pb-2">
            <FileLabel code="01/STORAGE" variant="muted" />
            <EditorialBadge variant={thirdPartyCookies === 0 ? "safe" : "default"} size="xs">
              {thirdPartyCookies === 0 ? "0 3rd-Party" : `${thirdPartyCookies} 3rd-Party`}
            </EditorialBadge>
          </div>

          <div className="my-2">
            <span className="text-3xl sm:text-4xl font-black font-display text-cs-ink">
              {totalCookies}
            </span>
            <span className="text-xs font-mono text-cs-muted ml-1.5 uppercase">
              Cookies
            </span>
          </div>

          <p className="text-xs text-cs-muted font-sans mt-1 leading-relaxed">
            {firstPartyCookies} first-party ({thirdPartyCookies} external third-party).
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-cs-border/60 text-[11px] font-mono text-cs-muted flex items-center gap-1.5">
          <Cookie className="h-3.5 w-3.5 text-cs-olive shrink-0" />
          <span>Browser storage inventory</span>
        </div>
      </PaperCard>

      {/* Metric 2: Third-Party Trackers */}
      <PaperCard variant="default" className="flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3 border-b border-cs-border/70 pb-2">
            <FileLabel code="02/TELEMETRY" variant="muted" />
            <EditorialBadge
              variant={totalTrackers === 0 ? "safe" : totalTrackers <= 3 ? "warning" : "danger"}
              size="xs"
            >
              {totalTrackers === 0 ? "Clean" : totalTrackers <= 3 ? "Moderate" : "Elevated"}
            </EditorialBadge>
          </div>

          <div className="my-2">
            <span className="text-3xl sm:text-4xl font-black font-display text-cs-ink">
              {totalTrackers}
            </span>
            <span className="text-xs font-mono text-cs-muted ml-1.5 uppercase">
              Trackers
            </span>
          </div>

          <p className="text-xs text-cs-muted font-sans mt-1 leading-relaxed">
            {thirdPartyRequests} outbound network requests captured.
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-cs-border/60 text-[11px] font-mono text-cs-muted flex items-center gap-1.5">
          <Radio className="h-3.5 w-3.5 text-cs-denim shrink-0" />
          <span>Cross-site tracking beacons</span>
        </div>
      </PaperCard>

      {/* Metric 3: Consent Banner */}
      <PaperCard variant="default" className="flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3 border-b border-cs-border/70 pb-2">
            <FileLabel code="03/CONSENT_UI" variant="muted" />
            <EditorialBadge variant={bannerBadge.variant} size="xs">
              {bannerBadge.text}
            </EditorialBadge>
          </div>

          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-black font-display text-cs-ink truncate block">
              {bannerDetected ? (cmpName || "CMP Banner") : "None"}
            </span>
            <span className="text-[10px] font-mono text-cs-muted uppercase">
              Choice Architecture
            </span>
          </div>

          <p className="text-xs text-cs-muted font-sans mt-1 leading-relaxed">
            {bannerSummary}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-cs-border/60 text-[11px] font-mono text-cs-muted flex items-center gap-1.5">
          <Sliders className="h-3.5 w-3.5 text-cs-muted shrink-0" />
          <span>Consent layer balance</span>
        </div>
      </PaperCard>

      {/* Metric 4: Pre-Consent Tracking */}
      <PaperCard variant="default" className="flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3 border-b border-cs-border/70 pb-2">
            <FileLabel code="04/TIMING" variant="muted" />
            <EditorialBadge
              variant={hasPreConsent ? "danger" : "safe"}
              size="xs"
              dot
            >
              {hasPreConsent ? "Active" : "Deferred"}
            </EditorialBadge>
          </div>

          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-black font-display text-cs-ink block">
              {hasPreConsent ? "Immediate" : "Safe"}
            </span>
            <span className="text-[10px] font-mono text-cs-muted uppercase">
              Pre-Consent State
            </span>
          </div>

          <p className="text-xs text-cs-muted font-sans mt-1 leading-relaxed">
            {hasPreConsent
              ? "Tracking telemetry fired prior to visitor choice."
              : "No telemetry executed before affirmative consent."}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-cs-border/60 text-[11px] font-mono text-cs-muted flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-cs-olive shrink-0" />
          <span>Visitor autonomy audit</span>
        </div>
      </PaperCard>

    </div>
  );
}
