"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, AlertOctagon, ShieldAlert, AlertTriangle, Info, Check, Wrench } from "lucide-react";
import { Finding, FindingSeverity } from "@/lib/types";
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
        return <AlertOctagon className="h-4 w-4 text-rust-700 shrink-0" />;
      case "high":
        return <ShieldAlert className="h-4 w-4 text-rust-600 shrink-0" />;
      case "medium":
        return <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0" />;
      default:
        return <Info className="h-4 w-4 text-forest-700 shrink-0" />;
    }
  };

  return (
    <div className="rounded-2xl bg-white border border-sand-300 p-6 sm:p-8 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sand-200 pb-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-forest-950 flex items-center gap-2">
            <span>Evidence-Based Privacy Findings</span>
            <span className="px-2 py-0.5 rounded text-xs font-mono bg-sand-100 text-forest-800 border border-sand-300">
              {filteredFindings.length}
            </span>
          </h3>
          <p className="text-xs text-forest-600 font-mono mt-1">
            Deterministic rule violations with empirical proofs and technical remediations.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                selectedCategory === cat
                  ? "bg-forest-800 text-white font-semibold shadow-subtle"
                  : "bg-sand-50 text-forest-700 border border-sand-300 hover:bg-sand-100 hover:text-forest-950"
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
          <div className="p-8 text-center rounded-xl bg-sand-50 border border-sand-200">
            <Check className="h-8 w-8 text-forest-700 mx-auto mb-2" />
            <p className="text-sm font-semibold text-forest-900">No Violations in this Category</p>
            <p className="text-xs text-forest-600 mt-1">
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
                className="rounded-xl border border-sand-300 bg-white hover:border-sand-400 transition-all overflow-hidden"
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
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-sand-100 text-forest-700 border border-sand-300">
                          {finding.ruleId}
                        </span>
                        <span className="text-[11px] font-mono text-forest-500">
                          [{category}]
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-forest-950 truncate">
                        {finding.title}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {finding.scoreDeduction > 0 ? (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-rust-50 text-rust-800 border border-rust-200">
                        -{finding.scoreDeduction} pts
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-mono text-forest-600 bg-sand-100 border border-sand-300">
                        0 pts
                      </span>
                    )}
                    <button className="text-forest-400 hover:text-forest-700">
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
                  <div className="px-4 pb-4 pt-2 border-t border-sand-200 bg-sand-50/60 space-y-3">
                    <p className="text-xs text-forest-800 leading-relaxed font-sans">
                      {finding.description}
                    </p>

                    {/* Supporting Evidence Panel */}
                    {finding.evidence && Object.keys(finding.evidence).length > 0 && (
                      <div>
                        <span className="text-[11px] font-mono uppercase tracking-wider text-forest-500 block mb-1">
                          Empirical Evidence
                        </span>
                        <pre className="p-3 rounded-xl bg-sand-100 border border-sand-300 text-[11px] font-mono text-forest-900 overflow-x-auto max-h-48">
                          {JSON.stringify(finding.evidence, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Actionable Remediation */}
                    <div className="p-3 rounded-xl bg-forest-50 border border-forest-200 flex items-start gap-2.5">
                      <Wrench className="h-4 w-4 text-forest-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-semibold text-forest-900">
                          Recommended Remediation
                        </span>
                        <p className="text-xs text-forest-700 mt-0.5 leading-relaxed font-sans">
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
