import { config } from "dotenv";
import { defineConfig } from "prisma/config";

if (
  process.env.VERCEL !== "1" &&
  !process.env.DIRECT_URL &&
  !process.env.DATABASE_URL
) {
  config({ path: ".env.local" });
  config({ path: ".env" });
}

const databaseUrl =
  process.env.DIRECT_URL ?? process.env.POSTGRES_URL ?? process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "Set DIRECT_URL, POSTGRES_URL, or DATABASE_URL in .env for Prisma CLI.",
  );
}

if (
  process.env.VERCEL === "1" &&
  (databaseUrl.includes("localhost") || databaseUrl.includes("127.0.0.1"))
) {
  throw new Error(
    "Production build must not use localhost database URLs. Set DATABASE_URL and DIRECT_URL in Vercel project settings.",
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});