import {
  RawScanPayload,
  AnalysisResult,
  RuleFinding,
  AnalyzedCookie,
  AnalyzedTracker,
} from "./rules.js";
import {
  KNOWN_TRACKERS,
  findKnownTracker,
  findKnownCookie,
  TrackerDefinition,
} from "./trackerDb.js";
import {
  DEFAULT_SCORING_CONFIG,
  ScoringConfig,
  LEGAL_DISCLAIMER,
} from "./scoringConfig.js";

/**
 * Robust root domain extractor handling common multi-part ccTLDs
 * (e.g. static.bbc.co.uk -> bbc.co.uk, ads.google.com -> google.com)
 */
export function extractRootDomain(hostname: string): string {
  const cleaned = hostname.toLowerCase().split(":")[0].replace(/^\./, "");
  const parts = cleaned.split(".");
  if (parts.length <= 2) return cleaned;

  const secondLast = parts[parts.length - 2];
  const multiPartTlds = [
    "co", "com", "org", "net", "gov", "edu", "ac", "mil", "nom", "biz",
  ];

  if (multiPartTlds.includes(secondLast) && parts.length > 2) {
    return parts.slice(-3).join(".");
  }
  return parts.slice(-2).join(".");
}

/**
 * Determines whether a cookie or network resource originates from a third party
 */
export function isThirdPartyDomain(targetHost: string, itemHost: string): boolean {
  if (!targetHost || !itemHost) return false;
  return extractRootDomain(targetHost) !== extractRootDomain(itemHost);
}

/**
 * Categorizes a cookie based on known database signatures, semantic name heuristics, and origin.
 * IMPORTANT: Third-party cookies without evidence are classified as 'Unknown', NEVER assumed to be advertising.
 */
export function categorizeCookie(
  name: string,
  domain: string,
  isThirdParty: boolean
): AnalyzedCookie["category"] {
  // 1. Check known cookie database
  const known = findKnownCookie(name);
  if (known) {
    return known.category;
  }

  // 2. Semantic name heuristics
  const cleanName = name.toLowerCase();

  // Essential / Security tokens
  if (
    /^(session|sess|csrf|xsrf|_csrf|token|jwt|auth|login|auth_token|identity|secure_session|cart|basket)/i.test(
      cleanName
    )
  ) {
    return "Essential";
  }

  // Functional preferences
  if (
    /^(theme|dark_mode|light_mode|mode|lang|language|locale|currency|view_mode|volume|player)/i.test(
      cleanName
    )
  ) {
    return "Functional";
  }

  // Analytics patterns
  if (
    /(analytics|_ga|_gid|visit|traffic|stats|metric|pageview|counter|event_id|telemetry)/i.test(
      cleanName
    )
  ) {
    return "Analytics";
  }

  // Explicit advertising naming patterns
  if (
    /(ad_id|ad_session|pixel_id|campaign_id|retarget|remarketing|affiliate|advert)/i.test(
      cleanName
    )
  ) {
    return "Advertising";
  }

  // If third-party, check if domain belongs to a known advertising/analytics tracker
  if (isThirdParty) {
    const knownTracker = findKnownTracker(domain);
    if (knownTracker) {
      if (knownTracker.category === "Advertising") return "Advertising";
      if (knownTracker.category === "Analytics") return "Analytics";
      if (knownTracker.category === "Essential") return "Essential";
    }
  }

  return "Unknown";
}

/**
 * Deterministic Privacy Transparency Analysis Engine
 */
