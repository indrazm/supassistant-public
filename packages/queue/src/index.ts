import { createHash } from "node:crypto";
import { z } from "zod";

export const ingestQueueName = "ingest";

export const ingestDocumentJobName = "ingest-document";

/** API request body for enqueueing a document ingestion. */
export const ingestDocumentRequest = z.strictObject({ url: z.url() });
export const ingestDocumentJobData = z.strictObject({
  /** Stable source id: re-ingesting the same URL replaces the previous document. */
  documentId: z.string().min(1),
  url: z.url(),
  title: z.string().min(1),
});

export type IngestDocumentJobData = z.infer<typeof ingestDocumentJobData>;

/** Derives the stable document id for a source URL. Shared by producer and consumer. */
export function documentIdFromUrl(url: string): string {
  return createHash("sha256").update(url).digest("hex").slice(0, 32);
}
