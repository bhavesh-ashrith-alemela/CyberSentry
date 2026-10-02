"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from "recharts";
import { NetworkRequest } from "@/lib/types";
import { Radio } from "lucide-react";
import { Card, Badge } from "@/components/ui";

interface TrackerChartProps {
  requests: NetworkRequest[];
}

const CATEGORY_COLORS: Record<string, string> = {
  Advertising: "#2563EB", // Primary Blue
  Analytics: "#25B47A", // Success Green
  Social: "#8067D8", // Purple
  Fingerprinting: "#EF4444", // Danger Red
  "Content/CDN": "#687386", // Muted Gray
  "Other / Unknown": "#94A3B8", // Slate
};

export function TrackerChart({ requests }: TrackerChartProps) {
  const domainCounts = new Map<string, number>();
  for (const r of requests) {
    if (r.isThirdParty) {
      domainCounts.set(r.domain, (domainCounts.get(r.domain) || 0) + 1);
    }
  }

  const data = Array.from(domainCounts.entries())
    .map(([domain, count]) => {
      let category = "Other / Unknown";
      if (/doubleclick|facebook|adnxs|criteo|amazon-ad|rubicon|pubmatic|taboola|outbrain/i.test(domain)) {
        category = "Advertising";
      } else if (/analytics|google-analytics|segment|mixpanel|amplitude|telemetry/i.test(domain)) {
        category = "Analytics";
      } else if (/hotjar|fullstory|clarity|mouseflow|crazyegg/i.test(domain)) {
        category = "Fingerprinting";
      } else if (/twitter|linkedin|pinterest|tiktok|instagram/i.test(domain)) {
        category = "Social";
      } else if (/cdnjs|jsdelivr|unpkg|fonts\.gstatic|code\.jquery/i.test(domain)) {
        category = "Content/CDN";
      }

      return {
        domain,
        calls: count,
        category,
        fill: CATEGORY_COLORS[category] || CATEGORY_COLORS["Other / Unknown"],
      };
    })
    .sort((a, b) => b.calls - a.calls)
    .slice(0, 8);

  const totalThirdPartyCalls = requests.filter((r) => r.isThirdParty).length;

  return (
    <Card padding="lg" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cs-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl sm:text-2xl font-bold font-sans text-cs-text">
              Tracker Directory
            </h3>
            <Badge variant="primary" size="sm">
              {domainCounts.size} External Domains
            </Badge>
          </div>
          <p className="text-xs text-cs-muted leading-relaxed">
            {domainCounts.size === 0
              ? "No third-party tracker domains detected."
              : `${domainCounts.size} third-party tracking domain${
                  domainCounts.size === 1 ? "" : "s"
                } observed across ${totalThirdPartyCalls} network requests.`}
          </p>
        </div>

        <div className="text-left sm:text-right shrink-0">
          <span className="text-xs font-semibold text-cs-primary block">
            {totalThirdPartyCalls} Requests Dispatched
          </span>
          <span className="text-[11px] text-cs-muted font-mono">
            Top {data.length} Trackers Listed
          </span>
        </div>
      </div>

      {/* Chart Section */}
      {data.length === 0 ? (
        <div className="h-56 flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-xl border border-cs-border">
          <Radio className="h-8 w-8 text-cs-muted mb-2 opacity-50" />
          <p className="text-sm font-semibold text-cs-text">
            No known third-party trackers identified
          </p>
          <p className="text-xs text-cs-muted mt-1 max-w-sm">
            Zero third-party network requests captured during the initial page crawl.
          </p>
        </div>
      ) : (
        <div className="h-64 w-full min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5EAF1" horizontal={false} />
              <XAxis
                type="number"
                stroke="#687386"
                fontSize={11}
                fontFamily="inherit"
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="domain"
                stroke="#172033"
                fontSize={11}
                fontFamily="monospace"
                tickLine={false}
                width={80}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="p-3 rounded-xl bg-cs-surface border border-cs-border shadow-md text-xs font-sans">
                        <p className="font-bold text-cs-text">{d.domain}</p>
                        <p className="text-cs-muted mt-1">
                          Requests: <span className="text-cs-primary font-bold">{d.calls}</span>
                        </p>
                        <p className="text-cs-muted">
                          Category:{" "}
                          <span style={{ color: d.fill }} className="font-semibold">
                            {d.category}
                          </span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="calls" radius={[0, 6, 6, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Category Legend */}
      <div className="pt-3 border-t border-cs-border flex flex-wrap items-center justify-center gap-4 text-xs text-cs-muted">
        {Object.entries(CATEGORY_COLORS).map(([name, color]) => (
          <div key={name} className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: color }}
            />
            <span>{name}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
