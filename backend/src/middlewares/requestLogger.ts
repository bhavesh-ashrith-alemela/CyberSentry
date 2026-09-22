import { Request, Response, NextFunction } from "express";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const color =
      status >= 500
        ? "\x1b[31m" // Red
        : status >= 400
        ? "\x1b[33m" // Yellow
        : "\x1b[32m"; // Green
    const reset = "\x1b[0m";

    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${color}${status}${reset} - ${duration}ms`
    );
  });

  next();
}
