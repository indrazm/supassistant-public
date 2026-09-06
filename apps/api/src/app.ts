import { agentToClientStream, parseClientStreamRequest } from "@anvia/client";
import { createClientStreamResponse } from "@anvia/server";
import { Hono } from "hono";
import { Queue } from "bullmq";
import { Redis } from "ioredis";
import {
  documentIdFromUrl,
  ingestDocumentJobName,
  ingestDocumentRequest,
  ingestQueueName,
} from "@superassistant/queue";
import { createSuperAssistant } from "@superassistant/agents";
import { authRouter } from "./modules/auth/router.js";
import { env } from "./env.js";

export function createApp() {
  const app = new Hono();

  app.get("/", (c) =>
    c.json({
      name: "@superassistant/api",
      version: "0.1.0",
    }),
  );

  const redis = new Redis(env.redisUrl, { maxRetriesPerRequest: null });
  const ingestQueue = new Queue(ingestQueueName, { connection: redis });

  app.post("/api/ingest", async (c) => {
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "Invalid JSON body." }, 400);
    }

    const parsed = ingestDocumentRequest.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: "Expected JSON body: { url: string }." }, 400);
    }

    const { url } = parsed.data;
    const parsedUrl = new URL(url);
    const lastSegment = parsedUrl.pathname.split("/").filter(Boolean).at(-1);
    const title = lastSegment ? decodeURIComponent(lastSegment) : parsedUrl.hostname;

    const job = await ingestQueue.add(
      ingestDocumentJobName,
      { documentId: documentIdFromUrl(url), title, url },
      {
        attempts: 3,
        backoff: { type: "exponential", delay: 5_000 },
        removeOnComplete: { age: 3_600, count: 100 },
        removeOnFail: { age: 86_400 },
      },
    );

    return c.json({ jobId: job.id, documentId: documentIdFromUrl(url) }, 202);
  });
  app.get("/health", (c) => c.json({ status: "ok" }));

  app.post("/api/chat", async (c) => {
    let request;
    try {
      request = parseClientStreamRequest(await c.req.json());
    } catch (error) {
      return c.json(
        { error: error instanceof Error ? error.message : "Invalid request body." },
        400,
      );
    }

    if (request.type !== "messages") {
      return c.json({ error: "This endpoint accepts messages requests only." }, 400);
    }

    const events = agentToClientStream({
      events: createSuperAssistant().stream({ messages: request.messages }),
    });

    return createClientStreamResponse({ events });
  });

  app.route("/api/auth", authRouter);

  return app;
}
