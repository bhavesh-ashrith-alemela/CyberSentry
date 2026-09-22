"use client";

import Link from "next/link";
import { Loader2, AlertOctagon, CheckCircle2, ShieldAlert, RefreshCw, ArrowLeft } from "lucide-react";
import { ScanStatus } from "@/lib/types";

interface StatusStepperProps {
  status: ScanStatus;
  url: string;
  errorMessage?: string | null;
  onRetry?: () => void;
}

const STAGES = [
  { id: "validate", label: "Security & SSRF Verification", desc: "Resolving DNS and checking CIDR IP restrictions." },
  { id: "crawler", label: "Headless Browser Launch", desc: "Spawning isolated incognito Chromium sandbox." },
  { id: "intercept", label: "Telemetry & Cookie Interception", desc: "Capturing network requests and media assets." },
  { id: "banner", label: "Consent & Dark Pattern Analysis", desc: "Evaluating CMP presence, button prominence, and toggles." },
  { id: "score", label: "Deterministic Scoring", desc: "Computing privacy transparency score and findings." },
];

export function StatusStepper({
  status,
  url,
  errorMessage,
  onRetry,
}: StatusStepperProps) {
  // Determine current active step index based on status
  let activeIndex = 1;
  if (status === "pending") activeIndex = 0;
  else if (status === "scanning") activeIndex = 2;
  else if (status === "analyzing") activeIndex = 4;
  else if (status === "completed") activeIndex = 5;

  if (status === "failed") {
    return (
      <div className="max-w-2xl mx-auto p-8 rounded-2xl bg-white border border-rust-200 shadow-sm text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rust-50 text-rust-700 border border-rust-200 mx-auto mb-4">
          <AlertOctagon className="h-7 w-7" />
        </div>

        <h2 className="text-2xl font-bold text-forest-950 tracking-tight">Scan Execution Failed</h2>
        <p className="mt-2 text-xs text-sand-600 font-mono break-all">{url}</p>

        <div className="mt-6 p-4 rounded-xl bg-sand-50 border border-rust-200/80 text-left">
          <span className="text-[11px] font-mono uppercase tracking-wider text-rust-700 block mb-1 font-semibold">
            Engine Diagnostic Error
          </span>
          <p className="text-xs font-mono text-forest-900 leading-relaxed">
            {errorMessage || "The crawler encountered a timeout or unresolvable connection error."}
          </p>
        </div>

        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-medium bg-sand-100 text-forest-900 hover:bg-sand-200 transition-colors border border-sand-300"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Try Another Website</span>
          </Link>
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-forest-900 text-sand-50 hover:bg-forest-800 transition-colors shadow-sm"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Retry Audit</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8 rounded-2xl bg-white border border-sand-300 shadow-sm">
      {/* Calm Status Header */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-forest-50 border border-forest-200 text-forest-800 mb-4">
          <Loader2 className="h-7 w-7 animate-spin" />
        </div>

        <span className="px-3 py-1 rounded-full text-[11px] font-mono font-medium tracking-wide bg-forest-50 text-forest-800 border border-forest-200 mb-2">
          STATUS: {status.toUpperCase()}
        </span>
        <h2 className="text-2xl font-bold text-forest-950 tracking-tight">Privacy Audit in Progress</h2>
        <p className="mt-1 text-xs text-sand-600 font-mono break-all">{url}</p>
      </div>

      {/* Stepper Timeline */}
      <div className="space-y-3">
        {STAGES.map((stg, i) => {
          const isDone = i < activeIndex;
          const isCurrent = i === activeIndex;

          return (
            <div
              key={stg.id}
              className={`p-3.5 rounded-xl border transition-all flex items-start gap-3.5 ${
                isCurrent
                  ? "bg-forest-50/80 border-forest-300 text-forest-950 shadow-xs"
                  : isDone
                  ? "bg-white border-sand-200 text-sand-700"
                  : "bg-sand-50/50 border-sand-200/60 opacity-60 text-sand-500"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isDone ? (
                  <CheckCircle2 className="h-4 w-4 text-forest-700" />
                ) : isCurrent ? (
                  <Loader2 className="h-4 w-4 text-forest-800 animate-spin" />
                ) : (
                  <div className="h-4 w-4 rounded-full border border-sand-300 text-[10px] text-sand-500 flex items-center justify-center font-mono">
                    {i + 1}
                  </div>
                )}
              </div>

              <div>
                <h4
                  className={`text-xs font-semibold ${
                    isCurrent ? "text-forest-950" : isDone ? "text-forest-900" : "text-sand-500"
                  }`}
                >
                  {stg.label}
                </h4>
                <p className="text-[11px] text-sand-600 mt-0.5">{stg.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-sand-200 text-center text-xs text-sand-500 font-mono">
        Playwright Chromium crawling with active network telemetry listener.
      </div>
    </div>
  );
}
