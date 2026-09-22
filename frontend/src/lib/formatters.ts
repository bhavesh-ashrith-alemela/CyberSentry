export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatDuration(ms: number | null | undefined): string {
  if (ms === null || ms === undefined) return "N/A";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function formatScoreColor(score: number | null | undefined): {
  text: string;
  bg: string;
  border: string;
  badge: string;
} {
  if (score === null || score === undefined) {
    return {
      text: "text-slate-400",
      bg: "bg-slate-800/50",
      border: "border-slate-700",
      badge: "bg-slate-700 text-slate-300",
    };
  }

  if (score >= 90) {
    return {
      text: "text-emerald-400",
      bg: "bg-emerald-950/30",
      border: "border-emerald-500/40",
      badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    };
  }
  if (score >= 80) {
    return {
      text: "text-cyan-400",
      bg: "bg-cyan-950/30",
      border: "border-cyan-500/40",
      badge: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    };
  }
  if (score >= 70) {
    return {
      text: "text-blue-400",
      bg: "bg-blue-950/30",
      border: "border-blue-500/40",
      badge: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    };
  }
  if (score >= 55) {
    return {
      text: "text-amber-400",
      bg: "bg-amber-950/30",
      border: "border-amber-500/40",
      badge: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    };
  }
  if (score >= 40) {
    return {
      text: "text-orange-400",
      bg: "bg-orange-950/30",
      border: "border-orange-500/40",
      badge: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    };
  }
  return {
    text: "text-rose-400",
    bg: "bg-rose-950/30",
    border: "border-rose-500/40",
    badge: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  };
}

export function formatSeverityBadge(severity: string): {
  color: string;
  bg: string;
  border: string;
} {
  switch (severity?.toLowerCase()) {
    case "critical":
      return {
        color: "text-rose-400",
        bg: "bg-rose-500/10",
        border: "border-rose-500/30",
      };
    case "high":
      return {
        color: "text-orange-400",
        bg: "bg-orange-500/10",
        border: "border-orange-500/30",
      };
    case "medium":
      return {
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/30",
      };
    case "low":
      return {
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/30",
      };
    default:
      return {
        color: "text-slate-400",
        bg: "bg-slate-500/10",
        border: "border-slate-500/30",
      };
  }
}
