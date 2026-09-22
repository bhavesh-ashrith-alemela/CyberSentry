/**
 * CyberSentry Scoring Configuration
 *
 * DISCLAIMER:
 * The CyberSentry Privacy Transparency Score is a deterministic engineering metric
 * evaluating observable tracking exposure, cookie security, and consent banner transparency.
 * It is NOT a legal compliance score and does NOT certify compliance with GDPR, ePrivacy,
 * CCPA, or any data protection regulation.
 *
 * Missing evidence, undetected elements, or untested behaviors are NEVER treated
 * as proof of good privacy practices.
 */

export interface RuleWeightConfig {
  deduction: number;
  maxDeduction?: number;
  severity: "info" | "low" | "medium" | "high" | "critical";
  category: "Consent" | "Cookies" | "Trackers" | "Security" | "DarkPattern";
}

export interface ScoringConfig {
  maxScore: number;
  minScore: number;
  rules: {
    // 1. Consent Banner Rules
    RULE_NO_BANNER: RuleWeightConfig;
    RULE_BANNER_FOUND: RuleWeightConfig;

    // 2. Consent Choices & Dark Patterns
    RULE_NO_REJECT_BUTTON: RuleWeightConfig;
    RULE_ASYMMETRIC_CONSENT: RuleWeightConfig;
    RULE_PRESELECTED_OPTIONS: RuleWeightConfig;

    // 3. Pre-Consent Tracking
    RULE_PRE_CONSENT_TRACKING: RuleWeightConfig;

    // 4. Trackers & Replay Tools
    RULE_SESSION_REPLAY: RuleWeightConfig;
    RULE_AD_TRACKERS: RuleWeightConfig;

    // 5. Cookie Rules
    RULE_THIRD_PARTY_COOKIES: RuleWeightConfig;
    RULE_INSECURE_COOKIES: RuleWeightConfig;
    RULE_EXCESSIVE_EXPIRY: RuleWeightConfig;
  };
  gradeThresholds: {
    grade: string;
    minScore: number;
  }[];
}

export const DEFAULT_SCORING_CONFIG: ScoringConfig = {
  maxScore: 100,
  minScore: 0,
  rules: {
    RULE_NO_BANNER: {
      deduction: 20,
      severity: "high",
      category: "Consent",
    },
    RULE_BANNER_FOUND: {
      deduction: 0,
      severity: "info",
      category: "Consent",
    },
    RULE_NO_REJECT_BUTTON: {
      deduction: 15,
      severity: "high",
      category: "Consent",
    },
    RULE_ASYMMETRIC_CONSENT: {
      deduction: 10,
      severity: "medium",
      category: "DarkPattern",
    },
    RULE_PRESELECTED_OPTIONS: {
      deduction: 15,
      severity: "high",
      category: "DarkPattern",
    },
    RULE_PRE_CONSENT_TRACKING: {
      deduction: 20,
      maxDeduction: 30,
      severity: "critical",
      category: "Consent",
    },
    RULE_SESSION_REPLAY: {
      deduction: 15,
      severity: "critical",
      category: "Trackers",
    },
    RULE_AD_TRACKERS: {
      deduction: 5, // per domain
      maxDeduction: 25,
      severity: "high",
      category: "Trackers",
    },
    RULE_THIRD_PARTY_COOKIES: {
      deduction: 5, // per cookie
      maxDeduction: 25,
      severity: "high",
      category: "Cookies",
    },
    RULE_INSECURE_COOKIES: {
      deduction: 2, // per cookie
      maxDeduction: 15,
      severity: "medium",
      category: "Security",
    },
    RULE_EXCESSIVE_EXPIRY: {
      deduction: 5, // flat deduction if any cookie > 1 year
      maxDeduction: 10,
      severity: "low",
      category: "Cookies",
    },
  },
  gradeThresholds: [
    { grade: "A+", minScore: 90 },
    { grade: "A", minScore: 80 },
    { grade: "B", minScore: 70 },
    { grade: "C", minScore: 55 },
    { grade: "D", minScore: 40 },
    { grade: "F", minScore: 0 },
  ],
};

export const LEGAL_DISCLAIMER =
  "The CyberSentry Privacy Transparency Score is an automated engineering assessment measuring visible tracking indicators, cookie security configurations, and consent banner transparency. It does NOT constitute legal counsel, formal compliance validation, or certification under GDPR, ePrivacy Directive, CCPA/CPRA, or any jurisdictional privacy framework.";