export function analyzeScan(
  payload: RawScanPayload,
  config: ScoringConfig = DEFAULT_SCORING_CONFIG
): AnalysisResult {
  const findings: RuleFinding[] = [];
  const recommendations: string[] = [];
  const analyzedCookies: AnalyzedCookie[] = [];
  const analyzedTrackers: AnalyzedTracker[] = [];
  const seenTrackerDomains = new Set<string>();

  const currentTimestamp = Math.floor(Date.now() / 1000);
  const oneYearSeconds = 365 * 24 * 60 * 60;

  // -------------------------------------------------------------
  // 1. COOKIE AUDITING & CLASSIFICATION
  // -------------------------------------------------------------
  let thirdPartyCookieCount = 0;
  let insecureCookieCount = 0;
  let excessiveLifespanCount = 0;
  let preConsentCookieCount = 0;
  const samplePreConsentCookies: string[] = [];
  const sampleInsecureCookies: string[] = [];
  const sampleExcessiveCookies: string[] = [];

  for (const c of payload.cookies) {
    const is3rdParty = isThirdPartyDomain(payload.targetDomain, c.domain);
    if (is3rdParty) thirdPartyCookieCount++;

    const isSession = c.expires === -1 || c.expires === 0;
    const lifespanSeconds =
      !isSession && c.expires > currentTimestamp ? c.expires - currentTimestamp : 0;
    if (lifespanSeconds > oneYearSeconds) {
      excessiveLifespanCount++;
      if (sampleExcessiveCookies.length < 5) sampleExcessiveCookies.push(c.name);
    }

    const category = categorizeCookie(c.name, c.domain, is3rdParty);

    // Non-essential cookies dropped on initial load are pre-consent indicators
    const isPreConsentViolation = category === "Advertising" || category === "Analytics";
    if (isPreConsentViolation) {
      preConsentCookieCount++;
      if (samplePreConsentCookies.length < 5) {
        samplePreConsentCookies.push(`${c.name} (${category})`);
      }
    }

    // Security flags check
    const missingSecurity =
      !c.secure || (!c.httpOnly && category !== "Functional" && !/^(theme|lang|locale)/i.test(c.name));
    if (missingSecurity) {
      insecureCookieCount++;
      if (sampleInsecureCookies.length < 5) {
        sampleInsecureCookies.push(`${c.name} (Secure: ${c.secure}, HttpOnly: ${c.httpOnly})`);
      }
    }

    analyzedCookies.push({
      name: c.name,
      domain: c.domain,
      path: c.path,
      expires: c.expires,
      isSession,
      isSecure: c.secure,
      isHttpOnly: c.httpOnly,
      sameSite: c.sameSite || "Lax",
      isThirdParty: is3rdParty,
      category,
      valuePreview: c.value
        ? `${c.value.substring(0, 16)}${c.value.length > 16 ? "..." : ""}`
        : "",
      isPreConsent: isPreConsentViolation,
    });
  }

  // -------------------------------------------------------------
  // 2. NETWORK REQUEST & TRACKER AUDITING
  // -------------------------------------------------------------
  let thirdPartyRequestCount = 0;
  let advertisingTrackerCount = 0;
  let fingerprintingCount = 0;
  let preConsentTrackerCalls = 0;
  const samplePreConsentTrackers: string[] = [];

  for (const req of payload.requests) {
    try {
      const parsedUrl = new URL(req.url);
      const reqHostname = parsedUrl.hostname.toLowerCase();
      const is3rdParty = isThirdPartyDomain(payload.targetDomain, reqHostname);

      if (is3rdParty) thirdPartyRequestCount++;

      // Match against known tracker database
      const matchedTracker = findKnownTracker(reqHostname);

      if (matchedTracker) {
        if (!seenTrackerDomains.has(reqHostname)) {
          seenTrackerDomains.add(reqHostname);

          if (matchedTracker.category === "Advertising") {
            advertisingTrackerCount++;
            preConsentTrackerCalls++;
            if (samplePreConsentTrackers.length < 5) {
              samplePreConsentTrackers.push(`${matchedTracker.name} (${reqHostname})`);
            }
          } else if (matchedTracker.category === "Fingerprinting") {
            fingerprintingCount++;
            preConsentTrackerCalls++;
            if (samplePreConsentTrackers.length < 5) {
              samplePreConsentTrackers.push(`${matchedTracker.name} (${reqHostname})`);
            }
          } else if (matchedTracker.category === "Analytics") {
            preConsentTrackerCalls++;
            if (samplePreConsentTrackers.length < 5) {
              samplePreConsentTrackers.push(`${matchedTracker.name} (${reqHostname})`);
            }
          }

          analyzedTrackers.push({
            domain: reqHostname,
            url: req.url,
            category: matchedTracker.category,
            company: matchedTracker.company,
            isThirdParty: is3rdParty,
            resourceType: req.resourceType,
            isPreConsent: true,
          });
        }
      } else if (is3rdParty && !seenTrackerDomains.has(reqHostname)) {
        // Unknown third-party domain -> Classified as "Other" / "Content/CDN" if matched, NOT Advertising!
        seenTrackerDomains.add(reqHostname);
        analyzedTrackers.push({
          domain: reqHostname,
          url: req.url,
          category: "Other",
          company: "Unclassified Third Party",
          isThirdParty: true,
          resourceType: req.resourceType,
          isPreConsent: false,
        });
      }
    } catch {
      // Malformed request URL skipped
    }
  }

  // -------------------------------------------------------------
  // 3. DETERMINISTIC RULE EVALUATION
  // -------------------------------------------------------------

  // --- Rule 1: Consent Banner Detection ---
  const bannerRules = config.rules;
  if (!payload.bannerDetected) {
    findings.push({
      ruleId: "RULE_NO_BANNER",
      category: bannerRules.RULE_NO_BANNER.category,
      title: "No Cookie Consent Banner Detected",
      severity: bannerRules.RULE_NO_BANNER.severity,
      scoreDeduction: bannerRules.RULE_NO_BANNER.deduction,
      description:
        "No cookie consent banner or Consent Management Platform (CMP) was detected during page load. Websites utilizing non-essential cookies must present a transparent consent interface.",
      evidence: { bannerDetected: false },
      remediation:
        "Deploy a standardized Consent Management Platform (e.g. OneTrust, Cookiebot, or Klaro) before dropping non-essential cookies.",
    });
    recommendations.push(
      "Deploy a standardized Consent Management Platform (CMP) to inform visitors of cookie usage."
    );
  } else {
    findings.push({
      ruleId: "RULE_BANNER_FOUND",
      category: bannerRules.RULE_BANNER_FOUND.category,
      title: `Consent Banner Identified (${payload.bannerCmpName || "Standard CMP"})`,
      severity: bannerRules.RULE_BANNER_FOUND.severity,
      scoreDeduction: bannerRules.RULE_BANNER_FOUND.deduction,
      description: `A consent banner was detected (${payload.bannerCmpName || "Standard Interface"}). Confirm that tracking mechanisms remain disabled until explicit user consent is granted.`,
      evidence: {
        cmpName: payload.bannerCmpName,
        visibility: payload.bannerInfo?.visibility || "visible",
      },
      remediation:
        "Ensure all advertising pixels and non-essential cookies remain deferred until user acceptance.",
    });
  }

  // --- Rule 2: Reject Option Visibility ---
  if (payload.bannerDetected && payload.bannerInfo) {
    const hasAccept = payload.bannerInfo.acceptButton.detected;
    const hasReject = payload.bannerInfo.rejectButton.detected;

    if (hasAccept && !hasReject) {
      findings.push({
        ruleId: "RULE_NO_REJECT_BUTTON",
        category: bannerRules.RULE_NO_REJECT_BUTTON.category,
        title: "Reject Option Missing on Primary Consent Banner",
        severity: bannerRules.RULE_NO_REJECT_BUTTON.severity,
        scoreDeduction: bannerRules.RULE_NO_REJECT_BUTTON.deduction,
        description:
          "The consent banner offers an 'Accept' button on the primary layer but does not offer an equivalent 'Reject' or 'Decline' button. Users should be able to decline tracking with equal ease.",
        evidence: {
          acceptButtonText: payload.bannerInfo.acceptButton.text,
          rejectButtonDetected: false,
        },
        remediation:
          "Add an equivalent 'Reject All' or 'Decline All' button directly adjacent to the 'Accept' button on the initial banner view.",
      });
      recommendations.push(
        "Provide a direct 'Reject All' button on the primary layer of the consent banner with equal prominence."
      );
    }
  }

  // --- Rule 3: Asymmetric Prominence (Dark Patterns) ---
  if (payload.bannerDetected && payload.bannerInfo) {
    const hasAccept = payload.bannerInfo.acceptButton.detected;
    const hasReject = payload.bannerInfo.rejectButton.detected;
    const hasSettings = payload.bannerInfo.settingsButton.detected;

    // Asymmetric choice: Accept is 1-click on layer 1, Reject requires multi-click through settings
    if (hasAccept && !hasReject && hasSettings) {
      findings.push({
        ruleId: "RULE_ASYMMETRIC_CONSENT",
        category: bannerRules.RULE_ASYMMETRIC_CONSENT.category,
        title: "Asymmetric Consent Flow (Dark Pattern)",
        severity: bannerRules.RULE_ASYMMETRIC_CONSENT.severity,
        scoreDeduction: bannerRules.RULE_ASYMMETRIC_CONSENT.deduction,
        description:
          "Accepting cookies requires a single click, whereas refusing cookies forces users into a secondary 'Settings' or 'Preferences' menu, creating unnecessary friction to decline tracking.",
        evidence: {
          acceptButtonText: payload.bannerInfo.acceptButton.text,
          settingsButtonText: payload.bannerInfo.settingsButton.text,
        },
        remediation:
          "Allow users to refuse non-essential cookies with a single click without requiring navigation through secondary settings menus.",
      });
      recommendations.push(
        "Eliminate asymmetric consent friction: make rejecting tracking as effortless as accepting it."
      );
    }
  }

  // --- Rule 4: Preselected Consent Options (Dark Patterns) ---
  if (payload.bannerDetected && payload.bannerInfo?.optionIndicators.detected) {
    // Check if any checkboxes are configured in the banner
    const count = payload.bannerInfo.optionIndicators.count;
    if (count > 0) {
      findings.push({
        ruleId: "RULE_PRESELECTED_OPTIONS",
        category: bannerRules.RULE_PRESELECTED_OPTIONS.category,
        title: `${count} Consent Option Indicator(s) Detected`,
        severity: "info",
        scoreDeduction: 0,
        description:
          "Granular consent indicators (checkboxes or toggles) were detected. Verify that all non-essential categories (analytics, marketing) remain unticked by default.",
        evidence: {
          optionCount: count,
          types: payload.bannerInfo.optionIndicators.types,
        },
        remediation:
          "Ensure non-essential cookie categories require affirmative opt-in and are not preselected.",
      });
    }
  }

  // --- Rule 5: Pre-Consent Tracking Indicators ---
  if (preConsentCookieCount > 0 || preConsentTrackerCalls > 0) {
    const totalViolations = preConsentCookieCount + preConsentTrackerCalls;
    const penalty = Math.min(
      bannerRules.RULE_PRE_CONSENT_TRACKING.maxDeduction || 30,
      bannerRules.RULE_PRE_CONSENT_TRACKING.deduction
    );

    findings.push({
      ruleId: "RULE_PRE_CONSENT_TRACKING",
      category: bannerRules.RULE_PRE_CONSENT_TRACKING.category,
      title: "Tracking Activity Executed Prior to User Consent",
      severity: bannerRules.RULE_PRE_CONSENT_TRACKING.severity,
      scoreDeduction: penalty,
      description:
        "Non-essential cookies or telemetry calls to tracking networks were executed immediately upon page landing, prior to any user consent interaction.",
      evidence: {
        preConsentCookies: samplePreConsentCookies,
        preConsentTrackers: samplePreConsentTrackers,
        cookieCount: preConsentCookieCount,
        trackerCallCount: preConsentTrackerCalls,
      },
      remediation:
        "Halt all non-essential tracking scripts and analytics tags until the visitor grants affirmative consent.",
    });
    recommendations.push(
      "Block all advertising scripts and non-essential cookies from firing until the visitor explicitly clicks 'Accept'."
    );
  }

  // --- Rule 6: Invasive Fingerprinting & Session Replay ---
  if (fingerprintingCount > 0) {
    const replayServices = analyzedTrackers.filter((t) => t.category === "Fingerprinting");
    findings.push({
      ruleId: "RULE_SESSION_REPLAY",
      category: bannerRules.RULE_SESSION_REPLAY.category,
      title: "Session Replay / DOM Recording Telemetry Detected",
      severity: bannerRules.RULE_SESSION_REPLAY.severity,
      scoreDeduction: bannerRules.RULE_SESSION_REPLAY.deduction,
      description: `Detected ${fingerprintingCount} service(s) capable of recording cursor movements, keystrokes, scroll depth, or browser device fingerprinting.`,
      evidence: {
        services: replayServices.map((t) => ({ name: t.company, domain: t.domain })),
      },
      remediation:
        "Deactivate session replay recording or gate it strictly behind explicit opt-in consent with sensitive input field masking.",
    });
    recommendations.push(
      "Gate session recording tools (e.g. Hotjar, FullStory, Clarity) behind affirmative opt-in consent."
    );
  }

  // --- Rule 7: Third-Party Advertising Trackers ---
  if (advertisingTrackerCount > 0) {
    const penalty = Math.min(
      bannerRules.RULE_AD_TRACKERS.maxDeduction || 25,
      advertisingTrackerCount * bannerRules.RULE_AD_TRACKERS.deduction
    );
    const adDomains = analyzedTrackers
      .filter((t) => t.category === "Advertising")
      .map((t) => t.domain);

    findings.push({
      ruleId: "RULE_AD_TRACKERS",
      category: bannerRules.RULE_AD_TRACKERS.category,
      title: `${advertisingTrackerCount} Third-Party Advertising Tracker(s) Loaded`,
      severity: bannerRules.RULE_AD_TRACKERS.severity,
      scoreDeduction: penalty,
      description:
        "Outbound network requests were dispatched to known commercial advertising and retargeting exchanges.",
      evidence: {
        count: advertisingTrackerCount,
        domains: adDomains.slice(0, 5),
      },
      remediation:
        "Configure Tag Manager triggers to only fire marketing pixels after user grants advertising consent.",
    });
    recommendations.push(
      "Defer commercial advertising pixels until explicit marketing consent is received."
    );
  }

  // --- Rule 8: Third-Party Cookies Dropped ---
  if (thirdPartyCookieCount > 0) {
    const penalty = Math.min(
      bannerRules.RULE_THIRD_PARTY_COOKIES.maxDeduction || 25,
      thirdPartyCookieCount * bannerRules.RULE_THIRD_PARTY_COOKIES.deduction
    );
    const sample3rdParty = analyzedCookies
      .filter((c) => c.isThirdParty)
      .map((c) => `${c.name} (${c.domain})`);

    findings.push({
      ruleId: "RULE_THIRD_PARTY_COOKIES",
      category: bannerRules.RULE_THIRD_PARTY_COOKIES.category,
      title: `${thirdPartyCookieCount} Third-Party Cookie(s) Dropped`,
      severity: bannerRules.RULE_THIRD_PARTY_COOKIES.severity,
      scoreDeduction: penalty,
      description:
        "Third-party cookies were stored in the browser on initial landing. These can enable cross-site behavioral profiling.",
      evidence: {
        count: thirdPartyCookieCount,
        cookies: sample3rdParty.slice(0, 5),
      },
      remediation:
        "Eliminate third-party cross-site cookies or replace with privacy-preserving first-party alternatives.",
    });
    recommendations.push(
      "Minimize reliance on cross-domain cookies and partition storage using modern web APIs."
    );
  }

  // --- Rule 9: Missing Cookie Security Flags ---
  if (insecureCookieCount > 0) {
    const penalty = Math.min(
      bannerRules.RULE_INSECURE_COOKIES.maxDeduction || 15,
      insecureCookieCount * bannerRules.RULE_INSECURE_COOKIES.deduction
    );
    findings.push({
      ruleId: "RULE_INSECURE_COOKIES",
      category: bannerRules.RULE_INSECURE_COOKIES.category,
      title: `${insecureCookieCount} Cookie(s) Missing Security Flags (Secure / HttpOnly)`,
      severity: bannerRules.RULE_INSECURE_COOKIES.severity,
      scoreDeduction: penalty,
      description:
        "Cookies missing 'Secure' can be transmitted over unencrypted HTTP; cookies missing 'HttpOnly' can be accessed by client scripts via XSS.",
      evidence: {
        count: insecureCookieCount,
        samples: sampleInsecureCookies,
      },
      remediation:
        "Append '; Secure; HttpOnly; SameSite=Lax' to server-side Set-Cookie headers.",
    });
    recommendations.push(
      "Ensure all server-managed cookies enforce Secure, HttpOnly, and SameSite attributes."
    );
  }

  // --- Rule 10: Excessive Cookie Retention Lifespan ---
  if (excessiveLifespanCount > 0) {
    const penalty = Math.min(
      bannerRules.RULE_EXCESSIVE_EXPIRY.maxDeduction || 10,
      bannerRules.RULE_EXCESSIVE_EXPIRY.deduction
    );
    findings.push({
      ruleId: "RULE_EXCESSIVE_EXPIRY",
      category: bannerRules.RULE_EXCESSIVE_EXPIRY.category,
      title: `${excessiveLifespanCount} Persistent Cookie(s) Exceeding 1 Year Lifespan`,
      severity: bannerRules.RULE_EXCESSIVE_EXPIRY.severity,
      scoreDeduction: penalty,
      description:
        "Cookies with retention durations exceeding 12 months present prolonged tracking exposure beyond necessity.",
      evidence: {
        count: excessiveLifespanCount,
        samples: sampleExcessiveCookies,
      },
      remediation:
        "Shorten persistent cookie expiration to 6-12 months max in accordance with privacy guidelines.",
    });
    recommendations.push(
      "Reduce persistent cookie expiration lifespans to under 12 months."
    );
  }

  // -------------------------------------------------------------
  // 4. SCORE CALCULATION & GRADE ASSIGNMENT
  // -------------------------------------------------------------
  const totalDeductions = findings.reduce((sum, f) => sum + f.scoreDeduction, 0);
  const score = Math.max(
    config.minScore,
    Math.min(config.maxScore, config.maxScore - totalDeductions)
  );

  let grade = "F";
  for (const threshold of config.gradeThresholds) {
    if (score >= threshold.minScore) {
      grade = threshold.grade;
      break;
    }
  }

  if (recommendations.length === 0) {
    recommendations.push("Excellent privacy posture! Continue periodic automated scans.");
  }

  return {
    score,
    grade,
    bannerDetected: payload.bannerDetected,
    bannerCmpName: payload.bannerCmpName,
    totalCookies: analyzedCookies.length,
    thirdPartyCookies: thirdPartyCookieCount,
    totalTrackers: analyzedTrackers.length,
    thirdPartyRequests: thirdPartyRequestCount,
    preConsentViolations: {
      cookieCount: preConsentCookieCount,
      trackerCount: preConsentTrackerCalls,
    },
    cookies: analyzedCookies,
    trackers: analyzedTrackers,
    findings,
    recommendations: Array.from(new Set(recommendations)),
    disclaimer: LEGAL_DISCLAIMER,
  };
}
