import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Pool } from "pg";

const root = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(
  join(root, "../prisma/migrations/20250608000002_view_count/migration.sql"),
  "utf8",
);

const pool = new Pool({
  connectionString: process.env.DIRECT_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  await pool.query(sql);
  console.log("viewCount migration applied");
} catch (e) {
  console.error("Failed:", e.message);
  process.exit(1);
} finally {
  await pool.end();
}