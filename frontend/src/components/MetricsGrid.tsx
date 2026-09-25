import { Eye, Radio, ShieldCheck, ShieldAlert, Lock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { ReportMetrics, ConsentBanner, Finding } from "@/lib/types";

interface MetricsGridProps {
  metrics: ReportMetrics;
  bannerDetected: boolean;
  cmpName: string | null;
  banner?: ConsentBanner | null;
  findings: Finding[];
}

export function MetricsGrid({
  metrics,
  bannerDetected,
  cmpName,
  banner,
  findings,
}: MetricsGridProps) {
  // 1. Consent Banner Status
  const hasAccept = banner?.hasAcceptButton ?? false;
  const hasReject = banner?.hasRejectButton ?? false;
  const isAsymmetric = findings.some((f) => f.ruleId === "RULE_ASYMMETRIC_CONSENT");

  let bannerStatus: {
    badge: string;
    badgeStyle: string;
    title: string;
    desc: string;
    icon: any;
    iconStyle: string;
  };

  if (!bannerDetected) {
    bannerStatus = {
      badge: "Banner: Missing",
      badgeStyle: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      title: "No Cookie Notice",
      desc: "Site drops cookies without informing or asking visitors.",
      icon: ShieldAlert,
      iconStyle: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    };
  } else if (isAsymmetric || !hasReject) {
    bannerStatus = {
      badge: "Banner: Hard to Reject",
      badgeStyle: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      title: "Choice Asymmetry",
      desc: "Accepting is 1-click, but declining is buried in sub-menus.",
      icon: AlertTriangle,
      iconStyle: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    };
  } else {
    bannerStatus = {
      badge: "Banner: Fair",
      badgeStyle: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      title: cmpName || "Standard CMP",
      desc: "Visitors can accept or reject tracking with equal ease.",
      icon: CheckCircle2,
      iconStyle: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    };
  }

  // 2. Third-Party Trackers Status
  const trackerCount = metrics.totalTrackers || 0;
  let trackerStatus: {
    badge: string;
    badgeStyle: string;
    title: string;
    desc: string;
    icon: any;
    iconStyle: string;
  };

  if (trackerCount === 0) {
    trackerStatus = {
      badge: "Trackers: 0 Detected",
      badgeStyle: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      title: "Clean of Trackers",
      desc: "No third-party advertising or spy scripts detected.",
      icon: ShieldCheck,
      iconStyle: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    };
  } else if (trackerCount <= 3) {
    trackerStatus = {
      badge: `Trackers: ${trackerCount} Detected`,
      badgeStyle: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      title: "Moderate Tracking",
      desc: `${trackerCount} external network(s) recording user interactions.`,
      icon: Radio,
      iconStyle: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    };
  } else {
    trackerStatus = {
      badge: `Trackers: ${trackerCount} Detected`,
      badgeStyle: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      title: "Heavy Tracking",
      desc: "Multiple commercial ad networks profiling visitors.",
      icon: Radio,
      iconStyle: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    };
  }

  // 3. Pre-Consent Tracking Status
  const hasPreConsent = findings.some((f) => f.ruleId === "RULE_PRE_CONSENT_TRACKING");
  let preConsentStatus: {
    badge: string;
    badgeStyle: string;
    title: string;
    desc: string;
    icon: any;
    iconStyle: string;
  };

  if (!hasPreConsent) {
    preConsentStatus = {
      badge: "Pre-Consent: Safe",
      badgeStyle: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      title: "Waits for Permission",
      desc: "No advertising cookies deposited prior to interaction.",
      icon: ShieldCheck,
      iconStyle: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    };
  } else {
    preConsentStatus = {
      badge: "Pre-Consent: Active",
      badgeStyle: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      title: "Tracking Before Agreement",
      desc: "Tracking started immediately upon page landing.",
      icon: AlertTriangle,
      iconStyle: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    };
  }

  // 4. Data Security & Storage Flags
  const hasInsecure = findings.some((f) => f.ruleId === "RULE_INSECURE_COOKIES");
  let securityStatus: {
    badge: string;
    badgeStyle: string;
    title: string;
    desc: string;
    icon: any;
    iconStyle: string;
  };

  if (!hasInsecure) {
    securityStatus = {
      badge: "Security: Strong",
      badgeStyle: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      title: "Encrypted Storage",
      desc: "Cookies enforce Secure & HttpOnly transmission flags.",
      icon: Lock,
      iconStyle: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    };
  } else {
    securityStatus = {
      badge: "Security: Flags Missing",
      badgeStyle: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      title: "Unsecured Cookies",
      desc: "Some cookies lack Secure or HttpOnly protection flags.",
      icon: AlertTriangle,
      iconStyle: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    };
  }

  const cards = [bannerStatus, trackerStatus, preConsentStatus, securityStatus];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-cyber-card border border-cyber-border hover:border-slate-700 transition-all flex flex-col justify-between shadow-lg"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold border ${card.badgeStyle}`}
                >
                  {card.badge}
                </span>
                <div className={`p-1.5 rounded-lg border ${card.iconStyle}`}>
                  <IconComponent className="h-4 w-4" />
                </div>
              </div>
              <h4 className="text-base font-bold text-slate-100 mt-2">{card.title}</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{card.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
