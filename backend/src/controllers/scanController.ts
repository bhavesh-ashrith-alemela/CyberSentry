import { Request, Response, NextFunction } from "express";
import { scanService } from "../services/scanService.js";
import {
  CreateScanSchema,
  ListScansQuerySchema,
  CompareScansQuerySchema,
  ScanIdParamSchema,
} from "../types/schemas.js";
import { sendSuccess } from "../utils/response.js";

export class ScanController {
  /**
   * POST /api/scans
   * Submits a URL, verifies SSRF safety, executes scan & analysis, and persists full audit trail
   */
  async createScan(req: Request, res: Response, next: NextFunction) {
    try {
      const { url } = CreateScanSchema.parse(req.body);
      const result = await scanService.executeScan(url);
      return sendSuccess(res, result, 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/scans/:id
   * Retrieves scan status and general metadata
   */
  async getScanById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = ScanIdParamSchema.parse(req.params);
      const scan = await scanService.getScanById(id);
      return sendSuccess(res, scan);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/scans/:id/report
   * Retrieves the final completed privacy report
   */
  async getScanReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = ScanIdParamSchema.parse(req.params);
      const report = await scanService.getScanReport(id);
      return sendSuccess(res, report);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/scans/:id/cookies
   * Retrieves all dropped cookies for a scan
   */
  async getScanCookies(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = ScanIdParamSchema.parse(req.params);
      const cookies = await scanService.getScanCookies(id);
      return sendSuccess(res, { count: cookies.length, cookies });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/scans/:id/trackers
   * Retrieves all identified third-party trackers for a scan
   */
  async getScanTrackers(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = ScanIdParamSchema.parse(req.params);
      const trackers = await scanService.getScanTrackers(id);
      return sendSuccess(res, { count: trackers.length, trackers });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/scans/:id/findings
   * Retrieves deterministic rule violations and structured JSONB evidence
   */
  async getScanFindings(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = ScanIdParamSchema.parse(req.params);
      const findings = await scanService.getScanFindings(id);
      return sendSuccess(res, { count: findings.length, findings });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/scans
   * Retrieves paginated scan history
   */
  async listScans(req: Request, res: Response, next: NextFunction) {
    try {
      const query = ListScansQuerySchema.parse(req.query);
      const result = await scanService.listScans(query);
      return sendSuccess(res, result.items, 200, result.pagination);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/scans/compare?scanA=UUID&scanB=UUID
   * Compares two scans side-by-side
   */
  async compareScans(req: Request, res: Response, next: NextFunction) {
    try {
      const { scanA, scanB } = CompareScansQuerySchema.parse(req.query);
      const comparison = await scanService.compareScans(scanA, scanB);
      return sendSuccess(res, comparison);
    } catch (err) {
      next(err);
    }
  }
}

export const scanController = new ScanController();
