import {
  defineGraphSchema,
  ingestGraphTextToStores,
  type GraphIngestionReceipt,
} from "@anvia/graph";
import { OpenAIClient } from "@anvia/openai";
import { Neo4jClient } from "@anvia/neo4j";
import { QdrantVectorClient } from "@anvia/qdrant";
import { z } from "zod";
import type { IngestDocumentJobData } from "@superassistant/queue";
import { env } from "./env.js";
import { createHashingEmbeddingModel, EMBEDDING_DIMENSIONS } from "./embedding.js";

const VECTOR_COLLECTION = "documents";

const documentGraphSchema = defineGraphSchema({
  nodes: {
    Entity: {
      description:
        "A notable person, organization, place, product, event, concept, or technology mentioned in the document.",
      identity: ["id"],
      properties: z.strictObject({
        id: z.string(),
        name: z.string(),
        description: z.string(),
      }),
    },
  },
  relationships: {
    RELATED_TO: {
      description: "Two entities that are connected in the source document.",
      from: "Entity",
      to: "Entity",
      properties: z.strictObject({ context: z.string() }),
    },
  },
});

export type Ingestion = Readonly<{
  ingest: (data: IngestDocumentJobData) => Promise<GraphIngestionReceipt>;
  close: () => Promise<void>;
}>;

export async function openIngestion(): Promise<Ingestion> {
  const neo4j = new Neo4jClient({
    uri: env.neo4jUri,
    auth: { username: env.neo4jUsername, password: env.neo4jPassword },
  });

  const graph = neo4j.managedKnowledgeGraph({
    name: "documents",
    schema: documentGraphSchema,
    resources: {
      labels: { document: "Document", chunk: "DocumentChunk", entity: "DocumentEntity" },
      indexes: {
        chunks: {
          vector: {
            name: "document_chunks_vector",
            dimensions: EMBEDDING_DIMENSIONS,
            similarity: "cosine",
          },
        },
        entities: {
          vector: {
            name: "document_entities_vector",
            dimensions: EMBEDDING_DIMENSIONS,
            similarity: "cosine",
          },
        },
      },
    },
  });

  await graph.ensure({ indexTimeoutMs: 60_000 });

  const qdrant = new QdrantVectorClient({ url: env.qdrantUrl });
  const vectorStore = qdrant.vectorStore({
    collectionName: VECTOR_COLLECTION,
    dimensions: EMBEDDING_DIMENSIONS,
    metric: "cosine",
  });
  await vectorStore.ensure();

  const openai = new OpenAIClient({
    apiKey: env.openaiApiKey,
    baseUrl: env.openaiBaseUrl,
  });
  const extractionModel = openai.completionModel({ modelId: "gpt-5.6-luna", api: "chat" });
  const embeddingModel = createHashingEmbeddingModel();

  return {
    async ingest(data) {
      const text = await fetchDocumentText(data.url);
      if (text.length === 0) {
        throw new Error(`No readable text found at ${data.url}`);
      }

      const { receipt } = await ingestGraphTextToStores({
        graph,
        vectorStore,
        document: { id: data.documentId, text, metadata: { url: data.url, title: data.title } },
        extractionModel,
        embeddingModel,
        chunking: {
          strategy: "recursive",
          maxSize: 1_000,
          overlap: 100,
          separators: ["\n\n", "\n", " "],
        },
        conflict: "overwrite",
        orphanEntities: "delete",
        revision: data.documentId,
        factConflicts: {
          entity: { default: "prefer-first" },
          relationship: { default: "prefer-first" },
        },
      });
      return receipt;
    },
    close: async () => {
      await qdrant.close();
      await neo4j.close();
    },
  };
}

async function fetchDocumentText(url: string): Promise<string> {
  const response = await fetch(url, {
    redirect: "follow",
    headers: { "user-agent": "superassistant-ingest/0.1" },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: HTTP ${response.status}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  const supported = ["text/html", "application/xhtml", "text/plain"].some((type) =>
    contentType.includes(type),
  );
  if (!supported) {
    throw new Error(`Unsupported content type at ${url}: ${contentType || "unknown"}`);
  }

  const body = await response.text();
  return contentType.includes("text/plain") ? body.trim() : htmlToText(body);
}

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}
