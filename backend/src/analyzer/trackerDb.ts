export interface TrackerDefinition {
  domain: string;
  name: string;
  company: string;
  category: "Advertising" | "Analytics" | "Social" | "Fingerprinting" | "Essential" | "Content/CDN" | "Other";
  description: string;
}

export interface CookieDefinition {
  pattern: RegExp | string;
  name: string;
  category: "Essential" | "Analytics" | "Advertising" | "Functional" | "Unknown";
  description: string;
}

export interface CmpDefinition {
  name: string;
  selectors: string[];
  scriptPatterns: string[];
}

export const KNOWN_TRACKERS: TrackerDefinition[] = [
  // --- Google / Alphabet ---
  {
    domain: "google-analytics.com",
    name: "Google Analytics",
    company: "Google LLC",
    category: "Analytics",
    description: "Tracks user sessions, engagement, pageviews, and bounce rates.",
  },
  {
    domain: "googletagmanager.com",
    name: "Google Tag Manager",
    company: "Google LLC",
    category: "Analytics",
    description: "Tag container platform used to orchestrate analytics and marketing pixels.",
  },
  {
    domain: "doubleclick.net",
    name: "Google DoubleClick",
    company: "Google LLC",
    category: "Advertising",
    description: "Cross-site digital advertising and behavioral targeting platform.",
  },
  {
    domain: "googleadservices.com",
    name: "Google Ad Services",
    company: "Google LLC",
    category: "Advertising",
    description: "Conversion tracking and remarketing service for Google Ads.",
  },
  {
    domain: "googlesyndication.com",
    name: "Google AdSense",
    company: "Google LLC",
    category: "Advertising",
    description: "Publishing network for serving targeted display advertising.",
  },

  // --- Meta / Facebook ---
  {
    domain: "connect.facebook.net",
    name: "Meta Pixel / SDK",
    company: "Meta Platforms, Inc.",
    category: "Advertising",
    description: "Tracks user actions and conversions for targeted Facebook and Instagram advertising.",
  },
  {
    domain: "facebook.com",
    name: "Facebook Social Plugins",
    company: "Meta Platforms, Inc.",
    category: "Social",
    description: "Social media sharing widgets, login, and audience measurement.",
  },

  // --- Microsoft / LinkedIn ---
  {
    domain: "clarity.ms",
    name: "Microsoft Clarity",
    company: "Microsoft Corp",
    category: "Fingerprinting",
    description: "User behavioral analytics tool capturing session recordings and click heatmaps.",
  },
  {
    domain: "bat.bing.com",
    name: "Microsoft Advertising (Bing Ads)",
    company: "Microsoft Corp",
    category: "Advertising",
    description: "Universal Event Tracking tag for Bing search advertising attribution.",
  },
  {
    domain: "licdn.com",
    name: "LinkedIn Insight Tag",
    company: "Microsoft Corp",
    category: "Social",
    description: "Professional network visitor tracking and campaign conversion measurement.",
  },

  // --- ByteDance / TikTok ---
  {
    domain: "analytics.tiktok.com",
    name: "TikTok Pixel",
    company: "ByteDance Ltd.",
    category: "Advertising",
    description: "Monitors website activity to optimize and personalize TikTok ad campaigns.",
  },

  // --- X / Twitter ---
  {
    domain: "ads-twitter.com",
    name: "X (Twitter) Ads Pixel",
    company: "X Corp.",
    category: "Advertising",
    description: "Conversion tracking tag for X/Twitter advertising campaigns.",
  },
  {
    domain: "platform.twitter.com",
    name: "X (Twitter) Widgets",
    company: "X Corp.",
    category: "Social",
    description: "Embedded timelines and tweet sharing buttons.",
  },

  // --- Amazon ---
  {
    domain: "amazon-adsystem.com",
    name: "Amazon Advertising",
    company: "Amazon.com, Inc.",
    category: "Advertising",
    description: "Ad exchange and sponsored product attribution across Amazon network.",
  },

  // --- Session Replay & DOM Recording (Fingerprinting) ---
  {
    domain: "hotjar.com",
    name: "Hotjar",
    company: "Hotjar Ltd",
    category: "Fingerprinting",
    description: "DOM mutation observer recording full cursor movements and visitor journeys.",
  },
  {
    domain: "fullstory.com",
    name: "FullStory",
    company: "FullStory, Inc.",
    category: "Fingerprinting",
    description: "Digital experience intelligence recording detailed user DOM interactions.",
  },
  {
    domain: "crazyegg.com",
    name: "Crazy Egg",
    company: "Crazy Egg, Inc.",
    category: "Fingerprinting",
    description: "Visual click tracking, scrollmaps, and user navigation recordings.",
  },
  {
    domain: "mouseflow.com",
    name: "Mouseflow",
    company: "Mouseflow ApS",
    category: "Fingerprinting",
    description: "Session replay and form abandon analysis tracking mouse velocity and keystrokes.",
  },

  // --- Programmatic Ad Exchanges ---
  {
    domain: "criteo.com",
    name: "Criteo Retargeting",
    company: "Criteo SA",
    category: "Advertising",
    description: "Cross-domain personalized retargeting network.",
  },
  {
    domain: "adnxs.com",
    name: "AppNexus / Xandr",
    company: "Microsoft Corp",
    category: "Advertising",
    description: "Real-time programmatic bidding and supply-side ad exchange.",
  },
  {
    domain: "rubiconproject.com",
    name: "Magnite (Rubicon Project)",
    company: "Magnite, Inc.",
    category: "Advertising",
    description: "Global sell-side programmatic advertising platform.",
  },
  {
    domain: "pubmatic.com",
    name: "PubMatic",
    company: "PubMatic, Inc.",
    category: "Advertising",
    description: "Cloud-based automated digital advertising platform.",
  },
  {
    domain: "taboola.com",
    name: "Taboola",
    company: "Taboola, Inc.",
    category: "Advertising",
    description: "Content discovery engine and native sponsored article network.",
  },
  {
    domain: "outbrain.com",
    name: "Outbrain",
    company: "Outbrain Inc.",
    category: "Advertising",
    description: "Native advertising feed delivering sponsored recommendation links.",
  },

  // --- Product Analytics ---
  {
    domain: "segment.io",
    name: "Segment",
    company: "Twilio, Inc.",
    category: "Analytics",
    description: "Customer data platform routing telemetry events to marketing tools.",
  },
  {
    domain: "mixpanel.com",
    name: "Mixpanel",
    company: "Mixpanel, Inc.",
    category: "Analytics",
    description: "User journey and product event analytics.",
  },
  {
    domain: "amplitude.com",
    name: "Amplitude",
    company: "Amplitude, Inc.",
    category: "Analytics",
    description: "Behavioral analytics and conversion funnel measurement.",
  },
  {
    domain: "newrelic.com",
    name: "New Relic Browser",
    company: "New Relic, Inc.",
    category: "Analytics",
    description: "Real User Monitoring (RUM) measuring frontend performance and network errors.",
  },

  // --- Content / CDNs (BENIGN INFRASTRUCTURE - NOT ADVERTISING) ---
  {
    domain: "cdnjs.cloudflare.com",
    name: "Cloudflare CDN",
    company: "Cloudflare, Inc.",
    category: "Content/CDN",
    description: "Public open-source JavaScript and CSS library repository.",
  },
  {
    domain: "cdn.jsdelivr.net",
    name: "jsDelivr CDN",
    company: "ProspectOne",
    category: "Content/CDN",
    description: "Free public open-source package delivery CDN.",
  },
  {
    domain: "unpkg.com",
    name: "UNPKG",
    company: "Cloudflare, Inc.",
    category: "Content/CDN",
    description: "Fast, global content delivery network for npm packages.",
  },
  {
    domain: "fonts.googleapis.com",
    name: "Google Fonts API",
    company: "Google LLC",
    category: "Content/CDN",
    description: "Web typography delivery stylesheet API.",
  },
  {
    domain: "fonts.gstatic.com",
    name: "Google Fonts Static",
    company: "Google LLC",
    category: "Content/CDN",
    description: "Static font asset delivery server.",
  },
  {
    domain: "code.jquery.com",
    name: "jQuery CDN",
    company: "OpenJS Foundation",
    category: "Content/CDN",
    description: "Static library host for jQuery libraries.",
  },

  // --- Essential Services (PAYMENTS & SECURITY) ---
  {
    domain: "js.stripe.com",
    name: "Stripe.js",
    company: "Stripe, Inc.",
    category: "Essential",
    description: "Payment gateway tokenization and anti-fraud library.",
  },
  {
    domain: "www.google.com/recaptcha",
    name: "Google reCAPTCHA",
    company: "Google LLC",
    category: "Essential",
    description: "Abuse detection and bot mitigation service.",
  },
  {
    domain: "hcaptcha.com",
    name: "hCaptcha",
    company: "Intuition Machines, Inc.",
    category: "Essential",
    description: "Privacy-focused bot defense verification service.",
  },
];

