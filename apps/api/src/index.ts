import { serve } from "@hono/node-server";
import { createApp } from "./app.js";
import { env } from "./env.js";

try {
  process.loadEnvFile();
} catch {
  // No .env file present — fall back to the process environment.
}

const app = createApp();

const server = serve({ fetch: app.fetch, port: env.port }, (info) => {
  console.log(`API listening on http://localhost:${info.port}`);
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    server.close();
    process.exit(0);
  });
}
