import { defineConfig, env } from "prisma/config";

try {
  process.loadEnvFile();
} catch {
  // No .env file present — fall back to the process environment.
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
