"use client";

import React from "react";
import Link from "next/link";
import {
  Loader2,
  AlertCircle,
  Check,
  RefreshCw,
  ArrowLeft,
  Globe,
  Cookie,
  Radio,
  FileCheck2,
  Sliders,
} from "lucide-react";
import { ScanStatus } from "@/lib/types";
import { Card, Badge, Button } from "@/components/ui";

interface StatusStepperProps {
  status: ScanStatus;
  url: string;
  errorMessage?: string | null;
  onRetry?: () => void;
  cookiesCount?: number;
  trackersCount?: number;
  requestsCount?: number;
  consentElementsCount?: number;
}

const STAGES = [
  {
    step: "1",
    title: "Loading Site",
    desc: "Website is being loaded in the controlled browser.",
  },
  {
    step: "2",
    title: "Collecting Data",
    desc: "Cookies, requests, scripts and consent elements are being observed.",
  },
  {
    step: "3",
    title: "Analyzing",
    desc: "Tracking domains, cookies and consent behaviour are being analyzed.",
  },
  {
    step: "4",
    title: "Generating Report",
    desc: "The final score and report are being prepared.",
  },
];

const ACTIVITY_MESSAGES: Record<string, string> = {
  pending: "Connecting to the target website safely.",
  scanning: "Observing cookies, network requests and consent elements.",
  analyzing: "Matching tracker domains and evaluating consent behaviour.",
  completed: "Preparing your privacy transparency report.",
};

