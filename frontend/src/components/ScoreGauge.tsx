"use client";

import { EditorialBadge } from "@/components/ui";

interface ScoreGaugeProps {
  score: number;
  grade: string;
  className?: string;
}

export function ScoreGauge({ score, grade, className = "" }: ScoreGaugeProps) {
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

  let assessment = "Severe Privacy Risks";
  let gradeVariant: "safe" | "denim" | "olive" | "warning" | "danger" = "danger";
  let ringColor = "stroke-cs-danger";

  if (score >= 90) {
    assessment = "High Transparency Posture";
    gradeVariant = "safe";
    ringColor = "stroke-cs-safe";
  } else if (score >= 80) {
    assessment = "Good Privacy Transparency";
    gradeVariant = "denim";
    ringColor = "stroke-cs-denim";
  } else if (score >= 70) {
    assessment = "Moderate Tracking Observed";
    gradeVariant = "olive";
    ringColor = "stroke-cs-olive";
  } else if (score >= 55) {
    assessment = "Elevated Tracking Exposure";
    gradeVariant = "warning";
    ringColor = "stroke-cs-warning";
  }

  return (
    <div
      className={`rounded-2xl border border-cs-border bg-cs-paper p-6 sm:p-7 shadow-paper text-cs-ink flex flex-col items-center justify-between text-center relative overflow-hidden ${className}`}
    >
      {/* Eyebrow Label */}
      <div className="w-full text-center border-b border-cs-border/70 pb-3 mb-4">
        <span className="text-[10px] font-mono uppercase tracking-widest text-cs-muted font-bold block">
          PRIVACY TRANSPARENCY SCORE
        </span>
      </div>

      {/* SVG Meter with Restrained Editorial Aesthetics */}
      <div className="relative flex items-center justify-center my-2">
        <svg className="h-40 w-40 -rotate-90 transform" viewBox="0 0 160 160">
          {/* Subtle Paper Track */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            className="stroke-cs-cream-deep/60"
            strokeWidth="10"
            fill="transparent"
          />
          {/* Active Editorial Arc */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className={`${ringColor} transition-all duration-1000 ease-out`}
          />
        </svg>

        {/* Central Display Score & Grade */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
          <div className="flex items-baseline justify-center">
            <span className="text-4xl sm:text-5xl font-black font-display tracking-tight text-cs-ink">
              {score}
            </span>
            <span className="text-xs font-mono text-cs-muted ml-0.5 font-bold">
              /100
            </span>
          </div>

          <div className="mt-1">
            <EditorialBadge variant={gradeVariant} size="xs" className="font-bold">
              GRADE {grade}
            </EditorialBadge>
          </div>
        </div>
      </div>

      {/* Assessment Headline & Methodology Reassurance */}
      <div className="w-full mt-4 pt-3 border-t border-cs-border/70 text-center space-y-1">
        <h4 className="text-sm sm:text-base font-bold text-cs-ink font-sans">
          {assessment}
        </h4>
        <p className="text-[11px] font-sans text-cs-muted leading-tight max-w-xs mx-auto">
          Deterministic technical rating based on observable client-side telemetry and consent friction.
        </p>
      </div>
    </div>
  );
}
