import { Worker } from "bullmq";
import { Redis } from "ioredis";
import { ingestQueueName } from "@superassistant/queue";
import { env } from "./env.js";
import { openIngestion } from "./ingest.js";
import { processJob } from "./processor.js";

try {
  process.loadEnvFile();
} catch {
  // No .env file present — fall back to the process environment.
}

const connection = new Redis(env.redisUrl, { maxRetriesPerRequest: null });

// Fails fast when neo4j/qdrant are unreachable; start them via docker compose first.
const ingestion = await openIngestion();

const worker = new Worker(ingestQueueName, (job) => processJob(job, ingestion), { connection });

worker.on("completed", (job) => {
  console.log(`[worker] completed job ${job.id ?? "?"} (${job.name})`);
});

worker.on("failed", (job, error) => {
  console.error(`[worker] failed job ${job?.id ?? "?"} (${job?.name}):`, error);
});

worker.on("error", (error) => {
  console.error("[worker] error:", error);
});

console.log(`[worker] ready — queue "${ingestQueueName}" on ${env.redisUrl}`);

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, async () => {
    await worker.close();
    await ingestion.close();
    connection.disconnect();
    process.exit(0);
  });
}
