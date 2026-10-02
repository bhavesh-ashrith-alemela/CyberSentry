"use client";

import React from "react";
import { Card, Badge } from "@/components/ui";

interface ScoreGaugeProps {
  score: number;
  grade: string;
  className?: string;
}

export function ScoreGauge({ score, grade, className = "" }: ScoreGaugeProps) {
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(100, Math.max(0, score));
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  let assessment = "Elevated Tracking Exposure";
  let gradeVariant: "success" | "primary" | "warning" | "danger" = "danger";
  let ringColor = "stroke-cs-danger";

  if (score >= 90) {
    assessment = "High Transparency Posture";
    gradeVariant = "success";
    ringColor = "stroke-cs-success";
  } else if (score >= 80) {
    assessment = "Good Privacy Transparency";
    gradeVariant = "primary";
    ringColor = "stroke-cs-primary";
  } else if (score >= 65) {
    assessment = "Moderate Tracking Observed";
    gradeVariant = "warning";
    ringColor = "stroke-cs-warning";
  }

  return (
    <Card
      padding="lg"
      className={`flex flex-col items-center justify-between text-center relative overflow-hidden ${className}`}
    >
      {/* Eyebrow Label */}
      <div className="w-full text-center border-b border-cs-border pb-3 mb-4">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-cs-muted block">
          PRIVACY TRANSPARENCY SCORE
        </span>
      </div>

      {/* SVG Meter */}
      <div className="relative flex items-center justify-center my-2">
        <svg className="h-44 w-44 -rotate-90 transform" viewBox="0 0 160 160">
          {/* Background Track */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            className="stroke-slate-100"
            strokeWidth="11"
            fill="transparent"
          />
          {/* Active Score Arc */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            strokeWidth="11"
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
            <span className="text-4xl sm:text-5xl font-bold font-sans tracking-tight text-cs-text">
              {score}
            </span>
            <span className="text-xs font-semibold text-cs-muted ml-0.5">
              /100
            </span>
          </div>

          <div className="mt-1.5">
            <Badge variant={gradeVariant} size="sm" dot>
              GRADE {grade}
            </Badge>
          </div>
        </div>
      </div>

      {/* Assessment Headline & Methodology Note */}
      <div className="w-full mt-4 pt-3.5 border-t border-cs-border text-center space-y-1">
        <h4 className="text-sm sm:text-base font-bold text-cs-text font-sans">
          {assessment}
        </h4>
        <p className="text-[11px] text-cs-muted leading-tight max-w-xs mx-auto">
          Based on observable tracking, consent, security and user-control indicators.
        </p>
      </div>
    </Card>
  );
}
