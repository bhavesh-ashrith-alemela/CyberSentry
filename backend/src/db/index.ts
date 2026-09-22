import pkg from "pg";
const { Pool } = pkg;
import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "../config/env.js";
import * as schema from "./schema.js";

// Determine SSL requirement (cloud PostgreSQL like Neon/Render/Supabase requires SSL)
const requiresSsl =
  env.DATABASE_URL.includes("sslmode=require") ||
  (env.NODE_ENV === "production" && !env.DATABASE_URL.includes("localhost"));

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: requiresSsl ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export const db = drizzle(pool, { schema });

/**
 * Verifies connectivity to the configured PostgreSQL instance
 */
export async function testConnection(): Promise<boolean> {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query("SELECT version(), current_database(), current_user;");
    const info = result.rows[0];
    console.log("==================================================");
    console.log(" PostgreSQL Connected Successfully!");
    console.log(` Database : ${info.current_database}`);
    console.log(` User     : ${info.current_user}`);
    console.log(` Version  : ${info.version.split(" on ")[0]}`);
    console.log("==================================================");
    return true;
  } catch (error: any) {
    console.error("==================================================");
    console.error(" PostgreSQL Connection Failed!");
    console.error(` Error: ${error.message}`);
    console.error(" Please verify your DATABASE_URL in backend/.env");
    console.error("==================================================");
    return false;
  } finally {
    if (client) client.release();
  }
}
