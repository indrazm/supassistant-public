import { createAuthClient } from "better-auth/react";

/**
 * Better Auth client. The Vite dev server proxies `/api` to the API server
 * (see vite.config.ts), so `/api/auth` reaches the backend's auth handler.
 */
export const authClient = createAuthClient({
  baseURL: `${window.location.origin}/api/auth`,
});

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

/** Error thrown by `postJson` for non-2xx API responses. */
export class AuthApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
  }
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(body),
  });

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof (data as { message?: unknown } | null)?.message === "string"
        ? (data as { message: string }).message
        : "Something went wrong. Please try again.";
    throw new AuthApiError(message, response.status);
  }

  return data as T;
}
