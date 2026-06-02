import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });
import { defineConfig } from "prisma/config";

const databaseUrl =
  process.env.DIRECT_URL ?? process.env.POSTGRES_URL ?? process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "Set DIRECT_URL, POSTGRES_URL, or DATABASE_URL in .env for Prisma CLI.",
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