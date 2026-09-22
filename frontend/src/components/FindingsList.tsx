"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, AlertOctagon, ShieldAlert, AlertTriangle, Info, Check, Wrench } from "lucide-react";
import { Finding, FindingSeverity, FindingCategory } from "@/lib/types";
import { formatSeverityBadge } from "@/lib/formatters";

interface FindingsListProps {
  findings: Finding[];
}

export function FindingsList({ findings }: FindingsListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const categories = ["ALL", "Consent", "Cookies", "Trackers", "Security", "DarkPattern"];

  const filteredFindings =
    selectedCategory === "ALL"
      ? findings
      : findings.filter((f) => {
          const cat = f.evidence?.category || "Consent";
          return cat.toLowerCase() === selectedCategory.toLowerCase();
        });

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getSeverityIcon = (severity: FindingSeverity) => {
    switch (severity) {
      case "critical":
        return <AlertOctagon className="h-4 w-4 text-rose-400 shrink-0" />;
      case "high":
        return <ShieldAlert className="h-4 w-4 text-orange-400 shrink-0" />;
      case "medium":
        return <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />;
      default:
        return <Info className="h-4 w-4 text-cyan-400 shrink-0" />;
    }
  };

  return (
    <div className="rounded-2xl bg-cyber-card border border-cyber-border p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyber-border/80 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span>Evidence-Based Privacy Findings</span>
            <span className="px-2 py-0.5 rounded text-xs font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {filteredFindings.length}
            </span>
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Deterministic rule violations with empirical proofs and technical remediations.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                selectedCategory === cat
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Findings List */}
      <div className="mt-6 space-y-3">
        {filteredFindings.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-slate-900/30 border border-slate-800/80">
            <Check className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-200">No Violations in this Category</p>
            <p className="text-xs text-slate-400 mt-1">
              Zero findings triggered under {selectedCategory} rules.
            </p>
          </div>
        ) : (
          filteredFindings.map((finding) => {
            const isExpanded = expandedIds.has(finding.id);
            const sevBadge = formatSeverityBadge(finding.severity);
            const category = finding.evidence?.category || "Consent";

            return (
              <div
                key={finding.id}
                className="rounded-xl border border-cyber-border bg-slate-900/50 hover:border-slate-700 transition-all overflow-hidden"
              >
                {/* Header Row */}
                <div
                  onClick={() => toggleExpand(finding.id)}
                  className="p-4 flex items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="mt-0.5">{getSeverityIcon(finding.severity)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${sevBadge.bg} ${sevBadge.color} ${sevBadge.border}`}
                        >
                          {finding.severity}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                          {finding.ruleId}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">
                          [{category}]
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-200 truncate">
                        {finding.title}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {finding.scoreDeduction > 0 ? (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                        -{finding.scoreDeduction} pts
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-lg text-xs font-mono text-slate-400 bg-slate-800/60 border border-slate-700">
                        0 pts
                      </span>
                    )}
                    <button className="text-slate-400 hover:text-slate-200">
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-cyber-border/60 bg-cyber-dark/40 space-y-3">
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {finding.description}
                    </p>

                    {/* Supporting Evidence Panel */}
                    {finding.evidence && Object.keys(finding.evidence).length > 0 && (
                      <div>
                        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                          Empirical Evidence
                        </span>
                        <pre className="p-3 rounded-lg bg-black/50 border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-48">
                          {JSON.stringify(finding.evidence, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Actionable Remediation */}
                    <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/30 flex items-start gap-2.5">
                      <Wrench className="h-4 w-4 text-cyber-accent shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-semibold text-cyan-300">
                          Recommended Remediation
                        </span>
                        <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                          {finding.remediation}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
