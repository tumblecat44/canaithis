import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Pool } from "pg";

const root = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(
  join(root, "../prisma/migrations/20250602000000_init/migration.sql"),
  "utf8",
);

const pool = new Pool({
  connectionString: process.env.DIRECT_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  await pool.query(sql);
  console.log("Migration applied successfully");
  const tables = await pool.query(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('User','Challenge','Solution','Like') ORDER BY tablename`,
  );
  console.log("canaithis tables:", tables.rows.map((r) => r.tablename).join(", "));
} catch (e) {
  console.error("Migration failed:", e.message);
  process.exit(1);
} finally {
  await pool.end();
}