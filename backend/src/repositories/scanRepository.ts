import { eq, desc, sql, and } from "drizzle-orm";
import { db } from "../db/index.js";
import {
  scans,
  websites,
  cookieRecords,
  networkRequests,
  consentBanners,
  findings,
  reports,
  trackers,
  Scan,
  Report,
  CookieRecord,
  Finding,
  NetworkRequest,
} from "../db/schema.js";
import { AnalysisResult } from "../analyzer/rules.js";
import { DetailedBannerInfo } from "../scanner/bannerDetector.js";

export class ScanRepository {
  /**
   * Creates an initial scan record in pending state
   */
  async createScan(websiteId: string): Promise<Scan> {
    const inserted = await db
      .insert(scans)
      .values({
        websiteId,
        status: "pending",
      })
      .returning();

    return inserted[0];
  }

  /**
   * Updates scan status
   */
  async updateScanStatus(
    id: string,
    status: "pending" | "scanning" | "analyzing" | "completed" | "failed",
    extra?: {
      durationMs?: number;
      score?: number;
      grade?: string;
      errorMessage?: string;
      completedAt?: Date;
    }
  ): Promise<void> {
    await db
      .update(scans)
      .set({
        status,
        ...(extra?.durationMs !== undefined && { durationMs: extra.durationMs }),
        ...(extra?.score !== undefined && { score: extra.score }),
        ...(extra?.grade !== undefined && { grade: extra.grade }),
        ...(extra?.errorMessage !== undefined && { errorMessage: extra.errorMessage }),
        ...(extra?.completedAt !== undefined && { completedAt: extra.completedAt }),
      })
      .where(eq(scans.id, id));
  }

