import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "./index.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runMigrations() {
  const candidatePaths = [
    path.resolve(__dirname, "../../drizzle"),
    path.resolve(__dirname, "../drizzle"),
    path.resolve(process.cwd(), "drizzle"),
    path.resolve(process.cwd(), "backend/drizzle"),
    "./drizzle",
  ];

  const migrationsFolder = candidatePaths.find((p) => fs.existsSync(p)) || "./drizzle";
  console.log(`Applying pending PostgreSQL migrations from ${migrationsFolder}...`);

  const MAX_RETRIES = 5;
  const RETRY_DELAY_MS = 3000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await migrate(db, { migrationsFolder });
      console.log("All PostgreSQL migrations applied successfully.");
      await pool.end().catch(() => {});
      process.exit(0);
    } catch (error: any) {
      console.warn(`[Migrate] Attempt ${attempt}/${MAX_RETRIES} failed: ${error.message}`);
      if (attempt < MAX_RETRIES) {
        console.log(`Waiting ${RETRY_DELAY_MS / 1000}s for database to accept connections...`);
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      } else {
        console.error("Migration execution failed after maximum retries:", error.message);
        await pool.end().catch(() => {});
        process.exit(1);
      }
    }
  }
}

runMigrations();
