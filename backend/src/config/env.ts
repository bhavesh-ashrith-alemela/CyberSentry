import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().default("5001").transform((v) => parseInt(v, 10)),
  HOST: z.string().default("0.0.0.0"),
  FRONTEND_ORIGIN: z.string().default("http://localhost:3000"),
  DATABASE_URL: z
    .string({
      required_error: "DATABASE_URL is required. Example: postgresql://postgres:password@localhost:5432/cybersentry",
    })
    .min(10, "DATABASE_URL must be a valid PostgreSQL connection string."),
  PLAYWRIGHT_HEADLESS: z.string().default("true").transform((v) => v.toLowerCase() !== "false"),
  SCAN_TIMEOUT_MS: z.string().default("30000").transform((v) => parseInt(v, 10)),
});

export const env = envSchema.parse(process.env);