  /**
   * Atomically persists full scan findings, cookies, requests, banner, and report in a database transaction
   */
  async saveScanFullResults(params: {
    scanId: string;
    websiteId: string;
    targetDomain: string;
    metadata: { title: string; finalUrl: string; metaTags: Record<string, any> };
    analysis: AnalysisResult;
    durationMs: number;
    rawRequests: Array<{
      url: string;
      method: string;
      resourceType: string;
      headers: Record<string, string>;
    }>;
    bannerInfo: {
      detected: boolean;
      cmpName: string | null;
      bannerText: string | null;
      visibility: string;
      acceptButton: { detected: boolean; text: string | null };
      rejectButton: { detected: boolean; text: string | null };
      settingsButton: { detected: boolean; text: string | null };
      optionIndicators: { detected: boolean; count: number; types: string[] };
    };
    consentTest: {
      tested: boolean;
      action: string;
      buttonText: string | null;
      observedNewCookies: number;
      observedNewRequests: number;
      details?: string;
    };
    domainToTrackerIdMap: Map<string, string>;
  }): Promise<void> {
    const {
      scanId,
      websiteId,
      targetDomain,
      metadata,
      analysis,
      durationMs,
      rawRequests,
      bannerInfo,
      consentTest,
      domainToTrackerIdMap,
    } = params;

    await db.transaction(async (tx) => {
      // 1. Update Website with final redirected URL
      await tx
        .update(websites)
        .set({
          url: metadata.finalUrl,
        })
        .where(eq(websites.id, websiteId));

      // 2. Update Scan record
      await tx
        .update(scans)
        .set({
          status: "completed",
          score: analysis.score,
          grade: analysis.grade,
          durationMs,
          completedAt: new Date(),
        })
        .where(eq(scans.id, scanId));

      // 3. Insert Consent Banner (1:0..1)
      if (bannerInfo.detected) {
        await tx.insert(consentBanners).values({
          scanId,
          detected: true,
          cmpName: bannerInfo.cmpName,
          bannerText: bannerInfo.bannerText || null,
          hasAcceptButton: bannerInfo.acceptButton.detected,
          hasRejectButton: bannerInfo.rejectButton.detected,
          hasSettingsButton: bannerInfo.settingsButton.detected,
          rawMetadata: {
            visibility: bannerInfo.visibility,
            acceptButtonText: bannerInfo.acceptButton.text,
            rejectButtonText: bannerInfo.rejectButton.text,
            settingsButtonText: bannerInfo.settingsButton.text,
            optionIndicators: bannerInfo.optionIndicators,
            consentTest,
          },
        });
      }

      // 3. Batch Insert Cookie Records
      if (analysis.cookies.length > 0) {
        const cookieRows = analysis.cookies.map((c) => {
          const rootDomain = c.domain.replace(/^\./, "").toLowerCase();
          const trackerId = domainToTrackerIdMap.get(rootDomain) || null;

          return {
            scanId,
            trackerId,
            name: c.name,
            domain: c.domain,
            path: c.path,
            expires: typeof c.expires === "number" && !isNaN(c.expires) ? Math.floor(c.expires) : -1,
            isSession: c.isSession,
            isSecure: c.isSecure,
            isHttpOnly: c.isHttpOnly,
            sameSite: c.sameSite,
            isThirdParty: c.isThirdParty,
            category: c.category,
            valuePreview: c.valuePreview,
          };
        });

        await tx.insert(cookieRecords).values(cookieRows);
      }

      // 4. Batch Insert Network Requests
      if (rawRequests.length > 0) {
        const netRows = rawRequests.slice(0, 150).map((r) => {
          let reqDomain = targetDomain;
          try {
            reqDomain = new URL(r.url).hostname;
          } catch {}
          const rootReq = reqDomain.replace(/^\./, "").toLowerCase();
          const trackerId = domainToTrackerIdMap.get(rootReq) || null;
          const is3rdParty = !reqDomain.includes(targetDomain);

          return {
            scanId,
            trackerId,
            url: r.url,
            domain: reqDomain,
            method: r.method || "GET",
            resourceType: r.resourceType || "other",
            isThirdParty: is3rdParty,
            headers: r.headers,
          };
        });

        await tx.insert(networkRequests).values(netRows);
      }

      // 5. Batch Insert Findings
      if (analysis.findings.length > 0) {
        const findingRows = analysis.findings.map((f) => ({
          scanId,
          ruleId: f.ruleId,
          title: f.title,
          severity: f.severity,
          scoreDeduction: f.scoreDeduction,
          description: f.description,
          evidence: {
            ...f.evidence,
            category: f.category,
          },
          remediation: f.remediation,
        }));

        await tx.insert(findings).values(findingRows);
      }

      // 6. Insert Report (1:1)
      await tx.insert(reports).values({
        scanId,
        summary: `Privacy transparency audit for ${targetDomain}: Score ${analysis.score}/100, Grade ${analysis.grade}.`,
        totalScore: analysis.score,
        grade: analysis.grade,
        metrics: {
          websiteTitle: metadata.title,
          finalUrl: metadata.finalUrl,
          totalCookies: analysis.totalCookies,
          thirdPartyCookies: analysis.thirdPartyCookies,
          totalTrackers: analysis.totalTrackers,
          thirdPartyRequests: analysis.thirdPartyRequests,
          durationMs,
          metaTags: metadata.metaTags,
          consentTestSummary: {
            tested: consentTest.tested,
            action: consentTest.action,
            observedNewCookies: consentTest.observedNewCookies,
            observedNewRequests: consentTest.observedNewRequests,
          },
        },
        recommendations: analysis.recommendations,
      });
    });
  }

  /**
   * Retrieves scan with associated website metadata
   */
  async getScanWithWebsite(id: string) {
    const res = await db
      .select({
        id: scans.id,
        websiteId: scans.websiteId,
        url: websites.url,
        targetDomain: websites.domain,
        status: scans.status,
        score: scans.score,
        grade: scans.grade,
        startedAt: scans.startedAt,
        completedAt: scans.completedAt,
        durationMs: scans.durationMs,
        errorMessage: scans.errorMessage,
        createdAt: scans.createdAt,
      })
      .from(scans)
      .innerJoin(websites, eq(scans.websiteId, websites.id))
      .where(eq(scans.id, id))
      .limit(1);

    return res.length > 0 ? res[0] : null;
  }

