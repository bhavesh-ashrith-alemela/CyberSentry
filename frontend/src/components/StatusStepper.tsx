"use client";

import Link from "next/link";
import { Loader2, AlertCircle, Check, RefreshCw, ArrowLeft, Globe, FileText } from "lucide-react";
import { ScanStatus } from "@/lib/types";
import { PaperCard, FolderTab, EditorialBadge, FileLabel } from "@/components/ui";

interface StatusStepperProps {
  status: ScanStatus;
  url: string;
  errorMessage?: string | null;
  onRetry?: () => void;
}

const STAGES = [
  {
    step: "01",
    label: "WEBSITE CONNECTED",
    desc: "Resolving DNS and establishing isolated route sandbox.",
  },
  {
    step: "02",
    label: "EVIDENCE COLLECTED",
    desc: "Chromium crawler executing client-side scripts and storage.",
  },
  {
    step: "03",
    label: "TRACKERS ANALYZED",
    desc: "Intercepting outbound third-party network requests and telemetry.",
  },
  {
    step: "04",
    label: "CONSENT ANALYZED",
    desc: "Evaluating CMP banner choice architecture and friction.",
  },
  {
    step: "05",
    label: "DOSSIER PREPARED",
    desc: "Computing deterministic transparency score and audit record.",
  },
];

export function StatusStepper({
  status,
  url,
  errorMessage,
  onRetry,
}: StatusStepperProps) {
  let activeIndex = 1;
  if (status === "pending") activeIndex = 0;
  else if (status === "scanning") activeIndex = 2;
  else if (status === "analyzing") activeIndex = 3;
  else if (status === "completed") activeIndex = 5;

  let domain = url;
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    domain = parsed.hostname;
  } catch {
    domain = url;
  }

  // FAILED STATE — Calm Editorial Paper Card
  if (status === "failed") {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-end justify-between px-1">
          <FolderTab color="pink" size="md">
            AUDIT ERROR FILE
          </FolderTab>
          <span className="font-mono text-xs text-cs-muted pb-1">
            [ STATUS: FAILED ]
          </span>
        </div>

        <div className="rounded-2xl rounded-tl-none border border-cs-border bg-cs-paper p-6 sm:p-8 shadow-paper text-cs-ink space-y-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl bg-cs-pink-light border border-cs-pink/40 text-cs-danger flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <EditorialBadge variant="danger" size="xs" className="mb-2">
                CRAWL INTERRUPTED
              </EditorialBadge>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-cs-ink">
                Audit Execution Could Not Complete
              </h2>
              <p className="mt-1 text-xs font-mono text-cs-muted break-all">
                Target: {url}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-cs-cream/60 border border-cs-border text-xs font-mono text-cs-ink space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-cs-muted block font-bold">
              Engine Diagnostic Trace
            </span>
            <p className="leading-relaxed text-cs-muted">
              {errorMessage || "The headless crawler encountered a network timeout, unreachable host, or strict connection firewall."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {onRetry && (
              <button
                onClick={onRetry}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono font-semibold bg-cs-denim text-white hover:bg-cs-denim-dark transition-colors shadow-sm active:translate-y-0.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Retry Audit</span>
              </button>
            )}
            <Link
              href="/"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono font-semibold bg-cs-paper border border-cs-border text-cs-ink hover:bg-cs-cream-deep/40 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Try Another Website</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE SCANNING STATE — Active File Stepper
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Folder Tab Header */}
      <div className="flex items-end justify-between px-1">
        <FolderTab color="denim" size="md">
          ACTIVE AUDIT DOSSIER
        </FolderTab>
        <span className="font-mono text-xs text-cs-muted pb-1">
          [ {status.toUpperCase()} ]
        </span>
      </div>

      {/* Main Dossier Card */}
      <div className="rounded-2xl rounded-tl-none border border-cs-border bg-cs-paper p-6 sm:p-8 shadow-paper text-cs-ink">
        
        {/* Header Block */}
        <div className="border-b border-cs-border/80 pb-5 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <EditorialBadge variant="denim" size="xs" dot>
              LIVE TELEMETRY INTERCEPTION
            </EditorialBadge>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold font-display text-cs-ink">
            Analyzing {domain}
          </h2>
          <p className="mt-1 text-xs font-mono text-cs-muted break-all">
            URL: {url}
          </p>
        </div>

        {/* 5-Stage Editorial Timeline */}
        <div className="space-y-3">
          {STAGES.map((stg, i) => {
            const isDone = i < activeIndex;
            const isCurrent = i === activeIndex;

            return (
              <div
                key={stg.step}
                className={`p-3.5 sm:p-4 rounded-xl border transition-all duration-200 flex items-start gap-3.5 ${
                  isCurrent
                    ? "bg-cs-denim-light border-cs-denim/40 shadow-xs"
                    : isDone
                    ? "bg-cs-olive-light/50 border-cs-olive/25 text-cs-ink"
                    : "bg-cs-paper border-cs-border/60 text-cs-muted opacity-50"
                }`}
              >
                {/* Step indicator */}
                <div className="mt-0.5 shrink-0">
                  {isDone ? (
                    <div className="h-5 w-5 rounded-full bg-cs-olive text-white flex items-center justify-center text-[10px]">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </div>
                  ) : isCurrent ? (
                    <div className="h-5 w-5 rounded-full bg-cs-denim text-white flex items-center justify-center text-[10px]">
                      <Loader2 className="h-3 w-3 animate-spin stroke-[2.5]" />
                    </div>
                  ) : (
                    <div className="h-5 w-5 rounded-full border border-cs-border bg-cs-paper text-cs-muted text-[10px] font-mono flex items-center justify-center font-bold">
                      {stg.step}
                    </div>
                  )}
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4
                      className={`text-xs sm:text-sm font-bold font-mono ${
                        isCurrent
                          ? "text-cs-denim"
                          : isDone
                          ? "text-cs-ink"
                          : "text-cs-muted"
                      }`}
                    >
                      {stg.step} — {stg.label}
                    </h4>

                    {isCurrent && (
                      <span className="text-[10px] font-mono font-bold uppercase text-cs-denim px-2 py-0.5 rounded bg-cs-denim/10">
                        In Progress
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-cs-muted mt-0.5 leading-relaxed font-sans">
                    {stg.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Reassurance */}
        <div className="mt-6 pt-4 border-t border-cs-border/80 flex items-center justify-between text-[11px] font-mono text-cs-muted">
          <span>Chromium headless incognito session active</span>
          <span>Please do not refresh</span>
        </div>
      </div>
    </div>
  );
}
