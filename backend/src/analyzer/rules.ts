import { DetailedBannerInfo } from "../scanner/bannerDetector.js";
import { ConsentTestResult } from "../scanner/consentTester.js";

export type FindingCategory = "Consent" | "Cookies" | "Trackers" | "Security" | "DarkPattern";
export type FindingSeverity = "info" | "low" | "medium" | "high" | "critical";

export interface RawCookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires: number; // Unix timestamp in seconds or -1
  httpOnly: boolean;
  secure: boolean;
  sameSite: "Strict" | "Lax" | "None";
}

export interface RawNetworkRequest {
  url: string;
  method: string;
  resourceType: string;
  headers: Record<string, string>;
}

export interface RawScanPayload {
  url: string;
  targetDomain: string;
  cookies: RawCookie[];
  requests: RawNetworkRequest[];
  bannerDetected: boolean;
  bannerCmpName: string | null;
  bannerInfo?: DetailedBannerInfo;
  consentTest?: ConsentTestResult;
  durationMs: number;
}

export interface RuleFinding {
  ruleId: string;
  category: FindingCategory;
  title: string;
  severity: FindingSeverity;
  scoreDeduction: number;
  description: string;
  evidence: Record<string, any>;
  remediation: string;
}

export interface AnalyzedCookie {
  name: string;
  domain: string;
  path: string;
  expires: number;
  isSession: boolean;
  isSecure: boolean;
  isHttpOnly: boolean;
  sameSite: string;
  isThirdParty: boolean;
  category: "Essential" | "Analytics" | "Advertising" | "Functional" | "Unknown";
  valuePreview: string;
  isPreConsent: boolean;
}

export interface AnalyzedTracker {
  domain: string;
  url: string;
  category: "Advertising" | "Analytics" | "Social" | "Fingerprinting" | "Essential" | "Content/CDN" | "Other";
  company: string;
  isThirdParty: boolean;
  resourceType: string;
  isPreConsent: boolean;
}

export interface AnalysisResult {
  score: number;
  grade: string;
  bannerDetected: boolean;
  bannerCmpName: string | null;
  totalCookies: number;
  thirdPartyCookies: number;
  totalTrackers: number;
  thirdPartyRequests: number;
  preConsentViolations: {
    cookieCount: number;
    trackerCount: number;
  };
  cookies: AnalyzedCookie[];
  trackers: AnalyzedTracker[];
  findings: RuleFinding[];
  recommendations: string[];
  disclaimer: string;
}
