import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DIRECT_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  const tables = await pool.query(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`,
  );
  console.log("tables:", tables.rows.map((r) => r.tablename).join(", ") || "(none)");
} catch (e) {
  console.error("ERR:", e.message);
} finally {
  await pool.end();
}