export const KNOWN_COOKIES: CookieDefinition[] = [
  // Analytics
  {
    pattern: /^_ga/,
    name: "_ga",
    category: "Analytics",
    description: "Google Analytics unique visitor identification cookie.",
  },
  {
    pattern: /^_gid$/,
    name: "_gid",
    category: "Analytics",
    description: "Google Analytics 24-hour session grouping cookie.",
  },
  {
    pattern: /^_gat/,
    name: "_gat",
    category: "Analytics",
    description: "Google Analytics request throttling cookie.",
  },
  {
    pattern: /^_hjSessionUser/,
    name: "_hjSessionUser",
    category: "Analytics",
    description: "Hotjar persistent visitor ID cookie.",
  },
  {
    pattern: /^_hjSession/,
    name: "_hjSession",
    category: "Analytics",
    description: "Hotjar active session tracking cookie.",
  },
  {
    pattern: /^_clck$/,
    name: "_clck",
    category: "Analytics",
    description: "Microsoft Clarity unique browser session ID.",
  },
  {
    pattern: /^_clsk$/,
    name: "_clsk",
    category: "Analytics",
    description: "Microsoft Clarity multi-page navigation session state.",
  },
  {
    pattern: /^_pk_id/,
    name: "_pk_id",
    category: "Analytics",
    description: "Matomo / Piwik persistent visitor ID cookie.",
  },
  {
    pattern: /^_pk_ses/,
    name: "_pk_ses",
    category: "Analytics",
    description: "Matomo / Piwik short-lived session cookie.",
  },
  {
    pattern: /^mp_.*_mixpanel$/,
    name: "mixpanel",
    category: "Analytics",
    description: "Mixpanel visitor tracking state.",
  },

  // Advertising
  {
    pattern: /^_fbp$/,
    name: "_fbp",
    category: "Advertising",
    description: "Meta Pixel browser identifier for advertising attribution.",
  },
  {
    pattern: /^fr$/,
    name: "fr",
    category: "Advertising",
    description: "Facebook cross-site advertising delivery cookie.",
  },
  {
    pattern: /^IDE$/,
    name: "IDE",
    category: "Advertising",
    description: "Google DoubleClick ad impression and conversion tracking cookie.",
  },
  {
    pattern: /^bcookie$/,
    name: "bcookie",
    category: "Advertising",
    description: "LinkedIn browser identifier cookie.",
  },
  {
    pattern: /^bscookie$/,
    name: "bscookie",
    category: "Advertising",
    description: "LinkedIn secure tracking browser cookie.",
  },
  {
    pattern: /^_uetsid$/,
    name: "_uetsid",
    category: "Advertising",
    description: "Microsoft Bing Ads session tracking cookie.",
  },
  {
    pattern: /^_uetvid$/,
    name: "_uetvid",
    category: "Advertising",
    description: "Microsoft Bing Ads persistent user identifier cookie.",
  },
  {
    pattern: /^tt_pixel/,
    name: "tt_pixel",
    category: "Advertising",
    description: "TikTok Pixel conversion tracking cookie.",
  },

  // Essential / Security
  {
    pattern: /^__cf_bm$/,
    name: "__cf_bm",
    category: "Essential",
    description: "Cloudflare bot management and rate limiting cookie.",
  },
  {
    pattern: /^cf_clearance$/,
    name: "cf_clearance",
    category: "Essential",
    description: "Cloudflare challenge clearance authorization token.",
  },
  {
    pattern: /^AWSALB/,
    name: "AWSALB",
    category: "Essential",
    description: "Amazon Application Load Balancer session affinity routing cookie.",
  },
  {
    pattern: /^PHPSESSID$/,
    name: "PHPSESSID",
    category: "Essential",
    description: "PHP native user session identifier.",
  },
  {
    pattern: /^JSESSIONID$/,
    name: "JSESSIONID",
    category: "Essential",
    description: "Java Servlet container session cookie.",
  },
  {
    pattern: /^(csrf|xsrf|_csrf)/i,
    name: "CSRF Token",
    category: "Essential",
    description: "Cross-Site Request Forgery security protection token.",
  },
  {
    pattern: /(consent|cookie_notice|cookieconsent|OptanonConsent)/i,
    name: "Consent State",
    category: "Essential",
    description: "Stores user cookie consent choices.",
  },

  // Functional
  {
    pattern: /^(theme|dark_mode|color_mode)/i,
    name: "UI Theme",
    category: "Functional",
    description: "Preserves user visual preference (dark/light theme).",
  },
  {
    pattern: /^(lang|language|locale)/i,
    name: "Language Preference",
    category: "Functional",
    description: "Preserves user selected locale or spoken language.",
  },
];

