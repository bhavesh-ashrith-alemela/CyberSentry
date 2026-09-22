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
  try {
    await migrate(db, { migrationsFolder });
    console.log("All PostgreSQL migrations applied successfully.");
  } catch (error: any) {
    console.error("Migration execution failed:", error.message);
    process.exit(1);
  } finally {
    await pool.end().catch(() => {});
    process.exit(0);
  }
}

runMigrations();
