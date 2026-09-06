import { Hono } from "hono";
import { authRouter } from "./modules/auth/router.js";

export function createApp() {
  const app = new Hono();

  app.get("/", (c) =>
    c.json({
      name: "@superassistant/api",
      version: "0.1.0",
    }),
  );

  app.get("/health", (c) => c.json({ status: "ok" }));

  app.route("/api/auth", authRouter);

  return app;
}
