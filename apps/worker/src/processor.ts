import type { Job } from "bullmq";
import { ingestDocumentJobData, ingestDocumentJobName } from "@superassistant/queue";
import type { Ingestion } from "./ingest.js";

export async function processJob(job: Job, ingestion: Ingestion): Promise<unknown> {
  if (job.name !== ingestDocumentJobName) {
    throw new Error(`Unknown job name: ${job.name}`);
  }

  const data = ingestDocumentJobData.parse(job.data);
  console.log(`[worker] ingesting ${data.url} as ${data.documentId}`);

  const receipt = await ingestion.ingest(data);

  console.log(
    `[worker] ingested ${data.documentId}: entities=${receipt.entityKeys.length} ` +
      `relationships=${receipt.relationshipKeys.length} ` +
      `vectors=${receipt.vectorDocumentIds.length} ` +
      `graphWrite=${receipt.graphWrite.status} vectorWrite=${receipt.vectorWrite.status}`,
  );

  if (receipt.warnings.length > 0) {
    console.warn(
      `[worker] ${receipt.warnings.length} extraction warning(s) while ingesting ${data.documentId}`,
    );
  }

  return receipt;
}
