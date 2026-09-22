import { Router } from "express";
import { scanController } from "../controllers/scanController.js";

export const scanRouter = Router();

// Create / Start Scan
scanRouter.post("/", scanController.createScan);

// List Scans (Paginated history)
scanRouter.get("/", scanController.listScans);

// Compare two scans (must precede /:id to prevent matching 'compare' as an ID)
scanRouter.get("/compare", scanController.compareScans);

// Scan Status & Information
scanRouter.get("/:id", scanController.getScanById);

// Scan Completed Report
scanRouter.get("/:id/report", scanController.getScanReport);

// Scan Dropped Cookies
scanRouter.get("/:id/cookies", scanController.getScanCookies);

// Scan Discovered Trackers
scanRouter.get("/:id/trackers", scanController.getScanTrackers);

// Scan Explainable Findings & Evidence
scanRouter.get("/:id/findings", scanController.getScanFindings);
