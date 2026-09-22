import { validateUrlSafety } from "./ssrfService.js";
import { websiteRepository } from "../repositories/websiteRepository.js";
import { scanRepository } from "../repositories/scanRepository.js";
import { trackerRepository } from "../repositories/trackerRepository.js";
import { runScan } from "../scanner/scannerEngine.js";
import { analyzeScan } from "../analyzer/scorer.js";

export class ScanService {
  /**
   * Validates URL and creates initial scan record in 'pending' state
   */
  async createScanJob(rawUrl: string) {
    // 1. SSRF Safety Validation
    const safetyCheck = await validateUrlSafety(rawUrl);
    if (!safetyCheck.safe) {
      const err = new Error(safetyCheck.error || "URL failed security validation.");
      (err as any).statusCode = 400;
      throw err;
    }

    const { normalizedUrl, hostname } = safetyCheck;

    // 2. Find or Create Website Entity
    const website = await websiteRepository.findOrCreateWebsite(normalizedUrl, hostname);

    // 3. Create Scan Entity in 'pending' state
    const scan = await scanRepository.createScan(website.id);
    const scanWithWebsite = await scanRepository.getScanWithWebsite(scan.id);

    return {
      scan: scanWithWebsite || scan,
      normalizedUrl,
      hostname,
      websiteId: website.id,
    };
  }

  /**
   * Background runner that crawls website, executes deterministic scoring, and stores results in DB
   */
  async processScanJob(
    scanId: string,
    normalizedUrl: string,
    hostname: string,
    websiteId: string
  ) {
    try {
      // 1. Update status to 'scanning'
      await scanRepository.updateScanStatus(scanId, "scanning");

      // 2. Execute Playwright Headless Scanner
      const scanPayload = await runScan(normalizedUrl);

      // 3. Update status to 'analyzing'
      await scanRepository.updateScanStatus(scanId, "analyzing");

      // 4. Execute Deterministic Privacy Scoring
      const analysis = analyzeScan(scanPayload);

      // 5. Build Knowledge Base Domain-to-Tracker ID mapping
      const allKnownTrackers = await trackerRepository.getAllTrackers();
      const domainToTrackerIdMap = new Map<string, string>();
      for (const t of allKnownTrackers) {
        domainToTrackerIdMap.set(t.domain.toLowerCase(), t.id);
      }

      // 6. Save full scan audit trail inside a PostgreSQL transaction
      await scanRepository.saveScanFullResults({
        scanId,
        websiteId,
        targetDomain: hostname,
        metadata: scanPayload.metadata,
        analysis,
        durationMs: scanPayload.durationMs,
        rawRequests: scanPayload.requests,
        bannerInfo: scanPayload.bannerInfo,
        consentTest: scanPayload.consentTest,
        domainToTrackerIdMap,
      });

      console.log(`[ScanService] Scan ${scanId} completed successfully.`);
      return { scanPayload, analysis };
    } catch (scanError: any) {
      console.error(`[ScanService] Scan ${scanId} failed:`, scanError.message);
      await scanRepository.updateScanStatus(scanId, "failed", {
        errorMessage: scanError.message || "Unknown error during website crawl.",
      });
      throw scanError;
    }
  }

  /**
   * Asynchronous scan launcher: creates pending scan record, starts background crawl, returns pending scan immediately
   */
  async startScan(rawUrl: string) {
    const job = await this.createScanJob(rawUrl);

    // Launch crawler & analysis in background without awaiting
    this.processScanJob(job.scan.id, job.normalizedUrl, job.hostname, job.websiteId).catch(
      (err) => {
        console.error(`[ScanService] Background scan failure for ${job.scan.id}:`, err.message);
      }
    );

    return {
      scan: job.scan,
    };
  }

  /**
   * Synchronous scan execution: awaits full crawl and returns report
   */
  async executeScan(rawUrl: string) {
    const job = await this.createScanJob(rawUrl);
    const { scanPayload, analysis } = await this.processScanJob(
      job.scan.id,
      job.normalizedUrl,
      job.hostname,
      job.websiteId
    );

    const updatedScan = await scanRepository.getScanWithWebsite(job.scan.id);
    const report = await this.getScanReport(job.scan.id);

    return {
      scan: updatedScan,
      report,
      summary: {
        score: analysis.score,
        grade: analysis.grade,
        bannerDetected: scanPayload.bannerDetected,
        bannerCmpName: scanPayload.bannerCmpName,
        totalCookies: analysis.totalCookies,
        thirdPartyCookies: analysis.thirdPartyCookies,
        totalTrackers: analysis.totalTrackers,
        thirdPartyRequests: analysis.thirdPartyRequests,
      },
    };
  }