export const KNOWN_CMPS: CmpDefinition[] = [
  {
    name: "OneTrust",
    selectors: ["#onetrust-banner-sdk", "#onetrust-consent-sdk", ".onetrust-pc-dark-filter"],
    scriptPatterns: ["cdn.cookielaw.org", "onetrust"],
  },
  {
    name: "Cookiebot",
    selectors: ["#CybotCookiebotDialog", "#CookiebotWidget", "#CybotCookiebotDialogBody"],
    scriptPatterns: ["consent.cookiebot.com", "cookiebot.js"],
  },
  {
    name: "TrustArc",
    selectors: ["#truste-consent-track", "#truste-consent-button", ".truste_box_overlay"],
    scriptPatterns: ["consent.trustarc.com", "truste.com"],
  },
  {
    name: "Didomi",
    selectors: ["#didomi-host", "#didomi-notice", "#didomi-popup"],
    scriptPatterns: ["didomi.io"],
  },
  {
    name: "Usercentrics",
    selectors: ["#usercentrics-root", "div[data-usercentrics]"],
    scriptPatterns: ["usercentrics.eu", "app.usercentrics.eu"],
  },
  {
    name: "Klaro",
    selectors: [".klaro", ".cookie-notice", ".klaro-cookie-notice"],
    scriptPatterns: ["klaro.js"],
  },
  {
    name: "Generic Banner Heuristic",
    selectors: [
      "[id*='cookie-banner']",
      "[id*='cookie-consent']",
      "[id*='cookie-notice']",
      "[class*='cookie-banner']",
      "[class*='cookie-consent']",
      "[class*='cookie-notice']",
      "[aria-label*='cookie' i]",
      "[aria-label*='consent' i]",
    ],
    scriptPatterns: [],
  },
];

/**
 * Searches the tracker database for a matching domain or root domain
 */
export function findKnownTracker(hostname: string): TrackerDefinition | null {
  const cleanHost = hostname.toLowerCase().split(":")[0].replace(/^\./, "");
  
  // Exact match or subdomain match (e.g. sub.google-analytics.com matches google-analytics.com)
  for (const tracker of KNOWN_TRACKERS) {
    if (cleanHost === tracker.domain || cleanHost.endsWith("." + tracker.domain)) {
      return tracker;
    }
  }

  return null;
}

/**
 * Searches the cookie database for a matching pattern
 */
export function findKnownCookie(cookieName: string): CookieDefinition | null {
  for (const c of KNOWN_COOKIES) {
    if (typeof c.pattern === "string" && c.pattern.toLowerCase() === cookieName.toLowerCase()) {
      return c;
    }
    if (c.pattern instanceof RegExp && c.pattern.test(cookieName)) {
      return c;
    }
  }
  return null;
}
