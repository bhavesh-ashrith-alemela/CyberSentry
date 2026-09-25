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
import { FileLabel, EditorialBadge } from "@/components/ui";

interface TrackerChartProps {
  requests: NetworkRequest[];
}

const CATEGORY_COLORS: Record<string, string> = {
  Advertising: "#275CCC", // Denim
  Analytics: "#7E8C4A", // Olive
  Social: "#E8B7C2", // Blush Pink
  Fingerprinting: "#C53B4F", // Crimson
  "Content/CDN": "#5F6870", // Muted
  "Other / Unknown": "#9CA3AF", // Gray
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
    <div className="rounded-2xl border border-cs-border bg-cs-paper p-6 sm:p-7 shadow-paper text-cs-ink space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cs-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <FileLabel code="TELEMETRY_LOGS" variant="muted" />
            <EditorialBadge variant="denim" size="xs">
              {domainCounts.size} External Domains
            </EditorialBadge>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-display text-cs-ink flex items-center gap-2">
            <span>Tracker Directory</span>
          </h3>
          <p className="text-xs text-cs-muted font-sans mt-0.5">
            Volume of outbound telemetry requests dispatched to third-party networks on landing.
          </p>
        </div>

        <div className="text-right">
          <span className="font-mono text-xs font-bold text-cs-denim block">
            {totalThirdPartyCalls} Requests Dispatched
          </span>
          <span className="font-mono text-[10px] text-cs-muted">
            Top {data.length} Trackers Listed
          </span>
        </div>
      </div>

      {/* Chart */}
      {data.length === 0 ? (
        <div className="h-56 flex flex-col items-center justify-center text-center p-6 bg-cs-cream/40 rounded-xl border border-cs-border/80">
          <p className="text-sm font-semibold text-cs-ink">
            No Outbound Third-Party Telemetry
          </p>
          <p className="text-xs text-cs-muted mt-1 font-sans">
            Zero third-party network requests captured during the initial page load.
          </p>
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 70, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#EADBCA" horizontal={false} />
              <XAxis
                type="number"
                stroke="#5F6870"
                fontSize={11}
                fontFamily="monospace"
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="domain"
                stroke="#20252B"
                fontSize={11}
                fontFamily="monospace"
                tickLine={false}
                width={70}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="p-3 rounded-xl bg-cs-paper border border-cs-border shadow-paper text-xs font-mono">
                        <p className="font-bold text-cs-ink">{d.domain}</p>
                        <p className="text-cs-muted mt-1">
                          Requests: <span className="text-cs-denim font-bold">{d.calls}</span>
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
      <div className="pt-3 border-t border-cs-border/70 flex flex-wrap items-center justify-center gap-4 text-[11px] font-mono text-cs-muted">
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
    </div>
  );
}