export function StatusStepper({
  status,
  url,
  errorMessage,
  onRetry,
  cookiesCount,
  trackersCount,
  requestsCount,
  consentElementsCount,
}: StatusStepperProps) {
  // Map backend status to 4 user-facing stages
  let activeIndex = 0;
  if (status === "pending") activeIndex = 0;
  else if (status === "scanning") activeIndex = 1;
  else if (status === "analyzing") activeIndex = 2;
  else if (status === "completed") activeIndex = 3;

  let domain = url || "Target Website";
  if (url && url !== "Target Website" && url.includes(".")) {
    try {
      const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
      domain = parsed.hostname;
    } catch {
      domain = url;
    }
  } else {
    domain = url || "Target Website";
  }

  // 1. FAILED STATE: Clean, calm error card
  if (status === "failed") {
    return (
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Top Breadcrumb & Status */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-cs-muted hover:text-cs-text transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Scanner</span>
          </Link>
          <Badge variant="danger" size="sm" dot>
            Crawl Interrupted
          </Badge>
        </div>

        {/* Error Card */}
        <Card padding="lg" className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl bg-cs-danger-soft text-cs-danger flex items-center justify-center shrink-0 mt-0.5 border border-red-200/70">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-cs-text font-sans">
                Scan could not be completed
              </h2>
              <p className="text-xs sm:text-sm text-cs-muted">
                Target: <span className="font-mono text-cs-text">{url}</span>
              </p>
            </div>
          </div>

          {/* Diagnostic Information */}
          <div className="p-4 rounded-xl bg-slate-50 border border-cs-border text-xs text-cs-muted space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-cs-text block font-mono">
              Diagnostic Information
            </span>
            <p className="leading-relaxed">
              {errorMessage ||
                "The headless crawler encountered a network timeout, unreachable host, or strict connection firewall."}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {onRetry && (
              <Button
                variant="primary"
                size="md"
                onClick={onRetry}
                className="gap-2 shadow-xs"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Retry Scan</span>
              </Button>
            )}
            <Link href="/">
              <Button variant="outline" size="md" className="gap-2">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Try Another Website</span>
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // 2. ACTIVE PROGRESS STATE (Pending, Scanning, Analyzing)
  const statusBadgeVariant =
    status === "analyzing"
      ? "purple"
      : status === "completed"
      ? "success"
      : status === "scanning"
      ? "primary"
      : "neutral";

  const statusLabel =
    status === "analyzing"
      ? "Analyzing"
      : status === "completed"
      ? "Generating Report"
      : status === "scanning"
      ? "Collecting Data"
      : "Loading Site";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Report Header: Website Info & Live Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-cs-surface border border-cs-border shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-cs-primary-soft text-cs-primary flex items-center justify-center shrink-0">
            <Globe className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-cs-text truncate">
              {domain}
            </h3>
            {url && url !== "Target Website" ? (
              <p className="text-xs text-cs-muted font-mono truncate">{url}</p>
            ) : (
              <p className="text-xs text-cs-muted font-sans truncate">Connecting safely...</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Badge variant={statusBadgeVariant} size="md" dot>
            {statusLabel}
          </Badge>
        </div>
      </div>

      {/* Main Scan Card */}
      <Card padding="lg" className="space-y-8 shadow-sm">
        {/* Card Title & Context */}
        <div className="text-center space-y-1.5 max-w-md mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-cs-text font-sans">
            Scanning Website...
          </h2>
          <p className="text-xs sm:text-sm text-cs-muted leading-relaxed">
            This may take a few moments. Please keep this page open.
          </p>
        </div>

        {/* 4-Step Progress Timeline (Desktop Horizontal) */}
        <div className="hidden sm:block">
          <div className="grid grid-cols-4 gap-4 relative">
            {/* Connecting Track Line behind steps */}
            <div
              className="absolute top-4 left-8 right-8 h-0.5 bg-slate-200 -z-0"
              aria-hidden="true"
            >
              <div
                className="h-full bg-cs-primary transition-all duration-500 ease-out"
                style={{
                  width: `${(activeIndex / (STAGES.length - 1)) * 100}%`,
                }}
              />
            </div>

            {STAGES.map((stage, idx) => {
              const isDone = idx < activeIndex;
              const isCurrent = idx === activeIndex;
              const isPending = idx > activeIndex;

              return (
                <div
                  key={stage.step}
                  className="relative z-10 flex flex-col items-center text-center space-y-2.5"
                >
                  {/* Step Indicator */}
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                      isDone
                        ? "bg-cs-success text-white shadow-xs"
                        : isCurrent
                        ? "bg-cs-primary text-white ring-4 ring-blue-100 shadow-xs"
                        : "bg-cs-surface border border-cs-border text-cs-muted"
                    }`}
                  >
                    {isDone ? (
                      <Check className="h-4 w-4 stroke-[3]" />
                    ) : isCurrent ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <span className="font-mono text-[11px]">{stage.step}</span>
                    )}
                  </div>

                  {/* Step Label & Subtitle */}
                  <div>
                    <span
                      className={`text-xs block font-semibold ${
                        isCurrent
                          ? "text-cs-primary"
                          : isDone
                          ? "text-cs-text"
                          : "text-cs-muted"
                      }`}
                    >
                      {stage.title}
                    </span>
                    <p className="text-[11px] text-cs-muted mt-0.5 leading-tight max-w-[130px] mx-auto">
                      {stage.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4-Step Progress Timeline (Mobile Vertical) */}
        <div className="sm:hidden space-y-3.5">
          {STAGES.map((stage, idx) => {
            const isDone = idx < activeIndex;
            const isCurrent = idx === activeIndex;

            return (
              <div
                key={stage.step}
                className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${
                  isCurrent
                    ? "bg-cs-primary-soft/40 border-blue-200"
                    : isDone
                    ? "bg-slate-50/70 border-cs-border"
                    : "bg-cs-surface border-cs-border/60 opacity-60"
                }`}
              >
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5 ${
                    isDone
                      ? "bg-cs-success text-white"
                      : isCurrent
                      ? "bg-cs-primary text-white"
                      : "bg-slate-100 text-cs-muted border border-cs-border"
                  }`}
                >
                  {isDone ? (
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  ) : isCurrent ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <span>{stage.step}</span>
                  )}
                </div>

                <div className="min-w-0">
                  <span
                    className={`text-xs font-bold block ${
                      isCurrent ? "text-cs-primary" : "text-cs-text"
                    }`}
                  >
                    {stage.title}
                  </span>
                  <p className="text-[11px] text-cs-muted mt-0.5">
                    {stage.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Current Activity Message */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-cs-border flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 text-cs-text font-medium">
            <Loader2 className="h-4 w-4 text-cs-primary animate-spin shrink-0" />
            <span>
              {ACTIVITY_MESSAGES[status] || "Processing telemetry data..."}
            </span>
          </div>
          <span className="text-[11px] font-mono text-cs-muted uppercase hidden sm:inline">
            Stage {Math.min(4, activeIndex + 1)} of 4
          </span>
        </div>

        {/* Live Collection Metrics */}
        <div className="pt-2 border-t border-cs-border space-y-2.5">
          <span className="text-[10px] font-semibold text-cs-muted uppercase tracking-wider block">
            Live Telemetry Interception
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Metric 1: Cookies Found */}
            <div className="p-3 rounded-xl bg-slate-50/60 border border-cs-border flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-cs-muted mb-1">
                <Cookie className="h-3.5 w-3.5 text-cs-primary" />
                <span className="text-[11px] font-medium">Cookies Found</span>
              </div>
              <span className="text-xl font-bold text-cs-text">
                {cookiesCount !== undefined && cookiesCount > 0 ? cookiesCount : "—"}
              </span>
            </div>

            {/* Metric 2: Trackers Found */}
            <div className="p-3 rounded-xl bg-slate-50/60 border border-cs-border flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-cs-muted mb-1">
                <Radio className="h-3.5 w-3.5 text-cs-purple" />
                <span className="text-[11px] font-medium">Trackers Found</span>
              </div>
              <span className="text-xl font-bold text-cs-text">
                {trackersCount !== undefined && trackersCount > 0 ? trackersCount : "—"}
              </span>
            </div>

            {/* Metric 3: Requests Analyzed */}
            <div className="p-3 rounded-xl bg-slate-50/60 border border-cs-border flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-cs-muted mb-1">
                <Globe className="h-3.5 w-3.5 text-cs-success" />
                <span className="text-[11px] font-medium">Requests</span>
              </div>
              <span className="text-xl font-bold text-cs-text">
                {requestsCount !== undefined && requestsCount > 0 ? requestsCount : "—"}
              </span>
            </div>

            {/* Metric 4: Consent Elements */}
            <div className="p-3 rounded-xl bg-slate-50/60 border border-cs-border flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-cs-muted mb-1">
                <Sliders className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-[11px] font-medium">Consent UI</span>
              </div>
              <span className="text-xl font-bold text-cs-text">
                {consentElementsCount !== undefined && consentElementsCount > 0 ? "Detected" : "—"}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
