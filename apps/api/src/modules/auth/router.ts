import { Hono } from "hono";
import { APIError } from "better-auth";
import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { jsonValidator, loginSchema, registerSchema } from "./schema.js";
import { auth, login, register } from "./service.js";

function forwardSetCookies(c: Context, headers: Headers): void {
  for (const cookie of headers.getSetCookie()) {
    c.header("set-cookie", cookie, { append: true });
  }
}
function apiErrorResponse(c: Context, error: unknown): Response {
  if (error instanceof APIError) {
    // Better Auth carries the human message in `body.message`; `statusCode`
    // is the numeric HTTP status (`status` itself is a string code).
    const message =
      (typeof error.body?.message === "string" && error.body.message) ||
      error.message ||
      "Authentication failed";
    return c.json({ message }, (error.statusCode ?? 400) as ContentfulStatusCode);
  }
  console.error("auth: unexpected error", error);
  return c.json({ message: "Internal server error" }, 500);
}

export const authRouter = new Hono()
  .post("/register", jsonValidator(registerSchema), async (c) => {
    const input = c.req.valid("json");
    try {
      const { user, headers } = await register(input);
      forwardSetCookies(c, headers);
      return c.json({ user }, 201);
    } catch (error) {
      return apiErrorResponse(c, error);
    }
  })
  .post("/login", jsonValidator(loginSchema), async (c) => {
    const input = c.req.valid("json");
    try {
      const { user, headers } = await login(input);
      forwardSetCookies(c, headers);
      return c.json({ user });
    } catch (error) {
      return apiErrorResponse(c, error);
    }
  });

// Better Auth handler for the remaining endpoints (session, sign-out, ...).
// Registered last so the custom routes above take precedence.
authRouter.on(["POST", "GET"], "*", (c) => auth.handler(c.req.raw));
