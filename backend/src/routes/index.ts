import { Router } from "express";
import { healthRouter } from "./healthRoutes.js";
import { scanRouter } from "./scanRoutes.js";

export const apiRouter = Router();

// Mount Health Check: GET /api/health
apiRouter.use("/", healthRouter);

// Mount Scans API: /api/scans
apiRouter.use("/scans", scanRouter);
