import { agentToClientStream, parseClientStreamRequest } from "@anvia/client";
import { createClientStreamResponse } from "@anvia/server";
import { Hono } from "hono";
import { createSuperAssistant } from "@superassistant/agents";

export function createApp() {
  const app = new Hono();

  app.get("/", (c) =>
    c.json({
      name: "@superassistant/api",
      version: "0.1.0",
    }),
  );

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

  return app;
}
