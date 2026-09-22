import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { env } from "../config/env.js";

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error("[ErrorHandler]", err);

  // 1. Zod Validation Error
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request payload.",
        details: err.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      },
      timestamp: new Date().toISOString(),
    });
  }

  // 2. Custom status code errors (e.g. from service layer)
  const statusCode = typeof err.statusCode === "number" ? err.statusCode : 500;
  const isServerFault = statusCode >= 500;

  // Mask internal error messages in production to protect credentials and infrastructure
  const message =
    isServerFault && env.NODE_ENV === "production"
      ? "An internal server error occurred."
      : err.message || "An unexpected error occurred.";

  return res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || (isServerFault ? "INTERNAL_SERVER_ERROR" : "BAD_REQUEST"),
      message,
      ...(env.NODE_ENV !== "production" && { stack: err.stack }),
    },
    timestamp: new Date().toISOString(),
  });
}
