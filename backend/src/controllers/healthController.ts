import { Request, Response } from "express";
import { pool } from "../db/index.js";
import { sendSuccess } from "../utils/response.js";

export async function checkHealth(_req: Request, res: Response) {
  let dbStatus = "disconnected";
  let dbLatencyMs = 0;

  try {
    const start = Date.now();
    await pool.query("SELECT 1;");
    dbLatencyMs = Date.now() - start;
    dbStatus = "connected";
  } catch (err: any) {
    console.warn("[HealthCheck] Database ping failed:", err.message);
  }

  const isHealthy = dbStatus === "connected";

  return sendSuccess(
    res,
    {
      status: isHealthy ? "healthy" : "degraded",
      service: "CyberSentry Backend API",
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
      },
      uptimeSeconds: Math.floor(process.uptime()),
    },
    isHealthy ? 200 : 503
  );
}
