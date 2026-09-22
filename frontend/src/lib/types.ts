export type ScanStatus = "pending" | "scanning" | "analyzing" | "completed" | "failed";
export type FindingSeverity = "info" | "low" | "medium" | "high" | "critical";
export type FindingCategory = "Consent" | "Cookies" | "Trackers" | "Security" | "DarkPattern";
export type TrackerCategory =
  | "Advertising"
  | "Analytics"
  | "Social"
  | "Fingerprinting"
  | "Essential"
  | "Content/CDN"
  | "Other";

export interface Scan {
  id: string;
  websiteId: string;
  status: ScanStatus;
  score: number | null;
  grade: string | null;
  durationMs: number | null;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
  website?: {
    id: string;
    url: string;
    domain: string;
  };
}

export interface ReportMetrics {
  totalCookies: number;
  thirdPartyCookies: number;
  totalTrackers: number;
  thirdPartyRequests: number;
  durationMs: number;
  websiteTitle?: string;
  finalUrl?: string;
  metaTags?: Record<string, string>;
  consentTestSummary?: {
    tested: boolean;
    action: string;
    buttonText?: string | null;
    observedNewCookies: number;
    observedNewRequests: number;
    details?: string;
  };
}

export interface Report {
  id: string;
  scanId: string;
  summary: string;
  totalScore: number;
  grade: string;
  metrics: ReportMetrics;
  recommendations: string[];
  consentBanner?: ConsentBanner | null;
  createdAt: string;
}

export interface Finding {
  id: string;
  scanId: string;
  ruleId: string;
  title: string;
  severity: FindingSeverity;
  scoreDeduction: number;
  description: string;
  evidence: Record<string, any>;
  remediation: string;
  createdAt: string;
}

export interface CookieRecord {
  id: string;
  scanId: string;
  trackerId?: string | null;
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
}

export interface NetworkRequest {
  id: string;
  scanId: string;
  trackerId?: string | null;
  url: string;
  domain: string;
  method: string;
  statusCode?: number | null;
  resourceType: string;
  isThirdParty: boolean;
  headers?: Record<string, string>;
}

export interface ConsentBanner {
  id: string;
  scanId: string;
  detected: boolean;
  cmpName: string | null;
  bannerText: string | null;
  hasAcceptButton: boolean;
  hasRejectButton: boolean;
  hasSettingsButton: boolean;
  rawMetadata?: {
    visibility?: string;
    acceptButtonText?: string | null;
    rejectButtonText?: string | null;
    settingsButtonText?: string | null;
    optionIndicators?: {
      detected: boolean;
      count: number;
      types: string[];
    };
    consentTest?: {
      tested: boolean;
      action: string;
      buttonText: string | null;
      observedNewCookies: number;
      observedNewRequests: number;
      details?: string;
    };
  };
}

export interface ScanComparison {
  scanA: {
    id: string;
    domain?: string;
    url?: string;
    score: number | null;
    grade: string | null;
    createdAt: string;
  };
  scanB: {
    id: string;
    domain?: string;
    url?: string;
    score: number | null;
    grade: string | null;
    createdAt: string;
  };
  comparison: {
    scoreDifference: number;
    gradeChange: string;
    status: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  error?: {
    message: string;
    details?: any;
  };
}
