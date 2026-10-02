import { Router } from "express";
import {
  checkHealth,
  checkLiveness,
  checkReadiness,
} from "../controllers/healthController.js";

export const healthRouter = Router();

// Liveness probe: GET /api/health/live
healthRouter.get("/health/live", checkLiveness);

// Readiness probe: GET /api/health/ready
healthRouter.get("/health/ready", checkReadiness);

// General health check: GET /api/health
healthRouter.get("/health", checkHealth);
