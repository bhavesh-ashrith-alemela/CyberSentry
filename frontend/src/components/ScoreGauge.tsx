"use client";

import { formatScoreColor } from "@/lib/formatters";

interface ScoreGaugeProps {
  score: number;
  grade: string;
  className?: string;
}

export function ScoreGauge({ score, grade, className = "" }: ScoreGaugeProps) {
  const color = formatScoreColor(score);
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let scoreTitle = "Critical Exposure";
  if (score >= 90) scoreTitle = "Excellent Transparency";
  else if (score >= 80) scoreTitle = "Good Privacy Posture";
  else if (score >= 70) scoreTitle = "Moderate Tracking";
  else if (score >= 55) scoreTitle = "High Tracking Risk";
  else if (score >= 40) scoreTitle = "Severe Privacy Risks";

  return (
    <div
      className={`relative flex flex-col items-center justify-center p-6 rounded-2xl bg-cyber-card border border-cyber-border shadow-xl ${className}`}
    >
      <div className="relative flex items-center justify-center">
        {/* SVG Circular Meter */}
        <svg className="h-44 w-44 -rotate-90 transform" viewBox="0 0 160 160">
          {/* Background Track */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            className="stroke-slate-800"
            strokeWidth="12"
            fill="transparent"
          />
          {/* Active Meter Arc */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className={`${color.text} transition-all duration-1000 ease-out`}
          />
        </svg>

        {/* Center Score & Grade */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className={`text-4xl font-black tracking-tight ${color.text}`}>
            {score}
          </span>
          <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
            Out of 100
          </span>
          <div
            className={`mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${color.badge}`}
          >
            Grade {grade}
          </div>
        </div>
      </div>

      {/* Label and Summary */}
      <div className="mt-4 text-center">
        <h4 className="text-base font-semibold text-slate-100">{scoreTitle}</h4>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Deterministic Transparency Metric
        </p>
      </div>
    </div>
  );
}