  async getScanById(id: string) {
    const scan = await scanRepository.getScanWithWebsite(id);
    if (!scan) {
      const err = new Error("Scan record not found.");
      (err as any).statusCode = 404;
      throw err;
    }
    return scan;
  }

  async getScanReport(scanId: string) {
    await this.getScanById(scanId); // ensure exists
    const [report, banner] = await Promise.all([
      scanRepository.getReport(scanId),
      scanRepository.getConsentBanner(scanId),
    ]);

    if (!report) {
      const err = new Error("Report not yet generated or scan did not complete.");
      (err as any).statusCode = 404;
      throw err;
    }

    return {
      ...report,
      consentBanner: banner,
    };
  }

  async getScanCookies(scanId: string) {
    await this.getScanById(scanId);
    return scanRepository.getCookies(scanId);
  }

  async getScanTrackers(scanId: string) {
    await this.getScanById(scanId);
    const [trackers, requests] = await Promise.all([
      scanRepository.getScanTrackers(scanId),
      scanRepository.getNetworkRequests(scanId),
    ]);

    return {
      trackers,
      requests,
    };
  }

  async getScanFindings(scanId: string) {
    await this.getScanById(scanId);
    return scanRepository.getFindings(scanId);
  }

  async listScans(options: { page: number; limit: number; domain?: string; status?: string }) {
    return scanRepository.listScans(options);
  }

  /**
   * Compares two scan reports side-by-side
   */
  async compareScans(scanIdA: string, scanIdB: string) {
    const [scanA, scanB] = await Promise.all([
      scanRepository.getScanWithWebsite(scanIdA),
      scanRepository.getScanWithWebsite(scanIdB),
    ]);

    if (!scanA || !scanB) {
      const err = new Error("One or both scans could not be found for comparison.");
      (err as any).statusCode = 404;
      throw err;
    }

    const [reportA, reportB, trackersA, trackersB] = await Promise.all([
      scanRepository.getReport(scanIdA),
      scanRepository.getReport(scanIdB),
      scanRepository.getScanTrackers(scanIdA),
      scanRepository.getScanTrackers(scanIdB),
    ]);

    const domainSetA = new Set(trackersA.map((t) => t.domain));
    const domainSetB = new Set(trackersB.map((t) => t.domain));

    const commonTrackers = trackersA.filter((t) => domainSetB.has(t.domain));
    const uniqueTrackersA = trackersA.filter((t) => !domainSetB.has(t.domain));
    const uniqueTrackersB = trackersB.filter((t) => !domainSetA.has(t.domain));

    const scoreDiff = (scanA.score || 0) - (scanB.score || 0);

    return {
      scanA: {
        id: scanA.id,
        domain: scanA.targetDomain,
        url: scanA.url,
        score: scanA.score,
        grade: scanA.grade,
        metrics: reportA?.metrics || null,
        createdAt: scanA.createdAt,
      },
      scanB: {
        id: scanB.id,
        domain: scanB.targetDomain,
        url: scanB.url,
        score: scanB.score,
        grade: scanB.grade,
        metrics: reportB?.metrics || null,
        createdAt: scanB.createdAt,
      },
      comparison: {
        scoreDifference: scoreDiff,
        betterPrivacyDomain:
          scoreDiff > 0
            ? scanA.targetDomain
            : scoreDiff < 0
            ? scanB.targetDomain
            : "Equal",
        cookieDifference:
          (reportA?.metrics?.totalCookies || 0) - (reportB?.metrics?.totalCookies || 0),
        trackerDifference:
          (reportA?.metrics?.totalTrackers || 0) - (reportB?.metrics?.totalTrackers || 0),
        commonTrackers,
        uniqueToA: uniqueTrackersA,
        uniqueToB: uniqueTrackersB,
      },
    };
  }
}

export const scanService = new ScanService();
