import { PrismaPg } from "@prisma/adapter-pg";
import { Pool, type PoolConfig } from "pg";

import { PrismaClient } from "@/lib/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getPostgresConnectionString() {
  const direct =
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL ??
    process.env.DIRECT_URL;

  if (
    direct?.startsWith("postgresql://") ||
    direct?.startsWith("postgres://")
  ) {
    return direct;
  }

  throw new Error(
    "Set DATABASE_URL or DIRECT_URL to a postgresql:// URL for the app runtime. (prisma+postgres:// is CLI-only.)",
  );
}

/** Supabase pooler usernames use a dot; URL parsers often misread them as host. */
function resolvePoolConfig(connectionString: string): PoolConfig {
  const url = new URL(connectionString);
  const projectRef = process.env.SUPABASE_PROJECT_REF;
  // Node URL keeps %2E in username; pg needs postgres.{ref}
  let user = decodeURIComponent(url.username);

  if (user === "postgres" && url.hostname.includes("pooler.supabase.com") && projectRef) {
    user = `postgres.${projectRef}`;
  }

  return {
    host: url.hostname,
    port: Number(url.port) || 5432,
    user,
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, "") || "postgres",
    ssl: url.searchParams.get("sslmode") === "require" ? { rejectUnauthorized: false } : undefined,
    max: 10,
  };
}

function createPrismaClient() {
  const connectionString = getPostgresConnectionString();
  const useResolvedConfig =
    connectionString.includes("pooler.supabase.com") ||
    connectionString.includes("db.") && connectionString.includes(".supabase.co");

  const pool = useResolvedConfig
    ? new Pool(resolvePoolConfig(connectionString))
    : new Pool({ connectionString });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}