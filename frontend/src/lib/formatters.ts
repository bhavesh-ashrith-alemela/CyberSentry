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
      text: "text-forest-500",
      bg: "bg-sand-100",
      border: "border-sand-300",
      badge: "bg-sand-200 text-forest-700 border-sand-300",
    };
  }

  if (score >= 80) {
    return {
      text: "text-forest-800",
      bg: "bg-forest-50",
      border: "border-forest-200",
      badge: "bg-forest-100 text-forest-900 border-forest-300",
    };
  }
  if (score >= 60) {
    return {
      text: "text-amber-800",
      bg: "bg-amber-50",
      border: "border-amber-200",
      badge: "bg-amber-100 text-amber-900 border-amber-300",
    };
  }
  return {
    text: "text-rust-800",
    bg: "bg-rust-50",
    border: "border-rust-200",
    badge: "bg-rust-100 text-rust-900 border-rust-300",
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
        color: "text-rust-800",
        bg: "bg-rust-50",
        border: "border-rust-200",
      };
    case "high":
      return {
        color: "text-rust-700",
        bg: "bg-rust-50",
        border: "border-rust-200",
      };
    case "medium":
      return {
        color: "text-amber-800",
        bg: "bg-amber-50",
        border: "border-amber-200",
      };
    case "low":
      return {
        color: "text-forest-700",
        bg: "bg-forest-50",
        border: "border-forest-200",
      };
    default:
      return {
        color: "text-forest-600",
        bg: "bg-sand-100",
        border: "border-sand-300",
      };
  }
}
