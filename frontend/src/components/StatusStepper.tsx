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
      <div className="max-w-2xl mx-auto p-8 rounded-2xl bg-cyber-card border border-rose-500/40 shadow-2xl text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/30 mx-auto mb-4">
          <AlertOctagon className="h-8 w-8" />
        </div>

        <h2 className="text-2xl font-bold text-slate-100">Scan Execution Failed</h2>
        <p className="mt-2 text-sm text-slate-400 font-mono break-all">{url}</p>

        <div className="mt-6 p-4 rounded-xl bg-black/40 border border-rose-500/30 text-left">
          <span className="text-xs font-mono uppercase tracking-wider text-rose-400 block mb-1">
            Engine Diagnostic Error
          </span>
          <p className="text-xs font-mono text-slate-200 leading-relaxed">
            {errorMessage || "The crawler encountered a timeout or unresolvable connection error."}
          </p>
        </div>

        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors border border-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Try Another Website</span>
          </Link>
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-rose-500 text-white hover:bg-rose-400 transition-colors shadow-lg shadow-rose-500/20"
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
    <div className="max-w-2xl mx-auto p-8 rounded-2xl bg-cyber-card border border-cyber-border shadow-2xl">
      {/* Radar Animation & Header */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="relative flex h-24 w-24 items-center justify-center mb-4">
          {/* Animated radar rings */}
          <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-ping" />
          <div className="absolute inset-2 rounded-full border border-cyan-500/40 animate-pulse" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-cyan-950/40 text-cyan-400 border border-cyan-500/50 shadow-lg shadow-cyan-500/20">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-2">
          STATUS: {status.toUpperCase()}
        </span>
        <h2 className="text-2xl font-bold text-slate-100">Live Privacy Audit in Progress</h2>
        <p className="mt-1 text-xs text-slate-400 font-mono break-all">{url}</p>
      </div>

      {/* Stepper Timeline */}
      <div className="space-y-4">
        {STAGES.map((stg, i) => {
          const isDone = i < activeIndex;
          const isCurrent = i === activeIndex;

          return (
            <div
              key={stg.id}
              className={`p-3.5 rounded-xl border transition-all flex items-start gap-3.5 ${
                isCurrent
                  ? "bg-cyan-950/20 border-cyan-500/40 shadow-sm"
                  : isDone
                  ? "bg-slate-900/40 border-slate-800 text-slate-400"
                  : "bg-slate-900/10 border-slate-800/40 opacity-40 text-slate-500"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isDone ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : isCurrent ? (
                  <Loader2 className="h-4 w-4 text-cyan-400 animate-spin" />
                ) : (
                  <div className="h-4 w-4 rounded-full border border-slate-700 text-[10px] flex items-center justify-center font-mono">
                    {i + 1}
                  </div>
                )}
              </div>

              <div>
                <h4
                  className={`text-sm font-semibold ${
                    isCurrent ? "text-cyan-300" : isDone ? "text-slate-200" : "text-slate-500"
                  }`}
                >
                  {stg.label}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">{stg.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-cyber-border text-center text-xs text-slate-500 font-mono">
        Playwright Chromium crawling with active network listener. Please do not refresh.
      </div>
    </div>
  );
}
