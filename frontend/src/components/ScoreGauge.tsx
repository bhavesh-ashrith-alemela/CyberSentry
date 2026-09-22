"use client";

import { formatScoreColor } from "@/lib/formatters";

interface ScoreGaugeProps {
  score: number;
  grade: string;
  className?: string;
}

export function ScoreGauge({ score, grade, className = "" }: ScoreGaugeProps) {
  const color = formatScoreColor(score);
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let scoreTitle = "Critical Tracking Exposure";
  if (score >= 90) scoreTitle = "Excellent Transparency";
  else if (score >= 80) scoreTitle = "Strong Privacy Posture";
  else if (score >= 70) scoreTitle = "Moderate Tracking Friction";
  else if (score >= 55) scoreTitle = "High Privacy Risks";
  else if (score >= 40) scoreTitle = "Severe Tracking Exposure";

  return (
    <div
      className={`relative flex flex-col items-center justify-center p-8 rounded-2xl bg-white border border-sand-300 shadow-card ${className}`}
    >
      <div className="relative flex items-center justify-center">
        {/* SVG Circular Meter */}
        <svg className="h-48 w-48 -rotate-90 transform" viewBox="0 0 160 160">
          {/* Background Track */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            className="stroke-sand-200"
            strokeWidth="10"
            fill="transparent"
          />
          {/* Active Meter Arc */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="currentColor"
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className={`${color.text} transition-all duration-700 ease-out`}
          />
        </svg>

        {/* Center Score & Grade */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-5xl font-black tracking-tight text-forest-950">
            {score}
          </span>
          <span className="text-[11px] font-mono uppercase tracking-widest text-forest-500 mt-0.5">
            Score / 100
          </span>
          <div
            className={`mt-2 px-3 py-0.5 rounded-full text-xs font-semibold border ${color.badge}`}
          >
            Grade {grade}
          </div>
        </div>
      </div>

      {/* Label and Summary */}
      <div className="mt-6 text-center">
        <h4 className="text-base font-bold text-forest-950">{scoreTitle}</h4>
        <p className="text-xs text-forest-600 font-mono mt-0.5">
          Deterministic Heuristic Score
        </p>
      </div>
    </div>
  );
}
