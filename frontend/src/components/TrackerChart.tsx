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
  Advertising: "#993833", // Muted Rust
  Analytics: "#234A38", // Deep Forest
  Fingerprinting: "#A12D27", // Deep Rust
  Social: "#8C6524", // Warm Ochre
  "Content/CDN": "#428360", // Muted Sage
  Essential: "#565E59", // Slate Stone
  Other: "#7A847D", // Warm Gray
};

export function TrackerChart({ requests }: TrackerChartProps) {
  // Aggregate requests by domain
  const domainCounts = new Map<string, number>();
  for (const r of requests) {
    if (r.isThirdParty) {
      domainCounts.set(r.domain, (domainCounts.get(r.domain) || 0) + 1);
    }
  }

  // Group into chart data
  const data = Array.from(domainCounts.entries())
    .map(([domain, count]) => {
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
    .slice(0, 8);

  return (
    <div className="rounded-2xl bg-white border border-sand-300 p-6 sm:p-8 shadow-card">
      <div className="flex items-center justify-between border-b border-sand-200 pb-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-forest-950 flex items-center gap-2">
            <Radio className="h-4 w-4 text-forest-700" />
            <span>Outbound Tracker Telemetry</span>
          </h3>
          <p className="text-xs text-forest-600 font-mono mt-1">
            Volume of requests dispatched to third-party domains on initial landing.
          </p>
        </div>
        <span className="text-xs font-mono text-forest-500">
          Top {data.length} Domains
        </span>
      </div>

      {data.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-sand-50 rounded-xl border border-sand-200">
          <p className="text-sm font-semibold text-forest-800">
            No Outbound Third-Party Telemetry
          </p>
          <p className="text-xs text-forest-500 mt-1">
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
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E4E0" horizontal={false} />
              <XAxis
                type="number"
                stroke="#7A847D"
                fontSize={11}
                fontFamily="monospace"
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="domain"
                stroke="#565E59"
                fontSize={11}
                fontFamily="monospace"
                tickLine={false}
                width={80}
                tickFormatter={(val: string) =>
                  val.length > 13 ? `${val.slice(0, 11)}..` : val
                }
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="p-3.5 rounded-xl bg-white border border-sand-300 shadow-card text-xs font-mono">
                        <p className="font-bold text-forest-950">{d.domain}</p>
                        <p className="text-forest-700 mt-1">
                          Requests: <span className="font-bold text-forest-900">{d.calls}</span>
                        </p>
                        <p className="text-forest-600">
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
      <div className="mt-4 pt-3 border-t border-sand-200 flex flex-wrap items-center justify-center gap-4 text-[11px] font-mono text-forest-600">
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

      {/* Itemized Tracker Domain Inventory Table */}
      {data.length > 0 && (
        <div className="mt-6 pt-5 border-t border-sand-200">
          <h4 className="text-xs font-mono uppercase tracking-wider text-forest-700 font-semibold mb-3">
            Identified Tracker Entities & Domain Directory
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-sand-200 text-forest-500 uppercase text-[10px]">
                  <th className="pb-2 font-semibold">Domain</th>
                  <th className="pb-2 font-semibold">Entity / Owner</th>
                  <th className="pb-2 font-semibold">Category</th>
                  <th className="pb-2 font-semibold text-right">Requests</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-200">
                {data.map((item) => {
                  let owner = "Independent / Third-Party";
                  if (/google|doubleclick|youtube|gstatic/i.test(item.domain)) owner = "Google LLC";
                  else if (/facebook|instagram|fbcdn/i.test(item.domain)) owner = "Meta Platforms";
                  else if (/amazon|a2z/i.test(item.domain)) owner = "Amazon.com Inc";
                  else if (/microsoft|bing|adnxs/i.test(item.domain)) owner = "Microsoft Corporation";
                  else if (/criteo/i.test(item.domain)) owner = "Criteo SA";
                  else if (/hotjar/i.test(item.domain)) owner = "Hotjar Ltd";
                  else if (/cloudflare/i.test(item.domain)) owner = "Cloudflare Inc";
                  else if (/twitter|t\.co/i.test(item.domain)) owner = "X Corp (Twitter)";

                  return (
                    <tr key={item.domain} className="hover:bg-sand-50/70 transition-colors">
                      <td className="py-2.5 font-bold text-forest-950 max-w-[180px] truncate">
                        {item.domain}
                      </td>
                      <td className="py-2.5 text-forest-700">{owner}</td>
                      <td className="py-2.5">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold border"
                          style={{
                            color: item.fill,
                            borderColor: `${item.fill}40`,
                            backgroundColor: `${item.fill}10`,
                          }}
                        >
                          {item.category}
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-bold text-forest-900">
                        {item.calls}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
