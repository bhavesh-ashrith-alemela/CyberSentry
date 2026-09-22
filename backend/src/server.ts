import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { apiRouter } from "./routes/index.js";
import { requestLogger } from "./middlewares/requestLogger.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { testConnection, pool } from "./db/index.js";
import { closeBrowser } from "./scanner/browser.js";

const app = express();

// Request size limits & body parsing
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// CORS configuration supporting FRONTEND_ORIGIN, localhost, and Vercel deployments
const allowedOrigins = [env.FRONTEND_ORIGIN, "http://localhost:3000", "http://127.0.0.1:3000"].filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        env.NODE_ENV === "development" ||
        /^https:\/\/.*\.vercel\.app$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy blocked access from origin: ${origin}`));
    },
    methods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Request logging middleware
app.use(requestLogger);

// Mount API endpoints
app.use("/api", apiRouter);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Cannot ${req.method} ${req.originalUrl}`,
    },
    timestamp: new Date().toISOString(),
  });
});

// Centralized Error Handler
app.use(errorHandler);

// Start Server: binds to 0.0.0.0 and listens on process.env.PORT
const server = app.listen(env.PORT, env.HOST, async () => {
  console.log("==================================================");
  console.log(` CyberSentry Backend API`);
  console.log(` Server bound to : http://${env.HOST}:${env.PORT}`);
  console.log(` Environment    : ${env.NODE_ENV}`);
  console.log(` Health Check   : http://${env.HOST}:${env.PORT}/api/health`);
  console.log("==================================================");

  // Test database connection on startup
  await testConnection();
});

// Graceful Shutdown
async function shutdown(signal: string) {
  console.log(`\nReceived ${signal}. Gracefully shutting down CyberSentry...`);
  server.close(async () => {
    console.log("HTTP server closed.");
    await closeBrowser();
    await pool.end().catch(() => {});
    console.log("Database connection pool closed. Exiting process.");
    process.exit(0);
  });

  // Force shutdown if cleanup exceeds 10s
  setTimeout(() => {
    console.error("Forced shutdown due to timeout.");
    process.exit(1);
  }, 10000);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

export default app;
