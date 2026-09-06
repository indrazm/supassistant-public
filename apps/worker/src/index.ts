import { Worker } from "bullmq";
import { Redis } from "ioredis";
import { env } from "./env.js";
import { processJob } from "./processor.js";

try {
  process.loadEnvFile();
} catch {
  // No .env file present — fall back to the process environment.
}

const queueName = "default";

const connection = new Redis(env.redisUrl, { maxRetriesPerRequest: null });

const worker = new Worker(queueName, processJob, { connection });

worker.on("completed", (job) => {
  console.log(`[worker] completed job ${job.id ?? "?"} (${job.name})`);
});

worker.on("failed", (job, error) => {
  console.error(`[worker] failed job ${job?.id ?? "?"} (${job?.name}):`, error);
});

worker.on("error", (error) => {
  console.error("[worker] error:", error);
});

console.log(`[worker] ready — queue "${queueName}" on ${env.redisUrl}`);

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, async () => {
    await worker.close();
    connection.disconnect();
    process.exit(0);
  });
}
