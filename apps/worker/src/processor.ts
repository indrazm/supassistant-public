import type { Job } from "bullmq";

export async function processJob(job: Job): Promise<unknown> {
  console.log(`[worker] processing job ${job.id ?? "?"} (${job.name})`);
  return job.data;
}
