"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, AlertCircle, Wrench, CheckCircle2 } from "lucide-react";
import { Finding, FindingSeverity } from "@/lib/types";
import { Card, Badge } from "@/components/ui";

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

  const getSeverityBadgeVariant = (
    severity: FindingSeverity
  ): "danger" | "warning" | "success" | "neutral" => {
    switch (severity?.toLowerCase()) {
      case "critical":
      case "high":
        return "danger";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "neutral";
    }
  };

  return (
    <Card padding="lg" className="space-y-6">
      {/* Header & Category Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cs-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl sm:text-2xl font-bold font-sans text-cs-text">
              Evidence & Findings
            </h3>
            <Badge variant="primary" size="sm">
              {filteredFindings.length} Observations
            </Badge>
          </div>
          <p className="text-xs text-cs-muted">
            Deterministic rule evaluations with empirical telemetry evidence and remediations.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all select-none ${
                selectedCategory === cat
                  ? "bg-cs-primary text-white font-semibold shadow-xs"
                  : "bg-slate-100 text-cs-muted hover:text-cs-text hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Findings List */}
      <div className="space-y-3">
        {filteredFindings.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-slate-50 border border-cs-border">
            <CheckCircle2 className="h-7 w-7 text-cs-success mx-auto mb-2" />
            <p className="text-sm font-semibold text-cs-text">
              No rule-based findings were generated
            </p>
            <p className="text-xs text-cs-muted mt-0.5">
              Zero rule deductions recorded under the {selectedCategory} audit checks.
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
                className="rounded-xl border border-cs-border bg-cs-surface shadow-xs overflow-hidden transition-all duration-200"
              >
                {/* Header Row */}
                <div
                  onClick={() => toggleExpand(finding.id)}
                  className="p-4 flex items-start justify-between gap-4 cursor-pointer select-none hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="mt-0.5 shrink-0">
                      <AlertCircle
                        className={`h-4 w-4 ${
                          finding.severity === "critical" || finding.severity === "high"
                            ? "text-cs-danger"
                            : finding.severity === "medium"
                            ? "text-amber-500"
                            : "text-cs-success"
                        }`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Badge variant={badgeVariant} size="sm" className="uppercase text-[10px]">
                          {finding.severity}
                        </Badge>
                        <span className="font-mono text-[11px] text-cs-muted font-semibold">
                          {finding.ruleId}
                        </span>
                        <span className="text-[11px] text-cs-muted">
                          [{category}]
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-cs-text font-sans">
                        {finding.title}
                      </h4>
                      <p className="text-xs text-cs-muted mt-0.5 leading-relaxed">
                        {finding.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {finding.scoreDeduction > 0 ? (
                      <span className="text-xs font-semibold text-cs-danger px-2 py-0.5 rounded-md bg-cs-danger-soft border border-red-200">
                        -{finding.scoreDeduction} pts
                      </span>
                    ) : (
                      <span className="text-xs text-cs-muted px-2 py-0.5 rounded-md bg-slate-100">
                        0 pts
                      </span>
                    )}

                    <div className="text-cs-muted hover:text-cs-text">
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
                  <div className="px-5 pb-5 pt-3 border-t border-cs-border bg-slate-50/60 space-y-3.5">
                    {/* Supporting Evidence Panel */}
                    {finding.evidence && Object.keys(finding.evidence).length > 0 && (
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-cs-muted font-semibold block mb-1">
                          Empirical Telemetry Payload
                        </span>
                        <pre className="p-3.5 rounded-xl bg-cs-surface border border-cs-border text-xs font-mono text-cs-text overflow-x-auto max-h-48 leading-relaxed shadow-xs">
                          {JSON.stringify(finding.evidence, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Remediation Box */}
                    {finding.remediation && (
                      <div className="p-3.5 rounded-xl bg-cs-primary-soft/60 border border-blue-200/80 flex items-start gap-2.5">
                        <Wrench className="h-4 w-4 text-cs-primary shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs font-bold text-cs-primary uppercase tracking-wide block">
                            Recommended Remediation
                          </span>
                          <p className="text-xs text-cs-text mt-0.5 leading-relaxed">
                            {finding.remediation}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
