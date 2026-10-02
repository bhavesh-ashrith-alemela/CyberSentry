import { Request, Response } from "express";
import { pool } from "../db/index.js";
import { sendSuccess } from "../utils/response.js";

/**
 * GET /health/live & /api/health/live
 * Liveness Probe: Verifies the Express process is running and accepting HTTP requests.
 * Always returns HTTP 200 if the process is responsive.
 */
export function checkLiveness(_req: Request, res: Response) {
  return sendSuccess(res, {
    status: "alive",
    service: "CyberSentry Backend API",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
}

/**
 * GET /health/ready & /api/health/ready
 * Readiness Probe: Verifies critical dependencies (PostgreSQL) are operational.
 * Returns HTTP 200 if database is connected, HTTP 503 if database is unreachable.
 */
export async function checkReadiness(_req: Request, res: Response) {
  let dbStatus = "disconnected";
  let dbLatencyMs = 0;
  let dbError: string | null = null;

  try {
    const start = Date.now();
    await pool.query("SELECT 1;");
    dbLatencyMs = Date.now() - start;
    dbStatus = "connected";
  } catch (err: any) {
    dbError = err.message || "Failed to query database";
    console.warn("[ReadinessCheck] Database ping failed:", dbError);
  }

  const isReady = dbStatus === "connected";

  if (isReady) {
    return sendSuccess(
      res,
      {
        status: "ready",
        service: "CyberSentry Backend API",
        database: {
          status: "connected",
          latencyMs: dbLatencyMs,
        },
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
      },
      200
    );
  } else {
    return res.status(503).json({
      success: false,
      error: {
        code: "DATABASE_UNAVAILABLE",
        message: "Database dependency is unreachable. Service not ready.",
      },
      data: {
        status: "not_ready",
        service: "CyberSentry Backend API",
        database: {
          status: "disconnected",
          error: dbError,
        },
        uptimeSeconds: Math.floor(process.uptime()),
      },
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * GET /health & /api/health
 * General Health Check: Checks overall readiness.
 */
export async function checkHealth(req: Request, res: Response) {
  return checkReadiness(req, res);
}
