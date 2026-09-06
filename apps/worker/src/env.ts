export const env = {
  get redisUrl(): string {
    const url = process.env.REDIS_URL;
    return url && url.length > 0 ? url : "redis://127.0.0.1:6379";
  },

  get neo4jUri(): string {
    const uri = process.env.NEO4J_URI;
    return uri && uri.length > 0 ? uri : "bolt://127.0.0.1:7687";
  },

  get neo4jUsername(): string {
    const username = process.env.NEO4J_USERNAME;
    return username && username.length > 0 ? username : "neo4j";
  },

  get neo4jPassword(): string {
    const password = process.env.NEO4J_PASSWORD;
    return password && password.length > 0 ? password : "devpassword";
  },

  get qdrantUrl(): string {
    const url = process.env.QDRANT_URL;
    return url && url.length > 0 ? url : "http://127.0.0.1:6333";
  },

  get openaiApiKey(): string {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey.length === 0) {
      throw new Error("OPENAI_API_KEY is not set");
    }
    return apiKey;
  },

  get openaiBaseUrl(): string | undefined {
    return process.env.OPENAI_BASE_URL || undefined;
  },
};
