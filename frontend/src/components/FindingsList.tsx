"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, AlertCircle, Info, Wrench, CheckCircle2 } from "lucide-react";
import { Finding, FindingSeverity } from "@/lib/types";
import { FileLabel, EditorialBadge } from "@/components/ui";

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

  const getSeverityBadgeVariant = (severity: FindingSeverity): "denim" | "olive" | "warning" | "danger" => {
    switch (severity?.toLowerCase()) {
      case "critical":
      case "high":
        return "danger";
      case "medium":
        return "warning";
      case "low":
        return "olive";
      default:
        return "denim";
    }
  };

  return (
    <div className="rounded-2xl border border-cs-border bg-cs-paper p-6 sm:p-7 shadow-paper text-cs-ink space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cs-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <FileLabel code="EVIDENCE_LOGS" variant="muted" />
            <EditorialBadge variant="denim" size="xs">
              {filteredFindings.length} Observations
            </EditorialBadge>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-display text-cs-ink">
            Evidence-Based Findings
          </h3>
          <p className="text-xs text-cs-muted font-sans mt-0.5">
            Deterministic rule evaluations with empirical proofs and technical remediations.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all select-none ${
                selectedCategory === cat
                  ? "bg-cs-denim text-white font-semibold shadow-xs"
                  : "bg-cs-cream-deep/40 text-cs-muted hover:text-cs-ink hover:bg-cs-cream-deep/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Findings Cards */}
      <div className="space-y-3.5">
        {filteredFindings.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-cs-cream/40 border border-cs-border">
            <CheckCircle2 className="h-6 w-6 text-cs-olive mx-auto mb-2" />
            <p className="text-sm font-bold text-cs-ink font-sans">
              No Findings in this Category
            </p>
            <p className="text-xs text-cs-muted font-sans mt-0.5">
              Zero rule deductions recorded under {selectedCategory} checks.
            </p>
          </div>
        ) : (
          filteredFindings.map((finding) => {
            const isExpanded = expandedIds.has(finding.id);
            const category = finding.evidence?.category || "Consent";
            const badgeVariant = getSeverityBadgeVariant(finding.severity);

            return (
              <div
                key={finding.id}
                className="rounded-xl border border-cs-border bg-cs-paper shadow-xs overflow-hidden transition-all duration-200"
              >
                {/* Clickable Header */}
                <div
                  onClick={() => toggleExpand(finding.id)}
                  className="p-4 sm:p-4.5 flex items-start justify-between gap-4 cursor-pointer select-none hover:bg-cs-cream-deep/20 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="mt-0.5 shrink-0">
                      <AlertCircle className={`h-4 w-4 ${
                        finding.severity === "critical" || finding.severity === "high"
                          ? "text-cs-danger"
                          : finding.severity === "medium"
                          ? "text-cs-warning"
                          : "text-cs-olive"
                      }`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <EditorialBadge variant={badgeVariant} size="xs" className="uppercase font-bold">
                          {finding.severity}
                        </EditorialBadge>
                        <span className="font-mono text-[10px] text-cs-muted">
                          {finding.ruleId}
                        </span>
                        <span className="font-mono text-[10px] text-cs-muted/80">
                          [{category}]
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-cs-ink font-sans">
                        {finding.title}
                      </h4>
                      <p className="text-xs text-cs-muted font-sans mt-0.5 leading-relaxed">
                        {finding.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {finding.scoreDeduction > 0 ? (
                      <span className="font-mono text-xs font-bold text-cs-danger px-2 py-0.5 rounded bg-cs-pink-light border border-cs-pink/40">
                        -{finding.scoreDeduction} pts
                      </span>
                    ) : (
                      <span className="font-mono text-xs text-cs-muted px-2 py-0.5 rounded bg-cs-cream-deep/40">
                        0 pts
                      </span>
                    )}

                    <div className="text-cs-muted hover:text-cs-ink">
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Collapsible Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-cs-border/70 bg-cs-cream/30 space-y-4">
                    {/* Supporting Evidence Panel */}
                    {finding.evidence && Object.keys(finding.evidence).length > 0 && (
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-cs-muted font-bold block mb-1">
                          Empirical Telemetry Payload
                        </span>
                        <pre className="p-3.5 rounded-xl bg-cs-paper border border-cs-border text-[11px] font-mono text-cs-ink overflow-x-auto max-h-48 leading-relaxed shadow-xs">
                          {JSON.stringify(finding.evidence, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Remediation Box */}
                    <div className="p-3.5 rounded-xl bg-cs-denim-light/50 border border-cs-denim/25 flex items-start gap-2.5">
                      <Wrench className="h-4 w-4 text-cs-denim shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-bold text-cs-denim font-mono uppercase tracking-wide">
                          Recommended Remediation
                        </span>
                        <p className="text-xs text-cs-ink font-sans mt-0.5 leading-relaxed">
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
