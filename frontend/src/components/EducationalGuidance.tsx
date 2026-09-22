"use client";

import { useState } from "react";
import { BookOpen, ChevronDown, ChevronUp, Shield, Lock, Sliders, Eye, AlertTriangle } from "lucide-react";

interface GlossaryItem {
  id: string;
  term: string;
  category: string;
  summary: string;
  explanation: string;
  whyItMatters: string;
  icon: any;
}

const GLOSSARY_ITEMS: GlossaryItem[] = [
  {
    id: "cmp",
    term: "Consent Management Platform (CMP)",
    category: "Consent Framework",
    summary: "Standardized framework deployed to collect and record user consent choices.",
    explanation:
      "A Consent Management Platform is a software tool (like OneTrust, Cookiebot, or Didomi) installed on a website to display privacy notices and capture visitor preferences regarding cookies and tracking scripts.",
    whyItMatters:
      "Under data protection regulations like the GDPR, ePrivacy Directive, and CCPA, websites must collect unambiguous, affirmative consent before deploying non-essential cookies.",
    icon: Sliders,
  },
  {
    id: "pre-consent",
    term: "Pre-Consent Tracking",
    category: "Telemetry Violation",
    summary: "Outbound trackers or cookies executing before visitor agreement.",
    explanation:
      "Pre-consent tracking occurs when advertising pixels, analytics tags, or fingerprinting scripts execute immediately upon page load before the visitor has clicked 'Accept' or interacted with the consent banner.",
    whyItMatters:
      "This is one of the most common web privacy violations. European data protection authorities (EDPB, CNIL, ICO) require that tracking scripts remain strictly deferred until explicit consent is granted.",
    icon: Eye,
  },
  {
    id: "third-party",
    term: "First-Party vs. Third-Party Cookies",
    category: "Storage Architecture",
    summary: "Storage created by the visited domain vs embedded external ad networks.",
    explanation:
      "First-party cookies belong to the domain in the address bar (used for logins, shopping carts, or site themes). Third-party cookies belong to external domains (like doubleclick.net or facebook.com) embedded in the page.",
    whyItMatters:
      "Third-party cookies allow advertising aggregators to track your browsing behaviour across different websites, creating comprehensive personal interest profiles without your direct knowledge.",
    icon: Shield,
  },
  {
    id: "dark-patterns",
    term: "Choice Asymmetry & Dark Patterns",
    category: "UX Ethics",
    summary: "Interface designs that manipulate users into agreeing to tracking.",
    explanation:
      "A privacy dark pattern is a deceptive interface choice—such as making the 'Accept All' button high-contrast and prominent while disguising the 'Reject' option as subtle text or burying it inside a secondary 'Preferences' layer.",
    whyItMatters:
      "Regulatory guidelines mandate that rejecting tracking must be just as easy and direct as accepting it (the 'One-Click Refusal' standard). Choice asymmetry undermines voluntary consent.",
    icon: AlertTriangle,
  },
  {
    id: "security-flags",
    term: "Cookie Security Flags (HttpOnly & Secure)",
    category: "Web Security",
    summary: "Cryptographic and browser flags safeguarding sensitive session storage.",
    explanation:
      "The 'Secure' flag restricts cookie transmission exclusively to encrypted HTTPS connections. The 'HttpOnly' flag prevents client-side JavaScript from accessing the cookie.",
    whyItMatters:
      "Without 'HttpOnly', any Cross-Site Scripting (XSS) vulnerability on the website allows attackers to steal your session tokens. Without 'Secure', cookies can be intercepted over unencrypted Wi-Fi networks.",
    icon: Lock,
  },
];

export function EducationalGuidance() {
  const [expandedId, setExpandedId] = useState<string | null>("cmp");

  const toggleItem = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="rounded-2xl bg-white border border-sand-300 p-6 sm:p-8 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sand-200 pb-5 mb-6">
        <div>
          <h3 className="text-lg font-bold text-forest-950 flex items-center gap-2.5">
            <BookOpen className="h-5 w-5 text-forest-700" />
            <span>Educational Privacy Guidance</span>
          </h3>
          <p className="text-xs text-forest-600 font-mono mt-1">
            Plain-language explanations of technical web tracking and consent compliance concepts.
          </p>
        </div>
        <span className="px-2.5 py-1 rounded text-[10px] font-mono bg-forest-50 text-forest-800 border border-forest-200 uppercase font-semibold">
          Reference Glossary
        </span>
      </div>

      <div className="space-y-3">
        {GLOSSARY_ITEMS.map((item) => {
          const isExpanded = expandedId === item.id;
          const Icon = item.icon;

          return (
            <div
              key={item.id}
              className={`rounded-xl border transition-all overflow-hidden ${
                isExpanded
                  ? "bg-sand-50/60 border-forest-300 shadow-subtle"
                  : "bg-white border-sand-200 hover:border-sand-300"
              }`}
            >
              <button
                type="button"
                onClick={() => toggleItem(item.id)}
                className="w-full p-4 text-left flex items-start justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 p-1.5 rounded-lg border shrink-0 ${
                      isExpanded
                        ? "bg-forest-800 text-white border-forest-900"
                        : "bg-sand-100 text-forest-700 border-sand-300"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono uppercase font-semibold text-sand-600">
                        {item.category}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-forest-950">{item.term}</h4>
                    {!isExpanded && (
                      <p className="text-xs text-forest-600 mt-1 font-sans line-clamp-1">
                        {item.summary}
                      </p>
                    )}
                  </div>
                </div>

                <div className="shrink-0 text-forest-500 pt-1">
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 pt-1 border-t border-sand-200/80 space-y-3 text-xs leading-relaxed font-sans text-forest-800">
                  <div className="p-3.5 rounded-xl bg-white border border-sand-200">
                    <span className="font-semibold text-forest-950 block mb-1">What it means:</span>
                    <p className="text-forest-700">{item.explanation}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-forest-50/80 border border-forest-200 text-forest-900">
                    <span className="font-semibold text-forest-950 block mb-1">
                      Why it matters for your privacy:
                    </span>
                    <p className="text-forest-800">{item.whyItMatters}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
