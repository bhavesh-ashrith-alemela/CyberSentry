import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "./index.js";

async function runMigrations() {
  console.log("Applying pending PostgreSQL migrations from ./drizzle...");
  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
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
