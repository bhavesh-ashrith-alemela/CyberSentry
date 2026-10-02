"use client";

import React from "react";
import { Cookie, Radio, Sliders, AlertTriangle } from "lucide-react";
import { ReportMetrics, ConsentBanner, Finding } from "@/lib/types";
import { MetricCard, Badge } from "@/components/ui";

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

  let bannerStatusLabel = "None Detected";
  let bannerVariant: "success" | "warning" | "danger" = "danger";
  let bannerSubtext = "No cookie banner observed";

  if (bannerDetected) {
    if (isAsymmetric || !hasReject) {
      bannerStatusLabel = "Asymmetric";
      bannerVariant = "warning";
      bannerSubtext = "Decline hidden in settings";
    } else {
      bannerStatusLabel = "Balanced";
      bannerVariant = "success";
      bannerSubtext = "Equal accept & reject options";
    }
  }

  // 4. Findings Computation
  const totalFindings = findings.length;
  const totalDeductions = findings.reduce((sum, f) => sum + (f.scoreDeduction || 0), 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Metric 1: Cookies */}
      <MetricCard
        label="Cookies Deposited"
        value={totalCookies}
        icon={<Cookie className="h-4 w-4" />}
        status={
          <Badge variant={thirdPartyCookies === 0 ? "success" : "neutral"} size="sm">
            {thirdPartyCookies === 0 ? "0 3rd-Party" : `${thirdPartyCookies} 3rd-Party`}
          </Badge>
        }
        delta={`${firstPartyCookies} first-party (${thirdPartyCookies} external)`}
      />

      {/* Metric 2: Trackers */}
      <MetricCard
        label="Trackers Identified"
        value={totalTrackers}
        icon={<Radio className="h-4 w-4" />}
        status={
          <Badge
            variant={totalTrackers === 0 ? "success" : totalTrackers <= 3 ? "warning" : "danger"}
            size="sm"
          >
            {totalTrackers === 0 ? "Clean" : totalTrackers <= 3 ? "Moderate" : "Elevated"}
          </Badge>
        }
        delta={`${thirdPartyRequests} third-party network calls`}
      />

      {/* Metric 3: Consent */}
      <MetricCard
        label="Consent Architecture"
        value={bannerDetected ? (cmpName || "CMP Banner") : "None"}
        icon={<Sliders className="h-4 w-4" />}
        status={
          <Badge variant={bannerVariant} size="sm" dot>
            {bannerStatusLabel}
          </Badge>
        }
        delta={bannerSubtext}
      />

      {/* Metric 4: Findings */}
      <MetricCard
        label="Audit Findings"
        value={totalFindings}
        icon={<AlertTriangle className="h-4 w-4" />}
        status={
          <Badge variant={totalFindings === 0 ? "success" : "warning"} size="sm">
            {totalDeductions > 0 ? `-${totalDeductions} pts` : "0 pts"}
          </Badge>
        }
        delta={totalFindings === 0 ? "Zero rule deductions" : `${totalDeductions} pts total deduction`}
      />
    </div>
  );
}
