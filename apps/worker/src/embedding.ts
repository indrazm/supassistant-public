import type { Embedding, EmbeddingModel, ModelCallOptions } from "@anvia/core/embeddings";

export const EMBEDDING_DIMENSIONS = 1536;

/**
 * Deterministic lexical hashing embedder.
 *
 * The configured OpenAI-compatible gateway exposes no embedding models, so dev
 * ingestion runs on hashed bag-of-words vectors. Retrieval is lexical overlap,
 * not semantic. Swap for a real embedding model (same interface) when an
 * embedding endpoint is available, then re-ingest documents.
 */
export function createHashingEmbeddingModel(): EmbeddingModel {
  return {
    provider: "local",
    modelId: "hashing-1536",
    dimensions: EMBEDDING_DIMENSIONS,
    async embedTexts(texts: string[], _options?: ModelCallOptions): Promise<Embedding[]> {
      return texts.map(hashEmbed);
    },
  };
}

function hashEmbed(text: string): Embedding {
  const vector: number[] = Array.from({ length: EMBEDDING_DIMENSIONS }, () => 0);
  const tokens = text.toLowerCase().match(/[a-z0-9']{2,}/g) ?? [];
  for (const token of tokens) {
    vector[fnv1a(token) % EMBEDDING_DIMENSIONS] += 1;
  }

  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  return {
    document: text,
    vector: norm > 0 ? vector.map((value) => value / norm) : vector,
  };
}

function fnv1a(token: string): number {
  let hash = 2166136261;
  for (let index = 0; index < token.length; index++) {
    hash ^= token.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
