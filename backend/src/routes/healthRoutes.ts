import { Router } from "express";
import { checkHealth } from "../controllers/healthController.js";

export const healthRouter = Router();

healthRouter.get("/health", checkHealth);
