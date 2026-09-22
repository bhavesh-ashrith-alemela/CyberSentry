"use client";

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

interface TrackerChartProps {
  requests: NetworkRequest[];
}

const CATEGORY_COLORS: Record<string, string> = {
  Advertising: "#f43f5e", // Rose
  Analytics: "#38bdf8", // Sky Blue
  Fingerprinting: "#a855f7", // Purple
  Social: "#f59e0b", // Amber
  "Content/CDN": "#10b981", // Emerald
  Essential: "#64748b", // Slate
  Other: "#94a3b8", // Muted
};

export function TrackerChart({ requests }: TrackerChartProps) {
  // Aggregate requests by domain & category
  const domainCounts = new Map<string, number>();
  for (const r of requests) {
    if (r.isThirdParty) {
      domainCounts.set(r.domain, (domainCounts.get(r.domain) || 0) + 1);
    }
  }

  // Group into chart data
  const data = Array.from(domainCounts.entries())
    .map(([domain, count]) => {
      // Determine basic category heuristic for chart coloring
      let category = "Other";
      if (/doubleclick|facebook|adnxs|criteo|amazon-ad|rubicon|pubmatic|taboola|outbrain/i.test(domain)) {
        category = "Advertising";
      } else if (/analytics|google-analytics|segment|mixpanel|amplitude|telemetry/i.test(domain)) {
        category = "Analytics";
      } else if (/hotjar|fullstory|clarity|mouseflow|crazyegg/i.test(domain)) {
        category = "Fingerprinting";
      } else if (/twitter|linkedin|pinterest|tiktok/i.test(domain)) {
        category = "Social";
      } else if (/cdnjs|jsdelivr|unpkg|fonts\.gstatic|code\.jquery/i.test(domain)) {
        category = "Content/CDN";
      }

      return {
        domain,
        calls: count,
        category,
        fill: CATEGORY_COLORS[category] || CATEGORY_COLORS.Other,
      };
    })
    .sort((a, b) => b.calls - a.calls)
    .slice(0, 8); // Top 8 domains

  return (
    <div className="rounded-2xl bg-cyber-card border border-cyber-border p-6 shadow-xl">
      <div className="flex items-center justify-between border-b border-cyber-border/80 pb-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Radio className="h-4 w-4 text-cyber-accent" />
            <span>Outbound Tracker Telemetry</span>
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Volume of requests dispatched to third-party domains on initial landing.
          </p>
        </div>
        <span className="text-xs font-mono text-slate-400">
          Top {data.length} Domains
        </span>
      </div>

      {data.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-slate-900/30 rounded-xl border border-slate-800">
          <p className="text-sm font-semibold text-slate-300">
            No Outbound Third-Party Telemetry
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Zero third-party requests captured during initial page load.
          </p>
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis
                type="number"
                stroke="#64748b"
                fontSize={11}
                fontFamily="monospace"
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="domain"
                stroke="#94a3b8"
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
                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 shadow-xl text-xs font-mono">
                        <p className="font-bold text-slate-100">{d.domain}</p>
                        <p className="text-slate-400 mt-1">
                          Requests: <span className="text-cyan-400">{d.calls}</span>
                        </p>
                        <p className="text-slate-400">
                          Category:{" "}
                          <span
                            style={{ color: d.fill }}
                            className="font-semibold"
                          >
                            {d.category}
                          </span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="calls" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-cyber-border/60 flex flex-wrap items-center justify-center gap-4 text-[11px] font-mono text-slate-400">
        {Object.entries(CATEGORY_COLORS).map(([name, color]) => (
          <div key={name} className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span>{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
