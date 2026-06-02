import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

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
    "Set POSTGRES_URL or DIRECT_URL to a postgresql:// URL for the app runtime. (prisma+postgres:// is CLI-only.)",
  );
}

function createPrismaClient() {
  const connectionString = getPostgresConnectionString();

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}