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
      text: "text-cs-muted",
      bg: "bg-cs-cream/60",
      border: "border-cs-border",
      badge: "bg-cs-paper text-cs-muted border-cs-border",
    };
  }

  if (score >= 90) {
    return {
      text: "text-cs-safe",
      bg: "bg-cs-safe-bg",
      border: "border-cs-safe/30",
      badge: "bg-cs-safe-bg text-cs-safe border-cs-safe/40",
    };
  }
  if (score >= 80) {
    return {
      text: "text-cs-denim",
      bg: "bg-cs-denim-light",
      border: "border-cs-denim/30",
      badge: "bg-cs-denim-light text-cs-denim border-cs-denim/40",
    };
  }
  if (score >= 70) {
    return {
      text: "text-cs-olive",
      bg: "bg-cs-olive-light",
      border: "border-cs-olive/30",
      badge: "bg-cs-olive-light text-cs-olive border-cs-olive/40",
    };
  }
  if (score >= 55) {
    return {
      text: "text-cs-warning",
      bg: "bg-cs-warning-bg",
      border: "border-cs-warning/30",
      badge: "bg-cs-warning-bg text-cs-warning border-cs-warning/40",
    };
  }
  return {
    text: "text-cs-danger",
    bg: "bg-cs-danger-bg",
    border: "border-cs-danger/30",
    badge: "bg-cs-danger-bg text-cs-danger border-cs-danger/40",
  };
}

export function formatSeverityBadge(severity: string): {
  color: string;
  bg: string;
  border: string;
} {
  switch (severity?.toLowerCase()) {
    case "critical":
    case "high":
      return {
        color: "text-cs-danger",
        bg: "bg-cs-danger-bg",
        border: "border-cs-danger/30",
      };
    case "medium":
      return {
        color: "text-cs-warning",
        bg: "bg-cs-warning-bg",
        border: "border-cs-warning/30",
      };
    case "low":
      return {
        color: "text-cs-olive",
        bg: "bg-cs-olive-light",
        border: "border-cs-olive/30",
      };
    default:
      return {
        color: "text-cs-denim",
        bg: "bg-cs-denim-light",
        border: "border-cs-denim/30",
      };
  }
}
