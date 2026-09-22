import {
  ApiResponse,
  Scan,
  Report,
  Finding,
  CookieRecord,
  NetworkRequest,
  ConsentBanner,
  ScanComparison,
} from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:5001";

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      cache: "no-store",
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || `Request failed with status ${res.status}`);
    }

    return data;
  } catch (err: any) {
    console.error(`[API Error] ${endpoint}:`, err.message);
    throw err;
  }
}

export const api = {
  // Check backend and DB connectivity
  getHealth: async () => {
    return request<{
      status: string;
      service: string;
      database: { status: string; latencyMs: number };
      uptimeSeconds: number;
    }>("/api/health");
  },

  // Submit URL for scan
  createScan: async (url: string) => {
    return request<{
      scan: Scan;
      report?: Report;
      summary?: any;
    }>("/api/scans", {
      method: "POST",
      body: JSON.stringify({ url }),
    });
  },

  // Get scan status
  getScan: async (id: string) => {
    return request<Scan>(`/api/scans/${id}`);
  },

  // Get report
  getReport: async (scanId: string) => {
    return request<Report>(`/api/scans/${scanId}/report`);
  },

  // Get cookies
  getCookies: async (scanId: string) => {
    return request<{
      cookies: CookieRecord[];
      count: number;
    }>(`/api/scans/${scanId}/cookies`);
  },

  // Get trackers
  getTrackers: async (scanId: string) => {
    return request<{
      trackers?: any[];
      requests?: NetworkRequest[];
      count: number;
    }>(`/api/scans/${scanId}/trackers`);
  },

  // Get findings
  getFindings: async (scanId: string) => {
    return request<{
      findings: Finding[];
      count: number;
    }>(`/api/scans/${scanId}/findings`);
  },

  // List scan history
  listScans: async (params: { page?: number; limit?: number; domain?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set("page", params.page.toString());
    if (params.limit) query.set("limit", params.limit.toString());
    if (params.domain) query.set("domain", params.domain);

    const qs = query.toString();
    return request<Scan[]>(`/api/scans${qs ? `?${qs}` : ""}`);
  },

  // Compare two scans
  compareScans: async (scanAId: string, scanBId: string) => {
    return request<ScanComparison>(`/api/scans/compare?scanA=${scanAId}&scanB=${scanBId}`);
  },
};
