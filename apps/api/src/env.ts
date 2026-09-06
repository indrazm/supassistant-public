try {
  process.loadEnvFile();
} catch {
  // No .env file present — fall back to the process environment.
}

export const env = {
  get port(): number {
    const port = Number(process.env.PORT);
    return Number.isInteger(port) && port > 0 ? port : 3000;
  },
  get databaseUrl(): string {
    const value = process.env.DATABASE_URL;
    if (!value) {
      throw new Error("Missing required environment variable: DATABASE_URL");
    }
    return value;
  },
  get betterAuthSecret(): string {
    const value = process.env.BETTER_AUTH_SECRET;
    if (!value) {
      throw new Error("Missing required environment variable: BETTER_AUTH_SECRET");
    }
    return value;
  },
  get betterAuthUrl(): string {
    return process.env.BETTER_AUTH_URL ?? `http://localhost:${this.port}`;
  },
  get webOrigin(): string {
    return process.env.WEB_ORIGIN ?? "http://localhost:5173";
  },

  get redisUrl(): string {
    const url = process.env.REDIS_URL;
    return url && url.length > 0 ? url : "redis://127.0.0.1:6379";
  },
};