  /**
   * Retrieves report for a scan
   */
  async getReport(scanId: string): Promise<Report | null> {
    const list = await db
      .select()
      .from(reports)
      .where(eq(reports.scanId, scanId))
      .limit(1);

    return list.length > 0 ? list[0] : null;
  }

  /**
   * Retrieves cookies for a scan
   */
  async getCookies(scanId: string): Promise<CookieRecord[]> {
    return db
      .select()
      .from(cookieRecords)
      .where(eq(cookieRecords.scanId, scanId));
  }

  /**
   * Retrieves network requests captured during a scan
   */
  async getNetworkRequests(scanId: string): Promise<NetworkRequest[]> {
    return db
      .select()
      .from(networkRequests)
      .where(eq(networkRequests.scanId, scanId));
  }

  /**
   * Retrieves findings for a scan
   */
  async getFindings(scanId: string): Promise<Finding[]> {
    return db
      .select()
      .from(findings)
      .where(eq(findings.scanId, scanId));
  }

  /**
   * Retrieves consent banner for a scan
   */
  async getConsentBanner(scanId: string) {
    const list = await db
      .select()
      .from(consentBanners)
      .where(eq(consentBanners.scanId, scanId))
      .limit(1);

    return list.length > 0 ? list[0] : null;
  }

  /**
   * Retrieves trackers discovered during a scan
   */
  async getScanTrackers(scanId: string) {
    // Fetch unique tracker IDs linked through cookie_records or network_requests
    const cookieTrackerList = await db
      .select({ trackerId: cookieRecords.trackerId })
      .from(cookieRecords)
      .where(and(eq(cookieRecords.scanId, scanId), sql`${cookieRecords.trackerId} IS NOT NULL`));

    const netTrackerList = await db
      .select({ trackerId: networkRequests.trackerId })
      .from(networkRequests)
      .where(and(eq(networkRequests.scanId, scanId), sql`${networkRequests.trackerId} IS NOT NULL`));

    const trackerIds = new Set<string>();
    cookieTrackerList.forEach((c) => c.trackerId && trackerIds.add(c.trackerId));
    netTrackerList.forEach((n) => n.trackerId && trackerIds.add(n.trackerId));

    if (trackerIds.size === 0) {
      return [];
    }

    const trackerIdArray = Array.from(trackerIds);
    return db
      .select()
      .from(trackers)
      .where(sql`${trackers.id} IN (${sql.join(trackerIdArray.map((id) => sql`${id}`), sql`, `)})`);
  }

  /**
   * Paginated scan history
   */
  async listScans(options: {
    page: number;
    limit: number;
    domain?: string;
    status?: string;
  }) {
    const { page, limit, domain, status } = options;
    const offset = (page - 1) * limit;

    const conditions = [];
    if (domain) {
      conditions.push(sql`${websites.domain} ILIKE ${`%${domain}%`}`);
    }
    if (status) {
      conditions.push(sql`${scans.status} = ${status}`);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [items, countResult] = await Promise.all([
      db
        .select({
          id: scans.id,
          websiteId: scans.websiteId,
          url: websites.url,
          targetDomain: websites.domain,
          status: scans.status,
          score: scans.score,
          grade: scans.grade,
          durationMs: scans.durationMs,
          startedAt: scans.startedAt,
          completedAt: scans.completedAt,
          createdAt: scans.createdAt,
        })
        .from(scans)
        .innerJoin(websites, eq(scans.websiteId, websites.id))
        .where(whereClause)
        .orderBy(desc(scans.createdAt))
        .limit(limit)
        .offset(offset),

      db
        .select({ count: sql<number>`count(*)::int` })
        .from(scans)
        .innerJoin(websites, eq(scans.websiteId, websites.id))
        .where(whereClause),
    ]);

    const total = countResult[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    };
  }
}

export const scanRepository = new ScanRepository();
