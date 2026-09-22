import {
  extractRootDomain,
  isThirdPartyDomain,
  categorizeCookie,
  analyzeScan,
} from "./scorer.js";
import { findKnownTracker, findKnownCookie } from "./trackerDb.js";
import { RawScanPayload } from "./rules.js";
import { DEFAULT_SCORING_CONFIG, ScoringConfig } from "./scoringConfig.js";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

async function runAnalyzerTestSuite() {
  console.log("==================================================");
  console.log(" 🧪 CYBERSENTRY PRIVACY ANALYSIS ENGINE TEST SUITE");
  console.log("==================================================");

  // -------------------------------------------------------------
  // Test 1: Known Tracker Identification & Categorization
  // -------------------------------------------------------------
  console.log("\n[Test 1] Testing Known Tracker Identification & Categorization...");
  const ga = findKnownTracker("google-analytics.com");
  assert(ga !== null, "Google Analytics must be identified");
  assert(ga?.category === "Analytics", `GA should be Analytics, got ${ga?.category}`);
  assert(ga?.company === "Google LLC", "GA company should be Google LLC");

  const doubleClick = findKnownTracker("ad.doubleclick.net");
  assert(doubleClick !== null, "DoubleClick subdomain must be identified");
  assert(doubleClick?.category === "Advertising", `DoubleClick should be Advertising, got ${doubleClick?.category}`);

  const clarity = findKnownTracker("scripts.clarity.ms");
  assert(clarity !== null, "Clarity must be identified");
  assert(clarity?.category === "Fingerprinting", `Clarity should be Fingerprinting, got ${clarity?.category}`);

  // Benign CDN check - MUST NOT be classified as advertising
  const cdn = findKnownTracker("cdnjs.cloudflare.com");
  assert(cdn !== null, "cdnjs must be identified");
  assert(cdn?.category === "Content/CDN", `CDN should be Content/CDN, got ${cdn?.category}`);

  // Essential Payment service - MUST NOT be classified as advertising
  const stripe = findKnownTracker("js.stripe.com");
  assert(stripe !== null, "Stripe must be identified");
  assert(stripe?.category === "Essential", `Stripe should be Essential, got ${stripe?.category}`);

  console.log("  ✓ Known trackers and benign CDNs identified with exact categories.");

  // -------------------------------------------------------------
  // Test 2: Unknown Third-Party Domains
  // -------------------------------------------------------------
  console.log("\n[Test 2] Testing Unknown Third-Party Domains (No False Generalization)...");
  const unknownDomain = "api.random-partner-vendor.xyz";
  const matchedUnknown = findKnownTracker(unknownDomain);
  assert(matchedUnknown === null, "Unknown domain must return null from tracker DB");

  const payloadUnknown: RawScanPayload = {
    url: "https://myshop.com",
    targetDomain: "myshop.com",
    cookies: [],
    requests: [
      {
        url: `https://${unknownDomain}/v1/data`,
        method: "GET",
        resourceType: "fetch",
        headers: {},
      },
    ],
    bannerDetected: true,
    bannerCmpName: "OneTrust",
    durationMs: 1200,
  };

  const resultUnknown = analyzeScan(payloadUnknown);
  assert(resultUnknown.trackers.length === 1, "Should record 1 third-party tracker");
  const recorded = resultUnknown.trackers[0];
  assert(
    recorded.category === "Other",
    `Unknown third-party domain MUST be categorized as 'Other', got: ${recorded.category}`
  );
  assert(
    !resultUnknown.findings.some((f) => f.ruleId === "RULE_AD_TRACKERS"),
    "RULE_AD_TRACKERS must NOT trigger for unclassified third-party domains"
  );
  console.log("  ✓ Unknown third-party domains safely categorized as 'Other' (never assumed to be Advertising).");

  // -------------------------------------------------------------
  // Test 3: First-Party vs. Third-Party Classification
  // -------------------------------------------------------------
  console.log("\n[Test 3] Testing First-Party vs Third-Party Domain & Cookie Classification...");
  assert(extractRootDomain("example.com") === "example.com", "example.com root domain");
  assert(extractRootDomain("sub.example.com") === "example.com", "subdomain root domain");
  assert(extractRootDomain("deep.sub.example.com") === "example.com", "deep subdomain root domain");
  assert(extractRootDomain("news.bbc.co.uk") === "bbc.co.uk", "multi-part ccTLD .co.uk");
  assert(extractRootDomain("shop.brand.com.au") === "brand.com.au", "multi-part ccTLD .com.au");

  assert(!isThirdPartyDomain("example.com", "example.com"), "Same host is first-party");
  assert(!isThirdPartyDomain("example.com", "auth.example.com"), "Subdomain is first-party");
  assert(!isThirdPartyDomain("shop.example.com", "api.example.com"), "Sibling subdomain is first-party");
  assert(!isThirdPartyDomain("news.bbc.co.uk", "static.bbc.co.uk"), ".co.uk sibling is first-party");
  assert(isThirdPartyDomain("example.com", "google.com"), "Different domain is third-party");
  assert(isThirdPartyDomain("bbc.co.uk", "adserver.com.au"), "Different ccTLD is third-party");
  console.log("  ✓ First-party and third-party domain resolution verified.");

  // -------------------------------------------------------------
  // Test 4: Cookie Categorization
  // -------------------------------------------------------------
  console.log("\n[Test 4] Testing Cookie Categorization...");
  assert(categorizeCookie("_ga", "example.com", false) === "Analytics", "_ga is Analytics");
  assert(categorizeCookie("_fbp", "facebook.com", true) === "Advertising", "_fbp is Advertising");
  assert(categorizeCookie("PHPSESSID", "example.com", false) === "Essential", "PHPSESSID is Essential");
  assert(categorizeCookie("csrf_token", "example.com", false) === "Essential", "csrf_token is Essential");
  assert(categorizeCookie("theme_mode", "example.com", false) === "Functional", "theme_mode is Functional");
  assert(categorizeCookie("my_custom_first_party_id", "example.com", false) === "Unknown", "custom cookie is Unknown");
  console.log("  ✓ Cookie categorization verified across essential, analytics, advertising, and functional types.");

  // -------------------------------------------------------------
  // Test 5: Pre-Consent Tracking Indicators
  // -------------------------------------------------------------
  console.log("\n[Test 5] Testing Pre-Consent Tracking Indicators...");
  const payloadWithPreConsent: RawScanPayload = {
    url: "https://example.com",
    targetDomain: "example.com",
    cookies: [
      {
        name: "_fbp",
        value: "fb.1.123",
        domain: ".example.com",
        path: "/",
        expires: Math.floor(Date.now() / 1000) + 3600,
        httpOnly: false,
        secure: true,
        sameSite: "Lax",
      },
    ],
    requests: [
      {
        url: "https://connect.facebook.net/en_US/fbevents.js",
        method: "GET",
        resourceType: "script",
        headers: {},
      },
    ],
    bannerDetected: true,
    bannerCmpName: "OneTrust",
    durationMs: 1500,
  };

  const resultPreConsent = analyzeScan(payloadWithPreConsent);
  const preConsentFinding = resultPreConsent.findings.find(
    (f) => f.ruleId === "RULE_PRE_CONSENT_TRACKING"
  );
  assert(preConsentFinding !== undefined, "RULE_PRE_CONSENT_TRACKING must be triggered");
  assert(preConsentFinding?.severity === "critical", "Pre-consent violation severity should be critical");
  assert(resultPreConsent.preConsentViolations.cookieCount === 1, "Should count 1 pre-consent cookie");
  assert(resultPreConsent.preConsentViolations.trackerCount >= 1, "Should count pre-consent tracker calls");
  console.log("  ✓ Pre-consent tracking detected and flagged with critical severity.");

  // -------------------------------------------------------------
  // Test 6: Consent Banner Detection & Reject Visibility
  // -------------------------------------------------------------
  console.log("\n[Test 6] Testing Consent Banner Detection & Reject Visibility...");
  // Case A: Missing Banner
  const payloadNoBanner: RawScanPayload = {
    url: "https://example.com",
    targetDomain: "example.com",
    cookies: [],
    requests: [],
    bannerDetected: false,
    bannerCmpName: null,
    durationMs: 1000,
  };
  const resultNoBanner = analyzeScan(payloadNoBanner);
  assert(
    resultNoBanner.findings.some((f) => f.ruleId === "RULE_NO_BANNER"),
    "RULE_NO_BANNER must trigger when no banner is detected"
  );

  // Case B: Banner with Accept but NO Reject button (Asymmetry)
  const payloadAsymmetric: RawScanPayload = {
    url: "https://example.com",
    targetDomain: "example.com",
    cookies: [],
    requests: [],
    bannerDetected: true,
    bannerCmpName: "Custom Banner",
    bannerInfo: {
      detected: true,
      cmpName: "Custom Banner",
      bannerText: "We use cookies to improve your experience.",
      visibility: "visible",
      acceptButton: { detected: true, text: "Accept All" },
      rejectButton: { detected: false, text: null },
      settingsButton: { detected: true, text: "Customize Options" },
      optionIndicators: { detected: false, count: 0, types: [] },
    },
    durationMs: 1000,
  };
  const resultAsymmetric = analyzeScan(payloadAsymmetric);
  assert(
    resultAsymmetric.findings.some((f) => f.ruleId === "RULE_NO_REJECT_BUTTON"),
    "RULE_NO_REJECT_BUTTON must trigger when accept exists but reject is missing"
  );
  assert(
    resultAsymmetric.findings.some((f) => f.ruleId === "RULE_ASYMMETRIC_CONSENT"),
    "RULE_ASYMMETRIC_CONSENT must trigger when reject is buried behind settings"
  );
  console.log("  ✓ Banner detection, reject-button absence, and dark patterns verified.");

  // -------------------------------------------------------------
  // Test 7: Missing or Unavailable Evidence (Graceful Handling)
  // -------------------------------------------------------------
  console.log("\n[Test 7] Testing Missing or Unavailable Evidence (No False Compliances)...");
  const payloadEmpty: RawScanPayload = {
    url: "https://clean-site.org",
    targetDomain: "clean-site.org",
    cookies: [],
    requests: [],
    bannerDetected: false,
    bannerCmpName: null,
    durationMs: 800,
  };

  const resultEmpty = analyzeScan(payloadEmpty);
  assert(!isNaN(resultEmpty.score), "Score must be a valid number, not NaN");
  assert(resultEmpty.score <= 80, "Absence of banner should apply deduction (score <= 80)");
  assert(resultEmpty.disclaimer.length > 20, "Legal disclaimer must be included");
  console.log(`  ✓ Handled empty evidence cleanly (Score: ${resultEmpty.score}/100, Grade: ${resultEmpty.grade}).`);

  // -------------------------------------------------------------
  // Test 8: Configurable Scoring Weights Override
  // -------------------------------------------------------------
  console.log("\n[Test 8] Testing Configurable Scoring Weights Override...");
  const customConfig: ScoringConfig = {
    ...DEFAULT_SCORING_CONFIG,
    rules: {
      ...DEFAULT_SCORING_CONFIG.rules,
      RULE_NO_BANNER: {
        deduction: 50, // harsh penalty
        severity: "critical",
        category: "Consent",
      },
    },
  };

  const resultCustom = analyzeScan(payloadNoBanner, customConfig);
  assert(resultCustom.score === 50, `Score should be 50 with custom 50pt penalty, got ${resultCustom.score}`);
  assert(resultCustom.grade === "D", `Grade should be D with score 50, got ${resultCustom.grade}`);
  console.log("  ✓ Configurable scoring weights cleanly override defaults.");

  console.log("\n==================================================");
  console.log(" 🎉 ALL 8 PRIVACY ANALYSIS ENGINE TESTS PASSED!");
  console.log("==================================================");
}

runAnalyzerTestSuite()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n❌ Analyzer test suite failed:", err);
    process.exit(1);
  });
