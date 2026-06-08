import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Pool } from "pg";

const root = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(
  join(root, "../prisma/migrations/20250608000001_comments/migration.sql"),
  "utf8",
);

const pool = new Pool({
  connectionString: process.env.DIRECT_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  const exists = await pool.query(
    `SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Comment'`,
  );
  if (exists.rows.length > 0) {
    console.log("Comment table already exists — skip");
    process.exit(0);
  }
  await pool.query(sql);
  console.log("Comment migration applied");
} catch (e) {
  console.error("Failed:", e.message);
  process.exit(1);
} finally {
  await pool.end();
}